# Admin Account Setup Guide

## Quick Start - Create Your First Admin Account

The admin credentials provided (admin@unifee.com / Admin@123456) require manual setup because the Supabase Auth user needs to be created first.

### Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - Navigate to your Supabase project at https://app.supabase.com
   - Click on "Authentication" in the left sidebar
   - Click "Users"
   - Click "Add User"

2. **Create the Admin User:**
   - Email: `admin@unifee.com`
   - Password: `Admin@123456` (or your preferred secure password)
   - Click "Create User"

3. **Copy the User ID:**
   - Find the newly created user in the list
   - Click on the user to expand details
   - Copy the "User UID" value

4. **Run the Database Setup:**
   - Go to SQL Editor in Supabase
   - Paste and run the following SQL (replacing USER_ID_HERE with your copied ID):

   ```sql
   INSERT INTO public.staff_profiles (id, role, department, created_at, updated_at)
   VALUES (
     'USER_ID_HERE',
     'Admin',
     'Administration',
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP
   )
   ON CONFLICT (id) DO NOTHING;
   
   -- Verify admin was created
   SELECT * FROM public.staff_profiles WHERE role = 'Admin';
   ```

5. **Login:**
   - Go to your application
   - Click "Sign In" on the homepage
   - Use email: `admin@unifee.com`
   - Use password: `Admin@123456`
   - You should now be redirected to the admin dashboard

### Method 2: Using the Application

If you want to create additional staff accounts after the initial admin:

1. **Login as Admin** (using the credentials above)
2. **Navigate to:** Admin Dashboard → Create Staff Account
3. **Fill in the form:**
   - Full Name
   - Email Address
   - Role (Admin, Accountant, or Registrar)
   - Temporary Password
4. **Click "Create Staff Account"**
5. **Share the credentials** with the staff member

### Troubleshooting

**"Invalid login credentials" error:**
- The admin user was not created in Supabase Auth
- Follow Method 1 steps 1-3 to create the user first
- Make sure you copied the correct User ID

**"Could not find the table" error:**
- The database migration scripts haven't been run
- Contact your system administrator to ensure all SQL migrations were executed

**"Unauthorized to access admin dashboard":**
- The staff_profiles entry was not created
- Follow Method 1 step 4 to create the database record

### Security Notes

⚠️ **Important:** After your first login, change the default password immediately:
1. Go to Profile → Change Password
2. Set a strong, unique password
3. Never share your credentials

⚠️ **For Production:**
- Use a strong password (min 12 characters, mix of upper/lower case, numbers, special chars)
- Disable default admin accounts after testing
- Implement additional authentication factors if available

### Need Help?

If you continue to experience issues:
1. Verify the Supabase project URL and credentials are correct
2. Check that all migration scripts have been executed
3. Ensure you're using the exact email and password from the setup
4. Contact your system administrator
