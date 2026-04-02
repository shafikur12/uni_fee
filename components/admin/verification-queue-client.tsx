'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react'
import { ReceiptReviewModal } from './receipt-review-modal'

interface Submission {
  id: string
  student_id: string
  batch_id: string
  submission_date: string
  amount: number
  bank_name: string
  transaction_id: string
  payment_reference: string
  status: string
  students: {
    user_id: string
    registration_number: string
    semester: number
  }
  batches: {
    batch_name: string
    fee_amount: number
  }
  uploaded_receipts: Array<{
    file_url: string
    file_type: string
    file_size: number
    storage_path?: string | null
  }>
}

interface VerificationQueueClientProps {
  submissions: Submission[]
  userId: string
}

export function VerificationQueueClient({
  submissions: initialSubmissions,
  userId,
}: VerificationQueueClientProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const filteredSubmissions = submissions.filter((sub) => {
    const query = searchTerm.toLowerCase()
    return (
      sub.students.registration_number.toLowerCase().includes(query) ||
      sub.batches.batch_name.toLowerCase().includes(query) ||
      sub.transaction_id.toLowerCase().includes(query)
    )
  })

  const handleApprove = async (submissionId: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/fee-submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, actorId: userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to approve submission')
      }

      // Remove from list
      setSubmissions(submissions.filter((s) => s.id !== submissionId))
      setSuccess('Submission approved and permission slip generated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Approval error:', err)
      setError('Failed to approve submission')
    } finally {
      setLoading(false)
      setSelectedSubmission(null)
    }
  }

  const handleReject = async (submissionId: string, reason: string) => {
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('fee_submissions')
        .update({
          status: 'Rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq('id', submissionId)

      if (updateError) throw updateError

      const submission = submissions.find((s) => s.id === submissionId)
      if (submission) {
        await supabase.from('audit_logs').insert({
          actor_id: userId,
          action_type: 'reject',
          target_table: 'fee_submissions',
          target_id: submissionId,
          batch_id: submission.batch_id,
          new_value: { status: 'Rejected', reason },
        })
      }

      setSubmissions(submissions.filter((s) => s.id !== submissionId))
      setSuccess('Submission rejected and student notified')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Rejection error:', err)
      setError('Failed to reject submission')
    } finally {
      setLoading(false)
      setSelectedSubmission(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Verification Queue</h1>
        <p className="text-gray-600 mt-2">
          Review and approve pending fee submissions ({filteredSubmissions.length})
        </p>
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

      {/* Search */}
      <div>
        <Input
          placeholder="Search by student ID, batch, or transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">All caught up!</p>
            <p className="text-gray-600">No pending submissions to review</p>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">
                      {submission.students.registration_number}
                    </p>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Batch</p>
                      <p className="font-medium text-gray-900">
                        {submission.batches.batch_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">Rs. {submission.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bank</p>
                      <p className="font-medium text-gray-900">{submission.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {submission.uploaded_receipts?.[0] && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{submission.uploaded_receipts[0].file_type}</span>
                      <span>
                        ({(submission.uploaded_receipts[0].file_size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedSubmission(submission)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <ReceiptReviewModal
          submission={selectedSubmission}
          onApprove={() => handleApprove(selectedSubmission.id)}
          onReject={(reason) => handleReject(selectedSubmission.id, reason)}
          onClose={() => setSelectedSubmission(null)}
          loading={loading}
        />
      )}
    </div>
  )
}
