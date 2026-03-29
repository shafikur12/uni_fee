import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuditLogsClient } from '@/components/admin/audit-logs-client'

export const metadata = {
  title: 'Audit Logs - Admin Panel',
  description: 'View system audit logs',
}

export default async function AuditLogsPage() {
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

  if (profile?.role !== 'Admin') {
    redirect('/admin/dashboard')
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)

  return <AuditLogsClient logs={logs || []} />
}
