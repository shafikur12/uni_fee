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
    const { batchId, emails } = await req.json()

    if (!batchId || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'batchId and at least one email are required' },
        { status: 400 },
      )
    }

    // Load batch info needed for `students.current_semester`
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id, semester')
      .eq('id', batchId)
      .maybeSingle()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Invalid batch' }, { status: 400 })
    }

    const semesterInt = parseInt(String(batch.semester), 10)
    const currentSemester = Number.isFinite(semesterInt) ? semesterInt : 1

    let added = 0
    let failed = 0

    for (const rawEmail of emails) {
      const email = String(rawEmail || '').trim()
      if (!email) continue

      try {
        const { data: usersResult, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        })

        if (listError) {
          failed++
          continue
        }

        const user = usersResult?.users?.find((u) => u.email === email)

        if (!user) {
          failed++
          continue
        }

        const { data: existingStudent, error: profileSelectError } = await supabaseAdmin
          .from('student_profiles')
          .select('id, student_id, full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profileSelectError) {
          failed++
          continue
        }

        const fallbackStudentId = `STU-${Date.now()}`
        const studentIdValue =
          (existingStudent as any)?.student_id ||
          (user.user_metadata as any)?.student_id ||
          fallbackStudentId

        if (existingStudent) {
          const { error: updateError } = await supabaseAdmin
            .from('student_profiles')
            .update({ batch_id: batchId })
            .eq('id', user.id)

          if (updateError) {
            failed++
            continue
          }
        } else {
          const fullName =
            (user.user_metadata as any)?.full_name ||
            user.email?.split('@')[0] ||
            'Student'

          const { error: insertError } = await supabaseAdmin
            .from('student_profiles')
            .insert({
              id: user.id,
              batch_id: batchId,
              full_name: fullName,
              student_id: studentIdValue,
            })

          if (insertError) {
            failed++
            continue
          }
        }

        // Keep `students` table in sync so admin pages can list students by batch.
        const registrationNumber = studentIdValue

        const finalName =
          (existingStudent as any)?.full_name ||
          (user.user_metadata as any)?.full_name ||
          user.email?.split('@')[0] ||
          'Student'

        const { error: studentsUpsertError } = await supabaseAdmin
          .from('students')
          .upsert(
            {
              id: user.id,
              user_id: user.id,
              registration_number: String(registrationNumber),
              name: String(finalName),
              current_semester: currentSemester,
              batch_id: batchId,
              status: 'Active',
            },
            { onConflict: 'id' },
          )

        if (studentsUpsertError) {
          failed++
          continue
        }

        added++
      } catch {
        failed++
      }
    }

    return NextResponse.json({ added, failed })
  } catch (err) {
    console.error('assign-students API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

