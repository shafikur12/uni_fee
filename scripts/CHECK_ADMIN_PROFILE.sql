-- Check if admin staff profile exists
SELECT * FROM public.staff_profiles WHERE role = 'Admin';

-- Check all staff profiles
SELECT id, role, department FROM public.staff_profiles;

-- Check if any profiles exist for the specific user ID (314cfe40-d02c-4e62-a26c-897b81f7eebb)
SELECT * FROM public.staff_profiles WHERE id = '314cfe40-d02c-4e62-a26c-897b81f7eebb';

-- Check all users in auth
SELECT id, email FROM auth.users WHERE email = 'admin@unifee.com';
