'use client'

import { useState, useTransition } from 'react'
import { toggleAccountForAsset } from '@/app/(dashboard)/topics/distribute-actions'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountChip = {
  id: string
  name: string
  platform: string
  positioning: string
  isMain?: boolean
}

export type AssetRow = {
  assetId: string
  assetType: string
  accounts: AccountChip[]
  assignedIds: string[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  WECHAT_ARTICLE: '公众号图文',
  XHS_POST:       '小红书图文',
  VIDEO:          '视频号',
}

const PLATFORM_COLOR: Record<string, string> = {
  VIDEO_CHANNEL:   '#6E3FFB',
  XIAOHONGSHU:     '#FF2442',
  WECHAT_OFFICIAL: '#07C160',
}

// ─── Account chip button ──────────────────────────────────────────────────────

function Chip({
  account,
  isOn,
  disabled,
  onToggle,
}: {
  account: AccountChip
  isOn: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const color = PLATFORM_COLOR[account.platform] ?? '#86868B'

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      title={account.positioning}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '3px',
        padding: '9px 14px',
        borderRadius: '12px',
        border: `1px solid ${isOn ? color : 'rgba(0,0,0,0.1)'}`,
        background: isOn ? `${color}14` : 'rgba(255,255,255,0.75)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        textAlign: 'left',
        minWidth: '120px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: isOn
          ? `inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px ${color}22`
          : 'inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = color
      }}
      onMouseLeave={(e) => {
        if (!isOn) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.1)'
      }}
    >
      {/* Top row: dot + name + 主号 badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: color, flexShrink: 0,
          boxShadow: isOn ? `0 0 6px ${color}88` : 'none',
          transition: 'box-shadow 0.2s',
        }} />
        <span style={{
          fontSize: '13px',
          fontWeight: isOn ? 600 : 500,
          color: isOn ? color : '#1D1D1F',
          letterSpacing: '-0.01em',
          transition: 'color 0.2s',
        }}>
          {account.name}
        </span>
        {account.isMain && (
          <span style={{
            fontSize: '9px', fontWeight: 700,
            color: '#fff',
            background: color,
            borderRadius: '4px',
            padding: '1px 5px',
            letterSpacing: '0em',
            lineHeight: 1.4,
          }}>
            主号
          </span>
        )}
      </div>

      {/* Subtitle: positioning */}
      {account.positioning && (
        <span style={{
          fontSize: '11px',
          color: isOn ? `${color}cc` : '#86868B',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          paddingLeft: '12px',
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}>
          {account.positioning}
        </span>
      )}
    </button>
  )
}

// ─── Single asset-type row ────────────────────────────────────────────────────

function AccountRow({ row }: { row: AssetRow }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(row.assignedIds))
  const [pending, startTransition] = useTransition()

  function toggle(accountId: string) {
    const next = new Set(selected)
    if (next.has(accountId)) next.delete(accountId)
    else next.add(accountId)
    setSelected(next)

    startTransition(async () => {
      await toggleAccountForAsset(row.assetId, accountId)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      {/* Row label */}
      <span style={{
        fontSize: '12px', color: '#86868B', fontWeight: 500,
        letterSpacing: '-0.01em',
        minWidth: '72px', flexShrink: 0,
        paddingTop: '10px',
      }}>
        {TYPE_LABEL[row.assetType] ?? row.assetType}
      </span>

      {/* Chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        opacity: pending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}>
        {row.accounts.map((acc) => (
          <Chip
            key={acc.id}
            account={acc}
            isOn={selected.has(acc.id)}
            disabled={pending}
            onToggle={() => toggle(acc.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AssetAccountPicker({ rows }: { rows: AssetRow[] }) {
  if (rows.length === 0) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.8)',
      borderRadius: '16px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.03)',
    }}>
      {rows.map((row) => (
        <AccountRow key={row.assetId} row={row} />
      ))}
    </div>
  )
}
