'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUrgentTaskCount } from '@/app/(dashboard)/schedule/actions'

export function NavbarUrgentBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const c = await getUrgentTaskCount()
        setCount(c)
      } catch {
        // silently ignore
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF3B30',
            color: '#fff',
            borderRadius: '50%',
            minWidth: '16px',
            height: '16px',
            fontSize: '10px',
            fontWeight: 600,
            padding: '0 3px',
            marginLeft: '4px',
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
