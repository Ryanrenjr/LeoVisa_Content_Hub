'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/apple/section-title'
import { AccountCard, type AccountData } from '@/components/account-card'

// ─── Framer Motion variants ──────────────────────────────────────────────────

const ease = [0.4, 0, 0.2, 1] as const

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const headerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

const cardGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

// ─── Component ───────────────────────────────────────────────────────────────

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
  return (
    <div style={{ padding: '0 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div variants={pageVariants} initial="hidden" animate="visible">
        {/* Page header */}
        <motion.div
          variants={headerVariants}
          style={{ marginTop: '48px', marginBottom: '64px' }}
        >
          <h1
            style={{
              fontSize: '34px',
              fontWeight: 600,
              color: '#1D1D1F',
              letterSpacing: '-0.022em',
              lineHeight: 1.12,
            }}
          >
            账号矩阵
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: '#6E6E73',
              marginTop: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            一人四号 · 一个IP · 多元姿态
          </p>
        </motion.div>

        {/* Section 1: 视频号矩阵 */}
        <motion.section variants={sectionVariants} style={{ marginBottom: '64px' }}>
          <SectionTitle title="视频号矩阵" subtitle="IP人设分号 · 四种姿态" />
          <motion.div
            variants={cardGridVariants}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            {videoAccounts.map((account) => (
              <motion.div key={account.id} variants={cardVariants}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section 2: 小红书 */}
        <motion.section variants={sectionVariants} style={{ marginBottom: '64px' }}>
          <SectionTitle title="小红书" subtitle="专业服务号" />
          <motion.div variants={cardGridVariants}>
            {xhsAccounts.map((account) => (
              <motion.div key={account.id} variants={cardVariants}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section 3: 微信公众号 */}
        <motion.section variants={sectionVariants} style={{ marginBottom: '64px' }}>
          <SectionTitle title="微信公众号" subtitle="按地域主题分号" />
          <motion.div
            variants={cardGridVariants}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            {mpAccounts.map((account) => (
              <motion.div key={account.id} variants={cardVariants}>
                <AccountCard account={account} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  )
}
