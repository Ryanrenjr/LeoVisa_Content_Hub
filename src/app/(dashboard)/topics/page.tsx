import { db } from '@/lib/db'
import { TopicsList } from '@/components/topics-list'

export const metadata = {
  title: '选题库 — LeoVisa Content Hub',
}

export default async function TopicsPage() {
  const [topics, allTags, allAccounts] = await Promise.all([
    db.topic.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        owner: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
        assets: {
          select: {
            id: true,
            type: true,
            status: true,
            publishTasks: {
              where: { status: { notIn: ['CANCELLED'] } },
              select: {
                accountId: true,
                account: { select: { id: true, name: true, platform: true } },
              },
            },
          },
        },
      },
    }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
    db.account.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, platform: true },
    }),
  ])

  const platformOrder: Record<string, number> = { VIDEO_CHANNEL: 0, WECHAT_OFFICIAL: 1, XIAOHONGSHU: 2 }
  const sortedAccounts = [...allAccounts].sort(
    (a, b) => (platformOrder[a.platform] ?? 9) - (platformOrder[b.platform] ?? 9),
  )

  const serialized = topics.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }))

  return <TopicsList topics={serialized} allTags={allTags} allAccounts={sortedAccounts} />
}
