'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface StudentProfileClientProps {
  user: User
  profile: any
}

export function StudentProfileClient({ user, profile }: StudentProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Update error:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email || '')
      if (error) throw error

      setSuccess(true)
      setError('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Failed to send password reset email. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Updated successfully!</p>
          </div>
        </Card>
      )}

      {/* Profile Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={user.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Input
              value={profile?.role || 'Student'}
              disabled
              className="bg-gray-50"
            />
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure
          </p>
          <Button
            onClick={handleChangePassword}
            variant="outline"
          >
            Change Password
          </Button>
          <p className="text-xs text-gray-500">
            You&apos;ll receive an email with instructions to reset your password
          </p>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Account Created:</span>{' '}
            {new Date(user.created_at || '').toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Email Verified:</span>{' '}
            {user.email_confirmed_at ? 'Yes' : 'No'}
          </p>
          <p>
            <span className="font-medium">Last Sign In:</span>{' '}
            {user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
      </Card>
    </div>
  )
}
