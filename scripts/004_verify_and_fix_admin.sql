-- Comprehensive admin setup verification and fixes
-- Run this script to ensure admin authentication works correctly

-- Step 1: Verify staff_profiles table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staff_profiles';

-- Step 2: List all staff profiles (to verify admins exist)
SELECT id, role, department, created_at FROM public.staff_profiles;

-- Step 3: Check for the specific admin user
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@unifee.com';

-- Step 4: Verify the staff profile exists for the admin user
SELECT * FROM public.staff_profiles WHERE role = 'Admin';

-- Step 5: If staff_profiles is missing the admin, check auth.users to find the ID
-- Then use the INSERT statement below (replace USER_ID_HERE with the actual UUID)
-- Example:
-- INSERT INTO public.staff_profiles (id, role, department)
-- VALUES ('USER_ID_HERE', 'Admin', 'Administration')
-- ON CONFLICT (id) DO NOTHING;
