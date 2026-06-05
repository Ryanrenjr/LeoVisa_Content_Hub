// ─── Base types (display data) ────────────────────────────────────────────────

export type FlowStep = {
  id: string
  number: number
  name: string
  description: string
  tool: string
  color: string
}

export type WeeklyStep = {
  number: number
  title: string
  description: string
}

export type BreakingCriterion = {
  id: string
  label: string
  title: string
  description: string
  color: string
}

export type PlatformRule = {
  id: string
  name: string
  form: string
  color: string
  emoji: string
  purposes: string[]
  detailLabel: string
  details: string[]
}

export type AISide = {
  name: string
  emoji: string
  accentColor: string
  bgColor: string
  borderColor: string
  items: string[]
}

// ─── Detail types (operational data) ─────────────────────────────────────────

export type StepDetail = {
  timing?: string
  purpose: string
  project?: string[]
  skill?: string[]
  output: string[]
  nextStep?: string
  riskNotes?: string[]
  promptIds?: string[]
}

export type CriterionDetail = {
  passExamples: string[]
  failExamples: string[]
  note: string
}

export type CopyPromptData = {
  id: string
  label: string
  project: string
  skill: string
  content: string
}

// ─── Display data ─────────────────────────────────────────────────────────────

export const FLOW_STEPS: FlowStep[] = [
  {
    id: 'planning',
    number: 1,
    name: '周一选题规划',
    description: '每周一上午生成本周选题池，先发到群里讨论，确认后进入生产。',
    tool: 'Claude · leovisa-weekly-topic-planning',
    color: '#0071E3',
  },
  {
    id: 'confirm',
    number: 2,
    name: '群内讨论确认',
    description: '老板和团队确认本周重点选题，未确认选题进入备用池。',
    tool: '团队群',
    color: '#6E3FFB',
  },
  {
    id: 'production',
    number: 3,
    name: '内容生产',
    description: '根据确认选题生成视频号脚本、小红书正文、公众号长文。',
    tool: 'Claude Skills',
    color: '#34C759',
  },
  {
    id: 'distribution',
    number: 4,
    name: '平台分发',
    description: '视频号发数字人口播，小红书发数字人视频和图文，公众号发长文。',
    tool: '视频号 / 小红书 / 公众号',
    color: '#FF9500',
  },
  {
    id: 'breaking',
    number: 5,
    name: '每日突发加发',
    description: '每天上午检查英国突发新闻，符合标准的经群确认后加发。',
    tool: 'Claude · 每日突发新闻 Prompt',
    color: '#FF3B30',
  },
  {
    id: 'review',
    number: 6,
    name: '发布复盘',
    description: '每周复盘播放量、评论、咨询和账号增长，反哺下周选题。',
    tool: '数据记录 · 团队复盘',
    color: '#32ADE6',
  },
  {
    id: 'feedback',
    number: 7,
    name: '反哺下周选题',
    description: '复盘数据和用户反馈直接影响下周选题优先级和内容方向。',
    tool: '↩ 回到步骤 1',
    color: '#0071E3',
  },
]

export const WEEKLY_STEPS: WeeklyStep[] = [
  {
    number: 1,
    title: '生成本周选题池',
    description: '使用 Claude 和 weekly topic planning Skill 生成 8–12 个选题。',
  },
  {
    number: 2,
    title: '按账号矩阵分配',
    description: '判断每个选题适合哪个视频号、小红书或公众号。',
  },
  {
    number: 3,
    title: '标注推荐理由',
    description: '给出选题理由、内容角度、优先级和风险点。',
  },
  {
    number: 4,
    title: '发群讨论',
    description: '先把选题和理由发到团队群里讨论，等待老板确认。',
  },
  {
    number: 5,
    title: '确认后生产',
    description: '定稿选题进入脚本、正文和长文生产流程。',
  },
]

export const BREAKING_CRITERIA: BreakingCriterion[] = [
  {
    id: 'readability',
    label: '可读性',
    title: '可读性',
    description: '普通华人是否看得懂，是否容易讲清楚。',
    color: '#0071E3',
  },
  {
    id: 'relevance',
    label: '关联性',
    title: '关联性',
    description: '是否和英国、移民、留学、华人生活、法律服务相关。',
    color: '#6E3FFB',
  },
  {
    id: 'topicality',
    label: '话题性',
    title: '话题性',
    description: '是否正在被讨论，是否容易引发评论和转发。',
    color: '#34C759',
  },
  {
    id: 'conversion',
    label: '转化性',
    title: '转化性',
    description: '是否能自然连接到签证、身份规划、法律咨询或服务需求。',
    color: '#FF9500',
  },
  {
    id: 'risk',
    label: '风险性',
    title: '风险性',
    description: '是否涉及政治、种族、宗教、死亡、犯罪、未审结案件等敏感内容。',
    color: '#FF3B30',
  },
]

export const BREAKING_MINI_FLOW = [
  '发现突发',
  '五项标准筛选',
  '单独发群确认',
  '确认后加发',
  '高风险先查证',
]

export const PLATFORM_RULES: PlatformRule[] = [
  {
    id: 'video',
    name: '视频号',
    form: '数字人口播视频',
    color: '#6E3FFB',
    emoji: '🎬',
    purposes: ['建立 IP 人设', '输出专业判断', '解释英国规则', '承接热点和政策内容'],
    detailLabel: '账号分工',
    details: [
      '李尔王移民说：讲深，建立信任',
      '李尔王说移民：讲清，政策实操',
      '李尔王谈移民：讲暖，生活故事',
      '李尔王聊移民：讲快，短评答疑',
    ],
  },
  {
    id: 'rednote',
    name: '小红书',
    form: '数字人视频 + 图文分页',
    color: '#FF2442',
    emoji: '📱',
    purposes: ['搜索获客', '案例种草', '承接咨询', '二次分发视频号内容'],
    detailLabel: '关键词方向',
    details: [
      '英国工签 / 英国永居',
      '配偶签 / 留学移民',
      'Sponsor Licence / eVisa / BRP',
      '欧洲移民',
    ],
  },
  {
    id: 'wechat',
    name: '公众号',
    form: '深度长文',
    color: '#07C160',
    emoji: '📝',
    purposes: ['深度沉淀', '专业背书', '私域转化', '系统解释复杂政策'],
    detailLabel: '内容要求',
    details: [
      '事实背景 + 故事推进',
      '规则解释 + 华人视角',
      '李尔王想说',
      '三句金句 + 朋友圈文案',
    ],
  },
]

export const AI_DIVISION: AISide[] = [
  {
    name: 'Claude',
    emoji: '🧠',
    accentColor: '#0071E3',
    bgColor: 'rgba(0,113,227,0.04)',
    borderColor: 'rgba(0,113,227,0.15)',
    items: [
      '每周选题规划',
      '每日突发新闻筛选',
      '账号分发建议',
      '视频号口播脚本',
      '小红书正文和图文分页文字',
      '公众号长文',
      '标题、金句、字幕切分',
      '封面文字建议',
      '发布文案',
    ],
  },
  {
    name: 'GPT',
    emoji: '🎨',
    accentColor: '#FF9500',
    bgColor: 'rgba(255,149,0,0.04)',
    borderColor: 'rgba(255,149,0,0.15)',
    items: [
      '视频号封面图',
      '小红书图集设计',
      '小红书封面图',
      '公众号首图',
      '图片生成提示词',
      '视觉构图',
      '实际出图',
    ],
  },
]

export const CONFIRM_ITEMS = [
  '计划内选题：先群内确认，再进入生产。',
  '突发选题：单独发群确认后再加发。',
  '高风险选题：先查证，再决定是否发布。',
  '未确认选题：进入备用选题池。',
]

export const RISK_ITEMS = [
  '当前移民政策',
  '法律条款与签证规则',
  '数据、金额、日期',
  '死亡、犯罪、警务事件',
  '种族、宗教、政治冲突',
  '未审结案件',
  '个案法律判断',
]

// ─── Operational detail data ──────────────────────────────────────────────────

export const FLOW_STEP_DETAILS: Record<string, StepDetail> = {
  planning: {
    timing: '每周一上午',
    purpose: '生成本周选题池，覆盖视频号、小红书、公众号三个平台的内容需求。',
    project: ['李尔王每周选题规划'],
    skill: ['leovisa-weekly-topic-planning'],
    output: [
      '本周内容总判断',
      '8–12 个推荐选题',
      '适合账号和平台',
      '推荐理由和内容角度',
      '优先级标注',
      '风险提示',
      '适合发群讨论的简短版',
    ],
    nextStep: '把选题发到团队群，等老板和团队确认。',
    riskNotes: [
      '涉及当前政策、法律、数据时必须查证',
      '高风险议题先进入备用池',
      '不确定的信息不写',
    ],
    promptIds: ['weekly-planning'],
  },
  confirm: {
    timing: '周一选题发出后',
    purpose: '老板和团队确认本周重点选题，明确哪些进入生产、哪些备用、哪些暂缓。',
    project: ['团队群'],
    output: [
      '确认进入生产的选题',
      '进入备用池的选题',
      '暂缓或放弃的选题',
    ],
    nextStep: '确认选题进入对应平台的内容生产流程。',
    riskNotes: [
      '未确认选题不要直接开始生产',
      '对有争议的选题，等老板最终确认',
    ],
    promptIds: ['group-confirm'],
  },
  production: {
    timing: '选题确认后',
    purpose: '根据确认选题，分平台生成完整内容文字稿。',
    project: ['李尔王视频号矩阵', '李尔王小红书', '李尔王公众号'],
    skill: ['leovisa-video-script', 'leovisa-rednote-post', 'leovisa-wechat-article'],
    output: [
      '视频号口播脚本 + 字幕切分 + 封面文字',
      '小红书正文 + 图文分页文案 + 标题和标签',
      '公众号长文 + 摘要 + 李尔王想说 + 金句',
    ],
    nextStep: '文字稿交给团队，图片和封面设计交给 GPT。',
    riskNotes: [
      '涉及当前新闻、政策时必须基于真实信息',
      'Claude 只负责文字，不负责图片',
      '同一选题不同平台需按平台风格重新拆解',
    ],
    promptIds: ['video-script', 'rednote-post', 'wechat-article'],
  },
  distribution: {
    timing: '内容文字和视觉均就绪后',
    purpose: '把制作好的内容发布到对应平台账号。',
    output: [
      '视频号：数字人口播视频上传发布',
      '小红书：图文或视频上传发布',
      '公众号：长文发布',
    ],
    nextStep: '发布后记录数据，用于每周复盘。',
    riskNotes: [
      '同一选题不同平台内容不能直接复制，需按平台拆解',
      '封面和图集由 GPT 制作后才能发布',
      '发布前确认账号分配正确',
    ],
  },
  breaking: {
    timing: '每天上午',
    purpose: '扫描英国突发新闻和政策变化，判断是否有值得在当天加发的内容。',
    project: ['李尔王每周选题规划'],
    skill: ['leovisa-weekly-topic-planning'],
    output: [
      '今日是否有值得加发的突发',
      '突发选题标题和一句话概括',
      '适合账号和平台',
      '推荐角度和内容形式',
      '风险点',
      '群内确认版短消息',
    ],
    nextStep: '把突发选题发群确认，老板批准后加发。',
    riskNotes: [
      '高风险选题先查证，不直接发布',
      '单独发群确认，不等到周一',
      '没有值得加发的突发时，直接跳过，不要凑内容',
    ],
    promptIds: ['breaking-news'],
  },
  review: {
    timing: '每周结束后',
    purpose: '复盘本周内容表现，找到高表现和低表现内容，指导下周选题。',
    output: [
      '各平台播放量、点赞、评论汇总',
      '高表现选题类型',
      '低表现或无效选题类型',
      '可二次开发的选题',
      '用户评论中的新选题线索',
    ],
    nextStep: '把复盘结论带入下周一选题规划。',
    riskNotes: [
      '复盘不要只看数字，要找出背后的原因',
      '记录结论，不要只看一次就忘',
    ],
  },
  feedback: {
    purpose: '把表现好的选题类型和方向继续做，把无效的减少，形成闭环迭代。',
    output: [
      '下周选题方向倾向',
      '需要深挖的主题',
      '需要减少的类型',
    ],
    nextStep: '进入下周一选题规划（回到步骤 1）。',
    riskNotes: [
      '不要因为某个选题没表现就完全放弃，要分析原因',
    ],
  },
}

export const WEEKLY_STEP_DETAILS: Record<number, StepDetail> = {
  1: {
    timing: '每周一上午',
    purpose: '通过 Claude 生成本周适合李尔王内容矩阵的选题，覆盖不同账号和平台。',
    project: ['李尔王每周选题规划'],
    skill: ['leovisa-weekly-topic-planning'],
    output: ['8–12 个推荐选题', '每个选题适合的账号和平台', '推荐理由', '风险提示'],
    promptIds: ['weekly-planning'],
  },
  2: {
    purpose: '根据四个视频号的不同定位，把每个选题分配到最适合的账号和平台。',
    output: [
      '李尔王移民说：深度规则类选题',
      '李尔王说移民：政策实操类选题',
      '李尔王谈移民：生活故事类选题',
      '李尔王聊移民：短评答疑类选题',
      '小红书：搜索获客、案例种草类',
      '公众号：深度长文、专业沉淀类',
    ],
    riskNotes: ['同一选题可以多平台分发，但内容需按平台风格重新拆解'],
  },
  3: {
    purpose: '给每个选题标注推荐理由、内容角度、优先级和风险点，方便群内讨论时快速判断。',
    output: [
      '推荐理由',
      '内容角度建议',
      '优先级（高/中/低）',
      '风险点提示',
      '是否需要查资料',
      '是否适合当天做',
    ],
    riskNotes: ['风险高的选题要明确标注，不要让它进入默认确认状态'],
  },
  4: {
    timing: '周一上午选题生成后',
    purpose: '把整理好的选题列表发到团队群，供老板和团队确认。',
    project: ['团队群'],
    output: ['适合群发的简短版选题列表', '每条选题一句话概括', '推荐理由和账号'],
    nextStep: '等老板和团队反馈，确认哪些进入生产。',
    riskNotes: ['发群消息要简洁，不要发长报告'],
    promptIds: ['group-confirm'],
  },
  5: {
    timing: '确认名单收到后',
    purpose: '针对每个确认选题，分别生成视频号脚本、小红书内容或公众号长文。',
    project: ['李尔王视频号矩阵', '李尔王小红书', '李尔王公众号'],
    skill: ['leovisa-video-script', 'leovisa-rednote-post', 'leovisa-wechat-article'],
    output: ['完整视频口播稿', '小红书正文和图文分页', '公众号长文和金句'],
    riskNotes: ['未确认的选题不要提前开始生产', 'Claude 只负责文字，图片交给 GPT'],
    promptIds: ['video-script', 'rednote-post', 'wechat-article'],
  },
}

export const BREAKING_CRITERION_DETAILS: Record<string, CriterionDetail> = {
  readability: {
    passExamples: [
      '新闻内容简单，可以用一句话讲清楚',
      '不需要大量背景知识',
      '普通华人能直接理解影响',
    ],
    failExamples: [
      '内容过于复杂，需要大量法律背景',
      '只有专业人士才能看懂',
      '解释起来需要超过五分钟',
    ],
    note: '如果需要大量铺垫才能讲清楚，这个选题可能更适合做公众号长文，而不是视频号快评。',
  },
  relevance: {
    passExamples: [
      '英国内政部或政府发布移民相关公告',
      '工签、永居、配偶签等签证规则变化',
      '影响在英华人日常生活的政策',
      '留学生、NHS、住房相关新闻',
    ],
    failExamples: [
      '纯粹的英国娱乐八卦，和移民无关',
      '其他国家的移民政策（除非有对比价值）',
      '与华人群体完全无关的事件',
    ],
    note: '关联性是筛选的第一道关，没有关联性的内容直接排除，不管话题多热。',
  },
  topicality: {
    passExamples: [
      '正在微博、微信、小红书上热议',
      '华人群里已经有人在讨论',
      '评论区容易引发"我也有这个问题"的共鸣',
    ],
    failExamples: [
      '三个月前的旧新闻',
      '已经被做烂的话题，没有新角度',
      '只有小圈子关注，普通华人不感兴趣',
    ],
    note: '话题性高的内容发布时效性强，适合当天或第二天加发，不要拖太久。',
  },
  conversion: {
    passExamples: [
      '政策变化可以自然引导到"你的签证是否受影响"',
      '内容可以自然引出"如果需要法律意见可以联系我们"',
      '案例内容引发用户"我是否也有这个风险"的思考',
    ],
    failExamples: [
      '纯粹的政治分析，和签证、法律服务完全无关',
      '内容引发恐慌但没有解决方案',
      '让用户觉得"好有趣"但不会想联系李尔王',
    ],
    note: '转化性不要强行，自然连接即可。不要每条视频都硬广，但要确保内容对目标用户有价值。',
  },
  risk: {
    passExamples: [
      '涉及已生效的签证政策，有官方来源',
      '内容可以查证，立场中性',
      '不涉及具体个人或未结案件',
    ],
    failExamples: [
      '政治冲突、党派对立内容',
      '种族、宗教相关敏感话题',
      '未审结的犯罪或警务案件',
      '未经证实的传言',
      '对具体个人的评判',
    ],
    note: '风险性高的内容不发，或先查证后再决定。高风险不等于一定不发，但必须有可靠来源和谨慎措辞。',
  },
}

// ─── Copy prompts ─────────────────────────────────────────────────────────────

export const COPY_PROMPTS: CopyPromptData[] = [
  {
    id: 'weekly-planning',
    label: '每周一选题规划',
    project: '李尔王每周选题规划',
    skill: 'leovisa-weekly-topic-planning',
    content: `使用 leovisa-weekly-topic-planning Skill。

请帮我生成本周"李尔王内容矩阵"的选题规划。

要求：
1. 输出本周内容总判断。
2. 推荐 8-12 个选题。
3. 标注每个选题适合哪个账号。
4. 标注适合视频号、小红书还是公众号。
5. 判断内容形式：数字人口播、小红书图文、公众号长文、短评答疑或备用选题。
6. 给出推荐理由、内容角度、优先级、风险点。
7. 标注是否需要查资料。
8. 标注是否适合当天做。
9. 标注是否适合沉淀为公众号。
10. 最后生成一版适合发到团队群里的简短版本。

选题判断标准：
- 可读性：普通华人是否看得懂。
- 关联性：是否和英国、移民、留学、华人生活、法律服务相关。
- 话题性：是否正在被讨论，是否容易引发评论和转发。
- 转化性：是否能自然连接到签证、身份规划、法律咨询或服务需求。
- 风险性：是否涉及政治、种族、宗教、死亡、犯罪、未审结案件等敏感内容。

请输出清楚、可执行，适合直接发到团队群讨论。`,
  },
  {
    id: 'breaking-news',
    label: '每日突发新闻筛选',
    project: '李尔王每周选题规划',
    skill: 'leovisa-weekly-topic-planning',
    content: `使用 leovisa-weekly-topic-planning Skill。

请帮我检查今天英国是否有适合"李尔王内容矩阵"加发的突发新闻或热点。

请重点关注：
1. 英国移民政策变化。
2. 英国内政部、签证、永居、工签、留学相关消息。
3. 英国政治与社会热点。
4. 华人社区相关事件。
5. 留学生、教育、NHS、住房、法律相关新闻。
6. 可能影响华人身份规划和英国生活的突发事件。

请按照五个标准判断：
1. 可读性：普通华人是否看得懂，是否容易讲清楚。
2. 关联性：是否和英国、移民、留学、华人生活、法律服务相关。
3. 话题性：是否正在被讨论，是否容易引发评论和转发。
4. 转化性：是否能自然连接到签证、身份规划、法律咨询或服务需求。
5. 风险性：是否涉及政治、种族、宗教、死亡、犯罪、未审结案件等敏感内容。

如果今天没有值得加发的突发选题，请直接说明：
"今天暂时没有必须加发的突发选题。"

如果有可发突发，请输出：
1. 突发事件标题。
2. 一句话概括。
3. 新闻或政策来源。
4. 为什么值得发。
5. 适合哪个账号。
6. 适合哪个平台。
7. 推荐内容形式。
8. 推荐角度。
9. 风险点。
10. 是否建议当天加发。
11. 群内确认建议。

最后请生成一段适合直接发到团队群里的简短版本。`,
  },
  {
    id: 'video-script',
    label: '视频号脚本生产',
    project: '李尔王视频号矩阵',
    skill: 'leovisa-video-script',
    content: `使用 leovisa-video-script Skill。

请根据下面这个已确认选题，生成适合李尔王视频号矩阵发布的数字人口播脚本。

选题：
【在这里粘贴选题】

素材：
【在这里粘贴资料或新闻来源】

要求：
1. 先判断最适合发布到哪个视频号：
   - 李尔王移民说：主号，讲深度规则和信任建立。
   - 李尔王说移民：政策号，讲签证、政策、路径和实操转化。
   - 李尔王谈移民：生活故事号，讲华人生活、家庭、人物和情绪共鸣。
   - 李尔王聊移民：短评答疑号，讲热点快评和高频问题。

2. 输出视频标题。
3. 输出前三秒钩子。
4. 输出完整口播稿。
5. 输出字幕切分版，每句控制在 10-15 个字左右。
6. 输出 B-roll 文字建议。
7. 输出封面标题文字和副标题文字。
8. 输出结尾金句。

注意：
Claude 只负责文字，不负责图片。
封面图、视觉构图和实际出图交给 GPT。
涉及当前新闻、政策、法律、数据时必须谨慎，不确定的信息要标注需要查证。`,
  },
  {
    id: 'rednote-post',
    label: '小红书内容生产',
    project: '李尔王小红书',
    skill: 'leovisa-rednote-post',
    content: `使用 leovisa-rednote-post Skill。

请根据下面这个已确认选题，生成适合"小红书：李尔王英欧移民中介服务"发布的内容。

选题：
【在这里粘贴选题】

素材：
【在这里粘贴资料或新闻来源】

要求：
1. 输出小红书主标题 1 个。
2. 输出备选标题 5 个。
3. 输出封面文字建议 3 组。
4. 输出正文，800-1200 字。
5. 输出图文分页文案，建议 6-8 页。
6. 输出评论区引导语 2-3 个。
7. 输出话题标签 8-12 个。
8. 内容要偏搜索获客、专业答疑、案例种草和咨询承接。
9. 标题和正文要包含相关关键词，例如英国工签、英国永居、配偶签、留学移民、Sponsor Licence、eVisa、BRP 等。

注意：
Claude 只负责文字和分页文案，不负责图集设计和出图。
小红书图集、封面图、视觉构图和实际出图交给 GPT。
涉及政策、签证、日期、金额、数据时必须准确，不能把提议说成已生效。`,
  },
  {
    id: 'wechat-article',
    label: '公众号长文生产',
    project: '李尔王公众号',
    skill: 'leovisa-wechat-article',
    content: `使用 leovisa-wechat-article Skill。

请根据下面这个已确认选题，生成适合"公众号：李尔王英国移民留学观察"发布的长文。

选题：
【在这里粘贴选题】

素材：
【在这里粘贴资料或新闻来源】

要求：
1. 输出主标题 1 个。
2. 输出备选标题 5 个。
3. 输出摘要导语，100-150 字。
4. 输出公众号正文。
5. 正文要有小标题。
6. 正文要包含事实背景、故事推进、规则解释、华人视角。
7. 文末加入"李尔王想说"。
8. 输出三句金句。
9. 输出公众号首图文字建议。
10. 输出朋友圈转发短文案。

注意：
公众号定位是深度沉淀、专业背书和私域转化。
文章要有报纸专栏感，不要写成 AI 报告或营销软文。
Claude 只负责文字，不负责首图设计和出图。
公众号首图、视觉构图和实际出图交给 GPT。
涉及当前新闻、政策、法律、数据时必须谨慎，不确定的信息要标注需要查证。`,
  },
  {
    id: 'group-confirm',
    label: '群内确认消息生成',
    project: '李尔王每周选题规划',
    skill: 'leovisa-weekly-topic-planning',
    content: `请把下面这些选题整理成适合发到团队群里的确认消息。

选题列表：
【粘贴选题列表】

要求：
1. 语气清楚、简洁，适合发给老板和团队看。
2. 每个选题包含：
   - 选题名称
   - 一句话概括
   - 推荐账号
   - 推荐平台
   - 推荐理由
   - 风险点
   - 是否建议本周做
3. 最后加一句：
"大家看一下这些选题方向是否合适，如果有需要调整的账号定位、内容角度或优先级，我这边再修改。"

不要写成长报告，要像团队协作消息。`,
  },
]
