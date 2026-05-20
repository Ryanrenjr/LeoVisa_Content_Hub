'use client'

import { useState, useRef, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Maximize2, Trash2, RefreshCw, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AppleCard } from '@/components/apple/apple-card'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { UploadDropzone } from '@/components/upload-dropzone'
import { updateAssetText, deleteAssetFile, getAssetTextContent } from '@/app/(dashboard)/topics/upload-actions'
import type { AssetStatus, AssetType } from '@/types'

// ─── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; variant: BadgeVariant; textSlot: string; coverSlot: string }> = {
  WECHAT_ARTICLE: { label: '公众号图文', variant: 'glass-green',  textSlot: 'textFile', coverSlot: 'coverFile' },
  XHS_POST:       { label: '小红书图文', variant: 'glass-red',    textSlot: 'textFile', coverSlot: 'coverFile' },
}

const STATUS_BADGE: Record<AssetStatus, { label: string; variant: BadgeVariant }> = {
  NOT_STARTED: { label: '未开始', variant: 'glass-default' },
  IN_PROGRESS: { label: '制作中', variant: 'glass-blue' },
  COMPLETED:   { label: '已完成', variant: 'glass-green' },
}

const IMAGE_ACCEPT = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }
const TEXT_ACCEPT  = { 'text/plain': ['.txt'] }

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export type AssetCardData = {
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
}

interface AssetCardTextProps {
  asset: AssetCardData
}

// ─── Text editor with autosave ─────────────────────────────────────────────────

type SaveState = 'idle' | 'pending' | 'saving' | 'saved'

function TextEditor({
  topicId,
  assetType,
  fileSlot,
  initialPath,
  onSaved,
}: {
  topicId: string
  assetType: string
  fileSlot: string
  initialPath: string | null
  onSaved: () => void
}) {
  const [content, setContent] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, startTransition] = useTransition()

  // Load initial content
  useEffect(() => {
    if (!initialPath) { setContent(''); return }
    getAssetTextContent(topicId, assetType, fileSlot as 'textFile' | 'scriptFile')
      .then(setContent)
      .catch(() => setContent(''))
  }, [topicId, assetType, fileSlot, initialPath])

  const save = useCallback(
    (text: string) => {
      setSaveState('saving')
      startTransition(async () => {
        try {
          await updateAssetText(topicId, assetType, fileSlot as 'textFile' | 'scriptFile', text)
          setSaveState('saved')
          onSaved()
          setTimeout(() => setSaveState('idle'), 1500)
        } catch {
          setSaveState('idle')
          toast.error('保存失败，请重试')
        }
      })
    },
    [topicId, assetType, fileSlot, onSaved],
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setContent(v)
    setSaveState('pending')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(v), 1500)
  }

  function handleBlur() {
    if (saveState === 'pending' && content !== null) {
      if (timerRef.current) clearTimeout(timerRef.current)
      save(content)
    }
  }

  if (content === null) {
    return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868B', fontSize: '13px' }}>加载中…</div>
  }

  const saveLabel = saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '✓ 已保存' : saveState === 'pending' ? '未保存' : ''

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>文案内容</span>
        {saveLabel && (
          <span style={{ fontSize: '11px', color: saveState === 'saved' ? '#34C759' : '#86868B' }}>
            {saveLabel}
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={12}
        placeholder="在此输入文案内容…"
        style={{
          width: '100%',
          minHeight: '200px',
          fontSize: '14px',
          color: '#1D1D1F',
          letterSpacing: '-0.01em',
          lineHeight: 1.7,
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.5)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          backdropFilter: 'blur(4px)',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#0071E3' }}
      />
      <div style={{ textAlign: 'right', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: '#86868B' }}>{content.length} 字</span>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AssetCardText({ asset }: AssetCardTextProps) {
  const router = useRouter()
  const cfg = TYPE_CONFIG[asset.type] ?? TYPE_CONFIG.WECHAT_ARTICLE
  const statusCfg = STATUS_BADGE[asset.status as AssetStatus] ?? STATUS_BADGE.NOT_STARTED

  const names: Record<string, string> = asset.originalNames ? JSON.parse(asset.originalNames) : {}
  const sizes: Record<string, number> = asset.fileSizes     ? JSON.parse(asset.fileSizes)     : {}

  const [coverPreviewOpen, setCoverPreviewOpen] = useState(false)
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null)

  const coverUrl = asset.coverImagePath ? `/api/storage/${asset.coverImagePath}` : null

  function refresh() { router.refresh() }

  async function handleDelete(slot: 'textFile' | 'coverFile') {
    setDeletingSlot(slot)
    try {
      await deleteAssetFile(asset.topicId, asset.type, slot)
      toast.success('已删除')
      refresh()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeletingSlot(null)
    }
  }

  return (
    <AppleCard variant="glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AppleBadge variant={cfg.variant}>{cfg.label}</AppleBadge>
        <AppleBadge variant={statusCfg.variant}>{statusCfg.label}</AppleBadge>
      </div>

      {/* Text content area */}
      {asset.textFilePath ? (
        <TextEditor
          topicId={asset.topicId}
          assetType={asset.type}
          fileSlot={cfg.textSlot}
          initialPath={asset.textFilePath}
          onSaved={refresh}
        />
      ) : (
        <div>
          <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>文案内容</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <UploadDropzone
              topicId={asset.topicId}
              assetType={asset.type}
              fileSlot={cfg.textSlot}
              accept={TEXT_ACCEPT}
              maxBytes={Infinity}
              label="上传 .txt 文案文件"
              compact
              onSuccess={refresh}
            />
            <button
              onClick={async () => {
                await updateAssetText(asset.topicId, asset.type, cfg.textSlot as 'textFile', '')
                refresh()
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                color: '#0071E3',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={13} />
              在线输入文案
            </button>
          </div>
        </div>
      )}

      {/* Text file meta + delete */}
      {asset.textFilePath && names.textFile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px' }}>
          <span style={{ fontSize: '11px', color: '#86868B' }}>{names.textFile}</span>
          {sizes.textFile && <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{formatBytes(sizes.textFile)}</span>}
          <button onClick={() => handleDelete('textFile')} disabled={deletingSlot === 'textFile'} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
            <Trash2 size={11} />删除
          </button>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

      {/* Cover image */}
      <div>
        <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>封面图</p>

        {coverUrl ? (
          <div>
            <div
              style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', maxWidth: '100%' }}
              onMouseEnter={(e) => {
                const overlay = e.currentTarget.querySelector('.cover-overlay') as HTMLElement
                if (overlay) overlay.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                const overlay = e.currentTarget.querySelector('.cover-overlay') as HTMLElement
                if (overlay) overlay.style.opacity = '0'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="封面图"
                style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', display: 'block', borderRadius: '10px' }}
              />
              <div
                className="cover-overlay"
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  opacity: 0, transition: 'opacity 0.2s ease', borderRadius: '10px',
                }}
              >
                <button onClick={() => setCoverPreviewOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                  <Maximize2 size={16} />
                </button>
                <label style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                  <RefreshCw size={16} />
                  <UploadDropzone topicId={asset.topicId} assetType={asset.type} fileSlot={cfg.coverSlot} accept={IMAGE_ACCEPT} maxBytes={10 * 1024 * 1024} compact onSuccess={refresh} />
                </label>
                <button onClick={() => handleDelete('coverFile')} disabled={deletingSlot === 'coverFile'} style={{ background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,59,48,0.4)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#FF3B30', display: 'flex' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#86868B' }}>{names.coverFile ?? '封面图'}</span>
              {sizes.coverFile && <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{formatBytes(sizes.coverFile)}</span>}
            </div>
          </div>
        ) : (
          <UploadDropzone
            topicId={asset.topicId}
            assetType={asset.type}
            fileSlot={cfg.coverSlot}
            accept={IMAGE_ACCEPT}
            maxBytes={10 * 1024 * 1024}
            label="上传封面图 (PNG/JPG, ≤10MB)"
            compact
            onSuccess={refresh}
          />
        )}
      </div>

      {/* Full preview dialog */}
      <Dialog open={coverPreviewOpen} onOpenChange={setCoverPreviewOpen}>
        <DialogContent style={{ maxWidth: '90vw', background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '16px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {coverUrl && <img src={coverUrl} alt="封面图预览" style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} />}
        </DialogContent>
      </Dialog>
    </AppleCard>
  )
}
