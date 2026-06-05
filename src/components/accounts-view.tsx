'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { SectionTitle } from '@/components/apple/section-title'
import { AccountCard, type AccountData } from '@/components/account-card'
import { SkillPromptSection } from '@/components/skill-prompt-section'

// ─── Animation variants ───────────────────────────────────────────────────────

const ease = [0.4, 0, 0.2, 1] as const

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}
const cardGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardFade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

// ─── Gradient text style ──────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #1D1D1F 0%, #6E3FFB 50%, #0071E3 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

// ─── Decorative rings ─────────────────────────────────────────────────────────

function DecorativeRings() {
  return (
    // hidden on mobile, shown on md+
    <div
      className="hidden md:block"
      style={{
        position: 'absolute',
        right: '-120px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '280px',
        height: '280px',
        pointerEvents: 'none',
      }}
    >
      {/* Outer ring – slow clockwise */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(0, 113, 227, 0.18)',
        }}
      />
      {/* Inner ring – counter-clockwise, faster */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: '40px', // (280 - 200) / 2
          borderRadius: '50%',
          border: '1px solid rgba(110, 63, 251, 0.14)',
        }}
      />
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(0, 113, 227, 0.25)',
        }}
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AccountsViewProps {
  videoAccounts: AccountData[]
  xhsAccounts: AccountData[]
  mpAccounts: AccountData[]
}

export function AccountsView({
  videoAccounts,
  xhsAccounts,
  mpAccounts,
}: AccountsViewProps) {
  const { scrollY } = useScroll()
  // Parallax: header content moves up at 0.3× scroll speed
  const headerY       = useTransform(scrollY, [0, 400], [0, -120])
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8])

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div variants={pageVariants} initial="hidden" animate="visible">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          style={{ marginTop: '56px', marginBottom: '72px', position: 'relative' }}
        >
          {/* Parallax wrapper for title + subtitle only */}
          <motion.div style={{ y: headerY, opacity: headerOpacity }}>
            <h1
              style={{
                fontSize: 'clamp(40px, 5vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.07,
                marginBottom: '16px',
              }}
            >
              <span style={gradientText}>账号矩阵</span>
            </h1>
            <p
              style={{
                fontSize: '20px',
                color: '#6E6E73',
                letterSpacing: '-0.01em',
                lineHeight: 1.5,
              }}
            >
              一人四号 · 一个IP · 多元姿态
            </p>
          </motion.div>

          {/* Decorative rings — positioned relative to header container */}
          <DecorativeRings />
        </motion.div>

        {/* ── Section 1: 视频号矩阵 ────────────────────────────────────────── */}
        <motion.section variants={fadeUp} style={{ marginBottom: '72px' }}>
          <SectionTitle title="视频号矩阵" subtitle="IP人设分号 · 四种姿态" />
          <motion.div
            variants={cardGrid}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            {videoAccounts.map((account) => (
              <motion.div key={account.id} variants={cardFade}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Section: Skill Prompts ───────────────────────────────────────── */}
        <SkillPromptSection />

        {/* ── Section 2: 小红书 ────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} style={{ marginBottom: '72px' }}>
          <SectionTitle title="小红书" subtitle="专业服务号" />
          <motion.div variants={cardGrid}>
            {xhsAccounts.map((account) => (
              <motion.div key={account.id} variants={cardFade}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Section 3: 微信公众号 ────────────────────────────────────────── */}
        <motion.section variants={fadeUp} style={{ marginBottom: '72px' }}>
          <SectionTitle title="微信公众号" subtitle="按地域主题分号" />
          <motion.div
            variants={cardGrid}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            {mpAccounts.map((account) => (
              <motion.div key={account.id} variants={cardFade}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

      </motion.div>
    </div>
  )
}
