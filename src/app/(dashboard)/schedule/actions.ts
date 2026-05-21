'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScheduleTask = {
  id: string
  assetId: string
  accountId: string
  scheduledAt: string | null
  urgency: string
  status: string
  publishedUrl: string | null
  publishedAt: string | null
  publishedScreenshotPath: string | null
  notes: string | null
  createdAt: string
  asset: {
    id: string
    type: string
    textFilePath: string | null
    coverImagePath: string | null
    videoFilePath: string | null
    scriptFilePath: string | null
    topic: {
      id: string
      code: string
      title: string
    }
  }
  account: {
    id: string
    name: string
    platform: string
  }
}

export type CalendarTask = {
  id: string
  scheduledAt: string
  urgency: string
  status: string
  assetType: string
}

// ─── Revalidation helper ──────────────────────────────────────────────────────

function revalidate() {
  revalidatePath('/schedule')
  revalidatePath('/topics')
}

async function syncTopicStatus(topicId: string) {
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    select: {
      status: true,
      assets: { select: { publishTasks: { select: { id: true } } } },
    },
  })
  if (!topic) return
  const allAssetsHaveTasks = topic.assets.every((a) => a.publishTasks.length > 0)
  if (allAssetsHaveTasks && topic.status === 'IN_PRODUCTION') {
    await db.topic.update({ where: { id: topicId }, data: { status: 'READY_TO_PUBLISH' } })
  } else if (!allAssetsHaveTasks && topic.status === 'READY_TO_PUBLISH') {
    await db.topic.update({ where: { id: topicId }, data: { status: 'IN_PRODUCTION' } })
  }
}

// ─── Mark task as published ───────────────────────────────────────────────────

export async function markTaskAsPublished(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const publishedUrl = formData.get('publishedUrl') as string
  const screenshotFile = formData.get('screenshot') as File | null

  if (!taskId || !publishedUrl) throw new Error('缺少必填字段')

  let screenshotPath: string | null = null

  if (screenshotFile && screenshotFile.size > 0) {
    const dir = path.join(process.cwd(), 'storage', 'publish-screenshots', taskId)
    await fs.mkdir(dir, { recursive: true })
    const ext = path.extname(screenshotFile.name) || '.png'
    const filename = `screenshot_${Date.now()}${ext}`
    const buffer = Buffer.from(await screenshotFile.arrayBuffer())
    await fs.writeFile(path.join(dir, filename), buffer)
    screenshotPath = `publish-screenshots/${taskId}/${filename}`
  }

  await db.publishTask.update({
    where: { id: taskId },
    data: {
      status: 'PUBLISHED',
      publishedUrl,
      publishedScreenshotPath: screenshotPath,
      publishedAt: new Date(),
    },
  })

  revalidate()
}

// ─── Delete task (from schedule page) ────────────────────────────────────────

export async function deleteScheduleTask(taskId: string) {
  const existing = await db.publishTask.findUnique({
    where: { id: taskId },
    select: { status: true, asset: { select: { topicId: true } } },
  })
  if (!existing) throw new Error('任务不存在')
  if (existing.status === 'PUBLISHED') throw new Error('已发布的任务无法删除')

  await db.publishTask.delete({ where: { id: taskId } })
  await syncTopicStatus(existing.asset.topicId)
  revalidate()
  revalidatePath(`/topics/${existing.asset.topicId}`)
  revalidatePath(`/topics/${existing.asset.topicId}/distribute`)
}

// ─── Get urgent task count (for Navbar badge) ─────────────────────────────────

export async function getUrgentTaskCount(): Promise<number> {
  return db.publishTask.count({
    where: {
      urgency: 'URGENT',
      status: { notIn: ['PUBLISHED', 'CANCELLED'] },
    },
  })
}

// ─── Today stats (for toolbar) ───────────────────────────────────────────────

export async function getTodayStats(): Promise<{
  todayTotal: number
  todayUrgent: number
  todayPublished: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const [todayTotal, todayUrgent, todayPublished] = await Promise.all([
    db.publishTask.count({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
        status: { notIn: ['CANCELLED'] },
      },
    }),
    db.publishTask.count({
      where: {
        urgency: 'URGENT',
        status: { notIn: ['PUBLISHED', 'CANCELLED'] },
      },
    }),
    db.publishTask.count({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
        status: 'PUBLISHED',
      },
    }),
  ])

  return { todayTotal, todayUrgent, todayPublished }
}

// ─── Get tasks for a month (for calendar) ────────────────────────────────────

export async function getTasksForMonth(
  year: number,
  month: number,
): Promise<CalendarTask[]> {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)

  const tasks = await db.publishTask.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { not: 'CANCELLED' },
    },
    select: {
      id: true,
      scheduledAt: true,
      urgency: true,
      status: true,
      asset: { select: { type: true } },
    },
  })

  return tasks
    .filter((t) => t.scheduledAt !== null)
    .map((t) => ({
      id: t.id,
      scheduledAt: t.scheduledAt!.toISOString(),
      urgency: t.urgency,
      status: t.status,
      assetType: t.asset.type,
    }))
}

// ─── Get asset text content (for copy) ───────────────────────────────────────

export async function getAssetTextContent(assetId: string): Promise<string | null> {
  const asset = await db.asset.findUnique({
    where: { id: assetId },
    select: { textFilePath: true, scriptFilePath: true, type: true },
  })
  if (!asset) return null

  const filePath = asset.type === 'VIDEO' ? asset.scriptFilePath : asset.textFilePath
  if (!filePath) return null

  try {
    return await fs.readFile(path.join(process.cwd(), 'storage', filePath), 'utf-8')
  } catch {
    return null
  }
}
