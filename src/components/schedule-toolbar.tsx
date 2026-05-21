'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const STATUS_TABS = [
  { label: '全部',   value: '' },
  { label: '待发布', value: 'PENDING' },
  { label: '已排期', value: 'SCHEDULED' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已取消', value: 'CANCELLED' },
]

interface ScheduleToolbarProps {
  view: string
  status: string
  todayTotal: number
  todayUrgent: number
  todayPublished: number
}

function TabCapsule({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: '980px',
        padding: '3px',
        gap: '1px',
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 14px',
              borderRadius: '980px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              letterSpacing: '-0.01em',
              background: active ? '#fff' : 'transparent',
              color: active ? '#1D1D1F' : '#6E6E73',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function ScheduleToolbar({
  view,
  status,
  todayTotal,
  todayUrgent,
  todayPublished,
}: ScheduleToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const viewOptions = [
    { label: '列表', value: 'list' },
    { label: '日历', value: 'calendar' },
  ]

  return (
    <div
      style={{
        position: 'sticky',
        top: '48px',
        zIndex: 40,
        background: 'rgba(245,245,247,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '10px 0',
        marginBottom: '28px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* View switcher */}
        <TabCapsule
          options={viewOptions}
          value={view || 'list'}
          onChange={(v) => updateParam('view', v === 'list' ? '' : v)}
        />

        <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }} />

        {/* Status filter */}
        <TabCapsule
          options={STATUS_TABS}
          value={status || ''}
          onChange={(v) => updateParam('status', v)}
        />

        <div style={{ flex: 1 }} />

        {/* Today stats */}
        <p
          style={{
            fontSize: '12px',
            color: '#86868B',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          今日 <strong style={{ color: '#1D1D1F' }}>{todayTotal}</strong> 条
          {todayUrgent > 0 && (
            <> · 紧急 <strong style={{ color: '#FF3B30' }}>{todayUrgent}</strong> 条</>
          )}
          {' '}· 已完成 <strong style={{ color: '#34C759' }}>{todayPublished}</strong> 条
        </p>
      </div>
    </div>
  )
}
