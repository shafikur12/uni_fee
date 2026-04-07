'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  Calendar,
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
  student_email?: string | null
  students: {
    user_id: string
    registration_number: string
    semester: number
    name?: string | null
    email?: string | null
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

const PAGE_SIZE = 8

const statusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes('approve')) return 'bg-emerald-100 text-emerald-800'
  if (normalized.includes('reject')) return 'bg-rose-100 text-rose-800'
  return 'bg-amber-100 text-amber-800'
}

export function VerificationQueueClient({ submissions: initialSubmissions, userId }: VerificationQueueClientProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptType, setReceiptType] = useState<string | null>(null)

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.toLowerCase()
    let items = submissions

    if (statusFilter !== 'all') {
      items = items.filter((sub) => sub.status.toLowerCase() === statusFilter)
    }

    if (query) {
      items = items.filter((sub) => {
        return (
          sub.students.registration_number.toLowerCase().includes(query) ||
          sub.batches.batch_name.toLowerCase().includes(query) ||
          sub.transaction_id.toLowerCase().includes(query) ||
          (sub.students.name || '').toLowerCase().includes(query) ||
          (sub.student_email || '').toLowerCase().includes(query)
        )
      })
    }

    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00.000Z`).getTime()
      items = items.filter((sub) => new Date(sub.submission_date).getTime() >= from)
    }

    if (toDate) {
      const to = new Date(`${toDate}T23:59:59.999Z`).getTime()
      items = items.filter((sub) => new Date(sub.submission_date).getTime() <= to)
    }

    return items
  }, [submissions, searchTerm, statusFilter, fromDate, toDate])

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE))
  const pagedSubmissions = filteredSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      const response = await fetch('/api/admin/fee-submissions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, actorId: userId, reason }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to reject submission')
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Verification Queue</h1>
          <p className="text-gray-500 mt-2">Review and approve pending fee submissions</p>
        </div>
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

      {/* Search and Filters */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by student ID, name, email, batch, or transaction ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="h-9 text-sm text-slate-700 focus:outline-none"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setPage(1)
                }}
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                className="h-9 text-sm text-slate-700 focus:outline-none"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card className="p-10 text-center border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">All caught up!</p>
            <p className="text-gray-500">No submissions match your filters.</p>
          </Card>
        ) : (
          pagedSubmissions.map((submission) => (
            <Card key={submission.id} className="p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col gap-4">
                {/* Top Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {submission.students.registration_number}
                    </p>
                    <Badge className={statusBadgeClass(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(submission.submission_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="text-xs text-gray-500">Student Name</p>
                    <p className="font-medium text-gray-900">
                      {submission.students.name || 'Student'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Student Email</p>
                    <p className="font-medium text-gray-900">
                      {submission.student_email || submission.students.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Batch</p>
                    <p className="font-medium text-gray-900">{submission.batches.batch_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-lg text-gray-900">Tk. {submission.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bank</p>
                    <p className="font-medium text-gray-900">{submission.bank_name}</p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {submission.uploaded_receipts?.[0] ? (
                      <>
                        <FileText className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {submission.uploaded_receipts[0].file_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(submission.uploaded_receipts[0].file_size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                          onClick={() => {
                            setReceiptUrl(submission.uploaded_receipts[0].file_url)
                            setReceiptType(submission.uploaded_receipts[0].file_type || null)
                            setReceiptOpen(true)
                          }}
                        >
                          View
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No attachment</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setSelectedSubmission(submission)}
                      disabled={loading}
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredSubmissions.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredSubmissions.length)} of{' '}
            {filteredSubmissions.length}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Receipt Preview */}
      {receiptOpen && receiptUrl && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl border border-white/30 shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-white/20 bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold text-gray-700">Receipt Preview</div>
              <div className="flex items-center gap-3">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setReceiptOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-white/80 backdrop-blur">
              {receiptType === 'application/pdf' ? (
                <iframe
                  src={receiptUrl}
                  className="w-full h-[70vh] bg-white"
                  title="Receipt PDF"
                />
              ) : (
                <img src={receiptUrl} alt="Receipt" className="max-w-full max-h-[70vh]" />
              )}
            </div>
          </Card>
        </div>
      )}

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