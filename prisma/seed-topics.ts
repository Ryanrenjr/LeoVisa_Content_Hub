import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding topics...')

  const ryan = await prisma.user.findUniqueOrThrow({
    where: { email: 'ryan@leovisa.com' },
  })

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = ['英国政治', '英国经济', '英国王室', '人物故事', '政策解读', '热点点评']
  const tagMap: Record<string, string> = {}
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tagMap[name] = tag.id
  }
  console.log(`✅ Tags: ${tagNames.join(' · ')}`)

  // ── Topics ────────────────────────────────────────────────────────────────
  const topicsData = [
    {
      code: 'T001',
      title: '李尔王看英国_5.16游行',
      description: '2024年5月16日英国大规模示威游行深度解读，背后的政治逻辑与社会裂痕',
      status: 'IN_PRODUCTION',
      tags: ['英国政治', '热点点评'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'IN_PROGRESS' },
        { type: 'XHS_POST',       status: 'IN_PROGRESS' },
        { type: 'VIDEO',          status: 'NOT_STARTED' },
      ],
    },
    {
      code: 'T002',
      title: '李尔王看英国_斯塔默还能撑多久',
      description: '工党执政百日，斯塔默支持率持续下滑，下一个丢掉唐宁街的首相？',
      status: 'READY_TO_PUBLISH',
      tags: ['英国政治', '热点点评'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'COMPLETED' },
        { type: 'XHS_POST',       status: 'COMPLETED' },
        { type: 'VIDEO',          status: 'COMPLETED' },
      ],
    },
    {
      code: 'T003',
      title: '李尔王讲政策_国王演说',
      description: '2024年国王演说全解读，工党首份施政纲领40项立法计划意味着什么',
      status: 'PUBLISHED',
      tags: ['英国政治', '政策解读'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'COMPLETED' },
        { type: 'XHS_POST',       status: 'COMPLETED' },
        { type: 'VIDEO',          status: 'COMPLETED' },
      ],
    },
    {
      code: 'T004',
      title: '李尔王看英国_Reform议会',
      description: 'Reform党首次进入下议院，法拉奇效应与英国右翼民粹主义的崛起',
      status: 'DRAFT',
      tags: ['英国政治'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'NOT_STARTED' },
        { type: 'XHS_POST',       status: 'NOT_STARTED' },
        { type: 'VIDEO',          status: 'NOT_STARTED' },
      ],
    },
    {
      code: 'T005',
      title: '李尔王讲故事_威廉王子纳税',
      description: '威廉王子成为英国首位主动公开纳税记录的王储，王室现代化转型信号',
      status: 'PUBLISHED',
      tags: ['英国王室', '人物故事'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'COMPLETED' },
        { type: 'XHS_POST',       status: 'COMPLETED' },
        { type: 'VIDEO',          status: 'COMPLETED' },
      ],
    },
    {
      code: 'T006',
      title: '李尔王看英国_英镑',
      description: '英镑汇率跌破关键点位，英国经济结构性困境与移民资产配置建议',
      status: 'IN_PRODUCTION',
      tags: ['英国经济', '热点点评'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'IN_PROGRESS' },
        { type: 'XHS_POST',       status: 'NOT_STARTED' },
        { type: 'VIDEO',          status: 'NOT_STARTED' },
      ],
    },
    {
      code: 'T007',
      title: '李尔王讲故事_别学乔布斯',
      description: '乔布斯为何放弃美国国籍？真实的税务逻辑与硅谷富豪的护照策略',
      status: 'READY_TO_PUBLISH',
      tags: ['人物故事'],
      assets: [
        { type: 'WECHAT_ARTICLE', status: 'COMPLETED' },
        { type: 'XHS_POST',       status: 'COMPLETED' },
        { type: 'VIDEO',          status: 'IN_PROGRESS' },
      ],
    },
  ]

  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { code: t.code },
      update: { title: t.title, description: t.description, status: t.status },
      create: {
        code: t.code,
        title: t.title,
        description: t.description,
        status: t.status,
        ownerId: ryan.id,
      },
    })

    // Sync tags
    await prisma.topic.update({
      where: { id: topic.id },
      data: { tags: { set: t.tags.map((name) => ({ id: tagMap[name] })) } },
    })

    // Recreate assets for clean state
    await prisma.asset.deleteMany({ where: { topicId: topic.id } })
    await prisma.asset.createMany({
      data: t.assets.map((a) => ({
        topicId: topic.id,
        type: a.type,
        status: a.status,
        source: 'MANUAL_UPLOAD',
      })),
    })

    console.log(`  ${t.code} ${t.title} [${t.status}]`)
  }

  console.log(`\n✅ ${topicsData.length} topics + ${tagNames.length} tags seeded`)
  console.log('🎉 Done!')
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
