import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'blue' | 'purple' | 'orange' | 'green' | 'red'
type BadgeSize = 'sm' | 'md'

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: '#F5F5F7', color: '#6E6E73' },
  blue:    { bg: '#E8F0FE', color: '#0071E3' },
  purple:  { bg: '#F0E8FE', color: '#6E3FFB' },
  orange:  { bg: '#FEF1E8', color: '#C26800' },
  green:   { bg: '#E8F8EE', color: '#1F8C3F' },
  red:     { bg: '#FCE8E8', color: '#C81E1E' },
}

interface AppleBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

export function AppleBadge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: AppleBadgeProps) {
  const { bg, color } = variantStyles[variant]

  return (
    <span
      className={cn('inline-flex items-center', className)}
      style={{
        backgroundColor: bg,
        color,
        borderRadius: '980px',
        padding: size === 'sm' ? '4px 10px' : '6px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  )
}
