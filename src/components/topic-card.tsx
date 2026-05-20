'use client'

import { CheckCircle2, Loader2, Circle, FileText, Video } from 'lucide-react'
import { AppleCard } from '@/components/apple/apple-card'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import type { TopicStatus, AssetType, AssetStatus } from '@/types'

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  TopicStatus,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT:            { label: '草稿',   variant: 'glass-default' },
  IN_PRODUCTION:    { label: '制作中', variant: 'glass-blue' },
  READY_TO_PUBLISH: { label: '待发布', variant: 'glass-orange' },
  PUBLISHED:        { label: '已发布', variant: 'glass-green' },
  ARCHIVED:         { label: '已归档', variant: 'glass-default' },
}

// ─── Asset icon ────────────────────────────────────────────────────────────────

const assetTypeIcon: Record<AssetType, React.ReactNode> = {
  WECHAT_ARTICLE: <FileText size={14} />,
  XHS_POST:       <FileText size={14} />,
  VIDEO:          <Video size={14} />,
}

const assetTypeLabel: Record<AssetType, string> = {
  WECHAT_ARTICLE: '公众号',
  XHS_POST:       '小红书',
  VIDEO:          '视频',
}

function AssetIcon({ type, status }: { type: AssetType; status: AssetStatus }) {
  const icon = assetTypeIcon[type]
  const label = assetTypeLabel[type]

  let color = '#86868B'
  let statusIcon: React.ReactNode

  if (status === 'COMPLETED') {
    color = '#34C759'
    statusIcon = <CheckCircle2 size={12} style={{ color: '#34C759' }} />
  } else if (status === 'IN_PROGRESS') {
    color = '#0071E3'
    statusIcon = <Loader2 size={12} style={{ color: '#0071E3' }} className="animate-spin" />
  } else {
    statusIcon = <Circle size={12} style={{ color: '#C7C7CC' }} />
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: '12px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {statusIcon}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export type TopicCardData = {
  id: string
  code: string
  title: string
  description: string | null
  status: string
  createdAt: string
  owner: { id: string; name: string }
  tags: { id: string; name: string }[]
  assets: { id: string; type: string; status: string }[]
}

interface TopicCardProps {
  topic: TopicCardData
}

export function TopicCard({ topic }: TopicCardProps) {
  const topicStatus = topic.status as TopicStatus
  const statusInfo = statusConfig[topicStatus] ?? { label: topic.status, variant: 'glass-default' as BadgeVariant }

  const visibleTags = topic.tags.slice(0, 3)
  const extraTagCount = topic.tags.length - visibleTags.length

  const date = new Date(topic.createdAt)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  return (
    <AppleCard hoverable variant="glass" className="h-full flex flex-col">
      {/* Header row: code + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#0071E3',
            letterSpacing: '0.04em',
            fontFamily: 'SF Mono, Consolas, monospace',
          }}
        >
          {topic.code}
        </span>
        <AppleBadge variant={statusInfo.variant}>{statusInfo.label}</AppleBadge>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#1D1D1F',
          letterSpacing: '-0.022em',
          lineHeight: 1.35,
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {topic.title}
      </h3>

      {/* Description */}
      {topic.description && (
        <p
          style={{
            fontSize: '13px',
            color: '#6E6E73',
            letterSpacing: '-0.01em',
            lineHeight: 1.5,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          {topic.description}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flexGrow: 1 }} />

      {/* Asset status row */}
      {topic.assets.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {topic.assets.map((a) => (
            <AssetIcon
              key={a.id}
              type={a.type as AssetType}
              status={a.status as AssetStatus}
            />
          ))}
        </div>
      )}

      {/* Tags + date row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {visibleTags.map((tag) => (
            <AppleBadge key={tag.id} variant="glass-default">
              {tag.name}
            </AppleBadge>
          ))}
          {extraTagCount > 0 && (
            <AppleBadge variant="glass-default">
              +{extraTagCount}
            </AppleBadge>
          )}
        </div>
        <span
          style={{
            fontSize: '11px',
            color: '#86868B',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {dateStr}
        </span>
      </div>
    </AppleCard>
  )
}
