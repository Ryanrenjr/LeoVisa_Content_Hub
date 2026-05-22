import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAllTags } from '@/app/(dashboard)/topics/actions'
import { TopicDetail } from '@/components/topic-detail'

export const metadata = {
  title: '新建选题 — LeoVisa Content Hub',
}

export default async function NewTopicPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const allTags = await getAllTags()

  return (
    <TopicDetail
      topic={null}
      allTags={allTags}
      mode="create"
      ownerId={session.user.id}
    />
  )
}
