'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Compass } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { NavbarUrgentBadge } from '@/components/navbar-urgent-badge'
import { handleSignOut } from '@/lib/actions/auth'

// ─── Config ───────────────────────────────────────────────────────────────────

const navLinks = [
  { label: '仪表盘', href: '/' },
  { label: '账号矩阵', href: '/accounts' },
  { label: '选题工作台', href: '/topics' },
  { label: '排期管理', href: '/schedule', showUrgentBadge: true },
]

const ROLE_LABEL: Record<string, string> = {
  ADMIN:     '管理员',
  PUBLISHER: '分发执行',
  EDITOR:    '内容编辑',
}

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  ADMIN:     { bg: 'rgba(0,113,227,0.1)',   color: '#0071E3' },
  PUBLISHER: { bg: 'rgba(110,63,251,0.1)',  color: '#6E3FFB' },
  EDITOR:    { bg: 'rgba(52,199,89,0.1)',   color: '#34C759' },
}

function avatarColor(name: string): string {
  const colors = ['#0071E3', '#6E3FFB', '#FF9500', '#34C759', '#FF3B30']
  return colors[name.charCodeAt(0) % colors.length]
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NavbarUser {
  name?: string
  email?: string
  role?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppleNavbar({ user }: { user?: NavbarUser }) {
  const pathname = usePathname()
  const initial = user?.name?.[0]?.toUpperCase() ?? '?'
  const bgColor = user?.name ? avatarColor(user.name) : '#86868B'
  const role = user?.role ?? 'EDITOR'
  const roleLabel = ROLE_LABEL[role] ?? role
  const roleColors = ROLE_COLOR[role] ?? ROLE_COLOR.EDITOR

  const router = useRouter()
  const isAdmin = role === 'ADMIN'

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
              'flex items-center rounded-lg px-3 py-1.5 text-sm tracking-[-0.01em] transition-colors duration-200',
              isActive(link.href)
                ? 'font-medium text-[#0071E3]'
                : 'text-[#1D1D1F] hover:text-[#0071E3]',
            )}
          >
            {link.label}
            {link.showUrgentBadge && <NavbarUrgentBadge />}
          </Link>
        ))}
      </nav>

      {/* User avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 text-white outline-none focus:outline-none focus-visible:outline-none"
          style={{
            backgroundColor: bgColor,
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {initial}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" style={{ minWidth: '200px' }}>
          {/* User info */}
          <DropdownMenuLabel className="font-normal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: bgColor, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.01em' }}>
                  {user?.name ?? '用户'}
                </div>
                <div style={{ fontSize: '11px', color: '#86868B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email ?? ''}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '3px',
                  background: roleColors.bg, color: roleColors.color,
                  fontSize: '10px', fontWeight: 600, letterSpacing: '-0.01em',
                  borderRadius: '980px', padding: '1px 7px',
                }}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Admin: user management */}
          {isAdmin && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push('/settings')}
            >
              用户管理
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Sign out */}
          <form action={handleSignOut} style={{ margin: 0 }}>
            <button
              type="submit"
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent"
              style={{ color: '#FF3B30', border: 'none', background: 'transparent' }}
            >
              退出登录
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
