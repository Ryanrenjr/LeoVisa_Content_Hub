'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import type { TopicStatus } from '@/types'
import { updateTopic } from '@/app/(dashboard)/topics/actions'

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: {
  value: TopicStatus
  label: string
  desc: string
  variant: BadgeVariant
}[] = [
  { value: 'DRAFT',            label: '草稿',   desc: '内容创作中，未启动制作', variant: 'glass-default' },
  { value: 'IN_PRODUCTION',    label: '制作中', desc: '资产正在制作或上传',     variant: 'glass-blue' },
  { value: 'READY_TO_PUBLISH', label: '待发布', desc: '已完成，等待分发',       variant: 'glass-orange' },
  { value: 'PUBLISHED',        label: '已发布', desc: '已完成分发至各平台',     variant: 'glass-green' },
  { value: 'ARCHIVED',         label: '已归档', desc: '已下线或暂停运营',       variant: 'glass-default' },
]

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TopicStatusSelectorProps {
  topicId: string
  currentStatus: TopicStatus
  onStatusChange?: (s: TopicStatus) => void
}

export function TopicStatusSelector({
  topicId,
  currentStatus,
  onStatusChange,
}: TopicStatusSelectorProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [pending, startTransition] = useTransition()

  const current = statusConfig.find((s) => s.value === status) ?? statusConfig[0]

  function handleSelect(newStatus: TopicStatus) {
    if (newStatus === status) { setOpen(false); return }
    setStatus(newStatus)
    setOpen(false)
    onStatusChange?.(newStatus)
    startTransition(async () => {
      await updateTopic(topicId, { status: newStatus })
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Current status badge — clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: pending ? 'wait' : 'pointer',
          opacity: pending ? 0.7 : 1,
        }}
        aria-label="切换状态"
      >
        <AppleBadge variant={current.variant}>
          {current.label}
          {pending && ' …'}
        </AppleBadge>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 50,
              width: '240px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '6px',
            }}
          >
            {statusConfig.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSelect(s.value)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: s.value === status ? 'rgba(0,113,227,0.06)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <AppleBadge variant={s.variant}>{s.label}</AppleBadge>
                <span style={{ fontSize: '12px', color: '#6E6E73', flex: 1, letterSpacing: '-0.01em' }}>
                  {s.desc}
                </span>
                {s.value === status && (
                  <Check size={13} style={{ color: '#0071E3', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
