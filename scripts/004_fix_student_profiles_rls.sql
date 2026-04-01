-- Fix RLS policies for student_profiles to allow service-role inserts/updates

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students view own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Staff view all profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "System insert profiles on signup" ON public.student_profiles;

-- Students can view their own profile
CREATE POLICY "Students view own profile" ON public.student_profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- Students can update their own profile; service role and staff can also update for admin flows
CREATE POLICY "Students update own profile" ON public.student_profiles
FOR UPDATE
USING (
  auth.uid() = id
  OR auth.role() = 'service_role'
  OR auth.uid() IN (SELECT id FROM public.staff_profiles)
);

-- Staff can view all profiles
CREATE POLICY "Staff view all profiles" ON public.student_profiles
FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM public.staff_profiles)
  OR auth.role() = 'service_role'
);

-- System/service role can insert profiles during signup or batch-assignment flows
CREATE POLICY "System insert profiles on signup" ON public.student_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
  OR auth.role() = 'service_role'
);

