import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getAllTags } from '@/app/(dashboard)/topics/actions'
import { TopicDetail } from '@/components/topic-detail'
import type { AssetRow } from '@/components/asset-account-picker'

const PLATFORM_FOR_ASSET: Record<string, string> = {
  WECHAT_ARTICLE: 'WECHAT_OFFICIAL',
  XHS_POST:       'XIAOHONGSHU',
  VIDEO:          'VIDEO_CHANNEL',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const topic = await db.topic.findUnique({ where: { id }, select: { title: true, code: true } })
  if (!topic) return { title: '选题不存在' }
  return { title: `${topic.code} ${topic.title} — LeoVisa Content Hub` }
}

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [topic, allTags, accounts] = await Promise.all([
    db.topic.findUnique({
      where: { id },
      include: {
        tags: true,
        owner: { select: { id: true, name: true } },
        assets: {
          orderBy: { type: 'asc' },
          include: {
            publishTasks: {
              where: { status: { not: 'CANCELLED' } },
              select: { accountId: true, status: true },
            },
          },
        },
      },
    }),
    getAllTags(),
    db.account.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, platform: true, positioning: true, displayOrder: true },
    }),
  ])

  if (!topic) notFound()

  // Build AssetRow[] for the account picker
  const assetRows: AssetRow[] = topic.assets.map((asset) => {
    const platform = PLATFORM_FOR_ASSET[asset.type] ?? ''
    const filtered = accounts.filter((a) => a.platform === platform)
    // The account with the lowest displayOrder for VIDEO_CHANNEL is the 主号
    const minOrder = Math.min(...filtered.map((a) => a.displayOrder))
    return {
      assetId: asset.id,
      assetType: asset.type,
      accounts: filtered.map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform,
        positioning: a.positioning,
        isMain: platform === 'VIDEO_CHANNEL' && a.displayOrder === minOrder,
      })),
      assignedIds: asset.publishTasks.map((t) => t.accountId),
    }
  })

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
      assetRows={assetRows}
    />
  )
}
