'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface TaskGroupProps {
  emoji: string
  title: string
  count: number
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  index?: number
}

export function TaskGroup({
  emoji,
  title,
  count,
  children,
  collapsible = false,
  defaultCollapsed = false,
  index = 0,
}: TaskGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.1 }}
      style={{ marginBottom: '28px' }}
    >
      {/* Group header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
      >
        <span style={{ fontSize: '16px' }}>{emoji}</span>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1D1D1F',
            letterSpacing: '-0.022em',
          }}
        >
          {title}
        </span>

        {/* Count badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: '#6E6E73',
            borderRadius: '980px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          {count}
        </span>

        {collapsible && (
          <motion.div
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginLeft: '2px', color: '#86868B' }}
          >
            <ChevronDown size={14} />
          </motion.div>
        )}
      </div>

      {/* Cards container */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '18px',
                padding: '12px',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
