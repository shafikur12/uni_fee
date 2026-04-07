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

async function resolveStudentId(submission: { student_id: string | null }) {
  const rawStudentId = submission.student_id
  if (!rawStudentId) return null

  const { data: byId } = await supabaseAdmin
    .from('students')
    .select('id, user_id')
    .eq('id', rawStudentId)
    .maybeSingle()
  if (byId?.id) return byId

  const { data: byUserId } = await supabaseAdmin
    .from('students')
    .select('id, user_id')
    .eq('user_id', rawStudentId)
    .maybeSingle()
  if (byUserId?.id) return byUserId

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { submissionId, actorId, reason } = await req.json()

    if (!submissionId || !actorId || !reason) {
      return NextResponse.json(
        { error: 'submissionId, actorId, and reason are required' },
        { status: 400 },
      )
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('fee_submissions')
      .select('id, student_id, batch_id')
      .eq('id', submissionId)
      .maybeSingle()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const studentRow = await resolveStudentId(submission)
    let studentEmail: string | null = null
    if (studentRow?.user_id || studentRow?.id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        studentRow.user_id || studentRow.id,
      )
      studentEmail = userData?.user?.email || null
    }

    const { error: updateError } = await supabaseAdmin
      .from('fee_submissions')
      .update({
        status: 'Rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: actorId,
      })
      .eq('id', submissionId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reject submission' }, { status: 500 })
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      action_type: 'reject',
      target_table: 'fee_submissions',
      target_id: submissionId,
      batch_id: submission.batch_id,
      new_value: {
        status: 'Rejected',
        reason,
        submission_id: submissionId,
        student_id: studentRow?.id || submission.student_id,
        student_email: studentEmail,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('reject fee submission API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
