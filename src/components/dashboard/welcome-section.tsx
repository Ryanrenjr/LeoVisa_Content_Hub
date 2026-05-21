'use client'

import { motion } from 'framer-motion'
import { formatFriendlyDate } from '@/lib/date-helpers'

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #0071E3 0%, #00C2FF 60%, #1ABA6E 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

function DoubleRing() {
  return (
    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2.5px solid rgba(0,113,227,0.35)',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: '16px', borderRadius: '50%',
          border: '2.5px solid rgba(0,194,255,0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '12px', height: '12px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #0071E3, #00C2FF)',
          boxShadow: '0 0 12px rgba(0,113,227,0.5)',
        }}
      />
    </div>
  )
}

interface WelcomeSectionProps {
  friendlyDate: string
  greeting: string
  userName: string
}

export function WelcomeSection({ friendlyDate, greeting, userName }: WelcomeSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '40px',
        paddingBottom: '40px',
        gap: '24px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'clamp(36px, 5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.07,
            marginBottom: '10px',
          }}
        >
          <span style={gradientText}>{greeting}，{userName}</span>
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: '#86868B',
            letterSpacing: '-0.01em',
          }}
        >
          内容生产中心 · {friendlyDate}
        </p>
      </div>
      <DoubleRing />
    </motion.div>
  )
}
