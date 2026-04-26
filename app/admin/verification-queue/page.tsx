import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { VerificationQueueClient } from '@/components/admin/verification-queue-client';

export const metadata = {
   title: 'Verification Queue - Admin Panel',
   description: 'Review and approve fee submissions',
};

export default async function VerificationQueuePage() {
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

   // Fetch pending submissions
   const { data: submissions } = await supabase
      .from('fee_submissions')
      .select(
         `*, 
       batches(batch_name, fee_amount, semester),
       uploaded_receipts(file_url, file_type, file_size, storage_path)`,
      )
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

   // `fee_submissions.student_id` may point to different tables depending on
   // the current DB setup. To keep the UI working, we fetch both possible
   // student sources and map them into the shape expected by the client.
   const safeSubmissions = submissions || [];
   const studentIds = Array.from(
      new Set(safeSubmissions.map((s: any) => s.student_id)),
   ).filter(Boolean);

   const [{ data: studentsRows }, { data: profilesRows }] = await Promise.all([
      studentIds.length
         ? supabase
              .from('students')
              .select('id, user_id, registration_number, current_semester')
              .in('id', studentIds)
         : Promise.resolve({ data: [] }),
      studentIds.length
         ? supabase
              .from('student_profiles')
              .select('id, student_id, batch_id, full_name')
              .in('id', studentIds)
         : Promise.resolve({ data: [] }),
   ]);

   const studentsById = new Map(
      (studentsRows || []).map((s: any) => [s.id, s]),
   );
   const profilesById = new Map(
      (profilesRows || []).map((p: any) => [p.id, p]),
   );

   const authUserIds = Array.from(
      new Set((studentsRows || []).map((s: any) => s.user_id).filter(Boolean)),
   );

   const { data: profilesByAuthId } = authUserIds.length
      ? await supabase
           .from('student_profiles')
           .select('id, full_name')
           .in('id', authUserIds)
      : { data: [] };

   const profilesByAuthIdMap = new Map(
      (profilesByAuthId || []).map((p: any) => [p.id, p]),
   );

   const uniqueEmailUserIds = Array.from(
      new Set([
         ...(studentsRows || []).map((s: any) => s.user_id).filter(Boolean),
         ...(profilesRows || []).map((p: any) => p.id).filter(Boolean),
      ]),
   );

   const studentEmailMap = new Map<string, string | null>();
   await Promise.all(
      uniqueEmailUserIds.map(async (id) => {
         try {
            const { data } = await supabaseAdmin.auth.admin.getUserById(id);
            studentEmailMap.set(id, data?.user?.email || null);
         } catch {
            studentEmailMap.set(id, null);
         }
      }),
   );

   const submissionsMapped = safeSubmissions.map((sub: any) => {
      const studentRow = studentsById.get(sub.student_id);
      const profileRow = profilesById.get(sub.student_id);
      const profileFromAuth = studentRow
         ? profilesByAuthIdMap.get(studentRow.user_id)
         : null;
      const semesterFromBatch = sub?.batches?.semester
         ? parseInt(String(sub.batches.semester), 10)
         : 1;
      const emailFromAuth = studentRow
         ? studentEmailMap.get(studentRow.user_id) || null
         : profileRow
           ? studentEmailMap.get(profileRow.id) || null
           : null;
      const resolvedEmail = sub.student_email || emailFromAuth || null;

      return {
         ...sub,
         student_email: resolvedEmail,
         students: studentRow
            ? {
                 user_id: studentRow.user_id,
                 registration_number: studentRow.registration_number,
                 semester: studentRow.current_semester,
                 name:
                    profileFromAuth?.full_name || profileRow?.full_name || null,
                 email: resolvedEmail,
              }
            : profileRow
              ? {
                   user_id: profileRow.id,
                   registration_number: profileRow.student_id,
                   semester: semesterFromBatch,
                   name: profileRow.full_name || null,
                   email: resolvedEmail,
                }
              : {
                   user_id: sub.student_id,
                   registration_number: 'N/A',
                   semester: semesterFromBatch,
                   name: null,
                   email: resolvedEmail,
                },
      };
   });

   return (
      <VerificationQueueClient
         submissions={submissionsMapped}
         userId={user.id}
      />
   );
}
