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
       students(user_id, registration_number, semester),
       batches(batch_name, fee_amount),
       uploaded_receipts(file_url, file_type, file_size)`
    )
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })

  return (
    <VerificationQueueClient submissions={submissions || []} userId={user.id} />
  )
}
