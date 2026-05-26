import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAllTags } from '@/app/(dashboard)/topics/actions'
import { TopicDetail } from '@/components/topic-detail'

export const metadata = {
  title: '新建选题 — LeoVisa Content Hub',
}

export default async function NewTopicPage() {
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

  const allTags = await getAllTags()

  return (
    <TopicDetail
      topic={null}
      allTags={allTags}
      mode="create"
      ownerId={currentUser.id}
    />
  )
}
