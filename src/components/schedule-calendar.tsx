'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTasksForMonth } from '@/app/(dashboard)/schedule/actions'
import type { CalendarTask } from '@/app/(dashboard)/schedule/actions'

// ─── Dot colors per asset type ────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  WECHAT_ARTICLE: '#34C759',
  XHS_POST:       '#FF3B30',
  VIDEO:          '#6E3FFB',
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun…6=Sat → convert to Mon-first (0=Mon…6=Sun)
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// ─── Component ────────────────────────────────────────────────────────────────

interface ScheduleCalendarProps {
  initialTasks: CalendarTask[]
  initialYear: number
  initialMonth: number
}

export function ScheduleCalendar({ initialTasks, initialYear, initialMonth }: ScheduleCalendarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [tasks, setTasks] = useState<CalendarTask[]>(initialTasks)
  const [loading, setLoading] = useState(false)

  // When year/month change, fetch new data
  useEffect(() => {
    if (year === initialYear && month === initialMonth) return
    setLoading(true)
    getTasksForMonth(year, month)
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [year, month, initialYear, initialMonth])

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const map: Record<number, CalendarTask[]> = {}
    for (const t of tasks) {
      const d = new Date(t.scheduledAt)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(t)
      }
    }
    return map
  }, [tasks, year, month])

  // Month stats
  const totalThisMonth = tasks.filter((t) => t.status !== 'CANCELLED').length
  const completedThisMonth = tasks.filter((t) => t.status === 'PUBLISHED').length

  // Next week stats
  const nextWeekCount = useMemo(() => {
    const now = new Date()
    const dow = now.getDay()
    const startNextWeek = new Date(now)
    startNextWeek.setDate(now.getDate() + (dow === 0 ? 1 : 8 - dow))
    startNextWeek.setHours(0, 0, 0, 0)
    const endNextWeek = new Date(startNextWeek)
    endNextWeek.setDate(startNextWeek.getDate() + 6)
    endNextWeek.setHours(23, 59, 59, 999)
    return tasks.filter((t) => {
      const d = new Date(t.scheduledAt)
      return d >= startNextWeek && d <= endNextWeek && t.status !== 'CANCELLED'
    }).length
  }, [tasks])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    router.push(`${pathname}?view=list&date=${dateStr}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Calendar card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.8)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(0,0,0,0.05)',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={prevMonth}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
              color: '#1D1D1F', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.10)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)' }}
          >
            <ChevronLeft size={16} />
          </button>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.022em' }}>
            {year} 年 {MONTH_NAMES[month]}
          </h2>

          <button
            onClick={nextMonth}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
              color: '#1D1D1F', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.10)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center', fontSize: '11px', fontWeight: 600,
                color: '#86868B', letterSpacing: '-0.01em', padding: '4px 0',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNumber = i - firstDay + 1
            const isCurrentMonth2 = dayNumber >= 1 && dayNumber <= daysInMonth
            const isToday = isCurrentMonth && dayNumber === today.getDate()
            const dayTasks = isCurrentMonth2 ? (tasksByDay[dayNumber] ?? []) : []
            const hasUrgent = dayTasks.some((t) => t.urgency === 'URGENT' && t.status !== 'PUBLISHED')
            const hasTasks = dayTasks.length > 0

            // Unique types for dots (max 4)
            const dotTypes = [...new Set(dayTasks.map((t) => t.assetType))].slice(0, 4)

            return (
              <div
                key={i}
                onClick={isCurrentMonth2 && hasTasks ? () => handleDayClick(dayNumber) : undefined}
                style={{
                  minHeight: '72px',
                  borderRadius: '10px',
                  padding: '6px',
                  background: isToday
                    ? 'rgba(0,113,227,0.06)'
                    : hasTasks && isCurrentMonth2
                    ? 'rgba(0,0,0,0.025)'
                    : 'transparent',
                  border: isToday
                    ? '1px solid rgba(0,113,227,0.2)'
                    : hasTasks && isCurrentMonth2
                    ? '1px solid rgba(0,0,0,0.05)'
                    : '1px solid transparent',
                  cursor: isCurrentMonth2 && hasTasks ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'background 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}
                onMouseEnter={(e) => {
                  if (isCurrentMonth2 && hasTasks) {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,113,227,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCurrentMonth2 && hasTasks) {
                    (e.currentTarget as HTMLDivElement).style.background =
                      isToday ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.025)'
                  }
                }}
              >
                {/* Urgent badge */}
                {hasUrgent && (
                  <div
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#FF3B30',
                    }}
                  />
                )}

                {/* Day number */}
                {isCurrentMonth2 && (
                  <div
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? '#0071E3' : 'transparent',
                      fontSize: '13px', fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#fff' : '#1D1D1F',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {dayNumber}
                  </div>
                )}

                {/* Task count */}
                {isCurrentMonth2 && dayTasks.length > 0 && (
                  <div
                    style={{
                      fontSize: '18px', fontWeight: 700,
                      color: '#1D1D1F', letterSpacing: '-0.022em', lineHeight: 1,
                    }}
                  >
                    {dayTasks.length}
                  </div>
                )}

                {/* Type dots */}
                {isCurrentMonth2 && dotTypes.length > 0 && (
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
                    {dotTypes.map((type) => (
                      <div
                        key={type}
                        style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: TYPE_COLORS[type] ?? '#86868B',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Month summary */}
      <div
        style={{
          display: 'flex', gap: '24px', flexWrap: 'wrap',
          marginTop: '16px', padding: '0 4px',
        }}
      >
        <p style={{ fontSize: '13px', color: '#86868B', letterSpacing: '-0.01em' }}>
          本月共 <strong style={{ color: '#1D1D1F' }}>{totalThisMonth}</strong> 条任务，
          <strong style={{ color: '#34C759' }}>{completedThisMonth}</strong> 条已完成
        </p>
        {nextWeekCount > 0 && (
          <p style={{ fontSize: '13px', color: '#86868B', letterSpacing: '-0.01em' }}>
            下周已排期 <strong style={{ color: '#0071E3' }}>{nextWeekCount}</strong> 条
          </p>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
          {[
            { color: '#34C759', label: '公众号' },
            { color: '#FF3B30', label: '小红书' },
            { color: '#6E3FFB', label: '视频' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '11px', color: '#86868B', letterSpacing: '-0.01em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
