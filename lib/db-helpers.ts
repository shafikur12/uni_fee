import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getStaffProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function getStudentProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function getStudentInfo(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_profiles')
    .select('*, batches(batch_name, fee_amount, fee_deadline, late_fee_percentage)')
    .eq('id', userId)
    .single()
  return data
}

export async function getFeeSubmissions(studentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('fee_submissions')
    .select('*, batches(batch_name)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  return data
}

export async function getPermissionSlips(studentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('permission_slips')
    .select('*')
    .eq('student_id', studentId)
    .order('generated_at', { ascending: false })
  return data
}
