import { cn } from '@/lib/utils'

interface AppleCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  bg?: 'white' | 'tertiary'
}

export function AppleCard({
  children,
  className,
  hoverable = false,
  onClick,
  bg = 'tertiary',
}: AppleCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-[18px] p-6',
        hoverable &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]',
        className,
      )}
      style={{
        backgroundColor: bg === 'white' ? '#FFFFFF' : '#FBFBFD',
        transition:
          'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  )
}
