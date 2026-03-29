-- First, verify your admin user exists
SELECT id, email FROM auth.users WHERE email = 'admin@unifee.com';

-- Copy the UUID from above, then use it in the INSERT below:
-- Replace 'YOUR_ADMIN_USER_ID_HERE' with the actual UUID

-- Create the staff profile for admin user
INSERT INTO public.staff_profiles (id, role, department, created_at, updated_at)
VALUES (
  'YOUR_ADMIN_USER_ID_HERE',  -- Replace with actual UUID from auth.users
  'Admin',
  'Administration',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Verify the staff profile was created
SELECT id, role, department FROM public.staff_profiles WHERE role = 'Admin';

-- Optional: If you need to delete the admin and re-create:
-- DELETE FROM public.staff_profiles WHERE role = 'Admin';
