import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Background Remover — AI 一键抠图',
  description: '免费在线 AI 抠图工具，上传图片自动去除背景，下载透明 PNG',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
