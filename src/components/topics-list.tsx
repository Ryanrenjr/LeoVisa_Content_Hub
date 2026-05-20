'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import { TopicsToolbar } from '@/components/topics-toolbar'
import { TopicCard, type TopicCardData } from '@/components/topic-card'
import { SectionTitle } from '@/components/apple/section-title'
import type { TopicStatus } from '@/types'

// ─── Animation variants ────────────────────────────────────────────────────────

const ease = [0.4, 0, 0.2, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.22, ease } },
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

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(0,113,227,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <FileText size={28} style={{ color: '#0071E3' }} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.022em', marginBottom: '8px' }}>
        暂无匹配选题
      </h3>
      <p style={{ fontSize: '15px', color: '#86868B', letterSpacing: '-0.01em', marginBottom: '24px' }}>
        调整筛选条件，或创建一个新选题
      </p>
      <button
        onClick={onCreateClick}
        style={{
          padding: '10px 24px',
          borderRadius: '999px',
          fontSize: '15px',
          fontWeight: 600,
          border: 'none',
          background: '#0071E3',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        新建选题
      </button>
    </motion.div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TopicsListProps {
  topics: TopicCardData[]
  allTags: { id: string; name: string }[]
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TopicsList({ topics, allTags }: TopicsListProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'ALL'>('ALL')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
      if (selectedTags.length > 0) {
        const topicTagIds = t.tags.map((tag) => tag.id)
        if (!selectedTags.some((id) => topicTagIds.includes(id))) return false
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !t.title.toLowerCase().includes(q) &&
          !(t.description ?? '').toLowerCase().includes(q) &&
          !t.code.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [topics, statusFilter, selectedTags, search])

  function handleCreateClick() {
    router.push('/topics/new')
  }

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ marginTop: '56px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.07, marginBottom: '16px' }}>
          <span style={gradientText}>选题库</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#6E6E73', letterSpacing: '-0.01em', lineHeight: 1.5 }}>
          {topics.length} 个选题 · 多平台内容协作
        </p>
      </motion.div>

      {/* ── Sticky toolbar ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: '48px',
          zIndex: 40,
          marginBottom: '32px',
          padding: '14px 20px',
          borderRadius: '16px',
          background: 'rgba(245,245,247,0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        <TopicsToolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          allTags={allTags}
          search={search}
          onSearchChange={setSearch}
          onCreateClick={handleCreateClick}
        />
      </div>

      {/* ── Section heading ──────────────────────────────────────────────── */}
      <SectionTitle
        title={statusFilter === 'ALL' ? '全部选题' : ALL_STATUS_LABELS[statusFilter]}
        subtitle={`共 ${filtered.length} 条`}
      />

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState onCreateClick={handleCreateClick} />
      ) : (
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((topic, i) => (
              <motion.div
                key={topic.id}
                layout
                variants={cardVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: i * 0.06 }}
                style={{ display: 'flex' }}
              >
                <div
                  style={{ width: '100%', cursor: 'pointer' }}
                  onClick={() => router.push(`/topics/${topic.id}`)}
                >
                  <TopicCard
                    topic={topic}
                    onDistributeClick={() => router.push(`/topics/${topic.id}/distribute`)}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ALL_STATUS_LABELS: Record<TopicStatus, string> = {
  DRAFT:            '草稿',
  IN_PRODUCTION:    '制作中',
  READY_TO_PUBLISH: '待发布',
  PUBLISHED:        '已发布',
  ARCHIVED:         '已归档',
}
