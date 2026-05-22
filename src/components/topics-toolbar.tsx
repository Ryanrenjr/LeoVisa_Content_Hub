'use client'

import { Search, Plus, Tag } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { TopicStatus } from '@/types'

// ─── Status filter capsules ────────────────────────────────────────────────────

const ALL_STATUSES: { value: TopicStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',            label: '全部' },
  { value: 'DRAFT',          label: '草稿' },
  { value: 'IN_PRODUCTION',  label: '制作中' },
  { value: 'READY_TO_PUBLISH', label: '待发布' },
  { value: 'PUBLISHED',      label: '已发布' },
  { value: 'ARCHIVED',       label: '已归档' },
]

// ─── Platform config ───────────────────────────────────────────────────────────

const PLATFORM_COLOR: Record<string, string> = {
  VIDEO_CHANNEL:   '#6E3FFB',
  WECHAT_OFFICIAL: '#07C160',
  XIAOHONGSHU:     '#FF2442',
}

const PLATFORM_LABEL: Record<string, string> = {
  VIDEO_CHANNEL:   '视频号',
  WECHAT_OFFICIAL: '公众号',
  XIAOHONGSHU:     '小红书',
}

const PLATFORM_ORDER = ['VIDEO_CHANNEL', 'WECHAT_OFFICIAL', 'XIAOHONGSHU']

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TopicsToolbarProps {
  statusFilter: TopicStatus | 'ALL'
  onStatusChange: (s: TopicStatus | 'ALL') => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  allTags: { id: string; name: string }[]
  allAccounts: { id: string; name: string; platform: string }[]
  selectedAccount: string | null
  onAccountChange: (id: string | null) => void
  search: string
  onSearchChange: (v: string) => void
  onCreateClick: () => void
}

export function TopicsToolbar({
  statusFilter,
  onStatusChange,
  selectedTags,
  onTagsChange,
  allTags,
  allAccounts,
  selectedAccount,
  onAccountChange,
  search,
  onSearchChange,
  onCreateClick,
}: TopicsToolbarProps) {

  function toggleTag(id: string) {
    if (selectedTags.includes(id)) {
      onTagsChange(selectedTags.filter((t) => t !== id))
    } else {
      onTagsChange([...selectedTags, id])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── Account filter — grouped by platform ────────────────────────── */}
      {allAccounts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {PLATFORM_ORDER.map((platform) => {
            const group = allAccounts.filter((a) => a.platform === platform)
            if (group.length === 0) return null
            const color = PLATFORM_COLOR[platform] ?? '#86868B'
            const label = PLATFORM_LABEL[platform] ?? platform
            return (
              <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Platform label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color,
                    letterSpacing: '0.02em',
                    background: `${color}12`,
                    border: `1px solid ${color}28`,
                    borderRadius: '5px',
                    padding: '2px 7px',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>

                {/* Account chips */}
                {group.map((acc) => {
                  const active = selectedAccount === acc.id
                  return (
                    <button
                      key={acc.id}
                      onClick={() => onAccountChange(active ? null : acc.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 11px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: active ? 600 : 400,
                        letterSpacing: '-0.01em',
                        border: active ? 'none' : `1px solid ${color}28`,
                        background: active ? color : `${color}0A`,
                        color: active ? '#fff' : '#1D1D1F',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: active ? `0 2px 8px ${color}40` : 'none',
                      }}
                    >
                      <span
                        style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: active ? 'rgba(255,255,255,0.8)' : color,
                          flexShrink: 0,
                        }}
                      />
                      {acc.name}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* ── Status capsules ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {ALL_STATUSES.map(({ value, label }) => {
          const active = statusFilter === value
          return (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                letterSpacing: '-0.01em',
                border: active ? 'none' : '1px solid rgba(0,0,0,0.1)',
                background: active
                  ? '#0071E3'
                  : 'rgba(255,255,255,0.5)',
                color: active ? '#fff' : '#1D1D1F',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Tag filter popover ───────────────────────────────────────────── */}
      <Popover>
        <PopoverTrigger
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '13px',
            letterSpacing: '-0.01em',
            border: selectedTags.length > 0
              ? '1px solid rgba(0, 113, 227, 0.4)'
              : '1px solid rgba(0,0,0,0.1)',
            background: selectedTags.length > 0
              ? 'rgba(0,113,227,0.08)'
              : 'rgba(255,255,255,0.5)',
            color: selectedTags.length > 0 ? '#0071E3' : '#1D1D1F',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)' as string,
          }}
        >
          <Tag size={13} />
          标签
          {selectedTags.length > 0 && (
            <span
              style={{
                background: '#0071E3',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '11px',
                padding: '0 6px',
                lineHeight: '18px',
                minWidth: '18px',
                textAlign: 'center',
              }}
            >
              {selectedTags.length}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent
          style={{
            width: '200px',
            padding: '12px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#86868B', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            按标签筛选
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allTags.map((tag) => (
              <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <Label
                  htmlFor={`tag-${tag.id}`}
                  style={{ fontSize: '14px', color: '#1D1D1F', cursor: 'pointer' }}
                >
                  {tag.name}
                </Label>
              </div>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagsChange([])}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#FF3B30',
                border: '1px solid rgba(255,59,48,0.2)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              清除筛选
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Search size={14} style={{ color: '#86868B', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="搜索选题..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#1D1D1F',
            letterSpacing: '-0.01em',
            width: '140px',
          }}
        />
      </div>

      {/* ── New topic button ─────────────────────────────────────────────── */}
      <button
        onClick={onCreateClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 16px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          border: 'none',
          background: '#0071E3',
          color: '#fff',
          cursor: 'pointer',
          transition: 'background 0.18s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0077ED' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0071E3' }}
      >
        <Plus size={14} />
        新建选题
      </button>
    </div>
    </div>
  )
}
