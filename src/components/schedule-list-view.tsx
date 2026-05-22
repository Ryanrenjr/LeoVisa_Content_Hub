'use client'

import { useMemo } from 'react'
import { groupTasksByTime } from '@/lib/format-date'
import { TaskGroup } from '@/components/task-group'
import { PublishTaskCard } from '@/components/publish-task-card'
import type { ScheduleTask } from '@/app/(dashboard)/schedule/actions'

// ─── Group definitions ────────────────────────────────────────────────────────

const GROUPS = [
  { key: 'urgent',       emoji: '🚨', label: '紧急任务',   collapsible: false, defaultCollapsed: false },
  { key: 'today',        emoji: '⏰', label: '今天',       collapsible: false, defaultCollapsed: false },
  { key: 'tomorrow',     emoji: '📅', label: '明天',       collapsible: false, defaultCollapsed: false },
  { key: 'thisWeekRest', emoji: '📆', label: '本周后续',   collapsible: false, defaultCollapsed: false },
  { key: 'later',        emoji: '🔮', label: '后续排期',   collapsible: false, defaultCollapsed: false },
  { key: 'immediate',    emoji: '⚡', label: '待发布',     collapsible: false, defaultCollapsed: false },
  { key: 'backlog',      emoji: '📚', label: '备稿库',     collapsible: true,  defaultCollapsed: false },
  { key: 'completed',    emoji: '✅', label: '已完成',     collapsible: true,  defaultCollapsed: true  },
] as const

interface ScheduleListViewProps {
  tasks: ScheduleTask[]
  statusFilter: string
}

export function ScheduleListView({ tasks, statusFilter }: ScheduleListViewProps) {
  // Apply status filter before grouping
  const filteredTasks = useMemo(() => {
    if (!statusFilter) return tasks
    return tasks.filter((t) => t.status === statusFilter)
  }, [tasks, statusFilter])

  const groups = useMemo(() => groupTasksByTime(filteredTasks), [filteredTasks])

  const activeGroups = GROUPS.filter((g) => groups[g.key].length > 0)

  if (activeGroups.length === 0) {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '12px',
          padding: '80px 24px',
          color: '#86868B',
        }}
      >
        <span style={{ fontSize: '40px' }}>📋</span>
        <p style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '-0.01em' }}>
          暂无发布任务
        </p>
        <p style={{ fontSize: '14px', color: '#C7C7CC', letterSpacing: '-0.01em' }}>
          {statusFilter ? '当前筛选条件下没有任务' : '前往选题工作台创建分发任务'}
        </p>
      </div>
    )
  }

  let groupIndex = 0

  return (
    <div>
      {GROUPS.map((groupDef) => {
        const groupTasks = groups[groupDef.key]
        if (groupTasks.length === 0) return null

        const currentIndex = groupIndex++

        return (
          <TaskGroup
            key={groupDef.key}
            emoji={groupDef.emoji}
            title={groupDef.label}
            count={groupTasks.length}
            collapsible={groupDef.collapsible}
            defaultCollapsed={groupDef.defaultCollapsed}
            index={currentIndex}
          >
            {(groupTasks as ScheduleTask[]).map((task, i) => (
              <PublishTaskCard key={task.id} task={task} index={i} />
            ))}
          </TaskGroup>
        )
      })}
    </div>
  )
}
