import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/admin/settings-client'

export const metadata = {
  title: 'Settings - Admin Panel',
  description: 'System configuration and user management',
}

export default async function SettingsPage() {
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

  const { data: staffMembers } = await supabase
    .from('staff_profiles')
    .select('*')
    .in('role', ['Admin', 'Accountant', 'Registrar'])

  return <SettingsClient staffMembers={staffMembers || []} userId={user.id} />
}
