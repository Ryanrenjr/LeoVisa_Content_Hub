// Global type definitions for LeoVisa Content Hub

export type Platform =
  | 'wechat_video_main'      // 李尔王移民说
  | 'wechat_video_policy'    // 李尔王说移民
  | 'wechat_video_story'     // 李尔王谈移民
  | 'wechat_video_qa'        // 李尔王聊移民
  | 'xiaohongshu'            // 李尔王英欧移民中介服务
  | 'mp_uk'                  // 李尔王英国移民留学观察
  | 'mp_europe'              // 李尔王欧洲移民家园

export type ContentFormat =
  | 'mp_article'             // 公众号图文
  | 'xiaohongshu_post'       // 小红书图文
  | 'digital_human_video'    // 数字人视频

export type ContentStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'

export interface Account {
  id: string
  name: string
  platform: Platform
  description: string
  tone: string
  targetAudience: string
  createdAt: Date
  updatedAt: Date
}

export interface Topic {
  id: string
  title: string
  description?: string
  createdBy: string
  status: ContentStatus
  createdAt: Date
  updatedAt: Date
}

export interface ContentPiece {
  id: string
  topicId: string
  format: ContentFormat
  title: string
  body?: string
  attachments?: string[]
  status: ContentStatus
  createdAt: Date
  updatedAt: Date
}

export interface DistributionRecord {
  id: string
  contentId: string
  accountId: string
  publishedAt?: Date
  publishedBy: string
  note?: string
  createdAt: Date
}
