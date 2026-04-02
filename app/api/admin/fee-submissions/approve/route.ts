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

async function resolveStudentRow(submission: {
  student_id: string | null
  batch_id: string | null
}) {
  const rawStudentId = submission.student_id

  if (rawStudentId) {
    const { data: byId } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', rawStudentId)
      .maybeSingle()
    if (byId?.id) return byId

    const { data: byUserId } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', rawStudentId)
      .maybeSingle()
    if (byUserId?.id) return byUserId
  }

  if (rawStudentId) {
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('id, student_id, full_name, batch_id')
      .eq('id', rawStudentId)
      .maybeSingle()

    if (profile?.id) {
      const studentIdValue = String(profile.student_id)
      const studentName = String(profile.full_name || 'Student')
      const batchId = profile.batch_id || submission.batch_id || null

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from('students')
        .upsert(
          {
            id: profile.id,
            user_id: profile.id,
            registration_number: studentIdValue,
            name: studentName,
            batch_id: batchId,
            status: 'Active',
          },
          { onConflict: 'id' },
        )
        .select('id')
        .maybeSingle()

      if (!upsertError && upserted?.id) {
        return upserted
      }
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { submissionId, actorId } = await req.json()

    if (!submissionId || !actorId) {
      return NextResponse.json(
        { error: 'submissionId and actorId are required' },
        { status: 400 },
      )
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('fee_submissions')
      .select('id, student_id, batch_id, status')
      .eq('id', submissionId)
      .maybeSingle()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.status === 'Approved') {
      return NextResponse.json({ ok: true })
    }

    const studentRow = await resolveStudentRow(submission)
    if (!studentRow?.id) {
      return NextResponse.json(
        { error: 'Student record not found. Please sync student data before approving.' },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('fee_submissions')
      .update({
        status: 'Approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: actorId,
      })
      .eq('id', submissionId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    const { data: existingSlip } = await supabaseAdmin
      .from('permission_slips')
      .select('id')
      .eq('submission_id', submissionId)
      .maybeSingle()

    if (!existingSlip) {
      const { error: slipError } = await supabaseAdmin
        .from('permission_slips')
        .insert({
          student_id: studentRow.id,
          submission_id: submissionId,
          batch_id: submission.batch_id,
          verification_code: `SLIP-${Date.now()}`,
          file_url: '#',
          issued_at: new Date().toISOString(),
          issued_by: actorId,
        })

      if (slipError) {
        return NextResponse.json({ error: 'Failed to generate permission slip' }, { status: 500 })
      }
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      action_type: 'approve',
      target_table: 'fee_submissions',
      target_id: submissionId,
      batch_id: submission.batch_id,
      new_value: { status: 'Approved' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('approve fee submission API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
