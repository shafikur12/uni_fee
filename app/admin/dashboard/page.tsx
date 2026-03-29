import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export const metadata = {
  title: 'Dashboard - Admin Panel',
  description: 'Admin dashboard for fee management and batch operations',
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Get user role from staff profiles
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'Admin' && profile?.role !== 'Accountant' && profile?.role !== 'Registrar') {
    redirect('/student/dashboard')
  }

  // Fetch dashboard metrics
  const [{ count: totalSubmissions }, { count: pendingSubmissions }, { count: approvedSubmissions }, { count: totalBatches }] = await Promise.all([
    supabase
      .from('fee_submissions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('fee_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending'),
    supabase
      .from('fee_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Approved'),
    supabase
      .from('batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active'),
  ])

  return (
    <AdminDashboardClient
      metrics={{
        totalSubmissions: totalSubmissions || 0,
        pendingSubmissions: pendingSubmissions || 0,
        approvedSubmissions: approvedSubmissions || 0,
        totalBatches: totalBatches || 0,
      }}
      userRole={profile?.role || 'Admin'}
    />
  )
}
