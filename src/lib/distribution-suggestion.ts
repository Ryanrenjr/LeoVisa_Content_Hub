export type AccountForSuggestion = {
  id: string
  name: string
  platform: string
  positioning: string
}

export type SuggestionResult = {
  accountId: string
  accountName: string
  reason: string
} | null

const TAG_TO_VIDEO_ACCOUNT: Record<string, string> = {
  '人物故事': '李尔王谈移民',
  '政策解读': '李尔王说移民',
  '热点点评': '李尔王聊移民',
  '英国政治': '李尔王移民说',
  '英国经济': '李尔王移民说',
  '英国王室': '李尔王谈移民',
}

const TAG_TO_WECHAT_ACCOUNT: Record<string, string> = {
  '英国政治': '李尔王英国移民留学观察',
  '英国经济': '李尔王英国移民留学观察',
  '英国王室': '李尔王英国移民留学观察',
  '英国移民': '李尔王英国移民留学观察',
}

export function suggestAccount(
  assetType: string,
  tagNames: string[],
  accounts: AccountForSuggestion[],
): SuggestionResult {
  if (assetType === 'XHS_POST') {
    const account = accounts.find((a) => a.platform === 'XIAOHONGSHU')
    if (!account) return null
    return {
      accountId: account.id,
      accountName: account.name,
      reason: '小红书图文自动锁定到「李尔王英欧移民中介服务」',
    }
  }

  if (assetType === 'VIDEO') {
    for (const tag of tagNames) {
      const targetName = TAG_TO_VIDEO_ACCOUNT[tag]
      if (targetName) {
        const account = accounts.find((a) => a.name === targetName)
        if (account) {
          return {
            accountId: account.id,
            accountName: account.name,
            reason: `因为标签「${tag}」匹配「${account.name}」的「${account.positioning}」定位`,
          }
        }
      }
    }
  }

  if (assetType === 'WECHAT_ARTICLE') {
    for (const tag of tagNames) {
      const targetName = TAG_TO_WECHAT_ACCOUNT[tag]
      if (targetName) {
        const account = accounts.find((a) => a.name === targetName)
        if (account) {
          return {
            accountId: account.id,
            accountName: account.name,
            reason: `因为标签「${tag}」匹配「${account.name}」的英国主题方向`,
          }
        }
      }
    }
  }

  return null
}
