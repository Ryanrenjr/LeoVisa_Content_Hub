'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: '仪表盘', href: '/' },
  { label: '账号矩阵', href: '/accounts' },
  { label: '选题工作台', href: '/topics' },
  { label: '排期管理', href: '/schedule' },
]

export function AppleNavbar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center px-6"
      style={{
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="mr-8 flex shrink-0 items-center gap-2">
        <Compass size={18} color="#0071E3" strokeWidth={2} />
        <span
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: '#1D1D1F',
            letterSpacing: '-0.022em',
          }}
        >
          LeoVisa
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex flex-1 items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm tracking-[-0.01em] transition-colors duration-200',
              isActive(link.href)
                ? 'font-medium text-[#0071E3]'
                : 'text-[#1D1D1F] hover:text-[#0071E3]',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 text-white outline-none focus:outline-none focus-visible:outline-none"
          style={{
            backgroundColor: '#0071E3',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          R
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer text-[#FF3B30] focus:text-[#FF3B30]">
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
