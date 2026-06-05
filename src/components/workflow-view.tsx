'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionTitle } from '@/components/apple/section-title'
import {
  FLOW_STEPS,
  WEEKLY_STEPS,
  BREAKING_CRITERIA,
  BREAKING_MINI_FLOW,
  PLATFORM_RULES,
  AI_DIVISION,
  CONFIRM_ITEMS,
  RISK_ITEMS,
  FLOW_STEP_DETAILS,
  WEEKLY_STEP_DETAILS,
  BREAKING_CRITERION_DETAILS,
  COPY_PROMPTS,
  type StepDetail,
} from '@/lib/workflow-data'

const ease = [0.4, 0, 0.2, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function ToolBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 9px',
        borderRadius: '980px',
        fontSize: '11px',
        fontWeight: 500,
        color,
        background: `${color}18`,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function InfoBadge({
  prefix,
  value,
  color,
}: {
  prefix: string
  value: string
  color: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '980px',
        fontSize: '11.5px',
        fontWeight: 500,
        background: `${color}12`,
        color: '#3A3A3C',
        border: `1px solid ${color}25`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color, fontWeight: 600 }}>{prefix}</span>
      {value}
    </span>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ promptId, compact }: { promptId: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const prompt = COPY_PROMPTS.find((p) => p.id === promptId)
  if (!prompt) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt!.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: compact ? '4px 12px' : '6px 16px',
        borderRadius: '980px',
        border: copied ? 'none' : '1px solid rgba(0,113,227,0.35)',
        background: copied ? '#0071E3' : 'transparent',
        color: copied ? '#fff' : '#0071E3',
        fontSize: compact ? '11px' : '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {copied ? '已复制 ✓' : '复制 Prompt'}
    </button>
  )
}

// ─── Prompt block ─────────────────────────────────────────────────────────────

function PromptBlock({ promptId }: { promptId: string }) {
  const [copied, setCopied] = useState(false)
  const prompt = COPY_PROMPTS.find((p) => p.id === promptId)
  if (!prompt) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt!.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // no-op
    }
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Header: label + meta */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>
            {prompt.label}
          </span>
          <InfoBadge prefix="Project" value={prompt.project} color="#0071E3" />
          <InfoBadge prefix="Skill" value={prompt.skill} color="#6E3FFB" />
        </div>
        <CopyButton promptId={promptId} compact />
      </div>

      {/* Dark code block */}
      <div
        style={{
          position: 'relative',
          background: '#1C1C1E',
          borderRadius: '10px',
          padding: '16px 48px 16px 16px',
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        <pre
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", monospace',
            fontSize: '11.5px',
            lineHeight: 1.75,
            color: '#E5E5EA',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {prompt.content}
        </pre>
        {/* Overlay copy button */}
        <button
          onClick={handleCopy}
          title="复制"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            border: 'none',
            background: copied ? 'rgba(52,199,89,0.25)' : 'rgba(255,255,255,0.10)',
            color: copied ? '#34C759' : '#8E8E93',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            flexShrink: 0,
          }}
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </div>
  )
}

// ─── Step detail panel ────────────────────────────────────────────────────────

function StepDetailPanel({ detail }: { detail: StepDetail }) {
  return (
    <div
      style={{
        padding: '20px 20px 20px 20px',
        background: 'rgba(248,248,250,0.9)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Meta badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '16px' }}>
        {detail.timing && (
          <InfoBadge prefix="时间" value={detail.timing} color="#6E6E73" />
        )}
        {detail.project?.map((p) => (
          <InfoBadge key={p} prefix="Project" value={p} color="#0071E3" />
        ))}
        {detail.skill?.map((s) => (
          <InfoBadge key={s} prefix="Skill" value={s} color="#6E3FFB" />
        ))}
      </div>

      {/* Purpose */}
      <p style={{ fontSize: '13px', color: '#3A3A3C', lineHeight: 1.65, marginBottom: '14px' }}>
        {detail.purpose}
      </p>

      {/* Output */}
      <div style={{ marginBottom: '14px' }}>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 600,
            color: '#86868B',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          输出
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {detail.output.map((o) => (
            <span
              key={o}
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'rgba(0,113,227,0.07)',
                color: '#0071E3',
                fontWeight: 500,
              }}
            >
              {o}
            </span>
          ))}
        </div>
      </div>

      {/* Next step */}
      {detail.nextStep && (
        <div
          style={{
            padding: '9px 13px',
            borderRadius: '8px',
            background: 'rgba(52,199,89,0.07)',
            border: '1px solid rgba(52,199,89,0.15)',
            fontSize: '12.5px',
            color: '#3A3A3C',
            lineHeight: 1.6,
            marginBottom: '14px',
          }}
        >
          <span style={{ color: '#34C759', fontWeight: 600 }}>下一步：</span>
          {detail.nextStep}
        </div>
      )}

      {/* Risk notes */}
      {detail.riskNotes && detail.riskNotes.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#FF3B30',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '7px',
            }}
          >
            注意事项
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {detail.riskNotes.map((r) => (
              <div
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '7px',
                  fontSize: '12.5px',
                  color: '#6E6E73',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: '#FF3B30', flexShrink: 0, marginTop: '1px' }}>·</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt blocks */}
      {detail.promptIds && detail.promptIds.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {detail.promptIds.map((id) => (
            <PromptBlock key={id} promptId={id} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Criterion detail panel ───────────────────────────────────────────────────

function CriterionDetailPanel({ criterionId }: { criterionId: string }) {
  const detail = BREAKING_CRITERION_DETAILS[criterionId]
  const criterion = BREAKING_CRITERIA.find((c) => c.id === criterionId)
  if (!detail || !criterion) return null

  return (
    <div
      style={{
        padding: '20px',
        background: 'rgba(248,248,250,0.9)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      {/* Pass */}
      <div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#34C759', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
          符合标准 ✓
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {detail.passExamples.map((ex) => (
            <div key={ex} style={{ display: 'flex', gap: '7px', fontSize: '12.5px', color: '#3A3A3C', lineHeight: 1.6 }}>
              <span style={{ color: '#34C759', flexShrink: 0 }}>·</span>
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Fail */}
      <div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#FF3B30', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
          不符合标准 ✗
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {detail.failExamples.map((ex) => (
            <div key={ex} style={{ display: 'flex', gap: '7px', fontSize: '12.5px', color: '#3A3A3C', lineHeight: 1.6 }}>
              <span style={{ color: '#FF3B30', flexShrink: 0 }}>·</span>
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div
          style={{
            padding: '9px 13px',
            borderRadius: '8px',
            background: `${criterion.color}08`,
            border: `1px solid ${criterion.color}20`,
            fontSize: '12.5px',
            color: '#6E6E73',
            lineHeight: 1.65,
          }}
        >
          {detail.note}
        </div>
      </div>
    </div>
  )
}

// ─── Section 1: Flow timeline (with accordion) ────────────────────────────────

function FlowTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="总流程概览" subtitle="点击步骤卡片查看操作详情和可用 Prompt" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {FLOW_STEPS.map((step, i) => {
          const isLast = i === FLOW_STEPS.length - 1
          const isExpanded = expandedId === step.id
          const detail = FLOW_STEP_DETAILS[step.id]

          return (
            <motion.div key={step.id} variants={fadeUp} style={{ display: 'flex', gap: 0 }}>
              {/* Left: circle + connector line */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: '56px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: step.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${step.color}40`,
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {step.number}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '20px',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04))',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              {/* Right: card + accordion */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : '10px' }}>
                {/* Clickable card */}
                <div
                  onClick={() => toggle(step.id)}
                  style={{
                    background: isExpanded
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,255,255,0.80)',
                    backdropFilter: 'saturate(180%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                    borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                    border: isExpanded
                      ? `1px solid ${step.color}35`
                      : '1px solid rgba(0,0,0,0.07)',
                    borderBottom: isExpanded ? 'none' : undefined,
                    boxShadow: isExpanded
                      ? `0 4px 20px ${step.color}18`
                      : '0 2px 10px rgba(0,0,0,0.05)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: isExpanded ? step.color : '#1D1D1F',
                          letterSpacing: '-0.02em',
                          marginBottom: '3px',
                          transition: 'color 0.2s',
                        }}
                      >
                        {step.name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#6E6E73', lineHeight: 1.55 }}>
                        {step.description}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <ToolBadge label={step.tool} color={step.color} />
                      <ChevronDown
                        size={16}
                        color="#86868B"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Accordion detail */}
                <AnimatePresence>
                  {isExpanded && detail && (
                    <motion.div
                      key={step.id + '-detail'}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease }}
                      style={{
                        overflow: 'hidden',
                        borderRadius: '0 0 14px 14px',
                        border: `1px solid ${step.color}35`,
                        borderTop: 'none',
                      }}
                    >
                      <StepDetailPanel detail={detail} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

// ─── Section 2: Weekly steps (grid + detail panel) ────────────────────────────

function WeeklySection() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  function toggle(num: number) {
    setSelectedStep((prev) => (prev === num ? null : num))
  }

  const selectedDetail = selectedStep !== null ? WEEKLY_STEP_DETAILS[selectedStep] : null
  const selectedMeta = selectedStep !== null ? WEEKLY_STEPS.find((s) => s.number === selectedStep) : null

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="每周一选题流程" subtitle="点击步骤卡片查看操作说明和 Prompt" />

      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '14px',
          marginBottom: selectedDetail ? '0' : '0',
        }}
      >
        {WEEKLY_STEPS.map((step) => {
          const isSelected = selectedStep === step.number
          const hasDetail = !!WEEKLY_STEP_DETAILS[step.number]
          return (
            <motion.div key={step.number} variants={fadeUp}>
              <div
                onClick={() => hasDetail && toggle(step.number)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.80)',
                  backdropFilter: 'saturate(180%) blur(20px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                  borderRadius: '14px',
                  border: isSelected
                    ? '1px solid rgba(0,113,227,0.35)'
                    : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: isSelected
                    ? '0 4px 20px rgba(0,113,227,0.12)'
                    : '0 2px 10px rgba(0,0,0,0.05)',
                  padding: '18px',
                  cursor: hasDetail ? 'pointer' : 'default',
                  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  userSelect: 'none',
                  height: '100%',
                }}
              >
                {/* Number */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: isSelected ? '#0071E3' : 'rgba(0,113,227,0.10)',
                    color: isSelected ? '#fff' : '#0071E3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '11px',
                    transition: 'all 0.2s',
                  }}
                >
                  {step.number}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isSelected ? '#0071E3' : '#1D1D1F',
                    letterSpacing: '-0.015em',
                    marginBottom: '5px',
                    transition: 'color 0.2s',
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6E6E73', lineHeight: 1.6 }}>
                  {step.description}
                </div>
                {hasDetail && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#86868B' }}>
                    {isSelected ? '点击收起' : '点击查看详情 →'}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Detail panel below grid */}
      <AnimatePresence>
        {selectedDetail && selectedMeta && (
          <motion.div
            key={`weekly-detail-${selectedStep}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease }}
            style={{ overflow: 'hidden', marginTop: '12px' }}
          >
            <div
              style={{
                borderRadius: '14px',
                border: '1px solid rgba(0,113,227,0.25)',
                overflow: 'hidden',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  padding: '12px 20px',
                  background: 'rgba(0,113,227,0.05)',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0071E3',
                }}
              >
                步骤 {selectedMeta.number}：{selectedMeta.title}
              </div>
              <StepDetailPanel detail={selectedDetail} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// ─── Section 3: Breaking news (criteria grid + detail panel) ──────────────────

function BreakingSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function toggle(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const selectedCriterion = BREAKING_CRITERIA.find((c) => c.id === selectedId)

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="每日突发新闻流程" subtitle="点击五项标准卡片查看判断指南" />

      {/* 5 criteria cards */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '14px',
          marginBottom: '12px',
        }}
      >
        {BREAKING_CRITERIA.map((c) => {
          const isSelected = selectedId === c.id
          return (
            <motion.div key={c.id} variants={fadeUp}>
              <div
                onClick={() => toggle(c.id)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.80)',
                  backdropFilter: 'saturate(180%) blur(20px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                  borderRadius: '14px',
                  border: isSelected
                    ? `1px solid ${c.color}40`
                    : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: isSelected
                    ? `0 4px 20px ${c.color}18`
                    : '0 2px 10px rgba(0,0,0,0.05)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '980px',
                    background: isSelected ? c.color : `${c.color}18`,
                    color: isSelected ? '#fff' : c.color,
                    fontSize: '11px',
                    fontWeight: 600,
                    marginBottom: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isSelected ? c.color : '#1D1D1F',
                    marginBottom: '4px',
                    letterSpacing: '-0.015em',
                    transition: 'color 0.2s',
                  }}
                >
                  {c.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6E6E73', lineHeight: 1.6 }}>
                  {c.description}
                </div>
                <div style={{ marginTop: '9px', fontSize: '11px', color: '#86868B' }}>
                  {isSelected ? '点击收起' : '点击查看标准 →'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Criterion detail panel */}
      <AnimatePresence>
        {selectedId && selectedCriterion && (
          <motion.div
            key={`criterion-${selectedId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease }}
            style={{ overflow: 'hidden', marginBottom: '12px' }}
          >
            <div
              style={{
                borderRadius: '14px',
                border: `1px solid ${selectedCriterion.color}30`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 20px',
                  background: `${selectedCriterion.color}08`,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: selectedCriterion.color,
                }}
              >
                {selectedCriterion.title}：判断指南
              </div>
              <CriterionDetailPanel criterionId={selectedId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini pipeline */}
      <motion.div variants={fadeUp}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '14px 18px',
            background: 'rgba(255,149,0,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,149,0,0.15)',
          }}
        >
          {BREAKING_MINI_FLOW.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1D1D1F', whiteSpace: 'nowrap' }}>
                {step}
              </span>
              {i < BREAKING_MINI_FLOW.length - 1 && (
                <span style={{ color: '#FF9500', fontSize: '14px', fontWeight: 600 }}>→</span>
              )}
            </div>
          ))}

          {/* Breaking news copy prompt button */}
          <div style={{ marginLeft: 'auto' }}>
            <CopyButton promptId="breaking-news" compact />
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

// ─── Section 4: Platform rules (static, unchanged) ────────────────────────────

function PlatformSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="平台分发规则" subtitle="视频号 · 小红书 · 公众号 — 各司其职" />

      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {PLATFORM_RULES.map((p) => (
          <motion.div key={p.id} variants={fadeUp}>
            <div
              style={{
                background: 'rgba(255,255,255,0.80)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '14px',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <div style={{ height: '3px', background: p.color }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px' }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '12px', color: p.color, fontWeight: 500, marginTop: '1px' }}>
                      {p.form}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86868B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    作用
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {p.purposes.map((item) => (
                      <span key={item} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '6px', background: `${p.color}10`, color: p.color, fontWeight: 500 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86868B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {p.detailLabel}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {p.details.map((item) => (
                      <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '12.5px', color: '#3A3A3C', lineHeight: 1.5 }}>
                        <span style={{ color: p.color, marginTop: '2px', flexShrink: 0 }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

// ─── Section 5: AI division (static, unchanged) ───────────────────────────────

function AIDivisionSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="AI 分工" subtitle="Claude 管文字，GPT 管图片" />
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '16px' }}
      >
        {AI_DIVISION.map((side) => (
          <motion.div key={side.name} variants={fadeUp}>
            <div
              style={{
                background: side.bgColor,
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: '14px',
                border: `1px solid ${side.borderColor}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '26px' }}>{side.emoji}</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: side.accentColor, letterSpacing: '-0.03em' }}>
                  {side.name}
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {side.items.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: '#1D1D1F', lineHeight: 1.5 }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: side.accentColor, flexShrink: 0, marginTop: '7px' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp}>
        <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', fontSize: '14px', color: '#6E6E73', fontWeight: 500, letterSpacing: '-0.01em' }}>
          Claude 管内容文字和结构，GPT 管图片视觉和出图
        </div>
      </motion.div>
    </motion.section>
  )
}

// ─── Section 6: Confirmation & risk (static, unchanged) ──────────────────────

function RiskSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger}
      style={{ marginBottom: '72px' }}
    >
      <SectionTitle title="确认机制与风险红线" subtitle="发之前确认，发之后负责" />
      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <motion.div variants={fadeUp}>
          <div style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34C759', flexShrink: 0 }} />
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.02em' }}>确认机制</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CONFIRM_ITEMS.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13.5px', color: '#3A3A3C', lineHeight: 1.6, padding: '8px 12px', borderRadius: '8px', background: 'rgba(52,199,89,0.05)' }}>
                  <span style={{ color: '#34C759', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3B30', flexShrink: 0 }} />
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.02em' }}>风险红线</span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#86868B', marginBottom: '10px' }}>涉及以下内容必须谨慎：</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '16px' }}>
              {RISK_ITEMS.map((item) => (
                <span key={item} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,59,48,0.07)', color: '#FF3B30', fontWeight: 500 }}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.12)', fontSize: '12.5px', color: '#6E6E73', lineHeight: 1.6 }}>
              不确定的信息不写，或先标注需要查证。
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

// ─── Page header ──────────────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #1D1D1F 0%, #0071E3 50%, #6E3FFB 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
      style={{ marginTop: '56px', marginBottom: '72px', position: 'relative' }}
    >
      <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.07, marginBottom: '14px' }}>
        <span style={gradientText}>操作流程</span>
      </h1>
      <p style={{ fontSize: '18px', color: '#6E6E73', letterSpacing: '-0.01em', lineHeight: 1.5 }}>
        李尔王内容矩阵 · 周一规划 / 每日突发 / 内容生产 / 发布复盘
      </p>
      <div className="hidden md:block" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '1.5px solid rgba(0,113,227,0.18)' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: '24px', borderRadius: '50%', border: '1.5px solid rgba(110,63,251,0.14)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#0071E3', opacity: 0.35 }} />
      </div>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkflowView() {
  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader />
      <FlowTimeline />
      <WeeklySection />
      <BreakingSection />
      <PlatformSection />
      <AIDivisionSection />
      <RiskSection />
    </div>
  )
}
