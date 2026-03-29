'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  return { user, loading }
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const getProfile = async () => {
      // Try to get student profile first
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (studentProfile) {
        setProfile(studentProfile)
        setLoading(false)
        return
      }

      // If not student, try staff profile
      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile(staffProfile)
      setLoading(false)
    }

    getProfile()
  }, [userId, supabase])

  return { profile, loading }
}
