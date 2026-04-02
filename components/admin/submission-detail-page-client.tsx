'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SubmissionDetailPageClientProps {
  submissionId: string
}

export function SubmissionDetailPageClient({ submissionId }: SubmissionDetailPageClientProps) {
  const [submission, setSubmission] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptType, setReceiptType] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/admin/submissions/detail?id=${submissionId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load submission')
        setSubmission(data.submission || null)
      } catch (err) {
        console.error(err)
        setError('Failed to load submission')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [submissionId])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/audit-logs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Audit Logs
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Submission Detail</h1>
        {loading ? (
          <div className="text-sm text-gray-600">Loading submission...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : submission ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-gray-500">Submission ID:</span>{' '}
                <span className="text-gray-900">{submission.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span className="text-gray-900">{submission.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Reason:</span>{' '}
                <span className="text-gray-900">{submission.rejection_reason || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>{' '}
                <span className="text-gray-900">{submission.amount}</span>
              </div>
              <div>
                <span className="text-gray-500">Bank:</span>{' '}
                <span className="text-gray-900">{submission.bank_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Transaction ID:</span>{' '}
                <span className="text-gray-900">{submission.transaction_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Payment Ref:</span>{' '}
                <span className="text-gray-900">{submission.payment_reference || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>{' '}
                <span className="text-gray-900">
                  {submission.submission_date
                    ? new Date(submission.submission_date).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Reviewed:</span>{' '}
                <span className="text-gray-900">
                  {submission.reviewed_at
                    ? new Date(submission.reviewed_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created At:</span>{' '}
                <span className="text-gray-900">
                  {submission.created_at
                    ? new Date(submission.created_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated At:</span>{' '}
                <span className="text-gray-900">
                  {submission.updated_at
                    ? new Date(submission.updated_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-500">Student:</span>{' '}
                <span className="text-gray-900">{submission.students?.name || 'Student'}</span>
              </div>
              <div>
                <span className="text-gray-500">Student Email:</span>{' '}
                <span className="text-gray-900">{submission.student_email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Registration:</span>{' '}
                <span className="text-gray-900">
                  {submission.students?.registration_number || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Semester:</span>{' '}
                <span className="text-gray-900">
                  {submission.students?.current_semester ?? 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Batch:</span>{' '}
                <span className="text-gray-900">{submission.batches?.batch_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Receipt:</span>{' '}
                <span className="text-gray-900">
                  {submission.uploaded_receipts?.[0]?.file_type || 'N/A'}
                </span>
              </div>
              {submission.uploaded_receipts?.[0]?.file_url && (
                <div>
                  <button
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={() => {
                      setReceiptUrl(submission.uploaded_receipts[0].file_url)
                      setReceiptType(submission.uploaded_receipts[0].file_type || null)
                      setReceiptOpen(true)
                    }}
                  >
                    View Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Submission not found.</div>
        )}
      </Card>

      {receiptOpen && receiptUrl && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl border border-white/30 shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-white/20 bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold text-gray-700">Receipt Preview</div>
              <div className="flex items-center gap-3">
                <a
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                  href={receiptUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setReceiptOpen(false)}
                >
                  ✕
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
    </div>
  )
}
