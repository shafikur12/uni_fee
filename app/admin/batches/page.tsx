import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BatchManagementClient } from '@/components/admin/batch-management-client';

export const metadata = {
   title: 'Batch Management - Admin Panel',
   description: 'Create and manage student batches',
};

export default async function BatchManagementPage() {
   const user = await getCurrentUser();

   if (!user) {
      redirect('/auth/login');
   }

   const supabase = await createClient();

   // Verify staff role (id matches auth user id)
   const { data: profile } = await supabase
      .from('staff_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

   if (
      !profile ||
      !['Admin', 'Accountant', 'Registrar'].includes(profile.role)
   ) {
      redirect('/admin/dashboard');
   }

   // Fetch all batches
   const { data: batches } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

   return <BatchManagementClient batches={batches || []} userId={user.id} />;
}
