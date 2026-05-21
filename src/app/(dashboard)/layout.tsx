import { auth } from '@/auth'
import { AppleNavbar } from '@/components/apple/apple-navbar'
import { AuroraBackground } from '@/components/apple/aurora-background'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user
    ? {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        role: (session.user as { role?: string }).role ?? 'EDITOR',
      }
    : undefined

  return (
    <>
      <AuroraBackground />
      <AppleNavbar user={user} />
      <main style={{ paddingTop: '48px', minHeight: '100vh' }}>{children}</main>
    </>
  )
}
