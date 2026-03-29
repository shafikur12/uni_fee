'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function AdminNav() {
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
        <Link href="/admin/dashboard" className="text-xl font-bold text-indigo-600">
          UniFee Admin
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-700 hover:text-indigo-600">
            Dashboard
          </Link>
          <Link href="/admin/batches" className="text-gray-700 hover:text-indigo-600">
            Batches
          </Link>
          <Link href="/admin/verification-queue" className="text-gray-700 hover:text-indigo-600">
            Verifications
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
          <Link href="/admin/dashboard" className="block text-gray-700 hover:text-indigo-600 py-2">
            Dashboard
          </Link>
          <Link href="/admin/batches" className="block text-gray-700 hover:text-indigo-600 py-2">
            Batches
          </Link>
          <Link href="/admin/verification-queue" className="block text-gray-700 hover:text-indigo-600 py-2">
            Verifications
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
