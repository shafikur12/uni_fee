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
    const { submissionId, actorId } = await req.json()

    if (!submissionId || !actorId) {
      return NextResponse.json(
        { error: 'submissionId and actorId are required' },
        { status: 400 },
      )
    }

    const { data: submission } = await supabaseAdmin
      .from('fee_submissions')
      .select('id, student_id, batch_id')
      .eq('id', submissionId)
      .maybeSingle()

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('fee_submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      action_type: 'delete',
      target_table: 'fee_submissions',
      target_id: submissionId,
      batch_id: submission.batch_id,
      new_value: {
        status: 'Deleted',
        submission_id: submissionId,
        student_id: submission.student_id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('delete submission API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
