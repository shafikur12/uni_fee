import { getCurrentUser, getStudentInfo, getFeeSubmissions, getPermissionSlips } from '@/lib/db-helpers'
import { redirect } from 'next/navigation'
import { StudentDashboardClient } from '@/components/student/student-dashboard-client'

export const metadata = {
  title: 'Dashboard - University Fee System',
  description: 'Student dashboard for fee management and exam permissions',
}

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [student, submissions, slips] = await Promise.all([
    getStudentInfo(user.id),
    getFeeSubmissions(user.id),
    getPermissionSlips(user.id),
  ])

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student profile not found. Please contact support.</p>
      </div>
    )
  }

  return (
    <StudentDashboardClient
      user={user}
      student={student}
      submissions={submissions || []}
      slips={slips || []}
    />
  )
}
