import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getAllTags } from '@/app/(dashboard)/topics/actions'
import { TopicDetail } from '@/components/topic-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const topic = await db.topic.findUnique({ where: { id }, select: { title: true, code: true } })
  if (!topic) return { title: '选题不存在' }
  return { title: `${topic.code} ${topic.title} — LeoVisa Content Hub` }
}

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [topic, allTags] = await Promise.all([
    db.topic.findUnique({
      where: { id },
      include: {
        tags: true,
        owner: { select: { id: true, name: true } },
        // NOTE: after dev server restart (prisma generate), originalNames/fileSizes will be present
        assets: { orderBy: { type: 'asc' } },
      },
    }),
    getAllTags(),
  ])

  if (!topic) notFound()

  // Serialize Date objects; cast assets to full type (new fields are null until client regenerated)
  const serialized = {
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    assets: topic.assets.map((a) => ({
      ...a,
      originalNames: (a as Record<string, unknown>).originalNames as string | null ?? null,
      fileSizes:     (a as Record<string, unknown>).fileSizes     as string | null ?? null,
    })),
  }

  return (
    <TopicDetail
      topic={serialized}
      allTags={allTags}
      mode="view"
      ownerId={topic.ownerId}
    />
  )
}
