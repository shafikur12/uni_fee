'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Lock } from 'lucide-react'

interface StaffMember {
  id: string
  full_name: string
  role: string
}

interface SettingsClientProps {
  staffMembers: StaffMember[]
  userId: string
}

export function SettingsClient({ staffMembers, userId }: SettingsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Manage system configuration and user accounts</p>
      </div>

      {/* User Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Staff Members
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{member.full_name}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={
                        member.role === 'Admin'
                          ? 'bg-red-100 text-red-800'
                          : member.role === 'Accountant'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {member.id !== userId && (
                      <Button variant="outline" size="sm" disabled>
                        Manage
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          System Configuration
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                University Name
              </label>
              <input
                type="text"
                value="State University"
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                System Email
              </label>
              <input
                type="email"
                value="fees@university.edu"
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Late Fee Percentage
              </label>
              <input
                type="number"
                value="5"
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value="30"
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <Button disabled className="mt-4">
            Update Settings
          </Button>
        </div>
      </Card>

      {/* System Info */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3">System Information</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Version:</span> 1.0.0
          </p>
          <p>
            <span className="font-medium">Last Updated:</span>{' '}
            {new Date().toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Database:</span> Supabase PostgreSQL
          </p>
          <p>
            <span className="font-medium">Status:</span> Operational
          </p>
        </div>
      </Card>
    </div>
  )
}
