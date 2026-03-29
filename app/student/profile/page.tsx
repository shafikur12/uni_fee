import { getCurrentUser, getStudentProfile } from '@/lib/db-helpers'
import { redirect } from 'next/navigation'
import { StudentProfileClient } from '@/components/student/student-profile-client'

export const metadata = {
  title: 'Profile - University Fee System',
  description: 'Manage your profile information',
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getStudentProfile(user.id)

  return (
    <StudentProfileClient
      user={user}
      profile={profile}
    />
  )
}
