'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Upload,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface FeeSubmission {
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

interface PermissionSlip {
  id: string
  generated_at: string
  verification_code: string
}

interface Student {
  id: string
  registration_number: string
  semester: number
  batches: {
    batch_name: string
    fee_amount: number
    fee_deadline: string
    late_fee_percentage: number
  }
}

export function StudentDashboardClient({
  user,
  student,
  submissions = [],
  slips = [],
}: {
  user: User
  student: Student
  submissions: FeeSubmission[]
  slips: PermissionSlip[]
}) {
  const latestSubmission = submissions[0]
  const batch = student.batches

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      case 'pending':
        return <Clock className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const daysUntilDeadline = batch
    ? Math.ceil(
        (new Date(batch.fee_deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.user_metadata?.full_name || 'Student'}!</h1>
        <p className="text-gray-600 mt-2">Student ID: {student.registration_number} | Semester: {student.semester}</p>
      </div>

      {/* Batch Info Card */}
      {batch && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Batch</p>
              <p className="text-lg font-semibold text-gray-900">{batch.batch_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Amount</p>
              <p className="text-lg font-semibold text-gray-900">Rs. {batch.fee_amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(batch.fee_deadline).toLocaleDateString()}
              </p>
              {daysUntilDeadline !== null && (
                <p
                  className={`text-sm mt-1 ${
                    daysUntilDeadline <= 7 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {daysUntilDeadline > 0
                    ? `${daysUntilDeadline} days remaining`
                    : 'Deadline passed'}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Late Fee</p>
              <p className="text-lg font-semibold text-gray-900">
                {batch.late_fee_percentage}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="text-2xl font-bold mt-2 text-gray-900">
                {submissions.length} Submissions
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {submissions.filter((s) => s.status === 'Approved').length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Permission Slips</p>
              <p className="text-2xl font-bold mt-2 text-indigo-600">
                {slips.length}
              </p>
            </div>
            <Download className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
      </div>

      {/* Latest Submission */}
      {latestSubmission && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Submission</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch</p>
                <p className="font-medium text-gray-900">
                  {latestSubmission.batches?.batch_name}
                </p>
              </div>
              <div className={`flex items-center gap-2 ${getStatusColor(latestSubmission.status)}`}>
                {getStatusIcon(latestSubmission.status)}
                <span className="font-medium capitalize">
                  {latestSubmission.status}
                </span>
              </div>
            </div>

            {latestSubmission.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700">
                  <strong>Rejection reason:</strong> {latestSubmission.rejection_reason}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Submitted on{' '}
              {new Date(latestSubmission.submission_date).toLocaleDateString()}
            </p>

            <div className="flex gap-2 pt-4">
              <Link href="/student/upload">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Receipt
                </Button>
              </Link>
              <Link href="/student/history">
                <Button variant="outline" size="sm">
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* No Submission */}
      {submissions.length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No submissions yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload your payment receipt to get started
          </p>
          <Link href="/student/upload">
            <Button>Upload Receipt</Button>
          </Link>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/student/upload">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Upload Receipt
            </Button>
          </Link>
          <Link href="/student/slips">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Permission Slip
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
