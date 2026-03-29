'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function StudentNav() {
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4 flex items-center justify-between">
        <Link href="/student/dashboard" className="text-xl font-bold text-blue-600">
          UniFee
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/student/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/student/upload" className="text-gray-700 hover:text-blue-600">
            Upload Receipt
          </Link>
          <Link href="/student/history" className="text-gray-700 hover:text-blue-600">
            Submission History
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 p-4 space-y-2">
          <Link href="/student/dashboard" className="block text-gray-700 hover:text-blue-600 py-2">
            Dashboard
          </Link>
          <Link href="/student/upload" className="block text-gray-700 hover:text-blue-600 py-2">
            Upload Receipt
          </Link>
          <Link href="/student/history" className="block text-gray-700 hover:text-blue-600 py-2">
            Submission History
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  )
}
