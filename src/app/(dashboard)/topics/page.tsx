import { db } from '@/lib/db'
import { TopicsList } from '@/components/topics-list'

export const metadata = {
  title: '选题库 — LeoVisa Content Hub',
}

export default async function TopicsPage() {
  const [topics, allTags] = await Promise.all([
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
        assets: { select: { id: true, type: true, status: true } },
      },
    }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
  ])

  // Serialize Date → ISO string for client components
  const serialized = topics.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }))

  return <TopicsList topics={serialized} allTags={allTags} />
}
