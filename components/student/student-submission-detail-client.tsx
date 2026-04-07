'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SubmissionDetail {
  id: string
  status: string
  submission_date: string
  amount: number
  bank_name: string
  transaction_id: string
  payment_reference: string
  reviewed_at?: string | null
  rejection_reason?: string | null
  batches: {
    batch_name: string
  } | null
  uploaded_receipts: Array<{
    file_url: string
    file_type: string
    file_size: number
    storage_path?: string | null
  }>
}

export function StudentSubmissionDetailClient({
  submission,
}: {
  submission: SubmissionDetail
}) {
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptType, setReceiptType] = useState<string | null>(null)

  const receipt = submission.uploaded_receipts?.[0]
  const directUrl = receipt?.file_url?.trim() || null
  const receiptSrc = directUrl
    ? directUrl
    : receipt?.storage_path
      ? `/api/blob?path=${encodeURIComponent(receipt.storage_path)}`
      : null

  return (
    <div className="space-y-6">
      <div>
        <Link href="/student/history">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Submission Details</h1>
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
              <span className="text-gray-500">Amount:</span>{' '}
              <span className="text-gray-900">Tk. {submission.amount}</span>
            </div>
            <div>
              <span className="text-gray-500">Batch:</span>{' '}
              <span className="text-gray-900">{submission.batches?.batch_name || 'N/A'}</span>
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
            {submission.reviewed_at && (
              <div>
                <span className="text-gray-500">Reviewed:</span>{' '}
                <span className="text-gray-900">
                  {new Date(submission.reviewed_at).toLocaleString()}
                </span>
              </div>
            )}
            {submission.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{submission.rejection_reason}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">Receipt:</span>{' '}
              <span className="text-gray-900">
                {receipt?.file_type || 'N/A'}
              </span>
            </div>
            {receiptSrc ? (
              <button
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                onClick={() => {
                  setReceiptUrl(receiptSrc)
                  setReceiptType(receipt?.file_type || null)
                  setReceiptOpen(true)
                }}
              >
                View Receipt
              </button>
            ) : (
              <span className="text-gray-500 text-sm">No receipt file available</span>
            )}
          </div>
        </div>
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
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-white/80 backdrop-blur">
              {receiptType === 'application/pdf' ? (
                <iframe src={receiptUrl} className="w-full h-[70vh] bg-white" title="Receipt PDF" />
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