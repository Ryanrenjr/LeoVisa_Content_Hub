import { AppleNavbar } from '@/components/apple/apple-navbar'
import { AuroraBackground } from '@/components/apple/aurora-background'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuroraBackground />
      <AppleNavbar />
      <main style={{ paddingTop: '48px', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  )
}
