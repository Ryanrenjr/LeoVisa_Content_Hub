# LeoVisa Content Hub — 项目记忆文档

## 项目背景

LeoVisa 移民咨询公司的内容分发管理系统（v1.0）。
目标：把"选题制作-内容分发-账号管理"流程数字化，让账号调性可见、分发有据可循。

### 角色分工
- **Ryan**：选题、制作内容（公众号图文、小红书图文、数字人视频）
- **Winnie**：内容分发到对应账号

### IP 矩阵账号

| 平台 | 账号名 | 定位 |
|------|--------|------|
| 视频号 | 李尔王移民说 | 主号·规则解读·深度专业 |
| 视频号 | 李尔王说移民 | 政策实操·转化主力 |
| 视频号 | 李尔王谈移民 | 人物故事·涨粉破圈 |
| 视频号 | 李尔王聊移民 | 答疑互动·日常养粉 |
| 小红书 | 李尔王英欧移民中介服务 | 图文种草·私域引流 |
| 微信公众号 | 李尔王英国移民留学观察 | 深度长文·英国方向 |
| 微信公众号 | 李尔王欧洲移民家园 | 深度长文·欧洲方向 |

### 内容形态
1. **公众号图文**：长文深度内容
2. **小红书图文**：种草式图文
3. **数字人视频**：AI 数字人讲解视频

---

## 技术栈

- **框架**：Next.js 14 (App Router) + TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **数据库**：Prisma + SQLite（本地存储）
- **鉴权**：NextAuth.js (beta)
- **动画**：Framer Motion
- **状态管理**：Zustand
- **工具库**：lucide-react, clsx, tailwind-merge
- **文件存储**：本地文件系统（`./storage` 目录）

---

## 设计系统 — Apple 风格

严格模仿 Apple 官网（apple.com）设计语言。

### 字体规范
```
字体栈：-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif
标题：font-weight: 600 (semibold)，letter-spacing: -0.022em
正文：font-weight: 400 (regular)，letter-spacing: -0.01em
```

### 色彩规范
```
背景主色：#FFFFFF
背景次色：#F5F5F7
背景三色：#FBFBFD
主文字：  #1D1D1F（Apple 黑，非纯黑）
次文字：  #6E6E73
三级文字：#86868B
系统蓝：  #0071E3（Apple 蓝）
分隔线：  rgba(0, 0, 0, 0.08)
```

### 圆角规范
```
小圆角：  8px
卡片：    12px
大卡片：  18px
容器级：  24px
按钮：    980px（胶囊形，用大值即可）
```

### 阴影规范（极克制）
```
sm: 0 1px 2px rgba(0, 0, 0, 0.04)
md: 0 4px 16px rgba(0, 0, 0, 0.06)
lg: 0 12px 32px rgba(0, 0, 0, 0.08)
```

### 交互规范
```
过渡曲线：cubic-bezier(0.4, 0, 0.2, 1)
微交互：  0.2s
过渡：    0.4s
hover：   上移 2px + 阴影加深
顶部导航：backdrop-filter: saturate(180%) blur(20px)（毛玻璃）
```

---

## 目录结构

```
src/
  app/              # Next.js App Router 页面
  components/
    apple/          # 自定义 Apple 风格组件
    ui/             # shadcn/ui 组件（自动生成）
  lib/
    utils.ts        # cn() 等工具函数
  types/
    index.ts        # 全局类型定义
prisma/             # Prisma schema & migrations
storage/            # 本地文件存储根目录
```

---

## 开发规范

- 所有新组件放 `src/components/apple/`，保持 Apple 设计语言一致性
- 颜色、圆角、阴影只使用设计系统中定义的变量，不硬编码
- 动画统一用 Framer Motion，过渡曲线用 `cubic-bezier(0.4, 0, 0.2, 1)`
- 中文内容优先，PingFang SC 作为中文字体兜底
