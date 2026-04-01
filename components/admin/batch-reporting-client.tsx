'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { TrendingUp, TrendingDown, Download } from 'lucide-react'

interface Batch {
  id: string
  batch_name: string
  academic_year: string
  semester: number
  fee_amount: number
  created_at: string
  fee_submissions: Array<{
    id: string
    status: string
    amount: number
    created_at: string
  }>
}

interface BatchReportingClientProps {
  batches: Batch[]
}

export function BatchReportingClient({ batches }: BatchReportingClientProps) {
  const [selectedBatches, setSelectedBatches] = useState<string[]>(
    batches.slice(0, 2).map((b) => b.id)
  )

  const calculateMetrics = (batch: Batch) => {
    const submissions = batch.fee_submissions || []
    const approved = submissions.filter((s) => s.status === 'Approved').length
    const pending = submissions.filter((s) => s.status === 'Pending').length
    const rejected = submissions.filter((s) => s.status === 'Rejected').length
    const totalAmount = submissions
      .filter((s) => s.status === 'Approved')
      .reduce((sum, s) => sum + s.amount, 0)

    return {
      total: submissions.length,
      approved,
      pending,
      rejected,
      approvalRate: submissions.length > 0 ? Math.round((approved / submissions.length) * 100) : 0,
      totalAmount,
    }
  }

  const comparisonData = useMemo(() => {
    const rows = selectedBatches.map((batchId) => {
      const batch = batches.find((b) => b.id === batchId)
      if (!batch) return null
      const metrics = calculateMetrics(batch)
      return {
        name: batch.batch_name,
        ...metrics,
      }
    })
    return rows.filter((row): row is NonNullable<(typeof rows)[number]> => row !== null)
  }, [selectedBatches, batches])

  const timelineData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    return months.map((month, idx) => {
      let submissions = 0
      let approvals = 0

      selectedBatches.forEach((batchId) => {
        const batch = batches.find((b) => b.id === batchId)
        if (batch?.fee_submissions) {
          batch.fee_submissions.forEach((sub) => {
            const date = new Date(sub.created_at)
            if (date.getMonth() === idx) {
              submissions++
              if (sub.status === 'Approved') approvals++
            }
          })
        }
      })

      return { month, submissions, approvals }
    })
  }, [selectedBatches, batches])

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    )
  }

  const handleExportReport = () => {
    const reportData = comparisonData.map((batch) => ({
      ...batch,
      year: batches.find((b) => b.batch_name === batch.name)?.academic_year,
    }))

    const csv = [
      ['Batch', 'Academic Year', 'Total Submissions', 'Approved', 'Pending', 'Rejected', 'Approval Rate %', 'Total Amount'],
      ...reportData.map((b) => [
        b.name,
        batches.find((batch) => batch.batch_name === b.name)?.academic_year || 'N/A',
        b.total,
        b.approved,
        b.pending,
        b.rejected,
        `${b.approvalRate}%`,
        `Rs. ${b.totalAmount}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Reporting & Analysis</h1>
          <p className="text-gray-600 mt-2">Compare batch performance and trends</p>
        </div>
        <Button onClick={handleExportReport} className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Batch Selector */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Batches to Compare</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((batch) => (
            <button
              key={batch.id}
              onClick={() => handleToggleBatch(batch.id)}
              className={`p-3 rounded-lg border-2 text-left transition ${
                selectedBatches.includes(batch.id)
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{batch.batch_name}</p>
              <p className="text-sm text-gray-600">{batch.academic_year}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Comparison Metrics */}
      {comparisonData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.map((batch) => (
              <Card key={batch.name} className="p-4">
                <p className="text-sm text-gray-600 mb-2">{batch.name}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{batch.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Approval Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-green-600">{batch.approvalRate}%</p>
                      {batch.approvalRate >= 80 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Batch</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Total</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Approved</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Pending</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Rejected</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Approval Rate</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((batch) => (
                    <tr key={batch.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{batch.name}</td>
                      <td className="px-4 py-3 text-gray-600">{batch.total}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {batch.approved}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {batch.pending}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {batch.rejected}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{batch.approvalRate}%</td>
                      <td className="px-4 py-3 text-gray-900">Rs. {batch.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Submissions by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" fill="#10b981" name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Approval Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="#3b82f6"
                    name="Total Submissions"
                  />
                  <Line type="monotone" dataKey="approvals" stroke="#10b981" name="Approvals" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {selectedBatches.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Select batches to view comparison metrics</p>
        </Card>
      )}
    </div>
  )
}
