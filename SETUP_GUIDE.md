# University Fee & Exam Permission System - Setup Guide

## ✅ Authentication Fix Applied

**Fixed Issue:** Admin users were being redirected to student dashboard instead of admin dashboard.

**Changes Made:**
- Fixed LoginModal to correctly identify admin users using `.maybeSingle()` instead of `.single()`
- Fixed ProtectedRoute component for better role validation
- Added debug logging to help troubleshoot authentication issues
- See `ADMIN_AUTH_FIX.md` for detailed technical changes

---

## Important: Disable Email Verification in Supabase

**This step must be completed for the system to work properly without email verification.**

1. Go to your Supabase Project Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Under "Email Confirmations", set **Confirm email** to **OFF**
4. Save the changes

This allows users to sign up and log in immediately without needing to confirm their email.

## Creating the First Admin Account

Since admin accounts cannot be created through the regular signup process, follow these steps:

### Required Steps:

1. **Step 1: Create Admin User in Supabase Auth**
   - Go to **Supabase Dashboard** → **Authentication** → **Users**
   - Click **Add user**
   - Email: `admin@unifee.com` (or your preferred admin email)
   - Password: `Admin@123456` (or a strong password of your choice)
   - Click **Create user**

2. **Step 2: Get Admin User ID**
   - Find the newly created admin user in the users list
   - Click on the user to view details
   - Copy the **User ID** (UUID format)

3. **Step 3: Create Staff Profile Record**
   - Go to **Supabase Dashboard** → **SQL Editor**
   - Paste and run this query (replace UUID with the actual admin user ID):

```sql
INSERT INTO public.staff_profiles (id, role, department)
VALUES ('PASTE_ADMIN_USER_ID_HERE', 'Admin', 'Administration')
ON CONFLICT (id) DO NOTHING;
```

Example with actual UUID:
```sql
INSERT INTO public.staff_profiles (id, role, department)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Admin', 'Administration')
ON CONFLICT (id) DO NOTHING;
```

### Verify Setup (Optional):

Run this SQL to verify everything is correct:
```sql
-- Check if admin user exists
SELECT id, email FROM auth.users WHERE email = 'admin@unifee.com';

-- Check if staff profile exists
SELECT id, role, department FROM public.staff_profiles WHERE role = 'Admin';
```

You should see one row in each result.

## Running the Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The project will be available at **http://localhost:3000**

### First Time Setup Checklist:
- ✅ Supabase project connected
- ✅ Email verification disabled in Supabase
- ✅ Admin user created in Supabase Auth
- ✅ Staff profile record inserted in database
- ✅ Dependencies installed
- ✅ Dev server running

## Testing the Admin Login (With Authentication Fix)

1. Open **http://localhost:3000**
2. Click **"Sign In"**
3. Enter credentials:
   - Email: `admin@unifee.com`
   - Password: `Admin@123456`
4. Click **"Sign In"**
5. ✅ **Expected Result:** You should be redirected to `/admin/dashboard`

**Debug Info:** Open browser console (F12 > Console) and look for messages like:
```
[v0] Staff profile check: { staffProfile: { id: 'xxx', role: 'Admin' }, staffError: null, userId: 'xxx' }
[v0] Admin user detected with role: Admin redirecting to admin dashboard
```

### If Still Redirected to Student Dashboard:

1. Check browser console for error messages (prefixed with `[v0]`)
2. Verify admin user ID in Supabase Auth
3. Verify staff_profiles record exists with correct UUID
4. Try clearing browser cookies and logging in again
5. Restart the dev server

See `ADMIN_AUTH_FIX.md` for detailed troubleshooting.

## Creating Additional Staff Accounts

Once you have at least one admin account:

1. Log in as Admin at `/auth/login`
2. Go to **Admin Dashboard** → **Create Staff Account**
3. Fill in the staff details:
   - Full Name
   - Email
   - Role (Accountant, Registrar, or Admin)
   - Password
4. Click **Create Staff Account**

## Creating Batches

1. Log in as Admin
2. Go to **Admin Dashboard** → **Batches**
3. Click **Create New Batch**
4. Fill in batch details:
   - Batch Name (e.g., "Batch 2024-25 Sem 1")
   - Batch Code (e.g., "B1")
   - Academic Year (e.g., "2024-2025")
   - Semester (1 or 2)
   - Fee Amount
   - Currency
   - Late Fee Percentage
   - Fee Deadline
5. Click **Create Batch**

## Student Registration

1. Students go to `/auth/signup`
2. Fill in registration form:
   - Full Name
   - Student ID (numbers only)
   - Email
   - **Select Batch** (only active batches show up)
   - Password
3. Click **Create Student Account**
4. Student is immediately logged in and directed to their dashboard

## Assigning Students to Batches

### Method 1: During Student Signup
Students select their batch during registration. Students can only register if at least one active batch exists.

### Method 2: Admin Bulk Assignment
1. Log in as Admin
2. Go to **Admin Dashboard** → **Batches**
3. Click on a batch → **Assign Students**
4. Choose either:
   - **Manual**: Search and add individual students
   - **Bulk Upload**: Upload CSV file with columns: `student_id`, `email`, `name`

## Verification Queue Workflow (Accountant)

1. Student uploads receipt → submission status is "Pending"
2. Accountant logs in → Goes to **Verification Queue**
3. Reviews receipt image and student details
4. **Approve**: Generates and sends permission slip
5. **Reject**: Provides feedback; student can resubmit

## Key Features

- **No Email Verification**: Students can log in immediately after signup
- **Batch Management**: Admin controls all batches
- **Role-Based Access**: 
  - Students: Can only view/manage their own fees
  - Accountant: Can verify receipts
  - Registrar: Can view student tracking and reports
  - Admin: Full system control
- **Batch-Specific Operations**: All workflows filtered by batch
- **CSV Export**: Export student data and reports as CSV

## Troubleshooting

**"Email not confirmed" error on login**
- Go to Supabase Dashboard → Authentication → Providers → Email
- Turn OFF email confirmation
- Wait a few minutes for changes to take effect

**Student can't see any batches during signup**
- Admin must create at least one active batch first
- Batches must have `status = 'Active'` to appear

**Accountant can't see submissions**
- Verify the batch is active
- Check that students are assigned to that batch
- Ensure fee deadline hasn't passed (or adjust deadline)

## Database Tables

- **batches**: Active/archived student batches with fee configs
- **student_profiles**: Student metadata (student ID, batch assignment)
- **fee_submissions**: Payment upload tracking
- **staff_profiles**: Accountant, Registrar, Admin accounts
- **permission_slips**: Generated exam slips
- **audit_logs**: System activity tracking
