import { AppleBadge, type BadgeVariant } from '@/components/apple/apple-badge'
import { AppleCard } from '@/components/apple/apple-card'

export type AccountData = {
  id: string
  name: string
  platform: string
  positioning: string
  coreQuestion: string
  contentType: string
  duration: string
  frequency: string
  style: string
  punchlineIndex: string
  conversionFunnel: string
  displayOrder: number
}

const platformBadgeMap: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  VIDEO_CHANNEL:   { label: '视频号', variant: 'glass-purple' },
  XIAOHONGSHU:     { label: '小红书', variant: 'glass-red' },
  WECHAT_OFFICIAL: { label: '公众号', variant: 'glass-green' },
}

const attributes: { key: keyof AccountData; label: string }[] = [
  { key: 'coreQuestion',     label: '核心问题' },
  { key: 'contentType',      label: '内容类型' },
  { key: 'duration',         label: '时长' },
  { key: 'frequency',        label: '发布频率' },
  { key: 'style',            label: '风格' },
  { key: 'punchlineIndex',   label: '金句指数' },
  { key: 'conversionFunnel', label: '转化定位' },
]

interface AccountCardProps {
  account: AccountData
}

export function AccountCard({ account }: AccountCardProps) {
  const platformInfo = platformBadgeMap[account.platform] ?? {
    label: account.platform,
    variant: 'glass-default' as BadgeVariant,
  }

  const hasAttributes = attributes.some((a) => {
    const val = account[a.key] as string
    return val && val.length > 0
  })

  return (
    <AppleCard hoverable variant="glass" className="h-full">
      {/* Platform + positioning badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <AppleBadge variant={platformInfo.variant}>{platformInfo.label}</AppleBadge>
        {account.positioning && (
          <AppleBadge variant="glass-default">{account.positioning}</AppleBadge>
        )}
      </div>

      {/* Account name */}
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1D1D1F',
          letterSpacing: '-0.022em',
          marginBottom: '20px',
          lineHeight: 1.2,
        }}
      >
        {account.name}
      </h3>

      {/* Attributes grid */}
      {hasAttributes ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 16px',
          }}
        >
          {attributes.map(({ key, label }) => {
            const value = account[key] as string
            return (
              <div key={key}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#86868B',
                    marginBottom: '3px',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    color: '#1D1D1F',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                  }}
                >
                  {value || '—'}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ fontSize: '15px', color: '#86868B', letterSpacing: '-0.01em' }}>
          详细信息待完善
        </p>
      )}
    </AppleCard>
  )
}
