'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser, useUserProfile } from '@/lib/hooks';
import {
   LayoutDashboard,
   Package,
   CheckSquare,
   Users,
   FileText,
   LogOut,
   Settings,
   BarChart3,
   UserPlus,
} from 'lucide-react';

const menuItems = [
   {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Batches',
      href: '/admin/batches',
      icon: Package,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Verification Queue',
      href: '/admin/verification-queue',
      icon: CheckSquare,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Student Tracking',
      href: '/admin/student-tracking',
      icon: Users,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Batch Reporting',
      href: '/admin/batch-reporting',
      icon: BarChart3,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Create Staff Account',
      href: '/admin/create-staff',
      icon: UserPlus,
      requiredRole: ['Admin'],
   },
   {
      label: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: FileText,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
   {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      requiredRole: ['Admin', 'Accountant', 'Registrar'],
   },
];

export function AdminSidebar() {
   const pathname = usePathname();
   const { user } = useUser();
   const { profile } = useUserProfile(user?.id);

   // Filter menu items based on user role
   const visibleMenuItems = menuItems.filter((item) => {
      if (!item.requiredRole) return true;
      return item.requiredRole.includes(profile?.role);
   });

   return (
      <aside className='hidden md:block w-64 bg-white border-r border-gray-200 p-6'>
         <nav className='space-y-2'>
            {visibleMenuItems.map((item) => {
               const Icon = item.icon;
               const isActive = pathname === item.href;

               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                           ? 'bg-indigo-100 text-indigo-700'
                           : 'text-gray-700 hover:bg-gray-100'
                     }`}>
                     <Icon className='w-5 h-5' />
                     <span className='font-medium'>{item.label}</span>
                  </Link>
               );
            })}
         </nav>
      </aside>
   );
}
