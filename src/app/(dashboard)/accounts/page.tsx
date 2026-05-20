import { db } from '@/lib/db'
import { AccountsView } from '@/components/accounts-view'

export const metadata = {
  title: '账号矩阵 — LeoVisa Content Hub',
}

export default async function AccountsPage() {
  const accounts = await db.account.findMany({
    select: {
      id: true,
      name: true,
      platform: true,
      positioning: true,
      coreQuestion: true,
      contentType: true,
      duration: true,
      frequency: true,
      style: true,
      punchlineIndex: true,
      conversionFunnel: true,
      displayOrder: true,
    },
    orderBy: { displayOrder: 'asc' },
  })

  const videoAccounts = accounts.filter((a) => a.platform === 'VIDEO_CHANNEL')
  const xhsAccounts   = accounts.filter((a) => a.platform === 'XIAOHONGSHU')
  const mpAccounts    = accounts.filter((a) => a.platform === 'WECHAT_OFFICIAL')

  return (
    <AccountsView
      videoAccounts={videoAccounts}
      xhsAccounts={xhsAccounts}
      mpAccounts={mpAccounts}
    />
  )
}
