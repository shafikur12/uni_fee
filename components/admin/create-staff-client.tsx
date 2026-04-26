'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function CreateStaffClient() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const [role, setRole] = useState('Accountant');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);
   const [successMessage, setSuccessMessage] = useState('');
   const [loading, setLoading] = useState(false);

   const validateForm = () => {
      if (!email || !password || !confirmPassword || !fullName) {
         setError('All fields are required');
         return false;
      }
      if (password !== confirmPassword) {
         setError('Passwords do not match');
         return false;
      }
      if (password.length < 8) {
         setError('Password must be at least 8 characters');
         return false;
      }
      if (role === 'Student') {
         setError(
            'Staff accounts must have role Accountant, Registrar, or Admin',
         );
         return false;
      }
      return true;
   };

   const handleCreateStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!validateForm()) return;

      setLoading(true);

      try {
         const supabase = createClient();

         // Get the current session to retrieve auth token
         const { data: sessionData } = await supabase.auth.getSession();
         const token = sessionData.session?.access_token;

         if (!token) {
            setError('Authentication required. Please log in again.');
            setLoading(false);
            return;
         }

         // Call the API route to create staff account
         const response = await fetch('/api/admin/create-staff', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               email,
               password,
               fullName,
               role,
            }),
         });

         const result = await response.json();

         if (!response.ok) {
            setError(result.error || 'Failed to create staff account');
            setLoading(false);
            return;
         }

         setSuccess(true);
         setSuccessMessage(`${role} account created successfully for ${email}`);

         // Reset form
         setEmail('');
         setPassword('');
         setConfirmPassword('');
         setFullName('');
         setRole('Accountant');

         setTimeout(() => {
            setSuccess(false);
         }, 5000);
      } catch (err: any) {
         setError(err.message || 'Failed to create staff account');
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
         <div className='max-w-md mx-auto'>
            <Card className='shadow-lg'>
               <div className='p-8'>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                     Create Staff Account
                  </h1>
                  <p className='text-gray-600 mb-8'>
                     Create Accountant, Registrar, or Admin accounts
                  </p>

                  {error && (
                     <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3'>
                        <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                        <p className='text-sm text-red-700'>{error}</p>
                     </div>
                  )}

                  {success && (
                     <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3'>
                        <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                        <div className='text-sm text-green-700'>
                           <p className='font-semibold'>Account Created!</p>
                           <p>{successMessage}</p>
                        </div>
                     </div>
                  )}

                  <form onSubmit={handleCreateStaff} className='space-y-4'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Full Name
                        </label>
                        <Input
                           type='text'
                           placeholder='John Doe'
                           value={fullName}
                           onChange={(e) => setFullName(e.target.value)}
                           disabled={loading}
                        />
                     </div>

                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Email
                        </label>
                        <Input
                           type='email'
                           placeholder='staff@university.edu'
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           disabled={loading}
                        />
                     </div>

                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Role
                        </label>
                        <Select
                           value={role}
                           onValueChange={setRole}
                           disabled={loading}>
                           <SelectTrigger>
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value='Admin'>Admin</SelectItem>
                              <SelectItem value='Accountant'>
                                 Accountant
                              </SelectItem>
                              <SelectItem value='Registrar'>
                                 Registrar
                              </SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Password
                        </label>
                        <Input
                           type='password'
                           placeholder='••••••••'
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           disabled={loading}
                        />
                        <p className='text-xs text-gray-500 mt-1'>
                           Minimum 8 characters
                        </p>
                     </div>

                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Confirm Password
                        </label>
                        <Input
                           type='password'
                           placeholder='••••••••'
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           disabled={loading}
                        />
                     </div>

                     <Button
                        type='submit'
                        className='w-full'
                        disabled={loading}>
                        {loading ? (
                           <>
                              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                              Creating Account...
                           </>
                        ) : (
                           'Create Staff Account'
                        )}
                     </Button>
                  </form>

                  <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                     <p className='text-xs text-blue-700'>
                        <strong>Note:</strong> New staff members should change
                        their password upon first login for security.
                     </p>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
}
