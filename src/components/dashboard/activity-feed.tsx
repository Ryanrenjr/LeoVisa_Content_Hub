'use client'

import { motion } from 'framer-motion'
import { Lightbulb, ArrowUpRight, RefreshCw, Upload, Clock } from 'lucide-react'
import type { ActivityItem, ActivityType } from '@/lib/activity-feed'
import { formatRelativeTime } from '@/lib/date-helpers'

const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string }> = {
  published: {
    icon: <ArrowUpRight size={13} />,
    color: '#34C759',
    bg: 'rgba(52,199,89,0.12)',
  },
  topic_created: {
    icon: <Lightbulb size={13} />,
    color: '#FF9500',
    bg: 'rgba(255,149,0,0.12)',
  },
  topic_status: {
    icon: <RefreshCw size={13} />,
    color: '#0071E3',
    bg: 'rgba(0,113,227,0.12)',
  },
  asset_uploaded: {
    icon: <Upload size={13} />,
    color: '#6E3FFB',
    bg: 'rgba(110,63,251,0.12)',
  },
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '20px' }}>
        最近动态
      </h2>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#86868B', fontSize: '14px' }}>
          暂无动态
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type]
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.025)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: cfg.bg, color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '1px',
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px', color: '#1D1D1F', letterSpacing: '-0.01em',
                    lineHeight: 1.45, marginBottom: '3px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.description}
                  </p>
                  <p style={{ fontSize: '11px', color: '#86868B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} />
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
