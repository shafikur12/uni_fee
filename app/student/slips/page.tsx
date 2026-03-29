import { getCurrentUser, getStudentInfo, getPermissionSlips } from '@/lib/db-helpers'
import { redirect } from 'next/navigation'
import { PermissionSlipsClient } from '@/components/student/permission-slips-client'

export const metadata = {
  title: 'Permission Slips - University Fee System',
  description: 'Download your exam permission slips',
}

export default async function SlipsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const student = await getStudentInfo(user.id)

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student profile not found. Please contact support.</p>
      </div>
    )
  }

  const slips = await getPermissionSlips(student.id)

  return <PermissionSlipsClient slips={slips || []} studentName={user.user_metadata?.full_name || 'Student'} />
}
