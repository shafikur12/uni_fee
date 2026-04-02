'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Upload, CheckCircle2, Loader2 } from 'lucide-react'

interface ReceiptUploadClientProps {
  student: any
  userId: string
}

export function ReceiptUploadClient({ student, userId }: ReceiptUploadClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [bankName, setBankName] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [amount, setAmount] = useState(student.batches?.fee_amount?.toString() || '')
  const [semester, setSemester] = useState(
    student.current_semester ? String(student.current_semester) : '',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    if (!bankName || !transactionId || !paymentReference || !amount || !semester) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      // Upload file to Vercel Blob via API route
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('userId', userId)

      const uploadResponse = await fetch('/api/student/upload-receipt', {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload file')
      }

      const fileUrl: string = uploadResult.url
      const storagePath: string = uploadResult.path

      // Create fee submission
      const { data: submission, error: submissionError } = await supabase
        .from('fee_submissions')
        .insert({
          student_id: student.id,
          batch_id: student.batch_id,
          submission_date: new Date().toISOString(),
          amount: parseFloat(amount),
          bank_name: bankName,
          transaction_id: transactionId,
          payment_reference: paymentReference,
          status: 'Pending',
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      const parsedSemester = parseInt(semester, 10)
      if (Number.isFinite(parsedSemester)) {
        await supabase
          .from('students')
          .update({ current_semester: parsedSemester })
          .eq('id', student.id)
      }

      // Create uploaded receipt record
      const { error: receiptError } = await supabase
        .from('uploaded_receipts')
        .insert({
          submission_id: submission.id,
          file_name: selectedFile.name,
          file_url: fileUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          storage_path: storagePath,
          uploaded_at: new Date().toISOString(),
        })

      if (receiptError) throw receiptError

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Write an audit log entry so admins can see activity in `/admin/audit-logs`.
      // (audit_logs has RLS policy allowing authenticated inserts.)
      await supabase.from('audit_logs').insert({
        actor_id: userId,
        action_type: 'create',
        target_table: 'fee_submissions',
        target_id: submission.id,
        batch_id: student.batch_id,
        new_value: {
          status: 'Pending',
          amount: parseFloat(amount),
          bank_name: bankName,
          transaction_id: transactionId,
          payment_reference: paymentReference,
          submission_id: submission.id,
          student_id: student.id,
          student_email: user?.email || null,
        },
      })

      setSuccess(true)
      setSelectedFile(null)
      setPreview(null)
      setBankName('')
      setTransactionId('')
      setPaymentReference('')
      setSemester('')

      setTimeout(() => {
        setSuccess(false)
      }, 5000)
      setLoading(false)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload receipt. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Payment Receipt</h1>
        <p className="text-gray-600 mt-2">
          Batch: {student.batches?.batch_name} | Fee: Tk.. {student.batches?.fee_amount}
        </p>
      </div>

      {success && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Receipt submitted successfully!</p>
              <p className="text-sm text-green-700">
                Your submission is now pending verification by the accountant.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Receipt Image/PDF *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG, or PDF (max 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              hidden
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., National Bank"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID *
              </label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., TXN123456"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Reference *
              </label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g., Invoice #"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (Tk.) *
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <Input
                type="number"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., 3"
                disabled={loading}
                min="1"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Receipt
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3">Need help?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Upload a clear image or PDF of your payment receipt</li>
          <li>• Ensure all payment details are visible in the image</li>
          <li>• File size must be less than 5MB</li>
          <li>• Our accountant will verify and approve within 24-48 hours</li>
        </ul>
      </Card>
    </div>
  )
}
