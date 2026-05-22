'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { markTaskAsPublished } from '@/app/(dashboard)/schedule/actions'
import type { ScheduleTask } from '@/app/(dashboard)/schedule/actions'

const PLATFORM_PLACEHOLDER: Record<string, string> = {
  WECHAT_OFFICIAL: 'https://mp.weixin.qq.com/s/...',
  XIAOHONGSHU: 'https://www.xiaohongshu.com/...',
  VIDEO_CHANNEL: 'https://channels.weixin.qq.com/...',
}

interface PublishConfirmDialogProps {
  task: ScheduleTask
  open: boolean
  onClose: () => void
}

export function PublishConfirmDialog({ task, open, onClose }: PublishConfirmDialogProps) {
  const [url, setUrl] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [urlError, setUrlError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Portal requires DOM — wait for client mount
  useEffect(() => { setMounted(true) }, [])

  const placeholder = PLATFORM_PLACEHOLDER[task.account.platform] ?? 'https://...'

  const isValidUrl = (s: string) => {
    try { new URL(s); return true } catch { return false }
  }

  const handleClose = () => {
    if (isPending) return
    setUrl('')
    setScreenshot(null)
    setUrlError(false)
    onClose()
  }

  const handleSubmit = () => {
    setUrlError(false)
    startTransition(async () => {
      try {
        await markTaskAsPublished(task.id)
        toast.success('✓ 已标记发布')
        handleClose()
      } catch (e) {
        toast.error('提交失败：' + (e instanceof Error ? e.message : '未知错误'))
      }
    })
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('请上传图片文件'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('图片不能超过 5MB'); return }
    setScreenshot(file)
  }

  if (!mounted) return null

  // Render via portal so position:fixed escapes all transforms / backdrop-filter
  // containing blocks (Framer Motion cards, glass containers, etc.)
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9000,
            }}
          />

          {/* Dialog — outer div handles centering; inner motion.div handles animation */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9001,
              width: '100%',
              maxWidth: '480px',
              padding: '0 16px',
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              padding: '28px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '4px' }}>
                  标记发布完成
                </h2>
                <p style={{ fontSize: '13px', color: '#86868B', letterSpacing: '-0.01em' }}>
                  请填写发布后的链接和截图
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
                  color: '#6E6E73', flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Task info */}
            <div
              style={{
                background: 'rgba(0,113,227,0.06)',
                border: '1px solid rgba(0,113,227,0.12)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '20px',
              }}
            >
              <p style={{ fontSize: '13px', color: '#0071E3', fontWeight: 500, letterSpacing: '-0.01em' }}>
                {task.asset.topic.code} — {task.asset.topic.title}
              </p>
              <p style={{ fontSize: '12px', color: '#86868B', marginTop: '2px', letterSpacing: '-0.01em' }}>
                {task.account.name}
              </p>
            </div>

            {/* URL input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.01em', marginBottom: '8px' }}>
                发布链接 <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(false) }}
                placeholder={placeholder}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: '#1D1D1F',
                  background: urlError ? 'rgba(255,59,48,0.04)' : 'rgba(0,0,0,0.04)',
                  border: urlError ? '1px solid rgba(255,59,48,0.5)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '10px',
                  outline: 'none',
                  letterSpacing: '-0.01em',
                  boxSizing: 'border-box',
                }}
              />
              {urlError && (
                <p style={{ fontSize: '11px', color: '#FF3B30', marginTop: '4px', letterSpacing: '-0.01em' }}>
                  请输入有效的 URL
                </p>
              )}
            </div>

            {/* Screenshot upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.01em', marginBottom: '8px' }}>
                发布截图 <span style={{ color: '#86868B', fontWeight: 400 }}>（选填）</span>
              </label>

              {screenshot ? (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(52,199,89,0.06)',
                    border: '1px solid rgba(52,199,89,0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <CheckCircle2 size={14} color="#34C759" />
                  <span style={{ flex: 1, fontSize: '13px', color: '#1D1D1F', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {screenshot.name}
                  </span>
                  <button
                    onClick={() => setScreenshot(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86868B', padding: '2px' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                  }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '20px',
                    background: dragging ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.03)',
                    border: `1.5px dashed ${dragging ? 'rgba(0,113,227,0.4)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: '10px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={18} color={dragging ? '#0071E3' : '#86868B'} />
                  <p style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>
                    拖拽图片到此处，或 <span style={{ color: '#0071E3' }}>点击选择</span>
                  </p>
                  <p style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>
                    支持 JPG / PNG，最大 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleClose}
                disabled={isPending}
                style={{
                  flex: 1, padding: '11px',
                  background: 'rgba(0,0,0,0.06)', border: 'none',
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, color: '#1D1D1F',
                  letterSpacing: '-0.01em', transition: 'background 0.15s',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !url}
                style={{
                  flex: 2, padding: '11px',
                  background: isPending || !url
                    ? 'rgba(0,113,227,0.4)'
                    : 'linear-gradient(135deg, #0071E3 0%, #0091FF 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isPending || !url ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: 600, color: '#fff',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'opacity 0.15s',
                }}
              >
                {isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> 提交中…</>
                ) : (
                  '确认提交'
                )}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
