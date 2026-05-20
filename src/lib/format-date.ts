export function formatScheduledTime(date: Date | string): { text: string; expired: boolean } {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()

  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  if (diffMs < 0) {
    const absMs = Math.abs(diffMs)
    const absHours = Math.floor(absMs / 3600000)
    const absDays = Math.floor(absMs / 86400000)
    if (absHours < 1) return { text: `已过期 ${Math.ceil(absMs / 60000)} 分钟`, expired: true }
    if (absHours < 24) return { text: `已过期 ${absHours} 小时`, expired: true }
    return { text: `已过期 ${absDays} 天`, expired: true }
  }

  if (d.toDateString() === now.toDateString()) {
    return { text: `今天 ${timeStr}`, expired: false }
  }

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) {
    return { text: `明天 ${timeStr}`, expired: false }
  }

  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return { text: `${weekdays[d.getDay()]} ${timeStr}`, expired: false }
  }

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return { text: `${y}.${m}.${day} ${timeStr}`, expired: false }
}

export function formatCountdown(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = d.getTime() - Date.now()
  if (diffMs <= 0) return ''

  const days = Math.floor(diffMs / 86400000)
  const hours = Math.floor((diffMs % 86400000) / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)

  if (days > 0) return `距离发布还有 ${days} 天 ${hours} 小时`
  if (hours > 0) return `距离发布还有 ${hours} 小时 ${mins} 分钟`
  return `距离发布还有 ${mins} 分钟`
}
