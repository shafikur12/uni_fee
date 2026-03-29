'use client'

import { ReactNode } from 'react'
import { StudentNav } from '@/components/student/student-nav'
import { StudentSidebar } from '@/components/student/student-sidebar'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
