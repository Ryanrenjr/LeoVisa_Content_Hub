import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { suggestAccount } from '@/lib/distribution-suggestion'
import { DistributionCard, type DistributeAsset, type DistributeSuggestion } from '@/components/distribution-card'
import { SuggestionBanner, type BannerSuggestion } from '@/components/suggestion-banner'
import { PublishTaskList, type TaskListItem } from '@/components/publish-task-list'
import { DistributeHeaderActions } from '@/components/distribute-header-actions'
import type { BadgeVariant } from '@/components/apple/apple-badge'
import { AppleBadge } from '@/components/apple/apple-badge'

// ─── Platform → asset type mapping ────────────────────────────────────────────

const ASSET_TYPE_TO_PLATFORM: Record<string, string> = {
  WECHAT_ARTICLE: 'WECHAT_OFFICIAL',
  XHS_POST:       'XIAOHONGSHU',
  VIDEO:          'VIDEO_CHANNEL',
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const topic = await db.topic.findUnique({ where: { id }, select: { title: true, code: true } })
  if (!topic) return { title: '选题不存在' }
  return { title: `分发设置 — ${topic.code} ${topic.title}` }
}

// ─── Gradient text style ──────────────────────────────────────────────────────

const gradientText: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: 'linear-gradient(135deg, #1D1D1F 0%, #6E3FFB 50%, #0071E3 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DistributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [topic, accounts] = await Promise.all([
    db.topic.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true, name: true } },
        assets: {
          orderBy: { type: 'asc' },
          include: {
            publishTasks: {
              include: {
                account: {
                  select: { id: true, name: true, platform: true, positioning: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    }),
    db.account.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, platform: true, positioning: true },
    }),
  ])

  if (!topic) notFound()

  const tagNames = topic.tags.map((t) => t.name)

  // ── Serialize assets ────────────────────────────────────────────────────────
  const serializedAssets: DistributeAsset[] = topic.assets.map((a) => ({
    id: a.id,
    topicId: a.topicId,
    type: a.type,
    textFilePath: a.textFilePath,
    coverImagePath: a.coverImagePath,
    videoFilePath: a.videoFilePath,
    scriptFilePath: a.scriptFilePath,
    originalNames: (a as Record<string, unknown>).originalNames as string | null ?? null,
    fileSizes:     (a as Record<string, unknown>).fileSizes     as string | null ?? null,
    status: a.status,
    updatedAt: a.updatedAt.toISOString(),
    publishTasks: a.publishTasks.map((t) => ({
      id: t.id,
      assetId: t.assetId,
      accountId: t.accountId,
      scheduledAt: t.scheduledAt?.toISOString() ?? null,
      urgency: t.urgency,
      status: t.status,
      publishedUrl: t.publishedUrl,
      publishedAt: t.publishedAt?.toISOString() ?? null,
      notes: t.notes,
      account: {
        id: t.account.id,
        name: t.account.name,
        platform: t.account.platform,
        positioning: t.account.positioning,
      },
    })),
  }))

  // ── Per-asset suggestions ──────────────────────────────────────────────────
  const assetSuggestions: Record<string, DistributeSuggestion> = {}
  for (const asset of serializedAssets) {
    assetSuggestions[asset.id] = suggestAccount(asset.type, tagNames, accounts)
  }

  // ── Banner suggestions ─────────────────────────────────────────────────────
  const bannerSuggestions: BannerSuggestion[] = serializedAssets
    .map((a) => {
      const s = assetSuggestions[a.id]
      if (!s) return null
      const hasTask = a.publishTasks.some((t) => ['PENDING', 'SCHEDULED', 'PUBLISHED'].includes(t.status))
      return {
        assetId: a.id,
        accountId: s.accountId,
        accountName: s.accountName,
        assetType: a.type,
        reason: s.reason,
        hasTask,
      }
    })
    .filter((s): s is BannerSuggestion => s !== null)

  // ── All tasks flat list ────────────────────────────────────────────────────
  const allTasks: TaskListItem[] = serializedAssets.flatMap((a) =>
    a.publishTasks.map((t) => ({
      id: t.id,
      assetId: a.id,
      assetType: a.type,
      accountId: t.accountId,
      accountName: t.account.name,
      scheduledAt: t.scheduledAt,
      urgency: t.urgency,
      status: t.status,
      publishedUrl: t.publishedUrl,
    })),
  )

  // ── Task count summary ─────────────────────────────────────────────────────
  const publishedCount = serializedAssets.filter((a) =>
    a.publishTasks.some((t) => t.status === 'PUBLISHED'),
  ).length
  const totalCount = serializedAssets.length

  return (
    <div style={{ padding: '0 24px 100px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '24px',
          paddingBottom: '28px',
          gap: '16px',
        }}
      >
        {/* Back */}
        <Link
          href={`/topics/${id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '14px',
            color: '#86868B',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={undefined}
        >
          ← 返回选题详情
        </Link>

        {/* Center: title */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.07,
              marginBottom: '4px',
            }}
          >
            <span style={gradientText}>分发设置</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#86868B', letterSpacing: '-0.01em' }}>
            <span style={{ fontFamily: 'SF Mono, Consolas, monospace', color: '#0071E3', fontWeight: 600, fontSize: '12px' }}>
              {topic.code}
            </span>
            {' '}— {topic.title}
          </p>
        </div>

        {/* Right: task count badge + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <AppleBadge
            variant={publishedCount === totalCount ? 'glass-green' : 'glass-blue'}
            size="md"
          >
            {publishedCount}/{totalCount} 已发布
          </AppleBadge>
          <DistributeHeaderActions topicId={id} topicStatus={topic.status} />
        </div>
      </div>

      {/* ── Suggestion banner ──────────────────────────────────────────────── */}
      <SuggestionBanner
        topicId={id}
        suggestions={bannerSuggestions}
        topicHasTags={topic.tags.length > 0}
      />

      {/* ── Distribution cards ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {serializedAssets.map((asset) => {
          const candidateAccounts = accounts.filter(
            (a) => a.platform === ASSET_TYPE_TO_PLATFORM[asset.type],
          )
          const activeTask    = asset.publishTasks.find((t) => ['PENDING', 'SCHEDULED'].includes(t.status))
          const publishedTask = asset.publishTasks.find((t) => t.status === 'PUBLISHED')
          const keyStr = publishedTask?.id ?? activeTask?.id ?? 'no-task'
          return (
            <DistributionCard
              key={`${asset.id}-${keyStr}`}
              asset={asset}
              candidateAccounts={candidateAccounts}
              suggestion={assetSuggestions[asset.id]}
            />
          )
        })}
      </div>

      {/* ── Task list ─────────────────────────────────────────────────────── */}
      {allTasks.length > 0 && <PublishTaskList tasks={allTasks} />}
    </div>
  )
}
