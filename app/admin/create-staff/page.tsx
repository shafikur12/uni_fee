import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateStaffClient } from '@/components/admin/create-staff-client';

export const metadata = {
   title: 'Create Staff Account - Admin Panel',
   description: 'Create new staff accounts',
};

export default async function CreateStaffPage() {
   const user = await getCurrentUser();

   if (!user) {
      redirect('/auth/login');
   }

   const supabase = await createClient();

   // id matches auth user id
   const { data: profile } = await supabase
      .from('staff_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

   if (!profile || profile.role !== 'Admin') {
      redirect('/admin/dashboard');
   }

   return <CreateStaffClient />;
}
