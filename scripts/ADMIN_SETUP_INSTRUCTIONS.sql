-- Script to create default admin account
-- Instructions: Replace admin@university.edu and SecurePassword123! with your desired credentials
-- Then run this script in the Supabase SQL editor

-- Note: This creates the admin in Supabase Auth and the staff_profiles table
-- You'll need to run this manually or use it as a reference for admin creation

INSERT INTO public.staff_profiles (id, role, department)
SELECT 
  auth.users.id,
  'Admin',
  'Administration'
FROM auth.users
WHERE email = 'admin@university.edu'
ON CONFLICT (id) DO NOTHING;

-- To create admin via Supabase Dashboard:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user"
-- 3. Email: admin@university.edu (or your choice)
-- 4. Password: Create a strong password
-- 5. Click "Create user"
-- 6. Then run the INSERT statement above to create the staff_profile
