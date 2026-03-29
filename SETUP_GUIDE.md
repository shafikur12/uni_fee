# University Fee & Exam Permission System - Setup Guide

## Important: Disable Email Verification in Supabase

**This step must be completed for the system to work properly without email verification.**

1. Go to your Supabase Project Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Under "Email Confirmations", set **Confirm email** to **OFF**
4. Save the changes

This allows users to sign up and log in immediately without needing to confirm their email.

## Creating the First Admin Account

Since admin accounts cannot be created through the regular signup process, follow these steps:

### Option 1: Using the Admin Creation Page (Recommended)

1. **First Admin Setup**: You'll need to manually create the first admin account using SQL:

```sql
-- Run this in Supabase SQL Editor

-- Create a test admin user via auth
-- Note: You'll still need to use the Supabase dashboard to create the first user

-- After creating a user in Supabase Auth, insert their profile:
INSERT INTO staff_profiles (user_id, full_name, email, role)
VALUES (
  'USER_ID_HERE', -- Replace with the actual user ID from auth.users
  'Administrator',
  'admin@university.edu',
  'Admin'
);
```

### Option 2: Manual Steps in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user**
3. Enter email: `admin@university.edu`
4. Enter password: (choose a strong password)
5. Click **Create user**
6. Copy the User ID from the newly created user
7. Go to **SQL Editor** and run this query:

```sql
INSERT INTO staff_profiles (user_id, full_name, email, role)
VALUES (
  'PASTE_USER_ID_HERE',
  'System Administrator',
  'admin@university.edu',
  'Admin'
);
```

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
