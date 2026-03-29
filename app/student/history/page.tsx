import { getCurrentUser, getStudentInfo, getFeeSubmissions } from '@/lib/db-helpers'
import { redirect } from 'next/navigation'
import { SubmissionHistoryClient } from '@/components/student/submission-history-client'

export const metadata = {
  title: 'Submission History - University Fee System',
  description: 'View your payment submission history',
}

export default async function HistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [student, submissions] = await Promise.all([
    getStudentInfo(user.id),
    getFeeSubmissions(user.id),
  ])

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Student profile not found. Please contact support.</p>
      </div>
    )
  }

  return <SubmissionHistoryClient submissions={submissions || []} />
}
