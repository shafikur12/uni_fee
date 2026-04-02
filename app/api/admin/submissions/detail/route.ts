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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data: submission, error } = await supabaseAdmin
      .from('fee_submissions')
      .select(
        'id, student_id, batch_id, submission_date, amount, bank_name, transaction_id, payment_reference, status, rejection_reason, reviewed_at, reviewed_by, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle()

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const [{ data: batch }, { data: receipts }, { data: studentById }, { data: studentByUser }] =
      await Promise.all([
        submission.batch_id
          ? supabaseAdmin
              .from('batches')
              .select('id, batch_name, fee_amount')
              .eq('id', submission.batch_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabaseAdmin
          .from('uploaded_receipts')
          .select('file_url, file_type, file_size, storage_path')
          .eq('submission_id', submission.id),
        supabaseAdmin
          .from('students')
          .select('id, name, registration_number, current_semester, user_id')
          .eq('id', submission.student_id)
          .maybeSingle(),
        supabaseAdmin
          .from('students')
          .select('id, name, registration_number, current_semester, user_id')
          .eq('user_id', submission.student_id)
          .maybeSingle(),
      ])

    const student = studentById || studentByUser

    let studentEmail: string | null = null
    const userId = student?.user_id || submission.student_id
    if (userId) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      studentEmail = userData?.user?.email || null
    }

    return NextResponse.json({
      submission: {
        ...submission,
        batches: batch || null,
        uploaded_receipts: receipts || [],
        students: student || null,
        student_email: studentEmail,
      },
    })
  } catch (err) {
    console.error('submission detail API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
