'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, X } from 'lucide-react'

interface Batch {
  id: string
  batch_name: string
}

interface BatchStudentModalProps {
  batch: Batch
  onClose: () => void
}

export function BatchStudentModal({ batch, onClose }: BatchStudentModalProps) {
  const [inputMode, setInputMode] = useState<'single' | 'csv'>('single')
  const [studentEmail, setStudentEmail] = useState('')
  const [csvText, setCsvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!studentEmail) {
      setError('Please enter a student email')
      return
    }

    setLoading(true)

    try {
      // Find user by email
      const { data: userData } = await supabase.auth.admin?.listUsers?.()

      const user = userData?.users?.find((u) => u.email === studentEmail)

      if (!user) {
        setError('User not found with this email')
        setLoading(false)
        return
      }

      // Check if student record exists
      const { data: existingStudent } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingStudent) {
        // Update batch assignment
        const { error: updateError } = await supabase
          .from('student_profiles')
          .update({ batch_id: batch.id })
          .eq('id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new student with batch
        const { error: createError } = await supabase
          .from('student_profiles')
          .insert({
            id: user.id,
            batch_id: batch.id,
            full_name: user.email?.split('@')[0] || 'Student',
            student_id: `STU-${Date.now()}`,
          })

        if (createError) throw createError
      }

      setSuccess(`Student assigned to ${batch.batch_name}`)
      setStudentEmail('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFromCSV = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!csvText) {
      setError('Please paste CSV data')
      return
    }

    setLoading(true)

    try {
      const lines = csvText.split('\n').filter((line) => line.trim())
      let added = 0
      let failed = 0

      for (const line of lines) {
        const [email] = line.split(',').map((col) => col.trim())

        if (!email) continue

        try {
          const { data: userData } = await supabase.auth.admin?.listUsers?.()
          const user = userData?.users?.find((u) => u.email === email)

          if (!user) {
            failed++
            continue
          }

          const { data: existingStudent } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('id', user.id)
            .single()

          if (existingStudent) {
            await supabase
              .from('student_profiles')
              .update({ batch_id: batch.id })
              .eq('id', user.id)
          } else {
            await supabase
              .from('student_profiles')
              .insert({
                id: user.id,
                batch_id: batch.id,
                full_name: email.split('@')[0],
                student_id: `STU-${Date.now()}`,
              })
          }

          added++
        } catch (err) {
          failed++
        }
      }

      setSuccess(`Added ${added} student(s). Failed: ${failed}`)
      setCsvText('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('CSV error:', err)
      setError('Failed to process CSV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Assign Students to {batch.batch_name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setInputMode('single')}
              variant={inputMode === 'single' ? 'default' : 'outline'}
              size="sm"
            >
              Single
            </Button>
            <Button
              onClick={() => setInputMode('csv')}
              variant={inputMode === 'csv' ? 'default' : 'outline'}
              size="sm"
            >
              Bulk (CSV)
            </Button>
          </div>

          {/* Single Student */}
          {inputMode === 'single' && (
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <Input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Student'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* CSV Upload */}
          {inputMode === 'csv' && (
            <form onSubmit={handleAddFromCSV} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV Data
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="email1@example.com&#10;email2@example.com"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  One email per line
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Bulk Assign'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
