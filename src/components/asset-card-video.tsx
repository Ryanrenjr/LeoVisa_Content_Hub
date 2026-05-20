'use client'

import { useState, useRef, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Trash2, RefreshCw, Maximize2, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AppleCard } from '@/components/apple/apple-card'
import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { UploadDropzone } from '@/components/upload-dropzone'
import { updateAssetText, deleteAssetFile, getAssetTextContent } from '@/app/(dashboard)/topics/upload-actions'
import type { AssetStatus } from '@/types'
import type { AssetCardData } from '@/components/asset-card-text'

// ─── Config ────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AssetStatus, { label: string; variant: BadgeVariant }> = {
  NOT_STARTED: { label: '未开始', variant: 'glass-default' },
  IN_PROGRESS: { label: '制作中', variant: 'glass-blue' },
  COMPLETED:   { label: '已完成', variant: 'glass-green' },
}

const IMAGE_ACCEPT = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }
const VIDEO_ACCEPT = { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'], 'video/x-msvideo': ['.avi'] }
const TEXT_ACCEPT  = { 'text/plain': ['.txt'] }

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ─── Script editor ─────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'pending' | 'saving' | 'saved'

function ScriptEditor({ topicId, initialPath, onSaved }: { topicId: string; initialPath: string | null; onSaved: () => void }) {
  const [content, setContent] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!initialPath) { setContent(''); return }
    getAssetTextContent(topicId, 'VIDEO', 'scriptFile').then(setContent).catch(() => setContent(''))
  }, [topicId, initialPath])

  const save = useCallback(
    (text: string) => {
      setSaveState('saving')
      startTransition(async () => {
        try {
          await updateAssetText(topicId, 'VIDEO', 'scriptFile', text)
          setSaveState('saved')
          onSaved()
          setTimeout(() => setSaveState('idle'), 1500)
        } catch {
          setSaveState('idle')
          toast.error('保存失败')
        }
      })
    },
    [topicId, onSaved],
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setContent(v)
    setSaveState('pending')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(v), 1500)
  }

  if (content === null) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#86868B', fontSize: '13px' }}>加载中…</div>
  }

  const saveLabel = saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '✓ 已保存' : saveState === 'pending' ? '未保存' : ''

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#86868B' }}>口播稿内容</span>
        {saveLabel && <span style={{ fontSize: '11px', color: saveState === 'saved' ? '#34C759' : '#86868B' }}>{saveLabel}</span>}
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        onBlur={() => {
          if (saveState === 'pending' && content !== null) {
            if (timerRef.current) clearTimeout(timerRef.current)
            save(content)
          }
        }}
        rows={8}
        placeholder="在此输入口播稿…"
        style={{
          width: '100%',
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

export function AssetCardVideo({ asset }: { asset: AssetCardData }) {
  const router = useRouter()
  const statusCfg = STATUS_BADGE[asset.status as AssetStatus] ?? STATUS_BADGE.NOT_STARTED
  const names: Record<string, string> = asset.originalNames ? JSON.parse(asset.originalNames) : {}
  const sizes: Record<string, number> = asset.fileSizes     ? JSON.parse(asset.fileSizes)     : {}

  const [scriptExpanded, setScriptExpanded] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [coverPreviewOpen, setCoverPreviewOpen] = useState(false)
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null)

  const videoUrl  = asset.videoFilePath  ? `/api/storage/${asset.videoFilePath}`  : null
  const coverUrl  = asset.coverImagePath ? `/api/storage/${asset.coverImagePath}` : null

  function refresh() { router.refresh() }

  async function handleDelete(slot: 'scriptFile' | 'videoFile' | 'coverFile') {
    setDeletingSlot(slot)
    try {
      await deleteAssetFile(asset.topicId, 'VIDEO', slot)
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
        <AppleBadge variant="glass-purple">视频</AppleBadge>
        <AppleBadge variant={statusCfg.variant}>{statusCfg.label}</AppleBadge>
      </div>

      {/* ── Script (collapsible) ─────────────────────────────────────────── */}
      <div style={{ borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <button
          onClick={() => setScriptExpanded((v) => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'rgba(0,0,0,0.02)', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, color: '#1D1D1F', letterSpacing: '-0.01em',
          }}
        >
          口播稿
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {asset.scriptFilePath && (
              <span style={{ fontSize: '11px', color: '#34C759', fontWeight: 600 }}>✓ 已上传</span>
            )}
            {scriptExpanded ? <ChevronUp size={15} style={{ color: '#86868B' }} /> : <ChevronDown size={15} style={{ color: '#86868B' }} />}
          </div>
        </button>
        {scriptExpanded && (
          <div style={{ padding: '14px' }}>
            {asset.scriptFilePath ? (
              <>
                <ScriptEditor topicId={asset.topicId} initialPath={asset.scriptFilePath} onSaved={refresh} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#86868B' }}>{names.scriptFile ?? '口播稿'}</span>
                  {sizes.scriptFile && <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{formatBytes(sizes.scriptFile)}</span>}
                  <button onClick={() => handleDelete('scriptFile')} disabled={deletingSlot === 'scriptFile'} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Trash2 size={11} />删除
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <UploadDropzone topicId={asset.topicId} assetType="VIDEO" fileSlot="scriptFile" accept={TEXT_ACCEPT} maxBytes={Infinity} label="上传口播稿 (.txt)" compact onSuccess={refresh} />
                <button
                  onClick={async () => { await updateAssetText(asset.topicId, 'VIDEO', 'scriptFile', ''); refresh() }}
                  style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#0071E3', cursor: 'pointer' }}
                >
                  在线输入口播稿
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Video area ───────────────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>视频文件</p>

        {videoUrl ? (
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', position: 'relative' }}>
              <video
                src={videoUrl}
                poster={coverUrl ?? undefined}
                controls
                preload="metadata"
                onLoadedMetadata={(e) => setVideoDuration((e.target as HTMLVideoElement).duration)}
                style={{ width: '100%', maxHeight: '300px', display: 'block' }}
              />
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#86868B' }}>{names.videoFile ?? '视频文件'}</span>
              {sizes.videoFile && <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{formatBytes(sizes.videoFile)}</span>}
              {videoDuration !== null && <span style={{ fontSize: '11px', color: '#C7C7CC' }}>{formatDuration(videoDuration)}</span>}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <label style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', color: '#6E6E73', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={11} /> 替换
                  <div style={{ display: 'none' }}>
                    <UploadDropzone topicId={asset.topicId} assetType="VIDEO" fileSlot="videoFile" accept={VIDEO_ACCEPT} maxBytes={500 * 1024 * 1024} compact onSuccess={refresh} />
                  </div>
                </label>
                <button onClick={() => handleDelete('videoFile')} disabled={deletingSlot === 'videoFile'} style={{ background: 'none', border: '1px solid rgba(255,59,48,0.2)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', color: '#FF3B30', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={11} /> 删除
                </button>
              </div>
            </div>
          </div>
        ) : (
          <UploadDropzone
            topicId={asset.topicId}
            assetType="VIDEO"
            fileSlot="videoFile"
            accept={VIDEO_ACCEPT}
            maxBytes={500 * 1024 * 1024}
            label="拖拽视频文件或点击上传 (MP4/MOV, ≤500MB)"
            onSuccess={refresh}
          />
        )}
      </div>

      {/* ── Video cover ──────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
        <p style={{ fontSize: '12px', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: '10px' }}>视频封面</p>

        {coverUrl ? (
          <div>
            <div
              style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', maxWidth: '100%' }}
              onMouseEnter={(e) => {
                const overlay = e.currentTarget.querySelector('.vcover-overlay') as HTMLElement
                if (overlay) overlay.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                const overlay = e.currentTarget.querySelector('.vcover-overlay') as HTMLElement
                if (overlay) overlay.style.opacity = '0'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="视频封面" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', display: 'block', borderRadius: '10px' }} />
              <div className="vcover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: 0, transition: 'opacity 0.2s', borderRadius: '10px' }}>
                <button onClick={() => setCoverPreviewOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                  <Maximize2 size={15} />
                </button>
                <button onClick={() => handleDelete('coverFile')} disabled={deletingSlot === 'coverFile'} style={{ background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,59,48,0.4)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#FF3B30', display: 'flex' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#86868B' }}>{names.coverFile ?? '视频封面'}</div>
          </div>
        ) : (
          <UploadDropzone topicId={asset.topicId} assetType="VIDEO" fileSlot="coverFile" accept={IMAGE_ACCEPT} maxBytes={10 * 1024 * 1024} label="上传视频封面 (PNG/JPG, ≤10MB)" compact onSuccess={refresh} />
        )}
      </div>

      {/* Full cover preview */}
      <Dialog open={coverPreviewOpen} onOpenChange={setCoverPreviewOpen}>
        <DialogContent style={{ maxWidth: '90vw', background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '16px' }}>
          {coverUrl && <img src={coverUrl} alt="封面预览" style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} />}
        </DialogContent>
      </Dialog>
    </AppleCard>
  )
}
