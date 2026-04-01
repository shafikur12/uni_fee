import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VerificationQueueClient } from '@/components/admin/verification-queue-client'

export const metadata = {
  title: 'Verification Queue - Admin Panel',
  description: 'Review and approve fee submissions',
}

export default async function VerificationQueuePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Verify accountant role (id matches auth user id)
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!['Admin', 'Accountant'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }

  // Fetch pending submissions
  const { data: submissions } = await supabase
    .from('fee_submissions')
    .select(
      `*, 
       batches(batch_name, fee_amount, semester),
       uploaded_receipts(file_url, file_type, file_size, storage_path)`
    )
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })

  // `fee_submissions.student_id` may point to different tables depending on
  // the current DB setup. To keep the UI working, we fetch both possible
  // student sources and map them into the shape expected by the client.
  const safeSubmissions = submissions || []
  const studentIds = Array.from(new Set(safeSubmissions.map((s: any) => s.student_id))).filter(Boolean)

  const [{ data: studentsRows }, { data: profilesRows }] = await Promise.all([
    studentIds.length
      ? supabase.from('students').select('id, user_id, registration_number, current_semester').in('id', studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase
          .from('student_profiles')
          .select('id, student_id, batch_id, full_name')
          .in('id', studentIds)
      : Promise.resolve({ data: [] }),
  ])

  const studentsById = new Map((studentsRows || []).map((s: any) => [s.id, s]))
  const profilesById = new Map((profilesRows || []).map((p: any) => [p.id, p]))

  const submissionsMapped = safeSubmissions.map((sub: any) => {
    const studentRow = studentsById.get(sub.student_id)
    const profileRow = profilesById.get(sub.student_id)
    const semesterFromBatch = sub?.batches?.semester ? parseInt(String(sub.batches.semester), 10) : 1

    return {
      ...sub,
      students: studentRow
        ? {
            user_id: studentRow.user_id,
            registration_number: studentRow.registration_number,
            semester: studentRow.current_semester,
          }
        : profileRow
          ? {
              user_id: profileRow.id,
              registration_number: profileRow.student_id,
              semester: semesterFromBatch,
            }
          : {
              user_id: sub.student_id,
              registration_number: 'N/A',
              semester: semesterFromBatch,
            },
    }
  })

  return (
    <VerificationQueueClient submissions={submissionsMapped} userId={user.id} />
  )
}
