import { getCurrentUser, getStudentInfo } from '@/lib/db-helpers'
import { redirect } from 'next/navigation'
import { ReceiptUploadClient } from '@/components/student/receipt-upload-client'

export const metadata = {
  title: 'Upload Receipt - University Fee System',
  description: 'Upload your payment receipt for fee verification',
}

export default async function UploadPage() {
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

  return <ReceiptUploadClient student={student} userId={user.id} />
}
