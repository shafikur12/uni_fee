import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentTrackingClient } from '@/components/admin/student-tracking-client'

export const metadata = {
  title: 'Student Tracking - Admin Panel',
  description: 'Track student fees and exam eligibility',
}

export default async function StudentTrackingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // id matches auth user id
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!['Admin', 'Registrar'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }

  // Source of truth for student data in this codebase is `student_profiles`.
  // We map it into the shape expected by `StudentTrackingClient`.
  const { data: profiles } = await supabase
    .from('student_profiles')
    .select('id, student_id, batches(batch_name, semester)')
    .order('updated_at', { ascending: false })

  const profileIds = (profiles || []).map((p: any) => p.id)

  const { data: feeSubs } = await supabase
    .from('fee_submissions')
    .select('student_id, status, amount')
    .in('student_id', profileIds)

  const groupedByStudent = new Map<string, any[]>()
  for (const sub of feeSubs || []) {
    const list = groupedByStudent.get(sub.student_id) || []
    list.push({ status: sub.status, amount: sub.amount })
    groupedByStudent.set(sub.student_id, list)
  }

  const mappedStudents = (profiles || []).map((p: any) => {
    const semesterInt = parseInt(String(p?.batches?.semester), 10)
    return {
      id: p.id,
      registration_number: p.student_id,
      semester: Number.isFinite(semesterInt) ? semesterInt : 1,
      batches: { batch_name: p?.batches?.batch_name },
      fee_submissions: groupedByStudent.get(p.id) || [],
    }
  })

  return <StudentTrackingClient students={mappedStudents} />
}
