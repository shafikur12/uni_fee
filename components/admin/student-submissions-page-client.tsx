'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)

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
                  <th className="text-left px-4 py-2">Actions</th>
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
                    <td className="px-4 py-2 space-x-3">
                      <Link
                        className="text-indigo-600 hover:text-indigo-700"
                        href={`/admin/student-tracking/submissions/${sub.id}?studentId=${student.id}`}
                      >
                        View
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteLoadingId === sub.id}
                        onClick={async () => {
                          if (!window.confirm('Delete this submission? This cannot be undone.')) return
                          setDeleteLoadingId(sub.id)
                          try {
                            const res = await fetch('/api/admin/submissions/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ submissionId: sub.id, actorId: student.id }),
                            })
                            const data = await res.json()
                            if (!res.ok) throw new Error(data?.error || 'Failed to delete submission')
                            setSubmissions(submissions.filter((s) => s.id !== sub.id))
                          } catch (err) {
                            console.error(err)
                            alert('Failed to delete submission')
                          } finally {
                            setDeleteLoadingId(null)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 inline-block mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}