import { db } from '@/lib/db'
import { getThisWeekRange, getLastWeekRange, formatFriendlyDate } from '@/lib/date-helpers'
import { aggregateRecentActivities } from '@/lib/activity-feed'
import { auth } from '@/auth'
import { WelcomeSection } from '@/components/dashboard/welcome-section'
import { StatCards, type StatCardsData } from '@/components/dashboard/stat-cards'
import { WeekSchedule, type WeekDayData, type WeekTask } from '@/components/dashboard/week-schedule'
import { AccountActivity, type AccountActivityItem } from '@/components/dashboard/account-activity'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return '早上好'
  if (h >= 11 && h < 13) return '中午好'
  if (h >= 13 && h < 18) return '下午好'
  if (h >= 18 && h < 22) return '晚上好'
  return '夜深了'
}

export default async function DashboardPage() {
  const session = await auth()
  const userName = session?.user?.name ?? '访客'
  const { start: weekStart, end: weekEnd } = getThisWeekRange()
  const { start: lastWeekStart, end: lastWeekEnd } = getLastWeekRange()

  const [
    totalTopics,
    archivedTopics,
    inProductionTopics,
    weekNewTopics,
    lastWeekNewTopics,
    pendingTasksCount,
    thisWeekPendingCount,
    urgentCount,
    publishedTotal,
    thisWeekPublished,
    weekTasks,
    accountsRaw,
    recentActivities,
  ] = await Promise.all([
    db.topic.count(),
    db.topic.count({ where: { status: 'ARCHIVED' } }),
    db.topic.count({ where: { status: 'IN_PRODUCTION' } }),
    db.topic.count({ where: { createdAt: { gte: weekStart, lte: weekEnd } } }),
    db.topic.count({ where: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } } }),
    db.publishTask.count({ where: { status: { in: ['PENDING', 'SCHEDULED'] } } }),
    db.publishTask.count({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledAt: { gte: weekStart, lte: weekEnd },
      },
    }),
    db.publishTask.count({
      where: { urgency: 'URGENT', status: { in: ['PENDING', 'SCHEDULED'] } },
    }),
    db.publishTask.count({ where: { status: 'PUBLISHED' } }),
    db.publishTask.count({
      where: { status: 'PUBLISHED', publishedAt: { gte: weekStart, lte: weekEnd } },
    }),
    db.publishTask.findMany({
      where: {
        scheduledAt: { gte: weekStart, lte: weekEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        scheduledAt: true,
        urgency: true,
        status: true,
        asset: { select: { type: true, topic: { select: { title: true } } } },
        account: { select: { name: true } },
      },
    }),
    db.account.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        publishTasks: {
          where: { status: 'PUBLISHED' },
          select: { id: true },
        },
      },
    }),
    aggregateRecentActivities(10),
  ])

  // ─── WeekDayData ────────────────────────────────────────────────────────────

  const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const days: WeekDayData[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dStr = d.toDateString()

    const dayTasks: WeekTask[] = weekTasks
      .filter((t) => t.scheduledAt && new Date(t.scheduledAt).toDateString() === dStr)
      .map((t) => ({
        id: t.id,
        assetType: t.asset.type,
        accountName: t.account.name,
        topicTitle: t.asset.topic.title,
        urgency: t.urgency,
        status: t.status,
      }))

    return {
      dayLabel: DAY_LABELS[i],
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      dateISO: d.toISOString(),
      tasks: dayTasks,
    }
  })

  const weekEndDate = new Date(weekStart)
  weekEndDate.setDate(weekStart.getDate() + 6)
  const weekRangeLabel = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 – ${weekEndDate.getMonth() + 1}月${weekEndDate.getDate()}日`

  // ─── AccountActivity ────────────────────────────────────────────────────────

  const pendingByAccount = await db.publishTask.groupBy({
    by: ['accountId'],
    where: { status: { in: ['PENDING', 'SCHEDULED'] } },
    _count: { id: true },
  })
  const pendingMap = new Map(pendingByAccount.map((r) => [r.accountId, r._count.id]))

  const accountItems: AccountActivityItem[] = accountsRaw.map((a) => ({
    accountName: a.name,
    platform: a.platform,
    publishedCount: a.publishTasks.length,
    pendingCount: pendingMap.get(a.id) ?? 0,
  }))

  // ─── StatCards ──────────────────────────────────────────────────────────────

  const statData: StatCardsData = {
    totalTopics,
    archivedTopics,
    inProductionTopics,
    weekNewTopics,
    lastWeekNewTopics,
    pendingTasksCount,
    thisWeekPendingCount,
    urgentCount,
    publishedTotal,
    thisWeekPublished,
  }

  const friendlyDate = formatFriendlyDate(new Date())

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Welcome */}
        <WelcomeSection
          friendlyDate={friendlyDate}
          greeting={getTimeGreeting()}
          userName={userName}
        />

        {/* Stat cards */}
        <StatCards data={statData} />

        {/* Week schedule + Account activity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <WeekSchedule days={days} weekRangeLabel={weekRangeLabel} />
          <AccountActivity items={accountItems} />
        </div>

        {/* Activity feed + Quick actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          <ActivityFeed items={recentActivities} />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
