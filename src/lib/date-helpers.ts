// ─── Week ranges ──────────────────────────────────────────────────────────────

export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dow = now.getDay() // 0=Sun
  const start = new Date(now)
  start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)) // Monday
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Sunday
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getLastWeekRange(): { start: Date; end: Date } {
  const { start: thisMonday } = getThisWeekRange()
  const end = new Date(thisMonday)
  end.setMilliseconds(-1) // last ms of previous Sunday
  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

// ─── Date predicates ──────────────────────────────────────────────────────────

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toDateString() === new Date().toDateString()
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`

  if (d.toDateString() === now.toDateString()) return `今天 ${hhmm}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${hhmm}`

  if (diffHours < 168) {
    // within 7 days
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${weekdays[d.getDay()]} ${hhmm}`
  }

  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatFriendlyDate(date: Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 ${weekdays[date.getDay()]}`
}
