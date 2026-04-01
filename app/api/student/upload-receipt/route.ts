import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const blobToken = process.env.BLOB_READ_WRITE_TOKEN!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'bin'
    const blobPath = `receipts/${userId}-${Date.now()}.${ext}`

    const blobResponse = await fetch('https://blob.vercel-storage.com/' + blobPath, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${blobToken}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!blobResponse.ok) {
      const text = await blobResponse.text()
      console.error('Blob upload failed:', blobResponse.status, text)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 },
      )
    }

    const blobJson = (await blobResponse.json()) as { url: string }

    return NextResponse.json({
      url: blobJson.url,
      path: blobPath,
    })
  } catch (err) {
    console.error('upload-receipt API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

