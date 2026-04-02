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
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Batch id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('batches').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('delete batch API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
