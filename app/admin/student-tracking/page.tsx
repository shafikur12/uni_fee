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

  // Fetch students with their submissions
  const { data: students } = await supabase
    .from('students')
    .select(`
      *, 
      batches(batch_name),
      fee_submissions(status, amount)
    `)
    .order('created_at', { ascending: false })

  return <StudentTrackingClient students={students || []} />
}
