import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image_base64 } = await req.json()

    if (!image_base64) {
      return NextResponse.json({ error: 'Missing image_base64' }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Strip data URL prefix to get raw base64
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
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

    if (response.status === 429) {
      return NextResponse.json({ error: 'API quota exceeded. Please try again later.' }, { status: 429 })
    }

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Remove.bg error: ${err}` }, { status: 500 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const resultBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`

    return NextResponse.json({ result_base64: resultBase64 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
