'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children, requiredRole?: string }: { children: React.ReactNode; requiredRole?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth/login')
          return
        }

        if (requiredRole) {
          // Check staff profile first
          const { data: staffProfile } = await supabase
            .from('staff_profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle()

          if (staffProfile?.role === requiredRole) {
            setAuthorized(true)
            setLoading(false)
            return
          }

          // If required role is 'Admin' or staff role, but staff profile doesn't match, deny access
          if (requiredRole === 'Admin' || requiredRole === 'Accountant' || requiredRole === 'Registrar') {
            router.push('/auth/login')
            return
          }

          // Check student profile
          const { data: studentProfile } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          if (studentProfile?.id !== session.user.id) {
            router.push('/auth/login')
            return
          }
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return authorized ? <>{children}</> : null
}
