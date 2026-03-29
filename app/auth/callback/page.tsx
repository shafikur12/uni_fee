'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        new URL(window.location.href).searchParams.get('code') || ''
      )

      if (error) {
        router.push('/auth/error?message=' + encodeURIComponent(error.message))
        return
      }

      if (data.user) {
        // Check if user is staff (admin, accountant, registrar)
        const { data: staffProfile } = await supabase
          .from('staff_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // If staff profile exists, they are admin/accountant/registrar
        if (staffProfile?.role) {
          router.push('/admin/dashboard')
          return
        }

        // Check if user is student (select only id, not role - role doesn't exist in student_profiles)
        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // Redirect based on profile found
        if (studentProfile?.id) {
          router.push('/student/dashboard')
        } else {
          router.push('/auth/error?message=' + encodeURIComponent('User profile not found'))
        }
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Verifying your email...</p>
    </div>
  )
}
