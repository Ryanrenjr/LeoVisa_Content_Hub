'use client'

import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/format-date'

export type ScheduleType = 'immediate' | 'scheduled' | 'backlog'

interface DistributionScheduleProps {
  scheduleType: ScheduleType
  scheduledAt: string
  urgency: 'NORMAL' | 'URGENT'
  onScheduleTypeChange: (t: ScheduleType) => void
  onScheduledAtChange: (v: string) => void
  onUrgencyChange: (u: 'NORMAL' | 'URGENT') => void
  disabled?: boolean
}

export function DistributionSchedule({
  scheduleType,
  scheduledAt,
  urgency,
  onScheduleTypeChange,
  onScheduledAtChange,
  onUrgencyChange,
  disabled,
}: DistributionScheduleProps) {
  const [countdown, setCountdown] = useState('')
  const [isPast, setIsPast] = useState(false)

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  useEffect(() => {
    if (!scheduledAt || scheduleType !== 'scheduled') {
      setCountdown('')
      setIsPast(false)
      return
    }
    function update() {
      const d = new Date(scheduledAt)
      if (d.getTime() <= Date.now()) {
        setIsPast(true)
        setCountdown('')
      } else {
        setIsPast(false)
        setCountdown(formatCountdown(d))
      }
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [scheduledAt, scheduleType])

  const radioStyle = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  })

  const options: { value: ScheduleType; label: string; hint?: string }[] = [
    { value: 'immediate', label: '立即发布' },
    { value: 'scheduled', label: '定时发布' },
    { value: 'backlog',   label: '备稿', hint: '已分配账号，时机成熟时发布' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Schedule type */}
      <div>
        <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>
          发布时间
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map(({ value, label, hint }) => (
            <label key={value} style={radioStyle()}>
              <input
                type="radio"
                disabled={disabled}
                checked={scheduleType === value}
                onChange={() => onScheduleTypeChange(value)}
                style={{ accentColor: '#0071E3', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#1D1D1F', letterSpacing: '-0.01em' }}>{label}</span>
              {hint && scheduleType === value && (
                <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>{hint}</span>
              )}
            </label>
          ))}
        </div>

        {scheduleType === 'scheduled' && (
          <div style={{ marginTop: '10px', paddingLeft: '23px' }}>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDateTime}
              disabled={disabled}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${isPast ? '#FF3B30' : 'rgba(0,0,0,0.1)'}`,
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontSize: '13px',
                color: '#1D1D1F',
                letterSpacing: '-0.01em',
                outline: 'none',
                width: '100%',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
            {isPast && !disabled && (
              <p style={{ fontSize: '11px', color: '#FF3B30', marginTop: '4px', letterSpacing: '-0.01em' }}>
                不允许选择过去的时间
              </p>
            )}
            {countdown && !isPast && !disabled && (
              <p style={{ fontSize: '11px', color: '#0071E3', marginTop: '4px', letterSpacing: '-0.01em' }}>
                {countdown}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Urgency — hidden for backlog */}
      {scheduleType !== 'backlog' && (
        <div>
          <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>
            紧急程度
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['NORMAL', 'URGENT'] as const).map((u) => {
              const isActive = urgency === u
              const isUrgent = u === 'URGENT'
              const activeColor = isUrgent ? '#FF3B30' : '#34C759'
              const activeBg = isUrgent ? 'rgba(255,59,48,0.1)' : 'rgba(52,199,89,0.1)'
              const activeBorder = isUrgent ? '#FF3B30' : '#34C759'
              const activeText = isUrgent ? '#C81E1E' : '#1F8C3F'
              return (
                <button
                  key={u}
                  type="button"
                  disabled={disabled}
                  onClick={() => onUrgencyChange(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    border: `1px solid ${isActive ? activeBorder : 'rgba(0,0,0,0.12)'}`,
                    background: isActive ? activeBg : 'rgba(255,255,255,0.6)',
                    color: isActive ? activeText : '#6E6E73',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  {isUrgent ? '🔴' : '🟢'} {isUrgent ? '紧急' : '普通'}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
