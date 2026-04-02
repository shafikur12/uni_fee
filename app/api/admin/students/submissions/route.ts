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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    // Resolve students.id when we get an auth user id
    const { data: studentRow } = await supabaseAdmin
      .from('students')
      .select('id')
      .or(`id.eq.${studentId},user_id.eq.${studentId}`)
      .maybeSingle()

    const resolvedStudentId = studentRow?.id || studentId

    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('fee_submissions')
      .select(
        'id, student_id, batch_id, submission_date, amount, bank_name, transaction_id, payment_reference, status, rejection_reason, reviewed_at, reviewed_by, created_at'
      )
      .eq('student_id', resolvedStudentId)
      .order('created_at', { ascending: false })

    if (submissionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions', details: submissionsError.message },
        { status: 500 },
      )
    }

    const submissionIds = (submissions || []).map((s) => s.id)
    const batchIds = Array.from(new Set((submissions || []).map((s) => s.batch_id).filter(Boolean)))

    const [{ data: receipts }, { data: batches }, { data: students }] = await Promise.all([
      submissionIds.length
        ? supabaseAdmin
            .from('uploaded_receipts')
            .select('submission_id, file_url, file_type, file_size, storage_path')
            .in('submission_id', submissionIds)
        : Promise.resolve({ data: [] }),
      batchIds.length
        ? supabaseAdmin.from('batches').select('id, batch_name, fee_amount').in('id', batchIds)
        : Promise.resolve({ data: [] }),
      submissions && submissions.length
        ? supabaseAdmin
            .from('students')
            .select('id, name, registration_number')
            .in('id', submissions.map((s) => s.student_id))
        : Promise.resolve({ data: [] }),
    ])

    const receiptsBySubmission = new Map<string, any[]>()
    for (const r of receipts || []) {
      const list = receiptsBySubmission.get(r.submission_id) || []
      list.push(r)
      receiptsBySubmission.set(r.submission_id, list)
    }

    const batchesById = new Map((batches || []).map((b: any) => [b.id, b]))
    const studentsById = new Map((students || []).map((s: any) => [s.id, s]))

    const enriched = (submissions || []).map((s) => ({
      ...s,
      batches: batchesById.get(s.batch_id) || null,
      students: studentsById.get(s.student_id) || null,
      uploaded_receipts: receiptsBySubmission.get(s.id) || [],
    }))

    return NextResponse.json({ submissions: enriched })
  } catch (err) {
    console.error('student submissions API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
