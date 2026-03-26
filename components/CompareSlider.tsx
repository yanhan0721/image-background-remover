'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface Props {
  originalUrl: string
  resultUrl: string
}

export default function CompareSlider({ originalUrl, resultUrl }: Props) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPosition(pct)
  }, [])

  const onMouseDown = () => { dragging.current = true }
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePosition(e.clientX) }
  const onMouseUp = () => { dragging.current = false }

  const onTouchMove = (e: React.TouchEvent) => { updatePosition(e.touches[0].clientX) }

  useEffect(() => {
    const up = () => { dragging.current = false }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl cursor-col-resize"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* Result (right side, full width, checkerboard bg) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <img src={resultUrl} alt="result" className="w-full h-full object-contain" />
      </div>

      {/* Original (left side, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img src={originalUrl} alt="original" className="absolute inset-0 w-full h-full object-contain" style={{ width: '100%' }} />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 text-xs font-bold">
          ⇔
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">原图</span>
      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">去背景</span>
    </div>
  )
}
