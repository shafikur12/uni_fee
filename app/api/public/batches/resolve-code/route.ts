import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { batchCode } = await req.json()
    const normalizedCode = String(batchCode || '').trim().toUpperCase()

    if (!normalizedCode) {
      return NextResponse.json({ error: 'Batch code is required' }, { status: 400 })
    }

    const { data: batch, error } = await supabaseAdmin
      .from('batches')
      .select('id, batch_code, status')
      .ilike('batch_code', normalizedCode)
      .eq('status', 'Active')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Failed to validate batch code' }, { status: 500 })
    }

    if (!batch) {
      return NextResponse.json({ error: 'Invalid batch code' }, { status: 404 })
    }

    return NextResponse.json({ id: batch.id, batchCode: batch.batch_code })
  } catch (err) {
    console.error('resolve-code API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

