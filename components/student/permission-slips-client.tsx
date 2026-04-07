'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PermissionSlip {
  id: string
  generated_at: string
  verification_code: string
  file_url?: string
}

export function PermissionSlipsClient({
  slips: initialSlips,
  studentName,
}: {
  slips: PermissionSlip[]
  studentName: string
}) {
  const [slips, setSlips] = useState<PermissionSlip[]>(initialSlips)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ensureSlip = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/student/slips/ensure', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate slip')
      if (Array.isArray(data.slips)) {
        setSlips(data.slips)
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Unable to generate permission slip yet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ensureSlip()
  }, [])

  const handleDownload = (slip: PermissionSlip) => {
    if (slip.file_url) {
      window.open(slip.file_url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Permission Slips</h1>
          <p className="text-gray-600 mt-2">
            Download your permission slip to sit for exams
          </p>
        </div>
        <Button
          onClick={ensureSlip}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Generate Slip
        </Button>
      </div>

      {loading && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-700">Generating your permission slip...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {slips.length === 0 && !loading ? (
        <Card className="p-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No permission slips yet
            </h3>
            <p className="text-gray-600 mb-4">
              Your permission slip will be generated once your fee payment is approved by the accountant.
            </p>
            <p className="text-sm text-gray-500">
              Please ensure your payment receipt has been submitted and approved.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {slips.map((slip) => (
            <Card key={slip.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {studentName} - Permission Slip
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Generated:{' '}
                        <span className="font-medium">
                          {new Date(slip.generated_at).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        Verification Code:{' '}
                        <span className="font-mono font-medium text-blue-600">
                          {slip.verification_code}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(slip)}
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                  disabled={!slip.file_url}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Each permission slip has a unique verification code for exam hall authentication
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Download and print the slip or keep a digital copy on your mobile device
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Present the slip along with your ID card during the exam
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              The slip is valid only for the examination period specified
            </span>
          </li>
        </ul>
      </Card>
    </div>
  )
}