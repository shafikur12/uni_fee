import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { BatchStudentsPageClient } from '@/components/admin/batch-students-page-client'

export const metadata = {
  title: 'Batch Students - Admin Panel',
  description: 'Manage students in a batch',
}

export default async function BatchStudentsPage({
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

  if (profile?.role !== 'Admin') {
    redirect('/admin/dashboard')
  }

  const { id: batchId } = await params

  const { data: batch } = await supabase
    .from('batches')
    .select('id, batch_name, batch_code, academic_year, semester, status')
    .eq('id', batchId)
    .maybeSingle()

  if (!batch) {
    redirect('/admin/batches')
  }

  const { data: students } = await supabase
    .from('students')
    .select('id, registration_number, name, current_semester, status, batch_id')
    .eq('batch_id', batchId)
    .order('registration_number', { ascending: true })

  return (
    <BatchStudentsPageClient
      batch={batch}
      students={students || []}
      userId={user.id}
    />
  )
}
