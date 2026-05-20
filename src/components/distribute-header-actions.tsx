'use client'

import { useTransition } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'
import { revertTopicToInProduction } from '@/app/(dashboard)/topics/distribute-actions'
import { toast } from 'sonner'

interface DistributeHeaderActionsProps {
  topicId: string
  topicStatus: string
}

export function DistributeHeaderActions({ topicId, topicStatus }: DistributeHeaderActionsProps) {
  const [pending, startTransition] = useTransition()

  if (topicStatus !== 'READY_TO_PUBLISH') return null

  function handleRevert() {
    startTransition(async () => {
      try {
        await revertTopicToInProduction(topicId)
        toast.success('选题已撤回到制作中')
      } catch {
        toast.error('操作失败，请重试')
      }
    })
  }

  return (
    <button
      onClick={handleRevert}
      disabled={pending}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        border: '1px solid rgba(194,104,0,0.3)',
        background: 'rgba(194,104,0,0.08)',
        color: '#C26800',
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.7 : 1,
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        if (!pending) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(194,104,0,0.14)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(194,104,0,0.08)'
      }}
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
      撤回到制作中
    </button>
  )
}
