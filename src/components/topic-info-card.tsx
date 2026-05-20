'use client'

import { useState, useRef, useTransition, useCallback } from 'react'
import { Check, Loader2, User, Clock } from 'lucide-react'
import { AppleCard } from '@/components/apple/apple-card'
import { TopicStatusSelector } from '@/components/topic-status-selector'
import { TopicTagSelector } from '@/components/topic-tag-selector'
import { updateTopic } from '@/app/(dashboard)/topics/actions'
import type { TopicStatus } from '@/types'

// ─── Inline editable field ─────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved'

function useInlineEdit(
  topicId: string | null,
  field: 'title' | 'description',
  initial: string,
) {
  const [value, setValue] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [, startTransition] = useTransition()

  const save = useCallback(async (v: string) => {
    if (!topicId || v === initial) { setEditing(false); return }
    setSaveState('saving')
    setEditing(false)
    startTransition(async () => {
      await updateTopic(topicId, { [field]: v })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    })
  }, [topicId, field, initial]) // eslint-disable-line

  return { value, setValue, editing, setEditing, saveState, save }
}

// ─── Save indicator ────────────────────────────────────────────────────────────

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
      {state === 'saving' ? (
        <><Loader2 size={12} className="animate-spin" style={{ color: '#86868B' }} /><span style={{ color: '#86868B' }}>保存中</span></>
      ) : (
        <><Check size={12} style={{ color: '#34C759' }} /><span style={{ color: '#34C759' }}>已保存</span></>
      )}
    </span>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TopicDetailData = {
  id: string
  code: string
  title: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  owner: { id: string; name: string }
  tags: { id: string; name: string }[]
  assets: { id: string; type: string; status: string }[]
}

interface TopicInfoCardProps {
  topic: TopicDetailData | null  // null = create mode
  allTags: { id: string; name: string }[]
  mode: 'view' | 'create'
  onTitleChange?: (v: string) => void
  onDescriptionChange?: (v: string) => void
  onStatusChange?: (s: TopicStatus) => void
  onTagsChange?: (tags: { id: string; name: string }[]) => void
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TopicInfoCard({
  topic,
  allTags,
  mode,
  onTitleChange,
  onDescriptionChange,
}: TopicInfoCardProps) {
  const isCreate = mode === 'create'

  // ── Edit state (create mode uses local state only) ────────────────────────
  const titleEdit = useInlineEdit(topic?.id ?? null, 'title', topic?.title ?? '')
  const descEdit  = useInlineEdit(topic?.id ?? null, 'description', topic?.description ?? '')

  // Create-mode local state
  const [createTitle, setCreateTitle] = useState('')
  const [createDesc,  setCreateDesc]  = useState('')

  const titleInputRef = useRef<HTMLInputElement>(null)
  const descTextareaRef = useRef<HTMLTextAreaElement>(null)

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  // ── Title render ──────────────────────────────────────────────────────────
  const renderTitle = () => {
    if (isCreate) {
      return (
        <input
          ref={titleInputRef}
          type="text"
          placeholder="输入选题标题…"
          value={createTitle}
          onChange={(e) => {
            setCreateTitle(e.target.value)
            onTitleChange?.(e.target.value)
          }}
          style={{
            width: '100%',
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#1D1D1F',
            border: 'none',
            borderBottom: '2px solid rgba(0,113,227,0.3)',
            outline: 'none',
            background: 'transparent',
            padding: '4px 0',
          }}
        />
      )
    }

    if (titleEdit.editing) {
      return (
        <input
          ref={titleInputRef}
          autoFocus
          type="text"
          value={titleEdit.value}
          onChange={(e) => titleEdit.setValue(e.target.value)}
          onBlur={() => titleEdit.save(titleEdit.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
              titleEdit.save(titleEdit.value)
            }
            if (e.key === 'Escape') { titleEdit.setValue(topic?.title ?? ''); titleEdit.setEditing(false) }
          }}
          style={{
            width: '100%',
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#1D1D1F',
            border: 'none',
            borderBottom: '2px solid #0071E3',
            outline: 'none',
            background: 'transparent',
            padding: '4px 0',
          }}
        />
      )
    }

    return (
      <h1
        onClick={() => titleEdit.setEditing(true)}
        title="点击编辑标题"
        style={{
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: '#1D1D1F',
          cursor: 'text',
          padding: '4px 0',
          borderBottom: '2px solid transparent',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(0,113,227,0.2)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}
      >
        {titleEdit.value || <span style={{ color: '#C7C7CC' }}>未填写标题</span>}
      </h1>
    )
  }

  // ── Description render ────────────────────────────────────────────────────
  const renderDesc = () => {
    if (isCreate) {
      return (
        <textarea
          ref={descTextareaRef}
          placeholder="选题描述（选填）…"
          value={createDesc}
          rows={3}
          onChange={(e) => {
            setCreateDesc(e.target.value)
            onDescriptionChange?.(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          style={{
            width: '100%',
            fontSize: '16px',
            color: '#6E6E73',
            letterSpacing: '-0.01em',
            lineHeight: 1.6,
            border: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            padding: '4px 0',
            fontFamily: 'inherit',
          }}
        />
      )
    }

    if (descEdit.editing) {
      return (
        <textarea
          ref={descTextareaRef}
          autoFocus
          value={descEdit.value}
          rows={3}
          onChange={(e) => {
            descEdit.setValue(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onBlur={() => descEdit.save(descEdit.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) descEdit.save(descEdit.value)
            if (e.key === 'Escape') { descEdit.setValue(topic?.description ?? ''); descEdit.setEditing(false) }
          }}
          style={{
            width: '100%',
            fontSize: '16px',
            color: '#6E6E73',
            letterSpacing: '-0.01em',
            lineHeight: 1.6,
            border: 'none',
            borderBottom: '1px solid #0071E3',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            padding: '4px 0',
            fontFamily: 'inherit',
          }}
        />
      )
    }

    return (
      <p
        onClick={() => descEdit.setEditing(true)}
        title="点击编辑描述"
        style={{
          fontSize: '16px',
          color: '#6E6E73',
          letterSpacing: '-0.01em',
          lineHeight: 1.6,
          cursor: 'text',
          padding: '4px 0',
          borderBottom: '1px solid transparent',
          transition: 'border-color 0.15s',
          minHeight: '28px',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(0,0,0,0.08)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}
      >
        {descEdit.value || <span style={{ color: '#C7C7CC' }}>点击添加描述…</span>}
      </p>
    )
  }

  return (
    <AppleCard variant="glass" hoverable={false} style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          gap: '40px',
          alignItems: 'start',
        }}
      >
        {/* ── Left: editable fields ──────────────────────────────────────── */}
        <div>
          {/* Code label */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#0071E3',
                letterSpacing: '0.04em',
                fontFamily: 'SF Mono, Consolas, monospace',
              }}
            >
              {isCreate ? '新建选题' : topic?.code}
            </span>
            {!isCreate && (
              <>
                <SaveIndicator state={titleEdit.saveState !== 'idle' ? titleEdit.saveState : descEdit.saveState} />
              </>
            )}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            {renderTitle()}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            {renderDesc()}
          </div>

          {/* Tags */}
          <div>
            <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>
              标签
            </p>
            {topic && (
              <TopicTagSelector
                topicId={topic.id}
                initialTags={topic.tags}
                allTags={allTags}
              />
            )}
            {isCreate && (
              <p style={{ fontSize: '13px', color: '#C7C7CC' }}>保存后可添加标签</p>
            )}
          </div>
        </div>

        {/* ── Right: meta info ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Status */}
          <div>
            <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>
              状态
            </p>
            {topic ? (
              <TopicStatusSelector
                topicId={topic.id}
                currentStatus={topic.status as TopicStatus}
              />
            ) : (
              <span style={{ fontSize: '13px', color: '#C7C7CC' }}>保存后可设置</span>
            )}
          </div>

          {/* Owner */}
          <div>
            <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>
              负责人
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0071E3, #6E3FFB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={14} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontSize: '14px', color: '#1D1D1F', letterSpacing: '-0.01em' }}>
                {topic?.owner.name ?? 'Ryan'}
              </span>
            </div>
          </div>

          {/* Dates */}
          {topic && (
            <>
              <div>
                <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>
                  创建时间
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} style={{ color: '#86868B' }} />
                  <span style={{ fontSize: '13px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
                    {formatDate(topic.createdAt)}
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>
                  最后更新
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} style={{ color: '#86868B' }} />
                  <span style={{ fontSize: '13px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
                    {formatDateTime(topic.updatedAt)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppleCard>
  )
}
