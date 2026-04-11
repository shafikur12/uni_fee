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
    const { data: slips, error } = await supabaseAdmin
      .from('permission_slips')
      .select('id, submission_id, issued_at, generated_at')
      .order('issued_at', { ascending: false, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to load slips', details: error.message }, { status: 500 })
    }

    const seen = new Set<string>()
    const toDelete: string[] = []

    for (const slip of slips || []) {
      const key = slip.submission_id || slip.id
      if (seen.has(key)) {
        toDelete.push(slip.id)
      } else {
        seen.add(key)
      }
    }

    if (toDelete.length === 0) {
      return NextResponse.json({ removed: 0 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('permission_slips')
      .delete()
      .in('id', toDelete)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete duplicates', details: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ removed: toDelete.length })
  } catch (err) {
    console.error('permission slips dedupe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}