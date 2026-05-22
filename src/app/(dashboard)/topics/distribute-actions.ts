'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

async function getPublisherId(): Promise<string> {
  const user =
    (await db.user.findFirst({ where: { role: 'PUBLISHER' }, select: { id: true } })) ??
    (await db.user.findFirst({ select: { id: true } }))
  return user?.id ?? ''
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

function revalidateAll(topicId: string) {
  revalidatePath(`/topics/${topicId}`)
  revalidatePath(`/topics/${topicId}/distribute`)
  revalidatePath('/topics')
}

export async function createPublishTask(
  assetId: string,
  accountId: string,
  scheduledAt: string | null,
  urgency: string,
  scheduleType?: 'immediate' | 'scheduled' | 'backlog',
) {
  const asset = await db.asset.findUnique({ where: { id: assetId }, select: { topicId: true } })
  if (!asset) throw new Error('Asset not found')

  const publisherId = await getPublisherId()
  const status = scheduleType === 'backlog' ? 'BACKLOG'
               : scheduledAt               ? 'SCHEDULED'
               : 'PENDING'

  const task = await db.publishTask.create({
    data: {
      assetId,
      accountId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      urgency,
      status,
      assignedToId: publisherId,
    },
  })

  await syncTopicStatus(asset.topicId)
  revalidateAll(asset.topicId)
  return task
}

export async function updatePublishTask(
  taskId: string,
  data: { accountId?: string; scheduledAt?: string | null; urgency?: string; scheduleType?: 'immediate' | 'scheduled' | 'backlog' },
) {
  const existing = await db.publishTask.findUnique({
    where: { id: taskId },
    select: { status: true, asset: { select: { topicId: true } } },
  })
  if (!existing) throw new Error('Task not found')
  if (['PUBLISHED', 'CANCELLED'].includes(existing.status)) {
    throw new Error('Cannot update published or cancelled task')
  }

  const newScheduledAt =
    data.scheduledAt !== undefined
      ? data.scheduledAt
        ? new Date(data.scheduledAt)
        : null
      : undefined

  const newStatus = data.scheduleType === 'backlog' ? 'BACKLOG'
                  : newScheduledAt !== undefined ? (newScheduledAt ? 'SCHEDULED' : 'PENDING')
                  : undefined

  await db.publishTask.update({
    where: { id: taskId },
    data: {
      ...(data.accountId !== undefined && { accountId: data.accountId }),
      ...(newScheduledAt !== undefined && { scheduledAt: newScheduledAt }),
      ...(newStatus !== undefined && { status: newStatus }),
      ...(data.urgency !== undefined && { urgency: data.urgency }),
    },
  })

  revalidateAll(existing.asset.topicId)
}

export async function deletePublishTask(taskId: string) {
  const existing = await db.publishTask.findUnique({
    where: { id: taskId },
    select: { status: true, asset: { select: { topicId: true } } },
  })
  if (!existing) throw new Error('Task not found')
  if (existing.status === 'PUBLISHED') throw new Error('Cannot delete published task')

  await db.publishTask.delete({ where: { id: taskId } })
  await syncTopicStatus(existing.asset.topicId)
  revalidateAll(existing.asset.topicId)
}

export async function applyAllSuggestions(
  topicId: string,
  suggestions: Array<{ assetId: string; accountId: string }>,
) {
  const publisherId = await getPublisherId()

  for (const { assetId, accountId } of suggestions) {
    const existing = await db.publishTask.findFirst({ where: { assetId } })
    if (existing) continue
    await db.publishTask.create({
      data: {
        assetId,
        accountId,
        scheduledAt: null,
        urgency: 'NORMAL',
        status: 'PENDING',
        assignedToId: publisherId,
      },
    })
  }

  await syncTopicStatus(topicId)
  revalidateAll(topicId)
}

export async function revertTopicToInProduction(topicId: string) {
  await db.topic.update({ where: { id: topicId }, data: { status: 'IN_PRODUCTION' } })
  revalidateAll(topicId)
}

export async function toggleAccountForAsset(assetId: string, accountId: string) {
  const asset = await db.asset.findUnique({ where: { id: assetId }, select: { topicId: true } })
  if (!asset) throw new Error('Asset not found')

  const existing = await db.publishTask.findFirst({
    where: { assetId, accountId, status: { not: 'CANCELLED' } },
    select: { id: true, status: true },
  })

  if (existing) {
    if (existing.status === 'PUBLISHED') return // 已发布不允许取消
    await db.publishTask.delete({ where: { id: existing.id } })
  } else {
    const publisherId = await getPublisherId()
    await db.publishTask.create({
      data: { assetId, accountId, urgency: 'NORMAL', status: 'PENDING', assignedToId: publisherId },
    })
  }

  await syncTopicStatus(asset.topicId)
  revalidateAll(asset.topicId)
}
