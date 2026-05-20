'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

async function getWinnieId(): Promise<string> {
  const winnie = await db.user.findFirst({ where: { name: 'Winnie' }, select: { id: true } })
  return winnie?.id ?? ''
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
) {
  const asset = await db.asset.findUnique({ where: { id: assetId }, select: { topicId: true } })
  if (!asset) throw new Error('Asset not found')

  const winnieId = await getWinnieId()

  const task = await db.publishTask.create({
    data: {
      assetId,
      accountId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      urgency,
      status: scheduledAt ? 'SCHEDULED' : 'PENDING',
      assignedToId: winnieId,
    },
  })

  await syncTopicStatus(asset.topicId)
  revalidateAll(asset.topicId)
  return task
}

export async function updatePublishTask(
  taskId: string,
  data: { accountId?: string; scheduledAt?: string | null; urgency?: string },
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

  await db.publishTask.update({
    where: { id: taskId },
    data: {
      ...(data.accountId !== undefined && { accountId: data.accountId }),
      ...(newScheduledAt !== undefined && {
        scheduledAt: newScheduledAt,
        status: newScheduledAt ? 'SCHEDULED' : 'PENDING',
      }),
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
  const winnieId = await getWinnieId()

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
        assignedToId: winnieId,
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
