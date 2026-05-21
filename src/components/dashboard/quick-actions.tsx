'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lightbulb, CalendarCheck2, Users } from 'lucide-react'

const ACTIONS = [
  {
    href: '/topics/new',
    title: '新建选题',
    subtitle: '开始新内容创作',
    icon: Lightbulb,
    iconColor: '#FF9500',
    iconBg: 'rgba(255,149,0,0.1)',
    gradient: 'linear-gradient(135deg, #FF9500, #FFCC02)',
  },
  {
    href: '/schedule',
    title: '排期管理',
    subtitle: '查看本周发布任务',
    icon: CalendarCheck2,
    iconColor: '#0071E3',
    iconBg: 'rgba(0,113,227,0.1)',
    gradient: 'linear-gradient(135deg, #0071E3, #0091FF)',
  },
  {
    href: '/accounts',
    title: '账号矩阵',
    subtitle: '管理各平台账号',
    icon: Users,
    iconColor: '#6E3FFB',
    iconBg: 'rgba(110,63,251,0.1)',
    gradient: 'linear-gradient(135deg, #6E3FFB, #9B6BFF)',
  },
]

function QuickActionCard({
  href,
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  gradient,
  delay,
}: typeof ACTIONS[0] & { delay: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  return (
    <motion.a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '18px 20px',
        borderRadius: '18px',
        textDecoration: 'none',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(0,0,0,0.08)'
          : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s',
          background:
            'radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(0,113,227,0.07), transparent 50%)',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative', zIndex: 1,
        }}
      >
        <Icon size={20} color={iconColor} />
      </div>

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '3px',
            background: gradient,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            display: 'inline-block',
          }}
        >
          {title}
        </div>
        <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>
          {subtitle}
        </p>
      </div>
    </motion.a>
  )
}

export function QuickActions() {
  return (
    <div>
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '14px' }}>
        快捷入口
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ACTIONS.map((action, i) => (
          <QuickActionCard key={action.href} {...action} delay={0.45 + i * 0.05} />
        ))}
      </div>
    </div>
  )
}
