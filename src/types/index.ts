// ─── Prisma model types ───────────────────────────────────────────────────────
export type {
  User,
  Account,
  Topic,
  Tag,
  Asset,
  PublishTask,
} from '@prisma/client'

// ─── Enum constants (SQLite stores as String) ─────────────────────────────────

export const UserRole = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  PUBLISHER: 'PUBLISHER',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const Platform = {
  VIDEO_CHANNEL: 'VIDEO_CHANNEL',
  XIAOHONGSHU: 'XIAOHONGSHU',
  WECHAT_OFFICIAL: 'WECHAT_OFFICIAL',
} as const
export type Platform = (typeof Platform)[keyof typeof Platform]

export const TopicStatus = {
  DRAFT: 'DRAFT',
  IN_PRODUCTION: 'IN_PRODUCTION',
  READY_TO_PUBLISH: 'READY_TO_PUBLISH',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const
export type TopicStatus = (typeof TopicStatus)[keyof typeof TopicStatus]

export const AssetType = {
  WECHAT_ARTICLE: 'WECHAT_ARTICLE',
  XHS_POST: 'XHS_POST',
  VIDEO: 'VIDEO',
} as const
export type AssetType = (typeof AssetType)[keyof typeof AssetType]

export const AssetStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus]

export const AssetSource = {
  MANUAL_UPLOAD: 'MANUAL_UPLOAD',
  AI_GENERATED: 'AI_GENERATED',
} as const
export type AssetSource = (typeof AssetSource)[keyof typeof AssetSource]

export const TaskUrgency = {
  URGENT: 'URGENT',
  NORMAL: 'NORMAL',
} as const
export type TaskUrgency = (typeof TaskUrgency)[keyof typeof TaskUrgency]

export const TaskStatus = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

// ─── Composed / helper types ──────────────────────────────────────────────────

import type { Topic, Asset, Account, User, PublishTask } from '@prisma/client'

export type TopicWithAssets = Topic & {
  assets: Asset[]
  owner: Pick<User, 'id' | 'name'>
  tags: { id: string; name: string }[]
}

export type AssetWithTasks = Asset & {
  publishTasks: (PublishTask & {
    account: Account
    assignedTo: Pick<User, 'id' | 'name'>
  })[]
}

export type PublishTaskWithRelations = PublishTask & {
  asset: Asset & { topic: Pick<Topic, 'id' | 'code' | 'title'> }
  account: Account
  assignedTo: Pick<User, 'id' | 'name'>
}
