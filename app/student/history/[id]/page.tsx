import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/db-helpers'
import { createClient } from '@/lib/supabase/server'
import { StudentSubmissionDetailClient } from '@/components/student/student-submission-detail-client'

export const metadata = {
  title: 'Submission Details - Student Portal',
  description: 'View a single submission in detail',
}

export default async function StudentSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const { id } = await params

  const { data: submission } = await supabase
    .from('fee_submissions')
    .select(
      'id, status, submission_date, amount, bank_name, transaction_id, payment_reference, reviewed_at, rejection_reason, batches(batch_name), uploaded_receipts(file_url, file_type, file_size, storage_path)'
    )
    .eq('id', id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Submission not found.</p>
      </div>
    )
  }

  return <StudentSubmissionDetailClient submission={submission} />
}