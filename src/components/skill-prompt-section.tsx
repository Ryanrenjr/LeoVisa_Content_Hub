'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SKILL_PROMPTS, TEST_PROMPTS, type SkillPrompt, type TestPrompt } from '@/lib/skill-prompts'

const ease = [0.4, 0, 0.2, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: SkillPrompt }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(skill.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderRadius: '18px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Accent bar */}
      <div style={{ height: '3px', background: skill.accentColor, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{skill.emoji}</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                {skill.title}
              </div>
              <div style={{ fontSize: '12px', color: '#86868B', marginTop: '2px', fontFamily: 'monospace' }}>
                {skill.subtitle}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '980px',
              border: copied ? 'none' : `1px solid ${skill.accentColor}`,
              background: copied ? skill.accentColor : 'transparent',
              color: copied ? '#fff' : skill.accentColor,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '已复制 ✓' : '复制 Skill'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 20px', flexShrink: 0 }} />

      {/* Prompt text */}
      <div style={{ padding: '16px 20px 20px', overflowY: 'auto', maxHeight: '300px', flex: 1 }}>
        <pre
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", "PingFang SC", monospace',
            fontSize: '11.5px',
            lineHeight: 1.7,
            color: '#3A3A3C',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {skill.prompt}
        </pre>
      </div>
    </motion.div>
  )
}

// ─── Test prompt card ─────────────────────────────────────────────────────────

function TestPromptCard({ item }: { item: TestPrompt }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <motion.div variants={fadeUp}>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#1D1D1F',
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        {item.title}
      </div>
      <div
        style={{
          position: 'relative',
          background: '#1C1C1E',
          borderRadius: '12px',
          padding: '20px 56px 20px 20px',
        }}
      >
        <pre
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", monospace',
            fontSize: '13px',
            lineHeight: 1.75,
            color: '#E5E5EA',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {item.content}
        </pre>
        <button
          onClick={handleCopy}
          title="复制"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            background: copied ? 'rgba(52,199,89,0.2)' : 'rgba(255,255,255,0.1)',
            color: copied ? '#34C759' : '#8E8E93',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            flexShrink: 0,
          }}
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#1D1D1F',
          letterSpacing: '-0.025em',
          marginBottom: '4px',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: '14px', color: '#86868B' }}>{subtitle}</p>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SkillPromptSection() {
  return (
    <div style={{ marginBottom: '72px' }}>

      {/* Skills */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        style={{ marginBottom: '56px' }}
      >
        <SectionHeader
          title="内容创作 Skills"
          subtitle="三个内容类型的 AI 创作提示词 · 点击复制后粘贴到 Claude 新聊天"
        />
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {SKILL_PROMPTS.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </motion.div>
      </motion.section>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '56px' }} />

      {/* Test prompts */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        <SectionHeader
          title="测试用 Prompts"
          subtitle="在 Claude 新聊天里输入以下内容测试各 Skill"
        />
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          {TEST_PROMPTS.map((item) => (
            <TestPromptCard key={item.id} item={item} />
          ))}
        </motion.div>
      </motion.section>

    </div>
  )
}
