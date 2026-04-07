'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, Trash2, Copy, Search, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  registration_number: string
  name: string | null
}

interface StudentSubmissionsPageClientProps {
  student: Student
}

const PAGE_SIZE = 8

const statusLabel = (status?: string) => {
  if (!status) return 'Unknown'
  const normalized = status.toLowerCase()
  if (normalized.includes('approve')) return 'Approved'
  if (normalized.includes('reject')) return 'Rejected'
  if (normalized.includes('pending')) return 'Pending'
  return status
}

const statusBadgeClass = (status?: string) => {
  const normalized = (status || '').toLowerCase()
  if (normalized.includes('approve')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (normalized.includes('reject')) return 'bg-rose-50 text-rose-700 border-rose-200'
  if (normalized.includes('pending')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

const shortenId = (id?: string) => {
  if (!id) return 'N/A'
  if (id.length <= 16) return id
  return `${id.slice(0, 8)}...${id.slice(-4)}`
}

export function StudentSubmissionsPageClient({ student }: StudentSubmissionsPageClientProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest')
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    const load = async () => {
      setSubmissionsLoading(true)
      setSubmissionsError('')
      try {
        const params = new URLSearchParams({
          studentId: student.id,
          page: String(page),
          pageSize: String(PAGE_SIZE),
          sort: sortBy,
        })

        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (search.trim()) params.set('q', search.trim())
        if (fromDate) params.set('from', fromDate)
        if (toDate) params.set('to', toDate)

        const res = await fetch(`/api/admin/students/submissions?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load submissions')
        }
        setSubmissions(data.submissions || [])
        setTotalCount(Number(data.total || 0))
      } catch (err) {
        console.error(err)
        setSubmissions([])
        setTotalCount(0)
        setSubmissionsError('Failed to load submissions')
      } finally {
        setSubmissionsLoading(false)
      }
    }

    load()
  }, [student.id, page, sortBy, statusFilter, search, fromDate, toDate, refreshKey])

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1200)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href="/admin/student-tracking">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Submissions for {student.name || 'Student'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {student.registration_number} · {totalCount} submissions
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="h-9 w-64 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none"
              placeholder="Search by ID or status..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as typeof sortBy)
              setPage(1)
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">Sort by status</option>
          </select>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="h-9 text-sm text-slate-700 focus:outline-none"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value)
                setPage(1)
              }}
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              className="h-9 text-sm text-slate-700 focus:outline-none"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700">
          Submissions List
        </div>
        <div className="px-6 py-4">
          {submissionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="h-12 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : submissionsError ? (
            <div className="text-sm text-rose-600">{submissionsError}</div>
          ) : submissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
              <div className="text-sm font-semibold text-slate-700">No submissions found</div>
              <p className="text-xs text-slate-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-slate-400">Submission</span>
                      <span className="text-sm font-mono text-slate-700">{shortenId(sub.id)}</span>
                      <button
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                        onClick={() => handleCopy(sub.id)}
                        type="button"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === sub.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>
                        {sub.submission_date
                          ? new Date(sub.submission_date).toLocaleDateString()
                          : 'No date'}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${statusBadgeClass(sub.status)}`}>
                        {statusLabel(sub.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/student-tracking/submissions/${sub.id}?studentId=${student.id}`}>
                      <Button size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      disabled={deleteLoadingId === sub.id}
                      onClick={() => setConfirmDeleteId(sub.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border border-slate-200">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Delete submission?</h2>
                <p className="text-sm text-slate-500 mt-2">
                  This action cannot be undone. The submission will be permanently removed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleteLoadingId === confirmDeleteId}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={deleteLoadingId === confirmDeleteId}
                  onClick={async () => {
                    const subId = confirmDeleteId
                    if (!subId) return
                    setDeleteLoadingId(subId)
                    try {
                      const res = await fetch('/api/admin/submissions/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ submissionId: subId, actorId: student.id }),
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data?.error || 'Failed to delete submission')
                      if (submissions.length === 1 && page > 1) {
                        setPage(page - 1)
                      }
                      setConfirmDeleteId(null)
                      setRefreshKey((prev) => prev + 1)
                    } catch (err) {
                      console.error(err)
                      alert('Failed to delete submission')
                    } finally {
                      setDeleteLoadingId(null)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}