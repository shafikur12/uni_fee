import { NextRequest, NextResponse } from 'next/server'

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export async function GET(req: NextRequest) {
  if (!blobToken) {
    return NextResponse.json({ error: 'Missing blob token' }, { status: 500 })
  }

  const url = new URL(req.url)
  const path = url.searchParams.get('path') ?? ''
  if (!path || !path.startsWith('receipts/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const upstream = await fetch(`https://blob.vercel-storage.com/${path}`, {
    headers: {
      Authorization: `Bearer ${blobToken}`,
    },
  })

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    return NextResponse.json(
      { error: 'Failed to fetch blob', status: upstream.status, details: text },
      { status: 502 },
    )
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const arrayBuffer = await upstream.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    },
  })
}

