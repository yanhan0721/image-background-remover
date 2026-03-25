import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image_base64 } = await req.json()

    if (!image_base64) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    const apiKey = process.env.CLIPDROP_API_KEY || process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key 未配置' }, { status: 500 })
    }

    // Convert base64 to buffer
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Try Clipdrop first
    const formData = new FormData()
    formData.append('image_file', new Blob([imageBuffer]), 'image.png')

    const clipdropRes = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    })

    if (clipdropRes.ok) {
      const resultBuffer = await clipdropRes.arrayBuffer()
      const resultBase64 = `data:image/png;base64,${Buffer.from(resultBuffer).toString('base64')}`
      return NextResponse.json({ result_base64: resultBase64 })
    }

    // Fallback to Remove.bg if Clipdrop fails
    const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: base64Data,
        size: 'auto',
        format: 'png',
      }),
    })

    if (removeBgRes.status === 429) {
      return NextResponse.json({ error: 'API 配额已用完，请稍后再试' }, { status: 429 })
    }

    if (!removeBgRes.ok) {
      const err = await removeBgRes.text()
      return NextResponse.json({ error: `处理失败: ${err}` }, { status: 500 })
    }

    const arrayBuffer = await removeBgRes.arrayBuffer()
    const resultBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`

    return NextResponse.json({ result_base64: resultBase64 })
  } catch (e: any) {
    console.error('API Error:', e)
    return NextResponse.json({ error: '服务器错误，请重试' }, { status: 500 })
  }
}
