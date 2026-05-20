'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

export interface UploadedFile {
  path: string
  originalName: string
  size: number
}

interface UploadDropzoneProps {
  topicId: string
  assetType: string
  fileSlot: string
  accept: Record<string, string[]>   // dropzone accept format
  maxBytes: number
  label?: string
  compact?: boolean
  onSuccess: (file: UploadedFile) => void
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function UploadDropzone({
  topicId,
  assetType,
  fileSlot,
  accept,
  maxBytes,
  label,
  compact = false,
  onSuccess,
}: UploadDropzoneProps) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    (file: File) => {
      // Client-side size check
      if (maxBytes !== Infinity && file.size > maxBytes) {
        const msg = `文件过大，最大 ${formatBytes(maxBytes)}`
        setError(msg)
        toast.error(msg)
        return
      }

      setError(null)
      setProgress(0)

      const formData = new FormData()
      formData.append('topicId',   topicId)
      formData.append('assetType', assetType)
      formData.append('fileSlot',  fileSlot)
      formData.append('file',      file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        setProgress(null)
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText)
          toast.success(`上传成功：${file.name}`)
          onSuccess({ path: res.path, originalName: file.name, size: file.size })
        } else {
          let msg = '上传失败'
          try { msg = JSON.parse(xhr.responseText).error ?? msg } catch { /* empty */ }
          setError(msg)
          toast.error(msg)
        }
      }

      xhr.onerror = () => {
        setProgress(null)
        const msg = '网络错误，请重试'
        setError(msg)
        toast.error(msg)
      }

      xhr.send(formData)
    },
    [topicId, assetType, fileSlot, maxBytes, onSuccess],
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) uploadFile(accepted[0])
    },
    [uploadFile],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: progress !== null,
    noClick: progress !== null,
  })

  const borderColor = isDragReject
    ? '#FF3B30'
    : isDragActive
    ? '#0071E3'
    : error
    ? '#FF3B30'
    : 'rgba(0,0,0,0.12)'

  const bgColor = isDragReject
    ? 'rgba(255,59,48,0.04)'
    : isDragActive
    ? 'rgba(0,113,227,0.06)'
    : 'rgba(0,0,0,0.02)'

  if (compact) {
    return (
      <div>
        <div
          {...getRootProps()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1.5px dashed ${borderColor}`,
            background: bgColor,
            cursor: progress !== null ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <input {...getInputProps()} />
          {progress !== null ? (
            <>
              <div style={{ flex: 1, height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#0071E3', borderRadius: '2px', transition: 'width 0.1s' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0071E3', flexShrink: 0 }}>{progress}%</span>
            </>
          ) : (
            <>
              <Upload size={15} style={{ color: isDragActive ? '#0071E3' : '#86868B', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: isDragActive ? '#0071E3' : '#6E6E73', letterSpacing: '-0.01em' }}>
                {isDragActive ? '释放以上传' : (label ?? '拖拽或点击上传')}
              </span>
              {maxBytes !== Infinity && (
                <span style={{ fontSize: '11px', color: '#86868B', marginLeft: 'auto' }}>
                  ≤{formatBytes(maxBytes)}
                </span>
              )}
            </>
          )}
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <X size={12} style={{ color: '#FF3B30' }} />
            <span style={{ fontSize: '12px', color: '#FF3B30' }}>{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '32px 24px',
          borderRadius: '12px',
          border: `2px dashed ${borderColor}`,
          background: bgColor,
          cursor: progress !== null ? 'wait' : 'pointer',
          transition: 'all 0.18s ease',
          minHeight: compact ? 'auto' : '120px',
        }}
      >
        <input {...getInputProps()} />
        {progress !== null ? (
          <>
            <div style={{ width: '100%', maxWidth: '240px', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#0071E3', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#0071E3' }}>正在上传… {progress}%</span>
          </>
        ) : isDragActive ? (
          <>
            <Upload size={28} style={{ color: '#0071E3' }} />
            <span style={{ fontSize: '14px', color: '#0071E3', fontWeight: 500 }}>释放以上传</span>
          </>
        ) : (
          <>
            <Upload size={28} style={{ color: '#86868B' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#1D1D1F', fontWeight: 500, letterSpacing: '-0.01em' }}>
                {label ?? '拖拽文件至此，或点击选择'}
              </p>
              {maxBytes !== Infinity && (
                <p style={{ fontSize: '12px', color: '#86868B', marginTop: '4px' }}>
                  最大 {formatBytes(maxBytes)}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <X size={12} style={{ color: '#FF3B30' }} />
          <span style={{ fontSize: '12px', color: '#FF3B30' }}>{error}</span>
        </div>
      )}
    </div>
  )
}
