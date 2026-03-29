'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Edit2,
  Archive,
  Users,
} from 'lucide-react'
import { BatchCreateModal } from './batch-create-modal'
import { BatchStudentModal } from './batch-student-modal'

interface Batch {
  id: string
  batch_name: string
  batch_code: string
  academic_year: string
  semester: string
  status: string
  fee_amount: number
  fee_deadline: string
  created_at: string
}

interface BatchManagementClientProps {
  batches: Batch[]
  userId: string
}

export function BatchManagementClient({ batches: initialBatches, userId }: BatchManagementClientProps) {
  const [batches, setBatches] = useState<Batch[]>(initialBatches)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleArchiveBatch = async (batchId: string) => {
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('batches')
        .update({ status: 'Archived' })
        .eq('id', batchId)

      if (updateError) throw updateError

      setBatches(batches.map((b) => (b.id === batchId ? { ...b, status: 'Archived' } : b)))
      setSuccess('Batch archived successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Archive error:', err)
      setError('Failed to archive batch')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchCreated = (newBatch: Batch) => {
    setBatches([newBatch, ...batches])
    setSuccess('Batch created successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage student batches
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Messages */}
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
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </Card>
      )}

      {/* Batches Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Year/Sem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fee Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    No batches created yet
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{batch.batch_name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {batch.batch_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {batch.academic_year} / Sem {batch.semester}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">Rs. {batch.fee_amount}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {new Date(batch.fee_deadline).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          batch.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedBatch(batch)
                          setShowStudentModal(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      {batch.status === 'Active' && (
                        <Button
                          onClick={() => handleArchiveBatch(batch.id)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <BatchCreateModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onBatchCreated={handleBatchCreated}
        />
      )}

      {showStudentModal && selectedBatch && (
        <BatchStudentModal
          batch={selectedBatch}
          onClose={() => {
            setShowStudentModal(false)
            setSelectedBatch(null)
          }}
        />
      )}
    </div>
  )
}
