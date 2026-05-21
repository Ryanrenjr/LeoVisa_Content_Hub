'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeekTask = {
  id: string
  assetType: string
  accountName: string
  topicTitle: string
  urgency: string
  status: string
}

export type WeekDayData = {
  dayLabel: string   // "周一"
  dateLabel: string  // "5/19"
  dateISO: string    // ISO string (for today detection)
  tasks: WeekTask[]
}

// ─── Color map ────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  VIDEO:          '#6E3FFB',
  WECHAT_ARTICLE: '#34C759',
  XHS_POST:       '#FF3B30',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WeekSchedule({
  days,
  weekRangeLabel,
}: {
  days: WeekDayData[]
  weekRangeLabel: string
}) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const today = new Date().toDateString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: '18px',
        padding: '24px',
        minHeight: '320px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '2px' }}>
            本周排期
          </h2>
          <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>{weekRangeLabel}</p>
        </div>
        <Link
          href="/schedule"
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: '#0071E3', fontWeight: 500,
            textDecoration: 'none', letterSpacing: '-0.01em',
          }}
        >
          完整排期 <ArrowRight size={12} />
        </Link>
      </div>

      {/* 7-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((day, i) => {
          const isToday = new Date(day.dateISO).toDateString() === today
          const hovered = hoveredDay === i
          const total = day.tasks.length
          const done = day.tasks.filter((t) => t.status === 'PUBLISHED').length
          const DOTS_MAX = 5

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredDay(i)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                borderRadius: '12px',
                background: hovered
                  ? 'rgba(0,113,227,0.06)'
                  : isToday
                  ? 'rgba(0,113,227,0.04)'
                  : 'transparent',
                border: isToday ? '1px solid rgba(0,113,227,0.15)' : '1px solid transparent',
                transition: 'background 0.15s',
                cursor: total > 0 ? 'pointer' : 'default',
                minHeight: '120px',
              }}
            >
              {/* Day name */}
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#86868B', letterSpacing: '-0.01em' }}>
                {day.dayLabel}
              </span>

              {/* Date */}
              <div
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: isToday ? '#0071E3' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{
                  fontSize: '12px', fontWeight: isToday ? 700 : 400,
                  color: isToday ? '#fff' : '#1D1D1F',
                  letterSpacing: '-0.01em',
                }}>
                  {day.dateLabel}
                </span>
              </div>

              {/* Task dots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', flex: 1 }}>
                {day.tasks.slice(0, DOTS_MAX).map((task) => (
                  <div
                    key={task.id}
                    title={`${task.topicTitle} → ${task.accountName}`}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: TYPE_COLOR[task.assetType] ?? '#86868B',
                      flexShrink: 0,
                      boxShadow: task.urgency === 'URGENT'
                        ? `0 0 6px ${TYPE_COLOR[task.assetType] ?? '#86868B'}88`
                        : 'none',
                    }}
                  />
                ))}
                {total > DOTS_MAX && (
                  <span style={{ fontSize: '9px', color: '#86868B', fontWeight: 600 }}>
                    +{total - DOTS_MAX}
                  </span>
                )}
              </div>

              {/* Count */}
              {total > 0 && (
                <span style={{ fontSize: '10px', color: '#86868B', letterSpacing: '-0.01em' }}>
                  {done}/{total}
                </span>
              )}

              {/* Hover tooltip */}
              {hovered && total > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    marginTop: '6px',
                    background: 'rgba(29,29,31,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    minWidth: '140px',
                    maxWidth: '200px',
                    pointerEvents: 'none',
                  }}
                >
                  {day.tasks.slice(0, 5).map((task) => (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      marginBottom: '4px',
                    }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: TYPE_COLOR[task.assetType] ?? '#86868B',
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: '11px', color: 'rgba(255,255,255,0.85)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                      }}>
                        {task.topicTitle}
                      </span>
                    </div>
                  ))}
                  {total > 5 && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      另有 {total - 5} 条…
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {[
          { color: '#6E3FFB', label: '视频' },
          { color: '#34C759', label: '公众号' },
          { color: '#FF3B30', label: '小红书' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
