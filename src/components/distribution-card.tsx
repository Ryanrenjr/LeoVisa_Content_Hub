'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, FileText, Video } from 'lucide-react'
import { AppleCard } from '@/components/apple/apple-card'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { DistributionAccountSelector, type AccountOption } from '@/components/distribution-account-selector'
import { DistributionSchedule, type ScheduleType } from '@/components/distribution-schedule'
import { createPublishTask, updatePublishTask } from '@/app/(dashboard)/topics/distribute-actions'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DistributeTask = {
  id: string
  assetId: string
  accountId: string
  scheduledAt: string | null
  urgency: string
  status: string
  publishedUrl: string | null
  publishedAt: string | null
  notes: string | null
  account: AccountOption
}

export type DistributeAsset = {
  id: string
  topicId: string
  type: string
  textFilePath: string | null
  coverImagePath: string | null
  videoFilePath: string | null
  scriptFilePath: string | null
  originalNames: string | null
  fileSizes: string | null
  status: string
  publishTasks: DistributeTask[]
  updatedAt: string
}

export type DistributeSuggestion = {
  accountId: string
  accountName: string
  reason: string
} | null

// ─── Config ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  WECHAT_ARTICLE: { label: '公众号图文', variant: 'glass-green' },
  XHS_POST:       { label: '小红书图文', variant: 'glass-red' },
  VIDEO:          { label: '数字人视频', variant: 'glass-blue' },
}

const STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  NOT_STARTED: { label: '未开始', variant: 'glass-default' },
  IN_PROGRESS: { label: '制作中', variant: 'glass-blue' },
  COMPLETED:   { label: '已完成', variant: 'glass-green' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Asset preview ────────────────────────────────────────────────────────────

function AssetPreview({ asset }: { asset: DistributeAsset }) {
  const names: Record<string, string> = asset.originalNames ? JSON.parse(asset.originalNames) : {}
  const coverUrl = asset.coverImagePath ? `/api/storage/${asset.coverImagePath}` : null

  if (asset.type === 'VIDEO') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* 16:9 thumbnail */}
        <div
          style={{
            width: '120px',
            height: '68px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Video size={24} style={{ color: '#C7C7CC' }} />
          )}
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#1D1D1F', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: '3px' }}>
            {names.videoFile ?? (asset.videoFilePath ? '视频已上传' : '暂无视频')}
          </p>
          {asset.scriptFilePath && (
            <p style={{ fontSize: '11px', color: '#86868B' }}>含脚本文件</p>
          )}
        </div>
      </div>
    )
  }

  // Text asset
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt="封面"
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }}
        />
      ) : (
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          <FileText size={24} style={{ color: '#C7C7CC' }} />
        </div>
      )}
      <div>
        <p style={{ fontSize: '13px', color: '#1D1D1F', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: '3px' }}>
          {names.textFile ?? (asset.textFilePath ? '文案已上传' : '暂无文案')}
        </p>
        <p style={{ fontSize: '11px', color: '#86868B' }}>
          {names.coverFile ? `封面：${names.coverFile}` : '暂无封面图'}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DistributionCardProps {
  asset: DistributeAsset
  candidateAccounts: AccountOption[]
  suggestion: DistributeSuggestion
}

export function DistributionCard({ asset, candidateAccounts, suggestion }: DistributionCardProps) {
  const typeCfg   = TYPE_CONFIG[asset.type]   ?? { label: asset.type, variant: 'glass-default' as BadgeVariant }
  const statusCfg = STATUS_BADGE[asset.status] ?? STATUS_BADGE.NOT_STARTED

  const isXhsLocked = asset.type === 'XHS_POST'
  const isDisabled  = asset.status === 'NOT_STARTED'

  const activeTask    = asset.publishTasks.find((t) => ['PENDING', 'SCHEDULED', 'BACKLOG'].includes(t.status))
  const publishedTask = asset.publishTasks.find((t) => t.status === 'PUBLISHED')

  // Form state (initialized from existing task or suggestion)
  const initialAccountId =
    activeTask?.accountId ??
    (isXhsLocked ? candidateAccounts[0]?.id : suggestion?.accountId ?? candidateAccounts[0]?.id) ??
    ''

  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId)
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    activeTask?.status === 'BACKLOG' ? 'backlog' :
    activeTask?.scheduledAt          ? 'scheduled' : 'immediate',
  )
  const [scheduledAt, setScheduledAt] = useState(
    activeTask?.scheduledAt ? toDatetimeLocal(activeTask.scheduledAt) : '',
  )
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT'>(
    (activeTask?.urgency as 'NORMAL' | 'URGENT') ?? 'NORMAL',
  )
  const [submitting, startSubmit] = useTransition()

  function handleSubmit() {
    if (!selectedAccountId) {
      toast.error('请选择目标账号')
      return
    }
    if (scheduleType === 'scheduled') {
      if (!scheduledAt) { toast.error('请选择发布时间'); return }
      if (new Date(scheduledAt) <= new Date()) { toast.error('不允许选择过去的时间'); return }
    }

    const scheduledAtValue = scheduleType === 'scheduled' ? scheduledAt : null
    const urgencyValue     = scheduleType === 'backlog'   ? 'NORMAL'    : urgency

    startSubmit(async () => {
      try {
        if (activeTask) {
          await updatePublishTask(activeTask.id, {
            accountId: selectedAccountId,
            scheduledAt: scheduledAtValue,
            urgency: urgencyValue,
            scheduleType,
          })
          toast.success('发布任务已更新')
        } else {
          await createPublishTask(asset.id, selectedAccountId, scheduledAtValue, urgencyValue, scheduleType)
          toast.success('发布任务已生成')
        }
      } catch (e) {
        toast.error('操作失败：' + (e instanceof Error ? e.message : '未知错误'))
      }
    })
  }

  // ── Published read-only state ───────────────────────────────────────────────
  if (publishedTask) {
    return (
      <AppleCard variant="glass">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AppleBadge variant={typeCfg.variant}>{typeCfg.label}</AppleBadge>
            <AppleBadge variant="glass-green">已发布</AppleBadge>
          </div>
          <AssetPreview asset={asset} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.2)' }}>
            <CheckCircle2 size={16} style={{ color: '#34C759', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1F8C3F', letterSpacing: '-0.01em' }}>
                已发布到 {publishedTask.account.name}
              </p>
              {publishedTask.publishedUrl && (
                <a
                  href={publishedTask.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#0071E3', textDecoration: 'none' }}
                >
                  查看已发布内容 →
                </a>
              )}
            </div>
          </div>
        </div>
      </AppleCard>
    )
  }

  return (
    <AppleCard variant="glass" style={{ position: 'relative' }}>
      {/* NOT_STARTED overlay */}
      {isDisabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={20} style={{ color: '#C7C7CC' }} />
          </div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#86868B', letterSpacing: '-0.01em', textAlign: 'center' }}>
            请先完成内容上传
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: isDisabled ? 0.4 : 1 }}>
        {/* Header: type + status badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AppleBadge variant={typeCfg.variant}>{typeCfg.label}</AppleBadge>
          <AppleBadge variant={statusCfg.variant}>{statusCfg.label}</AppleBadge>
          {activeTask && (
            <span style={{ fontSize: '11px', color: '#0071E3', marginLeft: 'auto', letterSpacing: '-0.01em' }}>
              已生成任务
            </span>
          )}
        </div>

        {/* Asset preview */}
        <AssetPreview asset={asset} />

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

        {/* Account selector */}
        <div>
          <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>
            发布到
          </p>
          {isXhsLocked ? (
            <DistributionAccountSelector
              accounts={candidateAccounts}
              selectedId={selectedAccountId}
              onChange={setSelectedAccountId}
              locked
              lockedAccountName={candidateAccounts[0]?.name}
            />
          ) : (
            <DistributionAccountSelector
              accounts={candidateAccounts}
              selectedId={selectedAccountId}
              onChange={setSelectedAccountId}
              suggestedId={suggestion?.accountId}
            />
          )}
          {suggestion && !isXhsLocked && (
            <p style={{ fontSize: '11px', color: '#0071E3', marginTop: '6px', letterSpacing: '-0.01em', opacity: 0.8 }}>
              ⚡ {suggestion.reason}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

        {/* Schedule + urgency */}
        <DistributionSchedule
          scheduleType={scheduleType}
          scheduledAt={scheduledAt}
          urgency={urgency}
          onScheduleTypeChange={setScheduleType}
          onScheduledAtChange={setScheduledAt}
          onUrgencyChange={setUrgency}
          disabled={isDisabled}
        />

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || isDisabled || !selectedAccountId}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            border: 'none',
            background:
              submitting || isDisabled || !selectedAccountId
                ? '#C7C7CC'
                : activeTask
                ? 'linear-gradient(135deg, #0071E3, #6E3FFB)'
                : '#0071E3',
            color: '#fff',
            cursor: submitting || isDisabled || !selectedAccountId ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
            opacity: submitting ? 0.7 : 1,
            boxShadow:
              submitting || isDisabled || !selectedAccountId
                ? 'none'
                : '0 4px 12px rgba(0,113,227,0.25)',
          }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {activeTask ? '更新发布任务' : '生成发布任务'}
        </button>
      </div>
    </AppleCard>
  )
}
