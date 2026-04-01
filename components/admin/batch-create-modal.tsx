'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface BatchCreateModalProps {
  userId: string
  onClose: () => void
  onBatchCreated: (batch: any) => void
}

export function BatchCreateModal({
  userId,
  onClose,
  onBatchCreated,
}: BatchCreateModalProps) {
  const [batchName, setBatchName] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!batchName || !batchCode || !academicYear) {
      setError('All fields are required')
      return
    }

    setLoading(true)

    try {
      const { data: newBatch, error: createError } = await supabase
        .from('batches')
        .insert({
          batch_name: batchName,
          batch_code: batchCode.toUpperCase(),
          academic_year: academicYear,
          // Use safe defaults for fields no longer collected in the form
          semester: '1',
          fee_amount: 0,
          fee_deadline: new Date().toISOString(),
          status: 'Active',
          created_by: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) throw createError

      onBatchCreated(newBatch)
      onClose()
    } catch (err) {
      console.error('Create error:', err)
      setError('Failed to create batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Batch</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name
              </label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g., Batch 2024-25 Sem 1"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code
              </label>
              <Input
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="e.g., BATCH-2024-01"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g., 2024-2025"
                  disabled={loading}
                />
              </div>

              {/* Semester is no longer collected in the form */}
            </div>

            {/* Fee Amount and Fee Deadline are no longer collected in the form */}

            <div className="flex gap-3 pt-4">
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
                    Creating...
                  </>
                ) : (
                  'Create Batch'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
