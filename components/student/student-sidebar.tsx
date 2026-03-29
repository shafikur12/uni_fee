'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Upload, History, Download, User } from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Upload Receipt',
    href: '/student/upload',
    icon: Upload,
  },
  {
    label: 'Submission History',
    href: '/student/history',
    icon: History,
  },
  {
    label: 'Permission Slips',
    href: '/student/slips',
    icon: Download,
  },
  {
    label: 'Profile',
    href: '/student/profile',
    icon: User,
  },
]

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
