import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { image_base64 } = await req.json()

    if (!image_base64) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key 未配置' }, { status: 500 })
    }

    // Strip the data URL prefix and decode base64 to binary
    const base64Data = (image_base64 as string).replace(/^data:image\/\w+;base64,/, '')

    // Call Remove.bg API with base64
    const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
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

    // Convert response ArrayBuffer to base64 using Web APIs (Edge compatible)
    const arrayBuffer = await removeBgRes.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    const resultBase64 = `data:image/png;base64,${btoa(binary)}`

    return NextResponse.json({ result_base64: resultBase64 })
  } catch (e: unknown) {
    console.error('API Error:', e)
    return NextResponse.json({ error: '服务器错误，请重试' }, { status: 500 })
  }
}
