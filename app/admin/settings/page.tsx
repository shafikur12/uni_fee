import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/admin/settings-client';

export const metadata = {
   title: 'Settings - Admin Panel',
   description: 'System configuration and user management',
};

export default async function SettingsPage() {
   const user = await getCurrentUser();

   if (!user) {
      redirect('/auth/login');
   }

   const supabase = await createClient();
   const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
         auth: {
            autoRefreshToken: false,
            persistSession: false,
         },
      },
   );

   // id matches auth user id
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

   // Fetch staff members with their full names from auth.users
   const { data: staffProfiles } = await supabase
      .from('staff_profiles')
      .select('id, role')
      .in('role', ['Admin', 'Accountant', 'Registrar']);

   // Fetch auth users to get full names
   const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

   // Map staff profiles with names from auth users
   const staffMembers = (staffProfiles || []).map((staff) => {
      const authUser = authUsers?.users.find((u) => u.id === staff.id);
      return {
         id: staff.id,
         full_name: (authUser?.user_metadata?.full_name as string) || 'Unknown',
         role: staff.role,
      };
   });

   // Fetch system configuration
   const { data: configData } = await supabase
      .from('system_configuration')
      .select('*')
      .maybeSingle();

   const systemConfig = configData || {
      university_name: 'State University',
      system_email: 'fees@university.edu',
      late_fee_percentage: 5,
      session_timeout: 30,
   };

   return (
      <SettingsClient
         staffMembers={staffMembers}
         userId={user.id}
         initialConfig={systemConfig}
      />
   );
}
