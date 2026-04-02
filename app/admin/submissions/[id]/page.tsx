import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { SubmissionDetailPageClient } from '@/components/admin/submission-detail-page-client'

export const metadata = {
  title: 'Submission Detail - Admin Panel',
  description: 'View a single submission in detail',
}

export default async function SubmissionDetailPage({
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

  if (!['Admin', 'Registrar', 'Accountant'].includes(profile?.role || '')) {
    redirect('/admin/dashboard')
  }

  const { id } = await params

  return <SubmissionDetailPageClient submissionId={id} />
}
