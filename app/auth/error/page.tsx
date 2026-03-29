'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred during authentication'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Authentication Error
          </h1>
          <p className="text-center text-gray-600 mb-6">{message}</p>
          <Link href="/auth/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Loading...
            </h1>
          </div>
        </Card>
      </div>
    }>
      <ErrorPageContent />
    </Suspense>
  )
}
