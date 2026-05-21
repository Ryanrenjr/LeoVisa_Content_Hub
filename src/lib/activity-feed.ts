import { db } from '@/lib/db'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityType = 'published' | 'topic_created' | 'topic_status' | 'asset_uploaded'

export type ActivityItem = {
  id: string
  type: ActivityType
  description: string
  timestamp: string // ISO string
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const ASSET_LABEL: Record<string, string> = {
  WECHAT_ARTICLE: '公众号文章',
  XHS_POST: '小红书图文',
  VIDEO: '视频',
}

const STATUS_LABEL: Record<string, string> = {
  IN_PRODUCTION: '制作中',
  READY_TO_PUBLISH: '待发布',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
  DRAFT: '草稿',
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export async function aggregateRecentActivities(limit = 10): Promise<ActivityItem[]> {
  const fetch = limit * 3 // over-fetch so we have enough after merge

  const [publishedTasks, topics, assets] = await Promise.all([
    db.publishTask.findMany({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      include: {
        asset: { select: { type: true, topic: { select: { title: true } } } },
        account: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: fetch,
    }),
    db.topic.findMany({
      orderBy: { updatedAt: 'desc' },
      take: fetch,
    }),
    db.asset.findMany({
      where: {
        OR: [
          { textFilePath: { not: null } },
          { coverImagePath: { not: null } },
          { videoFilePath: { not: null } },
          { scriptFilePath: { not: null } },
        ],
      },
      include: { topic: { select: { title: true } } },
      orderBy: { updatedAt: 'desc' },
      take: fetch,
    }),
  ])

  const items: ActivityItem[] = []

  for (const task of publishedTasks) {
    if (!task.publishedAt) continue
    items.push({
      id: `pub-${task.id}`,
      type: 'published',
      description: `已发布 ${ASSET_LABEL[task.asset.type] ?? task.asset.type}《${task.asset.topic.title}》到 ${task.account.name}`,
      timestamp: task.publishedAt.toISOString(),
    })
  }

  for (const topic of topics) {
    // Created event
    items.push({
      id: `tc-${topic.id}`,
      type: 'topic_created',
      description: `创建选题《${topic.title}》`,
      timestamp: topic.createdAt.toISOString(),
    })
    // Status change event (only when meaningfully updated and non-draft)
    const isUpdated = topic.updatedAt.getTime() - topic.createdAt.getTime() > 10_000
    if (isUpdated && topic.status !== 'DRAFT') {
      items.push({
        id: `ts-${topic.id}`,
        type: 'topic_status',
        description: `选题《${topic.title}》进入${STATUS_LABEL[topic.status] ?? topic.status}阶段`,
        timestamp: topic.updatedAt.toISOString(),
      })
    }
  }

  for (const asset of assets) {
    items.push({
      id: `au-${asset.id}`,
      type: 'asset_uploaded',
      description: `上传 ${ASSET_LABEL[asset.type] ?? asset.type} 内容到《${asset.topic.title}》`,
      timestamp: asset.updatedAt.toISOString(),
    })
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(
      // deduplicate by id (same item can appear multiple times from different queries)
      (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx,
    )
    .slice(0, limit)
}
