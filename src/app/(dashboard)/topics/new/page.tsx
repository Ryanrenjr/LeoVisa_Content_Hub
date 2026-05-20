import { db } from '@/lib/db'
import { getAllTags } from '@/app/(dashboard)/topics/actions'
import { TopicDetail } from '@/components/topic-detail'

export const metadata = {
  title: '新建选题 — LeoVisa Content Hub',
}

export default async function NewTopicPage() {
  const [ryan, allTags] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { email: 'ryan@leovisa.com' }, select: { id: true } }),
    getAllTags(),
  ])

  return (
    <TopicDetail
      topic={null}
      allTags={allTags}
      mode="create"
      ownerId={ryan.id}
    />
  )
}
