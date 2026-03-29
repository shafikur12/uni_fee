import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BatchReportingClient } from '@/components/admin/batch-reporting-client'

export const metadata = {
  title: 'Batch Reporting - Admin Panel',
  description: 'Compare and analyze batch performance metrics',
}

export default async function BatchReportingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!['Admin', 'Registrar'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }

  // Fetch all batches with submission metrics
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      id,
      batch_name,
      academic_year,
      semester,
      fee_amount,
      created_at,
      fee_submissions(
        id,
        status,
        amount,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  return <BatchReportingClient batches={batches || []} />
}
