'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface StaffMember {
   id: string;
   full_name: string;
   role: string;
}

interface SystemConfig {
   university_name: string;
   system_email: string;
   late_fee_percentage: number;
   session_timeout: number;
}

interface SettingsClientProps {
   staffMembers: StaffMember[];
   userId: string;
   initialConfig: SystemConfig;
}

export function SettingsClient({
   staffMembers,
   userId,
   initialConfig,
}: SettingsClientProps) {
   const [config, setConfig] = useState<SystemConfig>(initialConfig);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [error, setError] = useState('');

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setConfig((prev) => ({
         ...prev,
         [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value,
      }));
      setError('');
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
         const supabase = createClient();

         // Get auth token
         const { data: sessionData } = await supabase.auth.getSession();
         const token = sessionData.session?.access_token;

         if (!token) {
            setError('Authentication required. Please log in again.');
            setLoading(false);
            return;
         }

         // Call the API to update configuration
         const response = await fetch('/api/admin/system-config', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(config),
         });

         const result = await response.json();

         if (!response.ok) {
            setError(result.error || 'Failed to update system configuration');
            setLoading(false);
            return;
         }

         setSuccess(true);
         setTimeout(() => setSuccess(false), 5000);
      } catch (err: any) {
         setError(err.message || 'Failed to update system configuration');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className='space-y-6'>
         <div>
            <h1 className='text-3xl font-bold text-gray-900'>
               System Settings
            </h1>
            <p className='text-gray-600 mt-2'>
               Manage system configuration and user accounts
            </p>
         </div>

         {/* User Management */}
         <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
               <User className='w-5 h-5' />
               Staff Members
            </h2>
            <div className='overflow-x-auto'>
               <table className='w-full'>
                  <thead className='bg-gray-50'>
                     <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-700'>
                           Name
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-700'>
                           Role
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-700'>
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                     {staffMembers.map((member) => (
                        <tr key={member.id} className='hover:bg-gray-50'>
                           <td className='px-4 py-3 text-sm text-gray-900'>
                              {member.full_name}
                           </td>
                           <td className='px-4 py-3 text-sm'>
                              <Badge
                                 className={
                                    member.role === 'Admin'
                                       ? 'bg-red-100 text-red-800'
                                       : member.role === 'Accountant'
                                         ? 'bg-blue-100 text-blue-800'
                                         : 'bg-green-100 text-green-800'
                                 }>
                                 {member.role}
                              </Badge>
                           </td>
                           <td className='px-4 py-3 text-sm'>
                              {member.id !== userId && (
                                 <Button variant='outline' size='sm' disabled>
                                    Manage
                                 </Button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>

         {/* System Settings */}
         <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
               <Lock className='w-5 h-5' />
               System Configuration
            </h2>

            {error && (
               <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3'>
                  <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-red-700'>{error}</p>
               </div>
            )}

            {success && (
               <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3'>
                  <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-green-700'>
                     System configuration updated successfully
                  </p>
               </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
               <div className='grid grid-cols-2 gap-4'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        University Name
                     </label>
                     <input
                        type='text'
                        name='university_name'
                        value={config.university_name}
                        onChange={handleChange}
                        disabled={loading}
                        className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                     />
                  </div>
                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        System Email
                     </label>
                     <input
                        type='email'
                        name='system_email'
                        value={config.system_email}
                        disabled
                        className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900'
                     />
                  </div>
               </div>

               <div className='grid grid-cols-2 gap-4'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        Late Fee Percentage
                     </label>
                     <input
                        type='number'
                        name='late_fee_percentage'
                        value={config.late_fee_percentage}
                        onChange={handleChange}
                        disabled={loading}
                        step='0.01'
                        min='0'
                        className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                     />
                  </div>
                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        Session Timeout (minutes)
                     </label>
                     <input
                        type='number'
                        name='session_timeout'
                        value={config.session_timeout}
                        onChange={handleChange}
                        disabled={loading}
                        min='1'
                        className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                     />
                  </div>
               </div>

               <Button type='submit' disabled={loading} className='mt-4'>
                  {loading ? (
                     <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Updating...
                     </>
                  ) : (
                     'Update Settings'
                  )}
               </Button>
            </form>
         </Card>

         {/* System Info */}
         <Card className='p-6 bg-blue-50'>
            <h3 className='font-semibold text-gray-900 mb-3'>
               System Information
            </h3>
            <div className='space-y-2 text-sm text-gray-700'>
               <p>
                  <span className='font-medium'>Version:</span> 1.0.0
               </p>
               <p>
                  <span className='font-medium'>Last Updated:</span>{' '}
                  {new Date().toLocaleDateString()}
               </p>
               <p>
                  <span className='font-medium'>Database:</span> Supabase
                  PostgreSQL
               </p>
               <p>
                  <span className='font-medium'>Status:</span> Operational
               </p>
            </div>
         </Card>
      </div>
   );
}
