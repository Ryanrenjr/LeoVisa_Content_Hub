'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Lock } from 'lucide-react'

export type AccountOption = {
  id: string
  name: string
  platform: string
  positioning: string
}

interface DistributionAccountSelectorProps {
  accounts: AccountOption[]
  selectedId: string
  onChange: (id: string) => void
  suggestedId?: string
  locked?: boolean
  lockedAccountName?: string
}

export function DistributionAccountSelector({
  accounts,
  selectedId,
  onChange,
  suggestedId,
  locked,
  lockedAccountName,
}: DistributionAccountSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (locked) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Lock size={12} style={{ color: '#86868B', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#86868B', letterSpacing: '-0.01em' }}>已锁定到：</span>
        <span style={{ fontSize: '13px', color: '#1D1D1F', fontWeight: 500, letterSpacing: '-0.01em' }}>
          {lockedAccountName ?? '李尔王英欧移民中介服务'}
        </span>
      </div>
    )
  }

  const selected = accounts.find((a) => a.id === selectedId)
  const sorted = [...accounts].sort((a, b) => {
    if (a.id === suggestedId) return -1
    if (b.id === suggestedId) return 1
    return 0
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '9px 12px',
          borderRadius: '10px',
          border: `1px solid ${open ? 'rgba(0,113,227,0.4)' : 'rgba(0,0,0,0.1)'}`,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(0,113,227,0.08)' : 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selected?.id === suggestedId && (
            <span style={{ fontSize: '10px', color: '#0071E3', fontWeight: 600 }}>⚡</span>
          )}
          <span
            style={{
              fontSize: '13px',
              color: selected ? '#1D1D1F' : '#C7C7CC',
              fontWeight: selected ? 500 : 400,
              letterSpacing: '-0.01em',
            }}
          >
            {selected?.name ?? '选择目标账号…'}
          </span>
        </span>
        <ChevronDown
          size={14}
          style={{
            color: '#86868B',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.8)',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            overflow: 'hidden',
          }}
        >
          {sorted.map((account, i) => {
            const isSelected = account.id === selectedId
            const isSuggested = account.id === suggestedId
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => { onChange(account.id); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  background: isSelected ? 'rgba(0,113,227,0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSuggested && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#0071E3',
                        background: 'rgba(0,113,227,0.1)',
                        border: '1px solid rgba(0,113,227,0.2)',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⚡ 推荐
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '13px',
                      color: isSelected ? '#0071E3' : '#1D1D1F',
                      fontWeight: isSelected ? 600 : 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {account.name}
                  </span>
                </div>
                {account.positioning && (
                  <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em', paddingLeft: isSuggested ? '40px' : '0' }}>
                    {account.positioning}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
