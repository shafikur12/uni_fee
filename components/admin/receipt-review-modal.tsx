'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Check, AlertCircle, Loader2, ZoomIn, ZoomOut } from 'lucide-react'

interface Submission {
  id: string
  submission_date: string
  amount: number
  bank_name: string
  transaction_id: string
  payment_reference: string
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

interface ReceiptReviewModalProps {
  submission: Submission
  onApprove: () => void
  onReject: (reason: string) => void
  onClose: () => void
  loading: boolean
}

export function ReceiptReviewModal({
  submission,
  onApprove,
  onReject,
  onClose,
  loading,
}: ReceiptReviewModalProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [zoom, setZoom] = useState(1)
  const receipt = submission.uploaded_receipts?.[0]
  const hasRequiredAmount =
    typeof submission.batches?.fee_amount === 'number' && submission.batches.fee_amount > 0

  const directUrl = receipt?.file_url?.trim() || null
  const receiptSrc = directUrl
    ? directUrl
    : receipt?.storage_path
      ? `/api/blob?path=${encodeURIComponent(receipt.storage_path)}`
      : null

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rejectReason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters')
      return
    }
    onReject(rejectReason)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Receipt</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Image */}
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Receipt Preview</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                    variant="outline"
                    size="sm"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-gray-600 w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    onClick={() => setZoom(Math.min(2, zoom + 0.2))}
                    variant="outline"
                    size="sm"
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center bg-white rounded h-96 overflow-auto">
                {receipt?.file_type === 'application/pdf' ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">PDF Preview not available</p>
                    {receiptSrc ? (
                      <a
                        href={receiptSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        No file available for this receipt.
                      </p>
                    )}
                  </div>
                ) : receiptSrc ? (
                  <img
                    src={receiptSrc}
                    alt="Receipt"
                    style={{ transform: `scale(${zoom})` }}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No receipt file available</p>
                  </div>
                )}
              </div>

              {receipt && (
                <p className="text-xs text-gray-500 mt-2">
                  Size: {(receipt.file_size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>

            {/* Student & Payment Details */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Student Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Registration Number</p>
                    <p className="font-medium text-gray-900">
                      {submission.students.registration_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Semester</p>
                    <p className="font-medium text-gray-900">
                      {submission.students.semester}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Batch & Fee Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Batch</p>
                    <p className="font-medium text-gray-900">
                      {submission.batches.batch_name}
                    </p>
                  </div>
                  {hasRequiredAmount && (
                    <div>
                      <p className="text-gray-600">Required Amount</p>
                      <p className="font-medium text-gray-900">
                        Tk. {submission.batches.fee_amount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Submitted Amount</p>
                    <p className="font-medium text-gray-900">Tk. {submission.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bank</p>
                    <p className="font-medium text-gray-900">{submission.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-900 bg-gray-100 p-2 rounded">
                      {submission.transaction_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Reference</p>
                    <p className="font-mono text-xs text-gray-900 bg-gray-100 p-2 rounded">
                      {submission.payment_reference}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Check */}
              {hasRequiredAmount &&
                (submission.amount >= submission.batches.fee_amount ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      Amount is sufficient for batch fees
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Amount is less than required (Short by Tk.{' '}
                      {submission.batches.fee_amount - submission.amount})
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 border-t pt-6">
            {!showRejectForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={onApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (minimum 10 characters)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Receipt is unclear, Payment amount is insufficient..."
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectReason('')
                    }}
                    variant="outline"
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || rejectReason.trim().length < 10}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Confirm Rejection'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}