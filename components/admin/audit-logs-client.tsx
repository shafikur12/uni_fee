'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import Link from 'next/link'

interface AuditLog {
  id: string
  action_type: string
  target_table?: string
  timestamp: string
  actor_id: string
  target_id?: string | null
  new_value?: any
  old_value?: any
  submission_reference?: {
    id: string
    student_name: string | null
    registration_number: string | null
    student_email?: string | null
  } | null
  submission_target_id?: string | null
}

interface AuditLogsClientProps {
  logs: AuditLog[]
}

export function AuditLogsClient({ logs: initialLogs }: AuditLogsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const latestBySubmission = new Map<string, AuditLog>()
  for (const log of initialLogs) {
    const submissionId = (log as any).submission_target_id || log.target_id || null
    if (log.target_table === 'fee_submissions' && submissionId) {
      const existing = latestBySubmission.get(submissionId)
      if (!existing || new Date(log.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        latestBySubmission.set(submissionId, log)
      }
    }
  }

  const filteredLogs = initialLogs.filter((log) => {
    const submissionId = (log as any).submission_target_id || log.target_id || null
    if (log.target_table === 'fee_submissions' && submissionId) {
      const latest = latestBySubmission.get(submissionId)
      if (latest && latest.id !== log.id) return false
    }
    const query = searchTerm.toLowerCase()
    return (
      log.action_type.toLowerCase().includes(query) ||
      (log.target_table || '').toLowerCase().includes(query) ||
      (log.submission_reference?.student_name || '').toLowerCase().includes(query) ||
      (log.submission_reference?.registration_number || '').toLowerCase().includes(query) ||
      (log.submission_reference?.student_email || '').toLowerCase().includes(query)
    )
  })

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'approve':
        return 'bg-green-100 text-green-800'
      case 'reject':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatKey = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const pickDetails = (log: AuditLog) => {
    const source = log.new_value && typeof log.new_value === 'object' ? log.new_value : log.old_value
    if (!source || typeof source !== 'object') return []
    const entries = Object.entries(source as Record<string, any>)
    return entries.map(([key, value]) => ({
      key,
      label: formatKey(key),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }))
  }

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime()
    const bTime = new Date(b.timestamp).getTime()
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">Track all system actions and changes</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by action, entity, or student..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Student Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                    No logs found
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => {
                  const details = pickDetails(log)
                  const statusItem = details.find((item) => item.key === 'status')
                  const isRejected =
                    statusItem && String(statusItem.value).toLowerCase() === 'rejected'
                  const reasonItem = details.find((item) => item.key === 'reason')
                  const isPendingStatus =
                    statusItem && String(statusItem.value).toLowerCase() === 'pending'
                  const resolvedSubmissionId = log.submission_target_id || log.target_id || null
                  const isSubmission = !!resolvedSubmissionId
                  const isDeleted =
                    log.action_type.toLowerCase() === 'delete' ||
                    (statusItem && String(statusItem.value).toLowerCase() === 'deleted')
                  const canViewSubmission = Boolean(resolvedSubmissionId && !isDeleted)
                  const fallbackEmail =
                    (log.new_value && log.new_value.student_email) ||
                    (log.old_value && log.old_value.student_email) ||
                    null
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getActionBadgeColor(log.action_type)}>
                          {log.action_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.target_table || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {isSubmission
                          ? log.submission_reference?.student_email || fallbackEmail || 'N/A'
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {isRejected ? (
                          <>
                            {reasonItem && (
                              <div className="truncate">
                                <span className="text-gray-500">Reason:</span>{' '}
                                <span className="text-gray-900">{reasonItem.value}</span>
                              </div>
                            )}
                            {statusItem && (
                              <div className="truncate">
                                <span className="text-gray-500">Status:</span>{' '}
                                <span className="text-gray-900">{statusItem.value}</span>
                              </div>
                            )}
                            {!reasonItem && !statusItem && (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </>
                        ) : statusItem ? (
                          <div className="truncate">
                            <span className="text-gray-500">Status:</span>{' '}
                            <span className="text-gray-900">{statusItem.value}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {isSubmission ? (
                          canViewSubmission ? (
                            <Link
                              className="text-indigo-600 hover:text-indigo-700"
                              href={`/admin/submissions/${resolvedSubmissionId}`}
                            >
                              View
                            </Link>
                          ) : (
                            <span className="text-gray-400 cursor-not-allowed select-none">
                              View
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
