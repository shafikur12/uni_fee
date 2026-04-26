import { getCurrentUser } from '@/lib/db-helpers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { AuditLogsClient } from '@/components/admin/audit-logs-client';

export const metadata = {
   title: 'Audit Logs - Admin Panel',
   description: 'View system audit logs',
};

export default async function AuditLogsPage() {
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

   const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

   const getLogTargetId = (log: any) =>
      log?.target_id ||
      log?.new_value?.submission_id ||
      log?.new_value?.target_id ||
      log?.old_value?.submission_id ||
      log?.old_value?.target_id ||
      null;

   const targetIds = Array.from(
      new Set(
         (logs || [])
            .map((log: any) => getLogTargetId(log))
            .filter((id: any) => !!id),
      ),
   );

   const { data: submissions } = targetIds.length
      ? await supabaseAdmin
           .from('fee_submissions')
           .select(
              `id, student_id, batch_id, submission_date, amount, bank_name, transaction_id, payment_reference, status, rejection_reason, reviewed_at, reviewed_by, created_at,
           students(name, registration_number, user_id), batches(batch_name), uploaded_receipts(file_url, file_type, file_size, storage_path)`,
           )
           .in('id', targetIds)
      : { data: [] };

   const rawStudentIds = Array.from(
      new Set(
         (submissions || [])
            .map((s: any) => s?.student_id)
            .filter((id: any) => !!id),
      ),
   );

   const { data: studentsFallback } = rawStudentIds.length
      ? await supabaseAdmin
           .from('students')
           .select('id, name, registration_number, user_id')
           .in('id', rawStudentIds)
      : { data: [] };

   const studentsById = new Map(
      (studentsFallback || []).map((s: any) => [s.id, s]),
   );
   const studentsByUserId = new Map(
      (studentsFallback || []).map((s: any) => [s.user_id, s]),
   );

   const studentUserIds = Array.from(
      new Set(
         (submissions || [])
            .map((s: any) => s?.students?.user_id)
            .concat((studentsFallback || []).map((s: any) => s?.user_id))
            .filter((id: any) => !!id),
      ),
   );

   const studentEmailMap = new Map<string, string>();
   if (studentUserIds.length) {
      const userResults = await Promise.all(
         studentUserIds.map(async (id) => {
            try {
               const { data } = await supabaseAdmin.auth.admin.getUserById(id);
               return { id, email: data?.user?.email || null };
            } catch {
               return { id, email: null };
            }
         }),
      );
      for (const u of userResults) {
         if (u.email) {
            studentEmailMap.set(u.id, u.email);
         }
      }
   }

   const submissionById = new Map(
      (submissions || []).map((s: any) => [s.id, s]),
   );

   const missingSubmissionIds = targetIds.filter(
      (id: any) => !submissionById.has(id),
   );
   if (missingSubmissionIds.length) {
      const missingResults = await Promise.all(
         missingSubmissionIds.map(async (id: string) => {
            const { data } = await supabaseAdmin
               .from('fee_submissions')
               .select(
                  `id, student_id, batch_id, submission_date, amount, bank_name, transaction_id, payment_reference, status, rejection_reason, reviewed_at, reviewed_by, created_at,
             students(name, registration_number, user_id), batches(batch_name), uploaded_receipts(file_url, file_type, file_size, storage_path)`,
               )
               .eq('id', id)
               .maybeSingle();
            return data || null;
         }),
      );
      for (const sub of missingResults) {
         if (sub?.id) {
            submissionById.set(sub.id, sub);
         }
      }
   }

   const enrichedLogs = (logs || []).map((log: any) => {
      const resolvedTargetId = getLogTargetId(log);
      const submission = submissionById.get(resolvedTargetId) || null;
      const resolvedStudent =
         submission?.students ||
         (submission?.student_id
            ? studentsById.get(submission.student_id)
            : null) ||
         (submission?.student_id
            ? studentsByUserId.get(submission.student_id)
            : null);

      const resolvedUserId =
         resolvedStudent?.user_id ||
         submission?.students?.user_id ||
         submission?.student_id ||
         null;

      const fallbackEmail =
         log?.new_value?.student_email || log?.old_value?.student_email || null;

      return {
         ...log,
         submission_target_id: resolvedTargetId,
         submission_reference: submission
            ? {
                 id: submission.id,
                 student_name: resolvedStudent?.name || null,
                 registration_number:
                    resolvedStudent?.registration_number || null,
                 student_email:
                    (resolvedUserId
                       ? studentEmailMap.get(resolvedUserId) || null
                       : null) || fallbackEmail,
              }
            : null,
         submission_detail: submission || null,
      };
   });

   return <AuditLogsClient logs={enrichedLogs} />;
}
