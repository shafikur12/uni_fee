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

  const { data: directSlips } = await supabase
    .from('permission_slips')
    .select('*')
    .eq('student_id', studentId)
    .order('generated_at', { ascending: false })

  if (directSlips && directSlips.length > 0) {
    const unique = new Map<string, any>()
    for (const slip of directSlips) {
      const key = slip.submission_id || slip.id
      if (!unique.has(key)) unique.set(key, slip)
    }
    return Array.from(unique.values())
  }

  const { data: studentRow } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentId)
    .maybeSingle()

  if (!studentRow?.id) {
    return directSlips || []
  }

  const { data: fallbackSlips } = await supabase
    .from('permission_slips')
    .select('*')
    .eq('student_id', studentRow.id)
    .order('generated_at', { ascending: false })

  if (!fallbackSlips || fallbackSlips.length === 0) return []
  const unique = new Map<string, any>()
  for (const slip of fallbackSlips) {
    const key = slip.submission_id || slip.id
    if (!unique.has(key)) unique.set(key, slip)
  }
  return Array.from(unique.values())
}
