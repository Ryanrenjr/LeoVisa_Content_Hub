import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { SettingsUsers } from '@/components/settings-users'

export const metadata = { title: '用户管理 — LeoVisa Content Hub' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/')

  const users = await db.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return (
    <SettingsUsers
      users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      currentUserId={session.user.id}
    />
  )
}
