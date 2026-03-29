# Pre-Launch Checklist ✓

Use this checklist to verify everything is set up correctly before running the dev server.

## Supabase Configuration

- [ ] Email verification is **disabled**
  - Go to: Supabase Dashboard > Authentication > Providers > Email
  - Turn OFF "Confirm email"
  - Save changes

## Admin Account Setup

- [ ] Admin user created in Supabase Auth
  - Email: `admin@unifee.com`
  - Password: `Admin@123456`
  - Status: Active in users list

- [ ] Admin user ID copied
  - Go to: Supabase > Authentication > Users
  - Find `admin@unifee.com`
  - Copy the User ID (UUID)

- [ ] Staff profile record created in database
  - Go to: Supabase > SQL Editor
  - Run the INSERT query with the admin user UUID:
    ```sql
    INSERT INTO public.staff_profiles (id, role, department)
    VALUES ('PASTE_ADMIN_USER_ID_HERE', 'Admin', 'Administration')
    ON CONFLICT (id) DO NOTHING;
    ```

- [ ] Verify staff_profiles record exists
  - Run verification query:
    ```sql
    SELECT id, role FROM public.staff_profiles WHERE role = 'Admin';
    ```
  - Should return one row

## Code Verification

- [ ] LoginModal component updated
  - File: `components/auth-modals.tsx`
  - Uses `.maybeSingle()` for staff profile query
  - Uses `.maybeSingle()` for student profile query

- [ ] ProtectedRoute component updated
  - File: `components/protected-route.tsx`
  - Uses `.maybeSingle()` for staff profile query
  - Has explicit role validation

- [ ] Documentation files present
  - `SETUP_GUIDE.md` ✓
  - `ADMIN_AUTH_FIX.md` ✓
  - `FIX_SUMMARY.md` ✓
  - `README_FIX.md` ✓
  - `QUICK_START.sh` ✓

## Environment Verification

- [ ] Supabase URL is set
  - Check: `NEXT_PUBLIC_SUPABASE_URL`
  - Should be: `https://xxxx.supabase.co`

- [ ] Supabase Anon Key is set
  - Check: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Should be: A long string starting with `eyJ...`

- [ ] Service Role Key is set
  - Check: `SUPABASE_SERVICE_ROLE_KEY`
  - Should be: A long string starting with `eyJ...`

## Ready to Launch

### Run Development Server
```bash
npm run dev
```

Expected output:
```
> next dev

  ▲ Next.js 16.2.0
  - Local: http://localhost:3000
  ✓ Ready in Xs
```

### Test Admin Login

1. Open: http://localhost:3000
2. Click: **Sign In**
3. Enter credentials:
   - Email: `admin@unifee.com`
   - Password: `Admin@123456`
4. Click: **Sign In**
5. Expected: Redirected to `/admin/dashboard`

Check browser console (F12 > Console) for:
```
[v0] Staff profile check: { staffProfile: { id: '...', role: 'Admin' }, ... }
[v0] Admin user detected with role: Admin redirecting to admin dashboard
```

## Troubleshooting Checklist

If admin is still redirected to student dashboard:

- [ ] Verified admin user ID matches staff_profiles ID
  - Admin ID from `auth.users`
  - Staff profile ID from `staff_profiles` 
  - Should be identical UUIDs

- [ ] Checked browser console for `[v0]` debug messages
  - Look for what profiles were found/not found

- [ ] Cleared browser cookies
  - Delete all cookies for localhost:3000
  - Close and reopen the browser
  - Try login again

- [ ] Restarted dev server
  - Ctrl+C to stop
  - `npm run dev` to start again

- [ ] Ran verification script
  ```bash
  node scripts/verify-admin-setup.mjs
  ```

## Database Verification

Run these queries in Supabase SQL Editor to verify everything:

```sql
-- Check if admin user exists in auth
SELECT id, email, created_at FROM auth.users 
WHERE email = 'admin@unifee.com';

-- Check if staff_profiles has admin record
SELECT id, role, department, created_at FROM public.staff_profiles 
WHERE role = 'Admin';

-- Verify they match
SELECT 
  u.id AS user_id,
  u.email,
  sp.role,
  sp.department
FROM auth.users u
LEFT JOIN public.staff_profiles sp ON u.id = sp.id
WHERE u.email = 'admin@unifee.com';
```

All three queries should return exactly one row each.

## Next Steps After Successful Login

1. ✅ Create a test batch
   - Go to Admin Dashboard > Batches
   - Create New Batch
   - Fill in required fields

2. ✅ Create a test student
   - Go to http://localhost:3000
   - Click Sign Up
   - Fill in student details
   - Select the test batch
   - Create account

3. ✅ Test student login
   - Sign out
   - Sign in with student credentials
   - Should see student dashboard

4. ✅ Test verification flow
   - As student: Upload a receipt
   - As admin: Review and approve
   - Student should receive permission slip

## Quick Reference

| Role | Email | Password | Expected Page |
|------|-------|----------|-----------------|
| Admin | admin@unifee.com | Admin@123456 | /admin/dashboard |
| Student | (create via signup) | (your password) | /student/dashboard |

## Getting Help

If you encounter issues:

1. Check `README_FIX.md` for detailed explanation
2. Check `ADMIN_AUTH_FIX.md` for troubleshooting
3. Check `SETUP_GUIDE.md` for setup instructions
4. Run `node scripts/verify-admin-setup.mjs` to check setup
5. Check browser console for `[v0]` debug messages

---

**Ready to launch? Run:** `npm run dev`
