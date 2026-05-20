import { AppleNavbar } from '@/components/apple/apple-navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppleNavbar />
      <main
        style={{
          paddingTop: '48px',
          minHeight: '100vh',
          backgroundColor: '#F5F5F7',
        }}
      >
        {children}
      </main>
    </>
  )
}
