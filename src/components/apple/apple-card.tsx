'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface AppleCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  bg?: 'white' | 'tertiary'
  variant?: 'default' | 'glass'
}

const GLASS_SHADOW_DEFAULT = [
  'inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
  'inset 0 -1px 0 0 rgba(0, 0, 0, 0.04)',
  '0 1px 2px rgba(0, 0, 0, 0.04)',
  '0 8px 32px rgba(0, 0, 0, 0.04)',
].join(', ')

const GLASS_SHADOW_HOVER = [
  'inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
  'inset 0 -1px 0 0 rgba(0, 0, 0, 0.04)',
  '0 4px 16px rgba(0, 0, 0, 0.06)',
  '0 24px 48px rgba(0, 0, 0, 0.08)',
].join(', ')

export function AppleCard({
  children,
  className,
  hoverable = false,
  onClick,
  bg = 'tertiary',
  variant = 'default',
}: AppleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const isGlass = variant === 'glass'
  const isActive = isHovered && hoverable

  // Update CSS vars directly on the DOM element — zero re-renders on mousemove
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }, [])

  const cardStyle: React.CSSProperties = {
    transition:
      'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)',
    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
    ...(isGlass
      ? {
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: isActive ? GLASS_SHADOW_HOVER : GLASS_SHADOW_DEFAULT,
        }
      : {
          backgroundColor: bg === 'white' ? '#FFFFFF' : '#FBFBFD',
          boxShadow: isActive ? '0 12px 32px rgba(0,0,0,0.08)' : 'none',
        }),
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-[18px] p-6',
        hoverable && 'cursor-pointer',
        className,
      )}
      style={cardStyle}
    >
      {/* Spotlight — background references CSS vars set via DOM, no extra renders */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          background:
            'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 113, 227, 0.08), transparent 40%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
