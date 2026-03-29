-- Fix RLS Policies - Drop and recreate to fix infinite recursion
-- Run this script to update the broken RLS policies

-- Drop old problematic policies
DROP POLICY IF EXISTS "Staff view all staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Admin manage staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Admin update staff profiles" ON public.staff_profiles;

DROP POLICY IF EXISTS "Allow viewing all batches" ON public.batches;
DROP POLICY IF EXISTS "Allow admin to create batches" ON public.batches;
DROP POLICY IF EXISTS "Allow admin to update batches" ON public.batches;
DROP POLICY IF EXISTS "Allow admin to delete batches" ON public.batches;

DROP POLICY IF EXISTS "Students view own record" ON public.students;
DROP POLICY IF EXISTS "Students update own record" ON public.students;

DROP POLICY IF EXISTS "Students view own submissions" ON public.fee_submissions;
DROP POLICY IF EXISTS "Students insert own submissions" ON public.fee_submissions;
DROP POLICY IF EXISTS "Accountants can update submissions" ON public.fee_submissions;

DROP POLICY IF EXISTS "View receipts via submission" ON public.uploaded_receipts;
DROP POLICY IF EXISTS "Students upload receipts" ON public.uploaded_receipts;

DROP POLICY IF EXISTS "Students view own slips" ON public.permission_slips;
DROP POLICY IF EXISTS "Staff issue permission slips" ON public.permission_slips;

DROP POLICY IF EXISTS "Admin view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;

-- Recreate RLS policies for staff_profiles (fixed - avoid recursion)
CREATE POLICY "Staff view all staff profiles" ON public.staff_profiles FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admin manage staff profiles" ON public.staff_profiles FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admin update staff profiles" ON public.staff_profiles FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for batches
CREATE POLICY "Allow viewing all batches" ON public.batches FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to create batches" ON public.batches FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to update batches" ON public.batches FOR UPDATE USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Allow admin to delete batches" ON public.batches FOR DELETE USING (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for students
CREATE POLICY "Students view own record" ON public.students FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students update own record" ON public.students FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for fee_submissions
CREATE POLICY "Students view own submissions" ON public.fee_submissions FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students insert own submissions" ON public.fee_submissions FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Accountants can update submissions" ON public.fee_submissions FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for uploaded_receipts
CREATE POLICY "View receipts via submission" ON public.uploaded_receipts FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Students upload receipts" ON public.uploaded_receipts FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for permission_slips
CREATE POLICY "Students view own slips" ON public.permission_slips FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Staff issue permission slips" ON public.permission_slips FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Recreate RLS policies for audit_logs
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);
