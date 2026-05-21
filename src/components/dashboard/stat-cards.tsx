'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Wrench, Send, CheckCircle2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatCardsData = {
  totalTopics: number
  archivedTopics: number
  inProductionTopics: number
  weekNewTopics: number       // this week
  lastWeekNewTopics: number   // last week (for delta)
  pendingTasksCount: number   // ready to publish tasks + non-published publish tasks
  thisWeekPendingCount: number
  urgentCount: number
  publishedTotal: number
  thisWeekPublished: number
}

// ─── Glass spotlight card ─────────────────────────────────────────────────────

function GlassCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        padding: '24px',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 16px 40px rgba(0,0,0,0.08)'
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
            'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(0,113,227,0.07), transparent 45%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}

// ─── Individual stat card internals ──────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  gradient,
  icon,
  iconBg,
  urgentBadge,
  delay,
}: {
  title: string
  value: number
  subtitle: string
  gradient: string
  icon: React.ReactNode
  iconBg: string
  urgentBadge?: number
  delay?: number
}) {
  return (
    <GlassCard delay={delay}>
      {/* Top row: title + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#6E6E73', letterSpacing: '-0.01em' }}>
            {title}
          </span>
          {urgentBadge !== undefined && urgentBadge > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              background: 'rgba(255,59,48,0.12)', color: '#FF3B30',
              borderRadius: '980px', padding: '2px 7px',
              fontSize: '10px', fontWeight: 600, letterSpacing: '-0.01em',
            }}>
              🔴 {urgentBadge} 紧急
            </span>
          )}
        </div>
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Big number */}
      <div
        style={{
          fontSize: '48px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: '10px',
          background: gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          display: 'inline-block',
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em', lineHeight: 1.4 }}>
        {subtitle}
      </p>
    </GlassCard>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function StatCards({ data }: { data: StatCardsData }) {
  const delta = data.weekNewTopics - data.lastWeekNewTopics
  const deltaText =
    delta > 0
      ? `↑ 比上周 +${delta}`
      : delta < 0
      ? `↓ 比上周 ${delta}`
      : '与上周持平'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}
    >
      <StatCard
        delay={0.1}
        title="总选题数"
        value={data.totalTopics}
        subtitle={`已归档 ${data.archivedTopics} 条`}
        gradient="linear-gradient(135deg, #C26800, #F5A623)"
        icon={<Lightbulb size={16} color="#C26800" />}
        iconBg="rgba(194,104,0,0.1)"
      />
      <StatCard
        delay={0.15}
        title="制作中"
        value={data.inProductionTopics}
        subtitle={deltaText}
        gradient="linear-gradient(135deg, #0071E3, #0091FF)"
        icon={<Wrench size={16} color="#0071E3" />}
        iconBg="rgba(0,113,227,0.1)"
      />
      <StatCard
        delay={0.2}
        title="待发布"
        value={data.pendingTasksCount}
        subtitle={`本周需完成 ${data.thisWeekPendingCount} 条`}
        gradient="linear-gradient(135deg, #6E3FFB, #9B6BFF)"
        icon={<Send size={16} color="#6E3FFB" />}
        iconBg="rgba(110,63,251,0.1)"
        urgentBadge={data.urgentCount}
      />
      <StatCard
        delay={0.25}
        title="已发布"
        value={data.publishedTotal}
        subtitle={`本周已发布 ${data.thisWeekPublished} 条`}
        gradient="linear-gradient(135deg, #1F8C3F, #34C759)"
        icon={<CheckCircle2 size={16} color="#34C759" />}
        iconBg="rgba(52,199,89,0.1)"
      />
    </div>
  )
}
