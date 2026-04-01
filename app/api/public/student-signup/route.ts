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
    const { email, password, fullName, studentId, batchCode } = await req.json()

    if (!email || !password || !fullName || !studentId || !batchCode) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!/^\d+$/.test(String(studentId))) {
      return NextResponse.json({ error: 'Student ID must contain only numbers' }, { status: 400 })
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedBatchCode = String(batchCode).trim().toUpperCase()

    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id, semester')
      .ilike('batch_code', normalizedBatchCode)
      .eq('status', 'Active')
      .maybeSingle()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Invalid batch code' }, { status: 400 })
    }

    const { data: createAuthData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'Student',
      },
    })

    if (createAuthError || !createAuthData.user) {
      return NextResponse.json(
        { error: createAuthError?.message || 'Failed to create account' },
        { status: 400 },
      )
    }

    const { error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .insert({
        id: createAuthData.user.id,
        full_name: fullName,
        student_id: String(studentId),
        batch_id: batch.id,
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(createAuthData.user.id)
      return NextResponse.json(
        { error: 'Account created but profile setup failed. Please contact support.' },
        { status: 400 },
      )
    }

    // Also create a row in `students` so admin pages that rely on that table work.
    const semesterInt = parseInt(String(batch.semester), 10)
    const currentSemester = Number.isFinite(semesterInt) ? semesterInt : 1

    const { error: studentsError } = await supabaseAdmin
      .from('students')
      .insert({
        id: createAuthData.user.id, // Keep IDs aligned with auth user id
        user_id: createAuthData.user.id,
        registration_number: String(studentId),
        name: fullName,
        current_semester: currentSemester,
        batch_id: batch.id,
        status: 'Active',
      })

    if (studentsError) {
      // Rollback both: remove auth user and profile row
      await supabaseAdmin
        .from('student_profiles')
        .delete()
        .eq('id', createAuthData.user.id)

      await supabaseAdmin.auth.admin.deleteUser(createAuthData.user.id)

      return NextResponse.json(
        { error: 'Account created but students profile setup failed. Please contact support.' },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('student-signup API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

