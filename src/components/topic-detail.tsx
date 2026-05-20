'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Loader2, ArrowRight, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SectionTitle } from '@/components/apple/section-title'
import { TopicInfoCard, type TopicDetailData } from '@/components/topic-info-card'
import { AssetCardText } from '@/components/asset-card-text'
import { AssetCardVideo } from '@/components/asset-card-video'
import { deleteTopic, createTopic } from '@/app/(dashboard)/topics/actions'
import type { TopicStatus } from '@/types'

// ─── Animation variants ────────────────────────────────────────────────────────

const ease = [0.4, 0, 0.2, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease, delay: i * 0.08 },
  }),
}

// ─── Gradient text ─────────────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #1D1D1F 0%, #6E3FFB 50%, #0071E3 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TopicDetailProps {
  topic: TopicDetailData | null
  allTags: { id: string; name: string }[]
  mode: 'view' | 'create'
  ownerId: string
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TopicDetail({ topic, allTags, mode, ownerId }: TopicDetailProps) {
  const router = useRouter()
  const [createTitle, setCreateTitle] = useState('')
  const [createDesc,  setCreateDesc]  = useState('')
  const [creating, startCreate] = useTransition()
  const [deleting, startDelete] = useTransition()

  const isCreate = mode === 'create'
  const canGoToDistribute =
    topic &&
    ['IN_PRODUCTION', 'READY_TO_PUBLISH', 'PUBLISHED'].includes(topic.status)

  // ── Create ─────────────────────────────────────────────────────────────────
  function handleCreate() {
    if (!createTitle.trim()) return
    startCreate(async () => {
      const newTopic = await createTopic({
        title: createTitle.trim(),
        description: createDesc.trim() || undefined,
        ownerId,
      })
      router.push(`/topics/${newTopic.id}`)
    })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete() {
    if (!topic) return
    startDelete(async () => {
      await deleteTopic(topic.id)
      router.push('/topics')
    })
  }

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page-level nav bar ───────────────────────────────────────────── */}
      <motion.div
        custom={0} variants={fadeUp} initial="hidden" animate="visible"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '24px',
          paddingBottom: '28px',
        }}
      >
        {/* Back */}
        <button
          onClick={() => router.push('/topics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            fontSize: '14px',
            color: '#86868B',
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '-0.01em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0071E3' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#86868B' }}
        >
          <ChevronLeft size={16} />
          返回选题列表
        </button>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Save button (create mode) */}
          {isCreate && (
            <button
              onClick={handleCreate}
              disabled={!createTitle.trim() || creating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                background: createTitle.trim() ? '#0071E3' : '#C7C7CC',
                color: '#fff',
                cursor: createTitle.trim() ? 'pointer' : 'not-allowed',
                letterSpacing: '-0.01em',
              }}
            >
              {creating && <Loader2 size={13} className="animate-spin" />}
              保存
            </button>
          )}

          {/* Go to distribute */}
          {canGoToDistribute && (
            <button
              onClick={() => router.push(`/topics/${topic!.id}/distribute`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid rgba(0,113,227,0.3)',
                background: 'linear-gradient(135deg, rgba(0,113,227,0.08), rgba(110,63,251,0.06))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#0071E3',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,113,227,0.14)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,113,227,0.08), rgba(110,63,251,0.06))' }}
            >
              前往分发设置
              <ArrowRight size={13} />
            </button>
          )}

          {/* Delete (edit mode only) */}
          {!isCreate && topic && (
            <AlertDialog>
              <AlertDialogTrigger
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  background: 'transparent',
                  color: '#FF3B30',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={13} />
                删除选题
              </AlertDialogTrigger>
              <AlertDialogContent
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.022em' }}>
                    确认删除选题？
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ fontSize: '14px', color: '#6E6E73', letterSpacing: '-0.01em', lineHeight: 1.6 }}>
                    确认删除选题 <strong>{topic.code}</strong> —&nbsp;{topic.title} 吗？
                    此操作不可恢复，相关资产文件也将一并删除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{ borderRadius: '999px', fontSize: '14px' }}>
                    取消
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    style={{
                      borderRadius: '999px',
                      fontSize: '14px',
                      background: '#FF3B30',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {deleting && <Loader2 size={12} className="animate-spin" />}
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </motion.div>

      {/* ── Page title ────────────────────────────────────────────────────── */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.07 }}>
          <span style={gradientText}>{isCreate ? '新建选题' : (topic?.title ?? '')}</span>
        </h1>
      </motion.div>

      {/* ── Info card ─────────────────────────────────────────────────────── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <TopicInfoCard
          topic={topic}
          allTags={allTags}
          mode={mode}
          onTitleChange={setCreateTitle}
          onDescriptionChange={setCreateDesc}
        />
      </motion.div>

      {/* ── Assets section ────────────────────────────────────────────────── */}
      {topic && !isCreate && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <SectionTitle title="内容资产" subtitle="公众号图文 · 小红书图文 · 视频" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {topic.assets.map((asset) =>
              asset.type === 'VIDEO' ? (
                <AssetCardVideo key={asset.id} asset={asset} />
              ) : (
                <AssetCardText key={asset.id} asset={asset} />
              ),
            )}
          </div>
        </motion.div>
      )}

    </div>
  )
}
