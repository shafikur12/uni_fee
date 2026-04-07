'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
            <Card key={submission.id} className="p-4 hover:shadow-md transition">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.batches?.batch_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tk. {submission.amount} ·{' '}
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                  <Link
                    href={`/student/history/${submission.id}`}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center"
                  >
                    More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}