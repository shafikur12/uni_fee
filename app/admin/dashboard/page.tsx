import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export const metadata = {
   title: 'Dashboard - Admin Panel',
   description: 'Admin dashboard for fee management and batch operations',
};

export default async function AdminDashboard() {
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

   // Get user role from staff profiles (id matches auth user id)
   const { data: profile } = await supabase
      .from('staff_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

   if (
      !profile ||
      !['Admin', 'Accountant', 'Registrar'].includes(profile.role)
   ) {
      redirect('/student/dashboard');
   }

   // Fetch dashboard metrics
   const [
      { count: totalSubmissions },
      { count: pendingSubmissions },
      { count: approvedSubmissions },
      { count: totalBatches },
   ] = await Promise.all([
      supabaseAdmin
         .from('fee_submissions')
         .select('*', { count: 'exact', head: true }),
      supabaseAdmin
         .from('fee_submissions')
         .select('*', { count: 'exact', head: true })
         .eq('status', 'Pending'),
      supabaseAdmin
         .from('fee_submissions')
         .select('*', { count: 'exact', head: true })
         .eq('status', 'Approved'),
      supabaseAdmin
         .from('batches')
         .select('*', { count: 'exact', head: true })
         .eq('status', 'Active'),
   ]);

   const today = new Date();
   const startDate = new Date();
   startDate.setDate(today.getDate() - 6);
   startDate.setHours(0, 0, 0, 0);

   const { data: recentSubs } = await supabaseAdmin
      .from('fee_submissions')
      .select('submission_date, status, created_at')
      .gte('created_at', startDate.toISOString());

   const dayKeys: string[] = [];
   const dayLabels: string[] = [];
   for (let i = 0; i < 7; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayKeys.push(key);
      dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
   }

   const countsByDay = new Map<
      string,
      { submissions: number; approvals: number }
   >();
   for (const key of dayKeys) {
      countsByDay.set(key, { submissions: 0, approvals: 0 });
   }

   for (const sub of recentSubs || []) {
      const rawDate = sub.submission_date || sub.created_at;
      if (!rawDate) continue;
      const dayKey = new Date(rawDate).toISOString().slice(0, 10);
      if (!countsByDay.has(dayKey)) continue;
      const entry = countsByDay.get(dayKey)!;
      entry.submissions += 1;
      if (String(sub.status).toLowerCase() === 'approved') {
         entry.approvals += 1;
      }
   }

   const chartData = dayKeys.map((key, index) => {
      const entry = countsByDay.get(key) || { submissions: 0, approvals: 0 };
      return {
         name: dayLabels[index],
         submissions: entry.submissions,
         approvals: entry.approvals,
      };
   });

   return (
      <AdminDashboardClient
         metrics={{
            totalSubmissions: totalSubmissions || 0,
            pendingSubmissions: pendingSubmissions || 0,
            approvedSubmissions: approvedSubmissions || 0,
            totalBatches: totalBatches || 0,
         }}
         chartData={chartData}
         userRole={profile?.role || 'Admin'}
      />
   );
}
