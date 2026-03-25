# Image Background Remover — MVP 需求文档

**版本：** v0.1
**日期：** 2026-03-25
**状态：** 草稿

---

## 一、产品概述

### 1.1 产品定位

一款在线 AI 抠图工具，用户上传图片后一键去除背景，下载透明 PNG。目标用户为电商卖家、设计师、社交媒体运营者等有批量抠图需求的人群。

### 1.2 核心价值

无需安装软件，打开网页即用；AI 自动处理，秒级出图；免费额度吸引用户，付费订阅变现。

### 1.3 MVP 范围

MVP 只做一件事做到极致：上传图片 → 去除背景 → 下载结果。不做登录、不做存储、不做历史记录。

---

## 二、技术架构

### 2.1 技术选型

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 前端框架 | Next.js 14 (App Router) | SSR + API Routes 一体化 |
| UI 样式 | Tailwind CSS | 快速开发，响应式 |
| 语言 | TypeScript | 类型安全 |
| AI 能力 | Remove.bg API | 成熟稳定，按次计费 |
| 部署 | Cloudflare Pages | 全球 CDN，免费额度充足 |
| 图片处理 | 纯内存（Base64） | 不落盘，无存储成本 |

### 2.2 架构说明

```
用户浏览器上传图片（Base64）
    → Next.js 前端（Cloudflare Pages）
    → POST /api/remove-bg
    → Next.js API Route（服务端）
    → 调用 Remove.bg API（携带 API Key）
    → 返回去背景图（Base64）
    → 前端展示 + 提供下载
```

### 2.3 关键设计决策

- **API Key 不暴露给前端**：通过 Next.js API Route 做代理，Key 存在服务端环境变量。
- **无存储**：图片全程 Base64 在内存中流转，不写磁盘，不上云存储。
- **无登录**：MVP 阶段不做用户体系，降低开发复杂度。

---

## 三、功能需求

### 3.1 核心功能（必须做）

**F1 — 图片上传**
- 支持拖拽上传
- 支持点击选择文件
- 支持格式：JPG、PNG、WEBP
- 文件大小限制 ≤ 10MB
- 超出限制时展示错误提示

**F2 — 背景去除**
- 上传后自动触发处理，无需手动点击
- 展示 Loading 状态（进度动画）
- 调用 `/api/remove-bg` 接口，服务端转发至 Remove.bg
- 处理失败时展示错误信息（如 API 额度不足、网络超时）

**F3 — 结果预览**
- Before / After 对比滑块（拖动分割线对比原图与结果）
- 结果图背景用棋盘格纹理展示透明区域

**F4 — 下载**
- 下载按钮，点击下载透明 PNG
- 文件名格式：`removed-bg-{原文件名}.png`

### 3.2 非功能需求

| 指标 | 目标 |
| --- | --- |
| 首屏加载 | ≤ 2s（Cloudflare CDN 加速） |
| 处理响应时间 | ≤ 8s（受 Remove.bg API 限制） |
| 移动端适配 | 支持，响应式布局 |
| 浏览器兼容 | Chrome / Safari / Firefox 最新版 |

---

## 四、页面设计

### 4.1 主页面（唯一页面）

**状态一：初始上传区**
顶部展示网站 Logo 和标题 "Remove Image Background"，中间为拖拽上传区域，提示"拖拽图片到此处或点击选择文件，支持 JPG PNG WEBP"，底部说明"免费 · 无需注册 · 秒级处理"。

**状态二：处理中**
展示原图缩略图，下方显示"AI 正在处理中..."及进度动画。

**状态三：结果展示**
Before / After 对比滑块，左侧原图右侧去背景结果；下方提供"下载 PNG"和"重新上传"两个按钮。

### 4.2 UI 风格

- 整体风格：简洁现代，白底为主
- 主色调：蓝紫渐变
- 字体：系统默认无衬线字体

---

## 五、接口设计

### 5.1 POST /api/remove-bg

**请求体**
```json
{ "image_base64": "data:image/jpeg;base64,/9j/4AAQ..." }
```

**成功响应**
```json
{ "result_base64": "data:image/png;base64,iVBORw0KGgo..." }
```

**失败响应**
```json
{ "error": "API quota exceeded" }
```

**HTTP 状态码**

| 状态码 | 含义 |
| --- | --- |
| 200 | 处理成功 |
| 400 | 请求参数错误 |
| 429 | Remove.bg API 额度耗尽 |
| 500 | 服务端内部错误 |

---

## 六、环境变量

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| REMOVE_BG_API_KEY | Remove.bg API 密钥 | rmv_xxxxxxxxxxxx |

---

## 七、部署方案

### 7.1 Cloudflare Pages 部署步骤

1. 将代码推送至 GitHub 仓库
2. 在 Cloudflare Pages 中连接该仓库
3. 构建命令：`npm run build`
4. 输出目录：`.vercel/output/static`（使用 @cloudflare/next-on-pages 适配器）
5. 在 Pages 设置中添加环境变量 `REMOVE_BG_API_KEY`

### 7.2 本地开发

```bash
npm install
cp .dev.vars.example .dev.vars  # 编辑填入 REMOVE_BG_API_KEY
npm run dev
```

---

## 八、后续迭代方向（MVP 之后）

| 优先级 | 功能 | 说明 |
| --- | --- | --- |
| P1 | 自定义背景替换 | 纯色 / 渐变 / 自定义图片 |
| P1 | 免费次数限制 + 付费订阅 | 接入 Stripe，每日免费 3 次 |
| P2 | 批量处理 | 多图上传，队列处理 |
| P2 | 用户账号体系 | 历史记录、额度管理 |
| P3 | API 对外开放 | 开发者调用，按量计费 |
| P3 | 浏览器插件 | 右键图片直接抠图 |

---

## 九、风险与限制

| 风险 | 说明 | 应对 |
| --- | --- | --- |
| Remove.bg 免费额度有限 | 免费账号 50 次/月 | MVP 阶段够用，上线后升级付费计划 |
| 大图处理慢 | 10MB 图片传输 + 处理可能超 8s | 前端限制文件大小，加超时提示 |
| Cloudflare Workers 内存限制 | 单次请求内存上限 128MB | 10MB 图片 Base64 约 13MB，在限制内 |
| API Key 泄露风险 | 若前端直接调用则暴露 | 通过服务端代理解决，Key 不出服务端 |
