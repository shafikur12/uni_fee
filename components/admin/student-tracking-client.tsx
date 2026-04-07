'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Student {
  id: string
  registration_number: string
  name: string | null
  batches: {
    batch_name: string
  }
  fee_submissions: Array<{
    status: string
    amount: number
  }>
}

interface StudentTrackingClientProps {
  students: Student[]
}

export function StudentTrackingClient({ students: initialStudents }: StudentTrackingClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)

  const filteredStudents = initialStudents.filter((student) => {
    const query = searchTerm.toLowerCase()
    return (
      student.registration_number.toLowerCase().includes(query) ||
      student.batches?.batch_name?.toLowerCase().includes(query) ||
      (student.name || '').toLowerCase().includes(query)
    )
  })

  const handleExportCSV = () => {
    const csv = [
      ['Registration Number', 'Student Name', 'Batch', 'Total Submissions', 'Approved', 'Exam Eligible'],
      ...filteredStudents.map((s) => [
        s.registration_number,
        s.name || 'Student',
        s.batches?.batch_name || 'N/A',
        s.fee_submissions?.length || 0,
        s.fee_submissions?.filter((f) => f.status === 'Approved').length || 0,
        s.fee_submissions?.some((f) => f.status === 'Approved') ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-tracking-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const openSubmissions = (student: Student) => {
    setLoadingStudentId(student.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Tracking</h1>
          <p className="text-gray-600 mt-2">Track student fees and exam eligibility</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Input
        placeholder="Search by registration number, name, or batch..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Exam Eligible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const approved = student.fee_submissions?.filter((f) => f.status === 'Approved') || []
                  const submissionCount = student.fee_submissions?.length || 0
                  const isEligible = approved.length > 0

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {student.registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {student.name || 'Student'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {student.batches?.batch_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {submissionCount} submissions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submissionCount === 0 ? (
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        ) : approved.length > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            {approved.length} Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submissionCount === 0 ? (
                          <Badge className="bg-gray-100 text-gray-700">N/A</Badge>
                        ) : (
                          <Badge
                            className={
                              isEligible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {isEligible ? 'Yes' : 'No'}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          onClick={() => openSubmissions(student)}
                          disabled={loadingStudentId === student.id}
                        >
                          <Link href={`/admin/student-tracking/${student.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Submissions
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
