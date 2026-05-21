'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Copy, ImageDown, Play, Edit3, Trash2, Loader2, ExternalLink, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { PublishConfirmDialog } from '@/components/publish-confirm-dialog'
import { deleteScheduleTask, getAssetTextContent } from '@/app/(dashboard)/schedule/actions'
import { formatScheduledTime } from '@/lib/format-date'
import type { ScheduleTask } from '@/app/(dashboard)/schedule/actions'

// ─── Config ───────────────────────────────────────────────────────────────────

const ASSET_TYPE_CONFIG: Record<string, { label: string; variant: BadgeVariant; color: string }> = {
  WECHAT_ARTICLE: { label: '公众号', variant: 'glass-green', color: '#34C759' },
  XHS_POST:       { label: '小红书', variant: 'glass-red',   color: '#FF3B30' },
  VIDEO:          { label: '视频',   variant: 'glass-blue',  color: '#6E3FFB' },
}

// ─── Action button (icon-only with tooltip) ───────────────────────────────────

function ActionBtn({
  icon,
  label,
  onClick,
  loading = false,
  danger = false,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  loading?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={onClick}
        disabled={loading || disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '30px', height: '30px',
          background: hovered
            ? danger ? 'rgba(255,59,48,0.08)' : 'rgba(0,0,0,0.06)'
            : 'transparent',
          border: 'none', borderRadius: '8px',
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          color: loading || disabled ? '#C7C7CC' : danger ? '#FF3B30' : '#6E6E73',
          transition: 'background 0.15s, color 0.15s',
          flexShrink: 0,
        }}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      </button>
      {hovered && (
        <div
          style={{
            position: 'absolute', bottom: '36px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(29,29,31,0.88)',
            backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: '11px', fontWeight: 500,
            padding: '4px 8px', borderRadius: '6px',
            whiteSpace: 'nowrap', pointerEvents: 'none',
            letterSpacing: '-0.01em', zIndex: 10,
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

interface PublishTaskCardProps {
  task: ScheduleTask
  index?: number
}

export function PublishTaskCard({ task, index = 0 }: PublishTaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [copying, setCopying] = useState(false)
  const [deleting, startDelete] = useTransition()

  const assetCfg = ASSET_TYPE_CONFIG[task.asset.type] ?? {
    label: task.asset.type, variant: 'glass-default' as BadgeVariant, color: '#6E6E73',
  }

  const scheduled = task.scheduledAt ? formatScheduledTime(task.scheduledAt) : null
  const isPublished = task.status === 'PUBLISHED'
  const canDelete = !isPublished

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }, [])

  const handleCopy = async () => {
    setCopying(true)
    try {
      const text = await getAssetTextContent(task.assetId)
      if (!text) { toast.error('未找到文案文件'); return }
      await navigator.clipboard.writeText(text)
      toast.success('✓ 已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    } finally {
      setCopying(false)
    }
  }

  const handleDelete = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    startDelete(async () => {
      try {
        await deleteScheduleTask(task.id)
        toast.success('任务已删除')
      } catch (e) {
        toast.error('删除失败：' + (e instanceof Error ? e.message : '未知错误'))
      } finally {
        setDeleteConfirm(false)
      }
    })
  }

  const publishedDate = task.publishedAt
    ? new Date(task.publishedAt)
    : null

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: index * 0.05 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setDeleteConfirm(false) }}
        style={{
          position: 'relative', overflow: 'hidden',
          display: 'flex', gap: '12px', alignItems: 'stretch',
          padding: '14px 16px',
          background: isPublished ? 'rgba(52,199,89,0.04)' : 'rgba(255,255,255,0.6)',
          border: isPublished
            ? '1px solid rgba(52,199,89,0.15)'
            : '1px solid rgba(255,255,255,0.75)',
          borderRadius: '14px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: hovered
            ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 24px rgba(0,0,0,0.07)'
            : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        {/* Spotlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
            background:
              'radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), rgba(0,113,227,0.06), transparent 50%)',
          }}
        />

        {/* ── Left (30%) ──────────────────────────────────────────────── */}
        <div
          style={{
            flex: '0 0 30%', minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: '6px',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <AppleBadge variant={assetCfg.variant} size="sm">{assetCfg.label}</AppleBadge>
            {task.urgency === 'URGENT' && (
              <AppleBadge variant="glass-red" size="sm">🚨 紧急</AppleBadge>
            )}
          </div>

          {/* Topic title */}
          <p
            title={`${task.asset.topic.code} - ${task.asset.topic.title}`}
            style={{
              fontSize: '13px', fontWeight: 600, color: '#1D1D1F',
              letterSpacing: '-0.01em', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            <span style={{ color: '#0071E3', fontFamily: 'SF Mono, Consolas, monospace', fontSize: '11px', fontWeight: 700 }}>
              {task.asset.topic.code}
            </span>
            {' '}
            {task.asset.topic.title}
          </p>

          {/* Account + time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <AppleBadge variant="glass-default" size="sm">{task.account.name}</AppleBadge>
            {scheduled && (
              scheduled.expired ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  background: 'rgba(255,59,48,0.12)',
                  color: '#FF3B30',
                  borderRadius: '980px',
                  padding: '3px 8px',
                  fontSize: '11px', fontWeight: 500,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  ⚠️ {scheduled.text}
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>
                  {scheduled.text}
                </span>
              )
            )}
            {!task.scheduledAt && !isPublished && (
              <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>立即发布</span>
            )}
          </div>
        </div>

        {/* ── Middle (40%) ─────────────────────────────────────────────── */}
        <div
          style={{
            flex: '0 0 38%', minWidth: 0,
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Thumbnail */}
          {task.asset.coverImagePath ? (
            <div
              style={{
                flexShrink: 0,
                width: task.asset.type === 'VIDEO' ? '88px' : '72px',
                height: task.asset.type === 'VIDEO' ? '50px' : '72px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#F5F5F7',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/storage/${task.asset.coverImagePath}`}
                alt="cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {task.asset.type === 'VIDEO' && task.asset.videoFilePath && (
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                >
                  <Play size={14} fill="#fff" color="#fff" />
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flexShrink: 0, width: '72px', height: '72px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${assetCfg.color}22, ${assetCfg.color}08)`,
                border: `1px solid ${assetCfg.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              {task.asset.type === 'VIDEO' ? '🎬' : task.asset.type === 'XHS_POST' ? '📸' : '📄'}
            </div>
          )}

          {/* Text preview */}
          <p
            style={{
              flex: 1, minWidth: 0,
              fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em',
              lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
            }}
          >
            {task.asset.topic.title}
          </p>
        </div>

        {/* ── Right (30%) ──────────────────────────────────────────────── */}
        <div
          style={{
            flex: '1 1 0', minWidth: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            gap: '8px', position: 'relative', zIndex: 1,
          }}
        >
          {/* Action icons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
            <ActionBtn
              icon={<Copy size={13} />}
              label="复制文案"
              loading={copying}
              onClick={handleCopy}
            />
            {task.asset.coverImagePath && (
              <a
                href={`/api/storage/${task.asset.coverImagePath}`}
                download={`${task.asset.topic.code}_cover.png`}
                style={{ display: 'inline-flex', textDecoration: 'none' }}
              >
                <ActionBtn
                  icon={<ImageDown size={13} />}
                  label="下载封面"
                  onClick={() => {}}
                />
              </a>
            )}
            {task.asset.type === 'VIDEO' && task.asset.videoFilePath && (
              <a
                href={`/api/storage/${task.asset.videoFilePath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', textDecoration: 'none' }}
              >
                <ActionBtn
                  icon={<Play size={13} />}
                  label="查看视频"
                  onClick={() => {}}
                />
              </a>
            )}
            <Link
              href={`/topics/${task.asset.topic.id}/distribute`}
              style={{ display: 'inline-flex', textDecoration: 'none' }}
            >
              <ActionBtn
                icon={<Edit3 size={13} />}
                label="修改排期"
                onClick={() => {}}
              />
            </Link>
            {canDelete && (
              <ActionBtn
                icon={<Trash2 size={13} />}
                label={deleteConfirm ? '再次点击确认删除' : '删除任务'}
                loading={deleting}
                danger
                onClick={handleDelete}
              />
            )}
          </div>

          {/* Main action button */}
          <div>
            {isPublished ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="#34C759" />
                  <span style={{ fontSize: '12px', color: '#34C759', fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {publishedDate
                      ? `已于 ${publishedDate.getMonth() + 1} 月 ${publishedDate.getDate()} 日发布`
                      : '已发布'}
                  </span>
                </div>
                {task.publishedUrl && (
                  <a
                    href={task.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontSize: '11px', color: '#0071E3', fontWeight: 500,
                      textDecoration: 'none', letterSpacing: '-0.01em',
                    }}
                  >
                    <ExternalLink size={10} /> 查看链接
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={() => setDialogOpen(true)}
                style={{
                  width: '100%', padding: '8px 12px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #0091FF 100%)',
                  border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: '#fff',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 2px 8px rgba(0,113,227,0.3)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
              >
                标记已发布
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <PublishConfirmDialog
        task={task}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
