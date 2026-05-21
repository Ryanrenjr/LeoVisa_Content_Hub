import { Suspense } from 'react'
import { db } from '@/lib/db'
import { ScheduleToolbar } from '@/components/schedule-toolbar'
import { ScheduleListView } from '@/components/schedule-list-view'
import { ScheduleCalendar } from '@/components/schedule-calendar'
import type { ScheduleTask, CalendarTask } from '@/app/(dashboard)/schedule/actions'

export const metadata = {
  title: '排期管理 — LeoVisa Content Hub',
}

// ─── Gradient text style ──────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #1ABA6E 0%, #0071E3 50%, #6E3FFB 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

// ─── Double ring decoration ───────────────────────────────────────────────────

function DoubleRing() {
  return (
    <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
      {/* Outer ring */}
      <div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, #1ABA6E, #6E3FFB) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          opacity: 0.5,
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          position: 'absolute', inset: '14px',
          borderRadius: '50%',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, #6E3FFB, #1ABA6E) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          opacity: 0.7,
        }}
      />
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px', height: '10px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1ABA6E, #6E3FFB)',
        }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const view   = typeof params.view   === 'string' ? params.view   : 'list'
  const status = typeof params.status === 'string' ? params.status : ''

  // ── Fetch all active + last 30 days of published tasks ──────────────────────
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const rawTasks = await db.publishTask.findMany({
    where: {
      OR: [
        { status: { notIn: ['PUBLISHED', 'CANCELLED'] } },
        { status: 'PUBLISHED', publishedAt: { gte: thirtyDaysAgo } },
        { status: 'CANCELLED', createdAt: { gte: thirtyDaysAgo } },
      ],
    },
    include: {
      asset: {
        include: {
          topic: { select: { id: true, code: true, title: true } },
        },
      },
      account: { select: { id: true, name: true, platform: true } },
    },
    orderBy: [
      { urgency: 'desc' },
      { scheduledAt: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  // ── Serialize (Date → ISO string for client components) ─────────────────────
  const tasks: ScheduleTask[] = rawTasks.map((t) => ({
    id: t.id,
    assetId: t.assetId,
    accountId: t.accountId,
    scheduledAt: t.scheduledAt?.toISOString() ?? null,
    urgency: t.urgency,
    status: t.status,
    publishedUrl: t.publishedUrl,
    publishedAt: t.publishedAt?.toISOString() ?? null,
    publishedScreenshotPath: t.publishedScreenshotPath,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    asset: {
      id: t.asset.id,
      type: t.asset.type,
      textFilePath: t.asset.textFilePath,
      coverImagePath: t.asset.coverImagePath,
      videoFilePath: t.asset.videoFilePath,
      scriptFilePath: t.asset.scriptFilePath,
      topic: {
        id: t.asset.topic.id,
        code: t.asset.topic.code,
        title: t.asset.topic.title,
      },
    },
    account: {
      id: t.account.id,
      name: t.account.name,
      platform: t.account.platform,
    },
  }))

  // ── Today stats (computed from fetched tasks) ────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setDate(today.getDate() + 1)

  const todayTotal = tasks.filter((t) => {
    if (!t.scheduledAt || t.status === 'CANCELLED') return false
    const d = new Date(t.scheduledAt)
    return d >= today && d < todayEnd
  }).length

  const todayUrgent = tasks.filter(
    (t) => t.urgency === 'URGENT' && !['PUBLISHED', 'CANCELLED'].includes(t.status),
  ).length

  const todayPublished = tasks.filter((t) => {
    if (!t.scheduledAt || t.status !== 'PUBLISHED') return false
    const d = new Date(t.scheduledAt)
    return d >= today && d < todayEnd
  }).length

  // ── Calendar tasks (only scheduled ones for the current month) ───────────────
  const now = new Date()
  const calendarTasks: CalendarTask[] = tasks
    .filter((t) => t.scheduledAt !== null)
    .map((t) => ({
      id: t.id,
      scheduledAt: t.scheduledAt!,
      urgency: t.urgency,
      status: t.status,
      assetType: t.asset.type,
    }))

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: '40px',
          paddingBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.07,
              marginBottom: '8px',
            }}
          >
            <span style={gradientText}>排期管理</span>
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#86868B',
              letterSpacing: '-0.01em',
            }}
          >
            内容发布的执行中心 · 按时上岗
          </p>
        </div>

        <DoubleRing />
      </div>

      {/* ── Toolbar (sticky) ────────────────────────────────────────────────── */}
      <Suspense>
        <ScheduleToolbar
          view={view}
          status={status}
          todayTotal={todayTotal}
          todayUrgent={todayUrgent}
          todayPublished={todayPublished}
        />
      </Suspense>

      {/* ── Content view ────────────────────────────────────────────────────── */}
      {view === 'calendar' ? (
        <ScheduleCalendar
          initialTasks={calendarTasks}
          initialYear={now.getFullYear()}
          initialMonth={now.getMonth()}
        />
      ) : (
        <ScheduleListView tasks={tasks} statusFilter={status} />
      )}
    </div>
  )
}
