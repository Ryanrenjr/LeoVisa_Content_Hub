'use client'

import { motion } from 'framer-motion'

export type AccountActivityItem = {
  accountName: string
  platform: string
  publishedCount: number
  pendingCount: number
}

const PLATFORM_COLOR: Record<string, string> = {
  VIDEO_CHANNEL:   '#6E3FFB',
  XIAOHONGSHU:     '#FF2442',
  WECHAT_OFFICIAL: '#07C160',
}

const PLATFORM_LABEL: Record<string, string> = {
  VIDEO_CHANNEL:   '视频号',
  XIAOHONGSHU:     '小红书',
  WECHAT_OFFICIAL: '公众号',
}

export function AccountActivity({ items }: { items: AccountActivityItem[] }) {
  const maxCount = Math.max(...items.map((i) => i.publishedCount), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
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
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '2px' }}>
          账号活跃度
        </h2>
        <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>累计已发布内容分布</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, i) => {
          const pct = (item.publishedCount / maxCount) * 100
          const color = PLATFORM_COLOR[item.platform] ?? '#86868B'

          return (
            <div key={item.accountName}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: color, flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#1D1D1F', letterSpacing: '-0.01em', fontWeight: 500 }}>
                    {item.accountName}
                  </span>
                  <span style={{
                    fontSize: '10px', color: '#86868B',
                    background: 'rgba(0,0,0,0.05)', borderRadius: '4px', padding: '1px 5px',
                  }}>
                    {PLATFORM_LABEL[item.platform] ?? item.platform}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.pendingCount > 0 && (
                    <span style={{
                      fontSize: '10px', color: '#FF9500',
                      background: 'rgba(255,149,0,0.1)', borderRadius: '4px', padding: '1px 5px', fontWeight: 500,
                    }}>
                      待发 {item.pendingCount}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#6E6E73', fontWeight: 600, minWidth: '20px', textAlign: 'right' }}>
                    {item.publishedCount}
                  </span>
                </div>
              </div>

              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.5 + i * 0.07 }}
                  style={{ height: '100%', borderRadius: '3px', background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
        {Object.entries(PLATFORM_LABEL).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: PLATFORM_COLOR[key] }} />
            <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
