'use client'

import { useState, useTransition } from 'react'
import { X, Zap, Loader2 } from 'lucide-react'
import { applyAllSuggestions } from '@/app/(dashboard)/topics/distribute-actions'
import { toast } from 'sonner'

export type BannerSuggestion = {
  assetId: string
  accountId: string
  accountName: string
  assetType: string
  reason: string
  hasTask: boolean
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  WECHAT_ARTICLE: '公众号图文',
  XHS_POST: '小红书图文',
  VIDEO: '视频',
}

interface SuggestionBannerProps {
  topicId: string
  suggestions: BannerSuggestion[]
  topicHasTags: boolean
}

export function SuggestionBanner({ topicId, suggestions, topicHasTags }: SuggestionBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [pending, startTransition] = useTransition()

  if (dismissed) return null

  const applicableSuggestions = suggestions.filter((s) => !s.hasTask)
  const hasAnySuggestion = suggestions.length > 0

  function handleApplyAll() {
    if (applicableSuggestions.length === 0) return
    startTransition(async () => {
      try {
        await applyAllSuggestions(
          topicId,
          applicableSuggestions.map((s) => ({ assetId: s.assetId, accountId: s.accountId })),
        )
        toast.success('已应用全部智能建议')
        setDismissed(true)
      } catch {
        toast.error('应用建议失败，请重试')
      }
    })
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '28px',
        border: '1px solid rgba(0,113,227,0.18)',
        background: 'linear-gradient(135deg, rgba(0,113,227,0.06) 0%, rgba(110,63,251,0.04) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(0,113,227,0.08)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#86868B',
          display: 'flex',
          padding: '4px',
          borderRadius: '6px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        title="关闭"
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingRight: '28px' }}>
        {/* Icon */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(0,113,227,0.1)',
            border: '1px solid rgba(0,113,227,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={15} style={{ color: '#0071E3' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#0071E3', letterSpacing: '-0.01em', marginBottom: '6px' }}>
            智能建议
          </p>

          {!hasAnySuggestion && !topicHasTags ? (
            <p style={{ fontSize: '13px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
              为选题添加标签可获得智能推荐
            </p>
          ) : !hasAnySuggestion ? (
            <p style={{ fontSize: '13px', color: '#6E6E73', letterSpacing: '-0.01em' }}>
              当前标签暂无匹配规则，可手动选择目标账号
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {suggestions.map((s) => (
                <div key={s.assetId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#6E6E73',
                      background: 'rgba(0,0,0,0.06)',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ASSET_TYPE_LABEL[s.assetType] ?? s.assetType}
                  </span>
                  <span style={{ fontSize: '13px', color: '#1D1D1F', letterSpacing: '-0.01em' }}>
                    {s.reason}
                  </span>
                  {s.hasTask && (
                    <span style={{ fontSize: '11px', color: '#34C759', whiteSpace: 'nowrap' }}>✓ 已分配</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply all button */}
        {applicableSuggestions.length > 0 && (
          <button
            onClick={handleApplyAll}
            disabled={pending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              border: '1px solid rgba(0,113,227,0.3)',
              background: '#0071E3',
              color: '#fff',
              cursor: pending ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: pending ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {pending && <Loader2 size={12} className="animate-spin" />}
            一键应用全部建议
          </button>
        )}
      </div>
    </div>
  )
}
