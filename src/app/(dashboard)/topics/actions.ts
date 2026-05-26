'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function nextTopicCode(): Promise<string> {
  const last = await db.topic.findFirst({
    where: { code: { startsWith: 'T' } },
    orderBy: { code: 'desc' },
    select: { code: true },
  })
  if (!last) return 'T001'
  const num = parseInt(last.code.slice(1), 10)
  return `T${String(num + 1).padStart(3, '0')}`
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function updateTopic(
  id: string,
  data: { title?: string; description?: string; status?: string },
) {
  const topic = await db.topic.update({
    where: { id },
    data,
  })

  if (data.status === 'PUBLISHED') {
    await db.publishTask.updateMany({
      where: {
        asset: { topicId: id },
        status: { in: ['PENDING', 'SCHEDULED', 'BACKLOG'] },
      },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    })
  }

  revalidatePath('/topics')
  revalidatePath(`/topics/${id}`)
  revalidatePath('/schedule')
  return topic
}

export async function updateTopicTags(id: string, tagIds: string[]) {
  const topic = await db.topic.update({
    where: { id },
    data: { tags: { set: tagIds.map((tid) => ({ id: tid })) } },
    include: { tags: true },
  })
  revalidatePath('/topics')
  revalidatePath(`/topics/${id}`)
  return topic
}

export async function createTopic(data: {
  title: string
  description?: string
  status?: string
  tagIds?: string[]
  ownerId: string
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const currentUser = await db.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  if (!currentUser) redirect('/login')

  const code = await nextTopicCode()
  const topic = await db.topic.create({
    data: {
      code,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'DRAFT',
      ownerId: currentUser.id,
      tags: data.tagIds?.length
        ? { connect: data.tagIds.map((id) => ({ id })) }
        : undefined,
    },
  })
  // Create default assets
  await db.asset.createMany({
    data: [
      { topicId: topic.id, type: 'WECHAT_ARTICLE', status: 'NOT_STARTED', source: 'MANUAL_UPLOAD' },
      { topicId: topic.id, type: 'XHS_POST',       status: 'NOT_STARTED', source: 'MANUAL_UPLOAD' },
      { topicId: topic.id, type: 'VIDEO',           status: 'NOT_STARTED', source: 'MANUAL_UPLOAD' },
    ],
  })
  revalidatePath('/topics')
  return topic
}

export async function deleteTopic(id: string) {
  await db.asset.deleteMany({ where: { topicId: id } })
  await db.topic.delete({ where: { id } })
  revalidatePath('/topics')
}

export async function getAllTags() {
  return db.tag.findMany({ orderBy: { name: 'asc' } })
}

export async function createTag(name: string) {
  const tag = await db.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  })
  revalidatePath('/topics')
  return tag
}
