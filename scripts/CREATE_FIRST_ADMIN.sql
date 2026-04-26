-- Run this SQL in your Supabase SQL Editor to create the first admin account
-- After creating a user through Supabase Dashboard Auth

-- Step 1: Create a user in Supabase Auth via the Dashboard (Authentication → Users → Add User)
-- Use email: admin@university.edu and a secure password

-- Step 2: Copy the User ID and replace 'USER_ID_FROM_SUPABASE' below

-- Step 3: Run this query:

INSERT INTO public.staff_profiles (id, role, department)
VALUES (
  'USER_ID_FROM_SUPABASE',
  'Admin',
  'Administration'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the admin was created:
SELECT * FROM public.staff_profiles WHERE role = 'Admin';
