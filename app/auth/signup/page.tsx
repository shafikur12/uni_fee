'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

interface Batch {
  id: string
  batch_name: string
  batch_code: string
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [batches, setBatches] = useState<Batch[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchActiveBatches()
  }, [])

  const fetchActiveBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, batch_name, batch_code')
        .eq('status', 'Active')
        .order('batch_name', { ascending: true })

      if (error) throw error
      setBatches(data || [])
    } catch (err) {
      console.error('Error fetching batches:', err)
      setError('Failed to load batches. Please refresh the page.')
    }
  }

  const findBatchByCode = (code: string) => {
    return batches.find((b) => b.batch_code === code)
  }

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !fullName || !studentId || !batchCode) {
      setError('All fields are required')
      return false
    }
    if (!/^\d+$/.test(studentId)) {
      setError('Student ID must contain only numbers')
      return false
    }
    const selectedBatch = findBatchByCode(batchCode)
    if (!selectedBatch) {
      setError('Invalid batch code')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const selectedBatch = findBatchByCode(batchCode)
      if (!selectedBatch) {
        setError('Invalid batch code')
        setLoading(false)
        return
      }

      // Sign up with Supabase Auth without email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'Student',
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Create student profile with batch and student ID
        const { error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            student_id: studentId,
            batch_id: selectedBatch.id,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          setError('Account created but profile setup failed. Please contact support.')
          setLoading(false)
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      console.error(err)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your student account is ready. Redirecting to your dashboard...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Student Registration
          </h1>
          <p className="text-center text-gray-600 mb-8">Create your student account</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <Input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="12345678"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Numbers only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code
              </label>
              <Input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                placeholder="e.g., BATCH-2024-01"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the batch code provided by your institution</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Student Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
