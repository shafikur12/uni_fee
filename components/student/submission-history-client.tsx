'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'
import { useState } from 'react'

interface Submission {
  id: string
  status: string
  submission_date: string
  amount: number
  verified_at?: string
  rejection_reason?: string
  batches: {
    batch_name: string
  }
}

export function SubmissionHistoryClient({ submissions }: { submissions: Submission[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Eye className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submission History</h1>
        <p className="text-gray-600 mt-2">
          View all your payment submissions and their status
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No submissions yet</p>
          <p className="text-sm text-gray-500">
            Upload your first receipt to get started
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="p-4 cursor-pointer hover:shadow-md transition"
              onClick={() =>
                setSelectedSubmission(
                  selectedSubmission?.id === submission.id ? null : submission
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.batches?.batch_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tk. {submission.amount} •{' '}
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(submission.status)}>
                  {submission.status}
                </Badge>
              </div>

              {selectedSubmission?.id === submission.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(submission.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">Tk. {submission.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">{submission.status}</p>
                    </div>
                    {submission.verified_at && (
                      <div>
                        <p className="text-gray-600">Verified</p>
                        <p className="font-medium text-gray-900">
                          {new Date(submission.verified_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {submission.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm font-medium text-red-700 mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-600">
                        {submission.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
