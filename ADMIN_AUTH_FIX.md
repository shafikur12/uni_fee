# Admin Authentication Fix - Complete Guide

## Problem Summary
When logging in with admin credentials (admin@unifee.com / Admin@123456), the user was redirected to the student dashboard instead of the admin dashboard. This was caused by:

1. **Incorrect database queries**: The code was using `.single()` which throws errors when results don't exist
2. **Silent error handling**: Errors weren't properly logged, causing fallback to student profile checks
3. **No explicit admin check**: The protected route wasn't properly validating admin roles

## What Was Fixed

### 1. LoginModal Component (`/components/auth-modals.tsx`)
**Changed from:**
```typescript
const { data: staffProfile, error: staffError } = await supabase
  .from('staff_profiles')
  .select('role')
  .eq('id', data.user.id)
  .single()  // ❌ Throws error if no record found
```

**Changed to:**
```typescript
const { data: staffProfile, error: staffError } = await supabase
  .from('staff_profiles')
  .select('role')
  .eq('id', data.user.id)
  .maybeSingle()  // ✅ Returns null instead of error
```

**Behavior:**
- If admin record exists: `staffProfile` contains role, user redirects to `/admin/dashboard`
- If admin record doesn't exist: `staffProfile` is null, checks student profile
- If student record exists: user redirects to `/student/dashboard`

### 2. Protected Route Component (`/components/protected-route.tsx`)
**Improvements:**
- Changed `.single()` to `.maybeSingle()` for better error handling
- Added explicit check for staff roles ('Admin', 'Accountant', 'Registrar')
- If required role is admin but user doesn't have staff profile, deny access immediately
- Better logging for debugging

## Step-by-Step Admin Setup

### Prerequisite: Admin User Must Exist in Supabase Auth

You need to have already created the admin user in Supabase. If not, do this first:

1. Go to Supabase Dashboard
2. Click on "Authentication" in the left sidebar
3. Click "Add user"
4. Enter email: `admin@unifee.com`
5. Enter password: `Admin@123456`
6. Click "Create user"

### Step 1: Verify Admin User ID
After creating the user, you need to find its UUID:

1. Go to Supabase Dashboard > Authentication > Users
2. Find `admin@unifee.com` in the list
3. Click on the email to view details
4. Copy the **User ID** (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2: Create Staff Profile Record

Run this SQL query in Supabase SQL Editor (replace the UUID with the actual one):

```sql
INSERT INTO public.staff_profiles (id, role, department)
VALUES ('PASTE_USER_ID_HERE', 'Admin', 'Administration')
ON CONFLICT (id) DO NOTHING;
```

Example with actual UUID:
```sql
INSERT INTO public.staff_profiles (id, role, department)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Admin', 'Administration')
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Verify the Setup

Run this verification query to confirm everything is set up:

```sql
-- Check if admin user exists in auth
SELECT id, email FROM auth.users WHERE email = 'admin@unifee.com';

-- Check if admin staff profile exists
SELECT id, role, department FROM public.staff_profiles WHERE role = 'Admin';
```

You should see one row for each query.

### Step 4: Test the Login

1. Go to your app
2. Click "Sign In"
3. Enter: `admin@unifee.com` / `Admin@123456`
4. You should be redirected to `/admin/dashboard`
5. Check browser console for debug logs like: `[v0] Admin user detected with role: Admin`

## Troubleshooting

### Issue: Still seeing student dashboard after login

**Check these:**

1. **Verify the UUID was copied correctly**
   - Run verification SQL query above
   - Make sure `staff_profiles` has the correct admin record

2. **Check browser console logs**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[v0]` prefixed messages
   - They will show which profile was found

3. **Clear browser cookies and try again**
   - The session might be cached
   - Logout, clear cookies, then login again

4. **Verify Supabase connection**
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
   - Look for errors in server logs like "Your project's URL and Key are required"

### Issue: "User profile not found" error

This means neither `staff_profiles` nor `student_profiles` record exists for the user.

**Fix:**
1. Verify admin user exists in Supabase Auth
2. Run the INSERT query in Step 2 above
3. Logout and login again

## Testing Different Roles

### Admin User
- Email: `admin@unifee.com`
- Password: `Admin@123456`
- Expected: `/admin/dashboard`
- Staff profile required: YES (role = 'Admin')

### Student User
- Use the signup form to create a student account
- Expected: `/student/dashboard`
- Student profile required: YES

## Environment Variables

These should already be set by Vercel, but if you see "URL and Key are required" error:

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations
- `SUPABASE_JWT_SECRET` - For JWT verification

Check these in Vercel Project Settings > Environment Variables

## Code Changes Summary

1. **LoginModal**: Changed 2 `.single()` calls to `.maybeSingle()`
2. **ProtectedRoute**: Changed 1 `.single()` call to `.maybeSingle()` and added better validation logic
3. **New verification script**: `scripts/004_verify_and_fix_admin.sql`

These changes ensure:
- ✅ Admin users are correctly identified and redirected
- ✅ Better error messages for debugging
- ✅ No silent failures in the authentication flow
