import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeoVisa Content Hub',
  description: '内容分发管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
