'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Loader2, Pencil, Trash2, Upload, UserMinus } from 'lucide-react'
import Link from 'next/link'

interface Batch {
  id: string
  batch_name: string
  batch_code: string
  academic_year: string
  semester: string
  status: string
}

interface Student {
  id: string
  registration_number: string
  name: string | null
  current_semester: number | null
  status: string | null
  batch_id: string | null
}

interface BatchStudentsPageClientProps {
  batch: Batch
  students: Student[]
  userId: string
}

export function BatchStudentsPageClient({
  batch,
  students: initialStudents,
  userId,
}: BatchStudentsPageClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [assignMode, setAssignMode] = useState<'single' | 'csv'>('single')
  const [studentEmail, setStudentEmail] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editRegistration, setEditRegistration] = useState('')
  const [editName, setEditName] = useState('')
  const [editSemester, setEditSemester] = useState('')
  const [editStatus, setEditStatus] = useState('Active')

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return students
    return students.filter((s) => {
      return (
        s.registration_number.toLowerCase().includes(query) ||
        (s.name || '').toLowerCase().includes(query)
      )
    })
  }, [searchTerm, students])

  const startEdit = (student: Student) => {
    setEditingStudent(student)
    setEditRegistration(student.registration_number)
    setEditName(student.name || '')
    setEditSemester(String(student.current_semester ?? ''))
    setEditStatus(student.status || 'Active')
  }

  const clearEdit = () => {
    setEditingStudent(null)
    setEditRegistration('')
    setEditName('')
    setEditSemester('')
    setEditStatus('Active')
  }

  const assignStudents = async (emails: string[]) => {
    if (emails.length === 0) return
    setError('')
    setSuccess('')
    setLoadingId('assign')

    try {
      const response = await fetch('/api/admin/batches/assign-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batch.id, emails }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to assign students')
      }

      if (result.added === 0) {
        setError('No matching student accounts found for provided emails')
      } else {
        setSuccess(`Added ${result.added} student(s). Failed: ${result.failed}`)
        setStudentEmail('')
        setCsvFile(null)
        window.location.reload()
      }
    } catch (err) {
      console.error('Assign students error:', err)
      setError('Failed to assign students')
    } finally {
      setLoadingId(null)
    }
  }

  const handleAssignSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = studentEmail.trim()
    if (!email) {
      setError('Please enter a student email')
      return
    }
    await assignStudents([email])
  }

  const handleAssignCsv = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) {
      setError('Please upload a CSV file')
      return
    }
    const text = await csvFile.text()
    const emails = text
      .split('\n')
      .map((line) => line.split(',')[0]?.trim())
      .filter((email) => !!email)
    if (emails.length === 0) {
      setError('No valid email addresses found in CSV')
      return
    }
    await assignStudents(emails)
  }

  const updateStudent = async () => {
    if (!editingStudent) return
    setError('')
    setSuccess('')
    setLoadingId(editingStudent.id)

    try {
      const response = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          registration_number: editRegistration.trim(),
          name: editName.trim(),
          current_semester: editSemester ? parseInt(editSemester, 10) : null,
          status: editStatus,
          updated_by: userId,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to update student')
      }

      setStudents(
        students.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                registration_number: editRegistration.trim(),
                name: editName.trim(),
                current_semester: editSemester ? parseInt(editSemester, 10) : null,
                status: editStatus,
              }
            : s,
        ),
      )
      setSuccess('Student updated successfully')
      clearEdit()
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      console.error('Update student error:', err)
      setError('Failed to update student')
    } finally {
      setLoadingId(null)
    }
  }

  const removeFromBatch = async (student: Student) => {
    if (!window.confirm('Remove this student from the batch?')) return
    setError('')
    setSuccess('')
    setLoadingId(student.id)

    try {
      const response = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          batch_id: null,
          updated_by: userId,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to remove student from batch')
      }

      setStudents(students.filter((s) => s.id !== student.id))
      setSuccess('Student removed from batch')
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      console.error('Remove student error:', err)
      setError('Failed to remove student from batch')
    } finally {
      setLoadingId(null)
    }
  }

  const deleteStudent = async (student: Student) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return
    setError('')
    setSuccess('')
    setLoadingId(student.id)

    try {
      const response = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          deleted_by: userId,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to delete student')
      }

      setStudents(students.filter((s) => s.id !== student.id))
      setSuccess('Student deleted')
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      console.error('Delete student error:', err)
      setError('Failed to delete student')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/batches">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">
            {batch.batch_name} Students
          </h1>
          <p className="text-gray-600 mt-1">
            {batch.batch_code} • {batch.academic_year}
          </p>
        </div>
        <Badge
          className={
            batch.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {batch.status}
        </Badge>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">{success}</p>
        </Card>
      )}

      <Card className="p-4">
        <Input
          placeholder="Search by registration number or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Assign Students</h2>
          <div className="flex gap-2">
            <Button
              variant={assignMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssignMode('single')}
            >
              Single Email
            </Button>
            <Button
              variant={assignMode === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssignMode('csv')}
            >
              CSV Upload
            </Button>
          </div>
        </div>

        {assignMode === 'single' ? (
          <form onSubmit={handleAssignSingle} className="flex flex-col gap-3 md:flex-row">
            <Input
              type="email"
              placeholder="student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={loadingId === 'assign'}
            >
              {loadingId === 'assign' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Student
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAssignCsv} className="flex flex-col gap-3 md:flex-row">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-gray-700"
            />
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={loadingId === 'assign'}
            >
              {loadingId === 'assign' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </>
              )}
            </Button>
          </form>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Reg. No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                    No students found for this batch
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {student.registration_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {student.name || 'Student'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {student.current_semester ?? 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {student.status || 'Active'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(student)}
                        disabled={loadingId === student.id}
                        title="Edit student"
                      >
                        {loadingId === student.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromBatch(student)}
                        disabled={loadingId === student.id}
                        title="Remove from batch"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStudent(student)}
                        disabled={loadingId === student.id}
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Student</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <Input
                    value={editRegistration}
                    onChange={(e) => setEditRegistration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={clearEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={updateStudent}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
