'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle2, Package } from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardClientProps {
  metrics: {
    totalSubmissions: number
    pendingSubmissions: number
    approvedSubmissions: number
    totalBatches: number
  }
  userRole: string
}

const sampleData = [
  { name: 'Mon', submissions: 45, approvals: 30 },
  { name: 'Tue', submissions: 52, approvals: 38 },
  { name: 'Wed', submissions: 48, approvals: 32 },
  { name: 'Thu', submissions: 61, approvals: 45 },
  { name: 'Fri', submissions: 55, approvals: 40 },
  { name: 'Sat', submissions: 32, approvals: 25 },
  { name: 'Sun', submissions: 28, approvals: 18 },
]

export function AdminDashboardClient({ metrics, userRole }: AdminDashboardClientProps) {
  const rejectedSubmissions = metrics.totalSubmissions - metrics.pendingSubmissions - metrics.approvedSubmissions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Role: {userRole}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.totalSubmissions}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {metrics.pendingSubmissions}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {metrics.approvedSubmissions}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {metrics.totalBatches}
              </p>
            </div>
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
      </div>

      {/* Approval Rate */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Rate</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {metrics.totalSubmissions > 0
                ? Math.round((metrics.approvedSubmissions / metrics.totalSubmissions) * 100)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {metrics.totalSubmissions > 0
                ? Math.round((metrics.pendingSubmissions / metrics.totalSubmissions) * 100)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {metrics.totalSubmissions > 0
                ? Math.round((rejectedSubmissions / metrics.totalSubmissions) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Submissions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#3b82f6" name="Total Submissions" />
              <Bar dataKey="approvals" fill="#10b981" name="Approvals" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="approvals"
                stroke="#10b981"
                name="Approvals"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/admin/batches" className="p-4 bg-white rounded-lg hover:shadow-md transition">
            <p className="font-medium text-gray-900">Manage Batches</p>
            <p className="text-sm text-gray-600">Create and configure student batches</p>
          </Link>
          <Link href="/admin/verification-queue" className="p-4 bg-white rounded-lg hover:shadow-md transition">
            <p className="font-medium text-gray-900">Verification Queue</p>
            <p className="text-sm text-gray-600">Review pending submissions</p>
          </Link>
          <Link href="/admin/student-tracking" className="p-4 bg-white rounded-lg hover:shadow-md transition">
            <p className="font-medium text-gray-900">Student Tracking</p>
            <p className="text-sm text-gray-600">Track student fees and progress</p>
          </Link>
        </div>
      </Card>
    </div>
  )
}
