export type BadgeVariant =
  | 'default'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'green'
  | 'red'
  | 'glass-default'
  | 'glass-blue'
  | 'glass-purple'
  | 'glass-red'
  | 'glass-green'
  | 'glass-orange'

type BadgeSize = 'sm' | 'md'

type BadgeStyle = {
  color: string
  background: string
  backdropFilter?: string
  WebkitBackdropFilter?: string
  border?: string
  boxShadow?: string
}

const variantStyles: Record<BadgeVariant, BadgeStyle> = {
  // Solid
  default: { color: '#6E6E73', background: '#F5F5F7' },
  blue:    { color: '#0071E3', background: '#E8F0FE' },
  purple:  { color: '#6E3FFB', background: '#F0E8FE' },
  orange:  { color: '#C26800', background: '#FEF1E8' },
  green:   { color: '#1F8C3F', background: '#E8F8EE' },
  red:     { color: '#C81E1E', background: '#FCE8E8' },

  // Glass
  'glass-default': {
    color: '#6E6E73',
    background: 'linear-gradient(135deg, rgba(110,110,115,0.10), rgba(110,110,115,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(110,110,115,0.18)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  'glass-blue': {
    color: '#0071E3',
    background: 'linear-gradient(135deg, rgba(0,113,227,0.12), rgba(0,113,227,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,113,227,0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  'glass-purple': {
    color: '#6E3FFB',
    background: 'linear-gradient(135deg, rgba(110,63,251,0.12), rgba(110,63,251,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(110,63,251,0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  'glass-red': {
    color: '#C81E1E',
    background: 'linear-gradient(135deg, rgba(200,30,30,0.10), rgba(200,30,30,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(200,30,30,0.18)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  'glass-green': {
    color: '#1F8C3F',
    background: 'linear-gradient(135deg, rgba(31,140,63,0.10), rgba(31,140,63,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(31,140,63,0.18)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  'glass-orange': {
    color: '#C26800',
    background: 'linear-gradient(135deg, rgba(194,104,0,0.10), rgba(194,104,0,0.04))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(194,104,0,0.18)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
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
  const s = variantStyles[variant]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: s.background,
        color: s.color,
        backdropFilter: s.backdropFilter,
        WebkitBackdropFilter: s.WebkitBackdropFilter,
        border: s.border,
        boxShadow: s.boxShadow,
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
