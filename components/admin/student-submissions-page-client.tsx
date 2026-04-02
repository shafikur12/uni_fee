'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  registration_number: string
  name: string | null
}

interface StudentSubmissionsPageClientProps {
  student: Student
}

export function StudentSubmissionsPageClient({ student }: StudentSubmissionsPageClientProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptType, setReceiptType] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setSubmissionsLoading(true)
      setSubmissionsError('')
      try {
        const res = await fetch(`/api/admin/students/submissions?studentId=${student.id}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load submissions')
        }
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
        setSubmissions([])
        setSubmissionsError('Failed to load submissions')
      } finally {
        setSubmissionsLoading(false)
      }
    }

    load()
  }, [student.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/student-tracking">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">
            Submissions for {student.name || 'Student'}
          </h1>
          <p className="text-gray-600 mt-1">{student.registration_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
            Submissions List
          </div>
          <div className="max-h-[520px] overflow-auto">
            {submissionsLoading ? (
              <div className="p-4 text-sm text-gray-600">Loading submissions...</div>
            ) : submissionsError ? (
              <div className="p-4 text-sm text-red-600">{submissionsError}</div>
            ) : submissions.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No submissions found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2">Submission ID</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{sub.id}</td>
                      <td className="px-4 py-2">
                        {sub.submission_date
                          ? new Date(sub.submission_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2">{sub.status}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-700"
                          onClick={async () => {
                            setDetailLoading(true)
                            try {
                              const res = await fetch(`/api/admin/submissions/detail?id=${sub.id}`)
                              const data = await res.json()
                              setSelectedSubmission(data.submission || sub)
                            } finally {
                              setDetailLoading(false)
                            }
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Submission Details
          </div>
          {detailLoading ? (
            <div className="text-sm text-gray-600">Loading details...</div>
          ) : selectedSubmission ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span className="text-gray-900">{selectedSubmission.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Submission ID:</span>{' '}
                <span className="text-gray-900">{selectedSubmission.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>{' '}
                <span className="text-gray-900">{selectedSubmission.amount}</span>
              </div>
              <div>
                <span className="text-gray-500">Student:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.students?.name || student.name || 'Student'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Student Email:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.student_email || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Semester:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.students?.current_semester ?? 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Bank:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.bank_name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Transaction ID:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.transaction_id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Payment Ref:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.payment_reference || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.submission_date
                    ? new Date(selectedSubmission.submission_date).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Reviewed:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.reviewed_at
                    ? new Date(selectedSubmission.reviewed_at).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Reason:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.rejection_reason || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Batch:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.batches?.batch_name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Receipt:</span>{' '}
                <span className="text-gray-900">
                  {selectedSubmission.uploaded_receipts?.[0]?.file_type || 'N/A'}
                </span>
              </div>
              {selectedSubmission.uploaded_receipts?.[0]?.file_url && (
                <div>
                  <button
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={() => {
                      setReceiptUrl(selectedSubmission.uploaded_receipts[0].file_url)
                      setReceiptType(selectedSubmission.uploaded_receipts[0].file_type || null)
                      setReceiptOpen(true)
                    }}
                  >
                    View Receipt
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Select a submission to view details.</div>
          )}
        </Card>
      </div>

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
