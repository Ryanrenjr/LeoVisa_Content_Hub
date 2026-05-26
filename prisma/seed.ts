import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ──────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('123456789aB', 12)

  const ryan = await prisma.user.upsert({
    where: { email: 'rjxxx@leovisas.com' },
    update: {},
    create: {
      id: 'seed-user-ryan',
      email: 'rjxxx@leovisas.com',
      password: hashedPassword,
      name: 'Ryan',
      role: 'ADMIN',
    },
  })

  const winnie = await prisma.user.upsert({
    where: { email: 'User@leovisas.com' },
    update: {},
    create: {
      id: 'seed-user-publisher',
      email: 'User@leovisas.com',
      password: hashedPassword,
      name: 'User',
      role: 'PUBLISHER',
    },
  })

  await prisma.user.upsert({
    where: { email: 'Admin@leovisas.com' },
    update: {},
    create: {
      id: 'seed-user-admin',
      email: 'Admin@leovisas.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log(`✅ Users: Ryan (${ryan.id}), Winnie (${winnie.id}), Boss`)

  // ── Accounts ───────────────────────────────────────────────────────────────
  const accounts = [
    {
      id: 'seed-account-1',
      name: '李尔王移民说',
      platform: 'VIDEO_CHANNEL' as const,
      positioning: '主号·规则解读·深度专业',
      coreQuestion: '这件事背后的规则是什么',
      contentType: '新闻+案例+规则解读',
      duration: '3-5分钟',
      frequency: '3-4条/周',
      style: '沉稳、有判断',
      punchlineIndex: '高',
      conversionFunnel: '信任建立',
      displayOrder: 1,
    },
    {
      id: 'seed-account-2',
      name: '李尔王说移民',
      platform: 'VIDEO_CHANNEL' as const,
      positioning: '政策解读·工具型·转化主力',
      coreQuestion: '这个规则具体怎么用',
      contentType: '政策+实操+工具',
      duration: '2-3分钟',
      frequency: '2-3条/周',
      style: '清晰、像老师',
      punchlineIndex: '中',
      conversionFunnel: '直接转化',
      displayOrder: 2,
    },
    {
      id: 'seed-account-3',
      name: '李尔王谈移民',
      platform: 'VIDEO_CHANNEL' as const,
      positioning: '人物故事·情感共鸣·涨粉破圈',
      coreQuestion: '这件事发生在谁身上',
      contentType: '人物故事+群像',
      duration: '1.5-3分钟',
      frequency: '2条/周',
      style: '温度、有画面',
      punchlineIndex: '高',
      conversionFunnel: '拉新破圈',
      displayOrder: 3,
    },
    {
      id: 'seed-account-4',
      name: '李尔王聊移民',
      platform: 'VIDEO_CHANNEL' as const,
      positioning: '短平快·答疑互动·日常养粉',
      coreQuestion: '这个问题简单说一下',
      contentType: '答疑+热点点评',
      duration: '60-90秒',
      frequency: '4-5条/周',
      style: '轻松、像朋友',
      punchlineIndex: '高（更口语）',
      conversionFunnel: '日常养粉',
      displayOrder: 4,
    },
    {
      id: 'seed-account-5',
      name: '李尔王英欧移民中介服务',
      platform: 'XIAOHONGSHU' as const,
      positioning: '专业号',
      coreQuestion: '',
      contentType: '',
      duration: '',
      frequency: '',
      style: '',
      punchlineIndex: '',
      conversionFunnel: '',
      displayOrder: 5,
    },
    {
      id: 'seed-account-6',
      name: '李尔王英国移民留学观察',
      platform: 'WECHAT_OFFICIAL' as const,
      positioning: '英国主题',
      coreQuestion: '',
      contentType: '',
      duration: '',
      frequency: '',
      style: '',
      punchlineIndex: '',
      conversionFunnel: '',
      displayOrder: 6,
    },
    {
      id: 'seed-account-7',
      name: '李尔王欧洲移民家园',
      platform: 'WECHAT_OFFICIAL' as const,
      positioning: '欧洲主题',
      coreQuestion: '',
      contentType: '',
      duration: '',
      frequency: '',
      style: '',
      punchlineIndex: '',
      conversionFunnel: '',
      displayOrder: 7,
    },
  ]

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { id: account.id },
      update: account,
      create: account,
    })
  }

  console.log(`✅ Accounts: ${accounts.length} accounts seeded`)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
