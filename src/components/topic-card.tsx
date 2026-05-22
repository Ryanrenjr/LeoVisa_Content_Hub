'use client'

import { CheckCircle2, Loader2, Circle, FileText, Video, Send } from 'lucide-react'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import type { TopicStatus, AssetType, AssetStatus } from '@/types'

// ─── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<TopicStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT:            { label: '草稿',   variant: 'glass-default' },
  IN_PRODUCTION:    { label: '制作中', variant: 'glass-blue' },
  READY_TO_PUBLISH: { label: '待发布', variant: 'glass-orange' },
  PUBLISHED:        { label: '已发布', variant: 'glass-green' },
  ARCHIVED:         { label: '已归档', variant: 'glass-default' },
}

const PLATFORM_COLOR: Record<string, string> = {
  VIDEO_CHANNEL:   '#6E3FFB',
  XIAOHONGSHU:     '#FF2442',
  WECHAT_OFFICIAL: '#07C160',
}

const assetTypeLabel: Record<AssetType, string> = {
  WECHAT_ARTICLE: '公众号',
  XHS_POST:       '小红书',
  VIDEO:          '视频',
}

const assetTypeOrder: AssetType[] = ['WECHAT_ARTICLE', 'XHS_POST', 'VIDEO']
const assetTypeIcon: Record<AssetType, React.ReactNode> = {
  WECHAT_ARTICLE: <FileText size={11} />,
  XHS_POST:       <FileText size={11} />,
  VIDEO:          <Video size={11} />,
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TopicCardData = {
  id: string
  code: string
  title: string
  description: string | null
  status: string
  createdAt: string
  owner: { id: string; name: string }
  tags: { id: string; name: string }[]
  assets: {
    id: string
    type: string
    status: string
    publishTasks: {
      accountId: string
      account: { id: string; name: string; platform: string }
    }[]
  }[]
}

interface TopicCardProps {
  topic: TopicCardData
  onDistributeClick?: () => void
}

const DISTRIBUTE_ELIGIBLE = new Set(['IN_PRODUCTION', 'READY_TO_PUBLISH', 'PUBLISHED'])

// ─── Asset pill ────────────────────────────────────────────────────────────────

function AssetPill({ type, status }: { type: AssetType; status: AssetStatus }) {
  let color = '#C7C7CC'
  let statusNode: React.ReactNode = <Circle size={9} style={{ color: '#C7C7CC' }} />

  if (status === 'COMPLETED') {
    color      = '#34C759'
    statusNode = <CheckCircle2 size={9} style={{ color: '#34C759' }} />
  } else if (status === 'IN_PROGRESS') {
    color      = '#0071E3'
    statusNode = <Loader2 size={9} style={{ color: '#0071E3' }} className="animate-spin" />
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <span style={{ color, display: 'flex', alignItems: 'center' }}>{assetTypeIcon[type]}</span>
      <span style={{ fontSize: '11px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
        {assetTypeLabel[type]}
      </span>
      {statusNode}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TopicCard({ topic, onDistributeClick }: TopicCardProps) {
  const topicStatus = topic.status as TopicStatus
  const statusInfo  = statusConfig[topicStatus] ?? { label: topic.status, variant: 'glass-default' as BadgeVariant }

  const date    = new Date(topic.createdAt)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  // Unique accounts across all assets (deduped)
  const accountMap = new Map<string, { id: string; name: string; platform: string }>()
  for (const a of topic.assets) {
    for (const t of a.publishTasks) {
      if (!accountMap.has(t.accountId)) accountMap.set(t.accountId, t.account)
    }
  }
  const accounts    = Array.from(accountMap.values())
  const sortedAssets = [...topic.assets].sort(
    (a, b) => assetTypeOrder.indexOf(a.type as AssetType) - assetTypeOrder.indexOf(b.type as AssetType),
  )

  const showDistribute = DISTRIBUTE_ELIGIBLE.has(topic.status) && !!onDistributeClick

  return (
    <div
      style={{
        padding: '14px 20px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.08)'
        el.style.background = 'rgba(255,255,255,0.9)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.04)'
        el.style.background = 'rgba(255,255,255,0.72)'
      }}
    >
      {/* ── Row 1: status · code · title · date · button ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Status badge */}
        <AppleBadge variant={statusInfo.variant}>{statusInfo.label}</AppleBadge>

        {/* Code — permanent ID, like a ticket number */}
        <span
          title="选题编号（创建时自动分配，永久不变）"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#AEAEB2',
            letterSpacing: '0.04em',
            fontFamily: 'SF Mono, Consolas, monospace',
            flexShrink: 0,
          }}
        >
          {topic.code}
        </span>

        {/* Title */}
        <p style={{
          flex: 1,
          minWidth: 0,
          fontSize: '15px',
          fontWeight: 600,
          color: '#1D1D1F',
          letterSpacing: '-0.022em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
        }}>
          {topic.title}
        </p>

        {/* Date */}
        <span style={{
          fontSize: '11px',
          color: '#AEAEB2',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}>
          {dateStr}
        </span>

        {/* Distribute button */}
        {showDistribute ? (
          <button
            title="前往分发设置"
            onClick={(e) => { e.stopPropagation(); onDistributeClick!() }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              border: '1px solid rgba(0,113,227,0.2)',
              background: 'rgba(0,113,227,0.06)',
              color: '#0071E3',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = 'rgba(0,113,227,0.14)'
              b.style.borderColor = 'rgba(0,113,227,0.4)'
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = 'rgba(0,113,227,0.06)'
              b.style.borderColor = 'rgba(0,113,227,0.2)'
            }}
          >
            <Send size={12} />
          </button>
        ) : (
          /* placeholder so the row height is stable when button is absent */
          <div style={{ width: '26px', flexShrink: 0 }} />
        )}
      </div>

      {/* ── Row 2: assets · accounts · tags ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '9px',
          paddingTop: '9px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {/* Asset status pills */}
        {sortedAssets.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            {sortedAssets.map((a) => (
              <AssetPill key={a.id} type={a.type as AssetType} status={a.status as AssetStatus} />
            ))}
          </div>
        )}

        {/* Separator before accounts */}
        {accounts.length > 0 && sortedAssets.length > 0 && (
          <span style={{ color: '#D1D1D6', fontSize: '12px', flexShrink: 0 }}>·</span>
        )}

        {/* Account chips */}
        {accounts.map((acc) => {
          const color = PLATFORM_COLOR[acc.platform] ?? '#86868B'
          return (
            <span
              key={acc.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#6E6E73',
                background: `${color}0E`,
                border: `1px solid ${color}28`,
                borderRadius: '6px',
                padding: '2px 8px',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
                flexShrink: 0,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {acc.name}
            </span>
          )
        })}

        {/* Separator before tags */}
        {topic.tags.length > 0 && (accounts.length > 0 || sortedAssets.length > 0) && (
          <span style={{ color: '#D1D1D6', fontSize: '12px', flexShrink: 0 }}>·</span>
        )}

        {/* Topic tags */}
        {topic.tags.map((tag) => (
          <span
            key={tag.id}
            style={{
              fontSize: '11px',
              color: '#86868B',
              background: 'rgba(0,0,0,0.04)',
              borderRadius: '5px',
              padding: '2px 7px',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              flexShrink: 0,
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}
