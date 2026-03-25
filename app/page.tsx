'use client'

import { useRef, useState, useCallback } from 'react'
import CompareSlider from '@/components/CompareSlider'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function Home() {
  const [state, setState] = useState<State>('idle')
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [resultUrl, setResultUrl] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('仅支持 JPG、PNG、WEBP 格式')
      setState('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('文件大小不能超过 10MB')
      setState('error')
      return
    }

    setFileName(file.name)
    setState('processing')
    setErrorMsg('')

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setOriginalUrl(base64)

      try {
        const res = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64 }),
        })
        const data = await res.json()
        if (!res.ok) {
          setErrorMsg(data.error || 'Processing failed')
          setState('error')
          return
        }
        setResultUrl(data.result_base64)
        setState('done')
      } catch {
        setErrorMsg('Network error. Please try again.')
        setState('error')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `removed-bg-${fileName.replace(/\.[^.]+$/, '')}.png`
    a.click()
  }

  const handleReset = () => {
    setState('idle')
    setOriginalUrl('')
    setResultUrl('')
    setErrorMsg('')
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Background Remover
        </h1>
        <p className="mt-2 text-slate-500 text-sm">免费 · 无需注册 · AI 秒级处理</p>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-16">

        {/* Idle: Upload Area */}
        {state === 'idle' && (
          <label
            className={`block border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-lg font-medium text-slate-700">拖拽图片到此处</p>
            <p className="text-slate-400 mt-1">或点击选择文件</p>
            <p className="text-xs text-slate-400 mt-3">支持 JPG · PNG · WEBP · 最大 10MB</p>
          </label>
        )}

        {/* Processing */}
        {state === 'processing' && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            {originalUrl && (
              <img src={originalUrl} alt="original" className="w-32 h-32 object-cover rounded-xl mx-auto mb-6" />
            )}
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-medium">AI 正在处理中...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-500 font-medium">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新上传
            </button>
          </div>
        )}

        {/* Done: Compare + Download */}
        {state === 'done' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <CompareSlider originalUrl={originalUrl} resultUrl={resultUrl} />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                ⬇ 下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                重新上传
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
