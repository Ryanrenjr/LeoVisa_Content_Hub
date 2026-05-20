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

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TopicsToolbarProps {
  statusFilter: TopicStatus | 'ALL'
  onStatusChange: (s: TopicStatus | 'ALL') => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  allTags: { id: string; name: string }[]
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
  )
}
