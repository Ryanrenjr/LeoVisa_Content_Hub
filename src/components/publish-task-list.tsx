'use client'

import { useState, useTransition } from 'react'
import { Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { deletePublishTask } from '@/app/(dashboard)/topics/distribute-actions'
import { formatScheduledTime } from '@/lib/format-date'
import { toast } from 'sonner'

export type TaskListItem = {
  id: string
  assetId: string
  assetType: string
  accountId: string
  accountName: string
  scheduledAt: string | null
  urgency: string
  status: string
  publishedUrl: string | null
}

const ASSET_TYPE_LABEL: Record<string, { label: string; variant: BadgeVariant }> = {
  WECHAT_ARTICLE: { label: '公众号', variant: 'glass-green' },
  XHS_POST:       { label: '小红书', variant: 'glass-red' },
  VIDEO:          { label: '视频',   variant: 'glass-blue' },
}

const TASK_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING:   { label: '待发布', variant: 'glass-orange' },
  SCHEDULED: { label: '已排期', variant: 'glass-blue' },
  PUBLISHED: { label: '已发布', variant: 'glass-green' },
  CANCELLED: { label: '已取消', variant: 'glass-default' },
  BACKLOG:   { label: '备稿',   variant: 'glass-purple' },
}

const URGENCY_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  URGENT: { label: '紧急', variant: 'glass-red' },
  NORMAL: { label: '普通', variant: 'glass-default' },
}

interface PublishTaskListProps {
  tasks: TaskListItem[]
}

export function PublishTaskList({ tasks }: PublishTaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const pending   = tasks.filter((t) => t.status === 'PENDING').length
  const scheduled = tasks.filter((t) => t.status === 'SCHEDULED').length
  const backlog   = tasks.filter((t) => t.status === 'BACKLOG').length
  const published = tasks.filter((t) => t.status === 'PUBLISHED').length

  function handleDelete(taskId: string) {
    setDeletingId(taskId)
    startTransition(async () => {
      try {
        await deletePublishTask(taskId)
        toast.success('发布任务已删除')
      } catch (e) {
        toast.error('删除失败：' + (e instanceof Error ? e.message : '未知错误'))
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div style={{ marginTop: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1D1D1F',
            letterSpacing: '-0.022em',
          }}
        >
          发布任务
        </h2>
        <span style={{ fontSize: '13px', color: '#86868B', letterSpacing: '-0.01em' }}>
          {pending   > 0 && `${pending} 待发布`}
          {pending   > 0 && (scheduled > 0 || backlog > 0 || published > 0) && ' · '}
          {scheduled > 0 && `${scheduled} 已排期`}
          {scheduled > 0 && (backlog > 0 || published > 0) && ' · '}
          {backlog   > 0 && `${backlog} 备稿`}
          {backlog   > 0 && published > 0 && ' · '}
          {published > 0 && `${published} 已发布`}
        </span>
      </div>

      {/* Task rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map((task) => {
          const assetCfg  = ASSET_TYPE_LABEL[task.assetType]  ?? { label: task.assetType, variant: 'glass-default' as BadgeVariant }
          const statusCfg = TASK_STATUS_CONFIG[task.status]   ?? { label: task.status,    variant: 'glass-default' as BadgeVariant }
          const urgencyCfg = URGENCY_CONFIG[task.urgency]     ?? { label: task.urgency,   variant: 'glass-default' as BadgeVariant }

          const scheduled_ = task.scheduledAt ? formatScheduledTime(task.scheduledAt) : null
          const canDelete = task.status !== 'PUBLISHED'

          return (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Left: asset + account badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <AppleBadge variant={assetCfg.variant}>{assetCfg.label}</AppleBadge>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#1D1D1F',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '160px',
                  }}
                >
                  {task.accountName}
                </span>
              </div>

              {/* Middle: schedule + urgency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13px',
                    color: scheduled_?.expired ? '#FF3B30' : '#6E6E73',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {scheduled_           ? scheduled_.text
                   : task.status === 'BACKLOG' ? '备稿待发'
                   : '立即发布'}
                </span>
                {task.urgency === 'URGENT' && (
                  <AppleBadge variant={urgencyCfg.variant}>{urgencyCfg.label}</AppleBadge>
                )}
              </div>

              {/* Right: status + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <AppleBadge variant={statusCfg.variant}>{statusCfg.label}</AppleBadge>

                {task.status === 'PUBLISHED' && task.publishedUrl && (
                  <a
                    href={task.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#0071E3',
                      textDecoration: 'none',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <ExternalLink size={12} />
                    查看链接
                  </a>
                )}

                {canDelete && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: 'none',
                      border: 'none',
                      cursor: deletingId === task.id ? 'not-allowed' : 'pointer',
                      color: '#FF3B30',
                      fontSize: '12px',
                      padding: '4px',
                      borderRadius: '6px',
                      opacity: deletingId === task.id ? 0.6 : 1,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,48,0.08)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                    title="删除任务"
                  >
                    {deletingId === task.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
