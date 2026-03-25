# Image Background Remover

AI 一键抠图工具，基于 Remove.bg API，部署在 Cloudflare Pages。

## 本地开发

```bash
npm install
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 REMOVE_BG_API_KEY
npm run dev
```

访问 http://localhost:3000

## 获取 Remove.bg API Key

1. 注册 https://www.remove.bg/api
2. 免费额度：50 次/月
3. 将 Key 填入 `.env.local`

## 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. 在 [Cloudflare Pages](https://pages.cloudflare.com) 连接仓库
3. 构建命令：`npm run build`
4. 在 Pages 环境变量中添加 `REMOVE_BG_API_KEY`

## 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Remove.bg API
- Cloudflare Pages
