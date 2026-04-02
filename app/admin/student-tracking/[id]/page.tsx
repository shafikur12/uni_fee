import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { StudentSubmissionsPageClient } from '@/components/admin/student-submissions-page-client'

export const metadata = {
  title: 'Student Submissions - Admin Panel',
  description: 'View submissions for a student',
}

export default async function StudentSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!['Admin', 'Registrar'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }

  const { id } = await params

  const { data: student } = await supabase
    .from('students')
    .select('id, registration_number, name')
    .eq('id', id)
    .maybeSingle()

  if (!student) {
    redirect('/admin/student-tracking')
  }

  return <StudentSubmissionsPageClient student={student} />
}
