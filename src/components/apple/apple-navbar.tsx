'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavbarUrgentBadge } from '@/components/navbar-urgent-badge'

const navLinks = [
  { label: '仪表盘', href: '/' },
  { label: '账号矩阵', href: '/accounts' },
  { label: '选题工作台', href: '/topics' },
  { label: '排期管理', href: '/schedule', showUrgentBadge: true },
  { label: '操作流程', href: '/workflow' },
]

const ROLE_LABEL: Record<string, string> = {
  ADMIN: '管理员',
  PUBLISHER: '分发执行',
  EDITOR: '内容编辑',
}

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: 'rgba(0,113,227,0.1)', color: '#0071E3' },
  PUBLISHER: { bg: 'rgba(110,63,251,0.1)', color: '#6E3FFB' },
  EDITOR: { bg: 'rgba(52,199,89,0.1)', color: '#34C759' },
}

function avatarColor(name: string): string {
  const colors = ['#0071E3', '#6E3FFB', '#FF9500', '#34C759', '#FF3B30']
  return colors[name.charCodeAt(0) % colors.length]
}

interface NavbarUser {
  name?: string
  email?: string
  role?: string
}

export function AppleNavbar({ user }: { user?: NavbarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSigningOut, startSignOut] = useTransition()

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'
  const bgColor = user?.name ? avatarColor(user.name) : '#86868B'
  const role = user?.role ?? 'EDITOR'
  const roleLabel = ROLE_LABEL[role] ?? role
  const roleColors = ROLE_COLOR[role] ?? ROLE_COLOR.EDITOR
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

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

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 text-white outline-none focus:outline-none focus-visible:outline-none"
          style={{
            backgroundColor: bgColor,
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {initial}
        </button>

        {menuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '36px',
              right: 0,
              zIndex: 80,
              minWidth: '220px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 18px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
              padding: '8px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: bgColor,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.01em' }}>
                  {user?.name ?? '用户'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#86868B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email ?? ''}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '3px',
                    background: roleColors.bg,
                    color: roleColors.color,
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    borderRadius: '980px',
                    padding: '1px 7px',
                  }}
                >
                  {roleLabel}
                </span>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '8px -2px' }} />

            {isAdmin && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    router.push('/settings')
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#1D1D1F',
                    cursor: 'pointer',
                  }}
                >
                  用户管理
                </button>
                <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '8px -2px' }} />
              </>
            )}

            <button
              type="button"
              role="menuitem"
              disabled={isSigningOut}
              onClick={() => {
                startSignOut(async () => {
                  await signOut({ callbackUrl: '/login' })
                })
              }}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                borderRadius: '8px',
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: '13px',
                color: '#FF3B30',
                cursor: isSigningOut ? 'wait' : 'pointer',
                opacity: isSigningOut ? 0.65 : 1,
              }}
            >
              {isSigningOut ? '退出中...' : '退出登录'}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
