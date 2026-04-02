'use client'

import { useEffect, useState } from 'react'
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
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [studentsInBatch, setStudentsInBatch] = useState<
    Array<{
      id: string
      registration_number: string
      current_semester: number | null
      name: string | null
      status: string | null
    }>
  >([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const supabase = createClient()

  const fetchStudentsInBatch = async () => {
    setStudentsLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('id, registration_number, current_semester, name, status')
        .eq('batch_id', batch.id)
        .order('registration_number', { ascending: true })

      if (!fetchError) {
        setStudentsInBatch(data || [])
      }
    } catch {
      // ignore; UI will just show empty list
    } finally {
      setStudentsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentsInBatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.id])

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
      const response = await fetch('/api/admin/batches/assign-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: batch.id,
          emails: [studentEmail],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add student')
      }

      if (result.added === 0) {
        setError('No matching student accounts found for this email')
      } else {
        setSuccess(`Student assigned to ${batch.batch_name}`)
        setStudentEmail('')
        await fetchStudentsInBatch()
        setTimeout(() => setSuccess(''), 3000)
      }
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

    if (!csvFile) {
      setError('Please upload a CSV file')
      return
    }

    setLoading(true)

    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter((line) => line.trim())
      const emails = lines
        .map((line) => line.split(',')[0]?.trim())
        .filter((email) => !!email)

      if (emails.length === 0) {
        setError('No valid email addresses found in CSV')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/batches/assign-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: batch.id,
          emails,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process CSV')
      }

      setSuccess(`Added ${result.added} student(s). Failed: ${result.failed}`)
      setCsvFile(null)
      await fetchStudentsInBatch()
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

          {/* Students in this batch */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Students in this batch ({studentsInBatch.length})
            </h3>
            {studentsLoading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : studentsInBatch.length === 0 ? (
              <div className="text-sm text-gray-600">No students assigned yet.</div>
            ) : (
              <div className="max-h-64 overflow-auto border border-gray-200 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">Reg. No</th>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Semester</th>
                      <th className="text-left px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentsInBatch.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {s.registration_number}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {s.name || 'Student'}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          Sem {s.current_semester ?? 1}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {s.status || 'Active'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="w-full text-sm text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  CSV should contain one email per line as the first column.
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
