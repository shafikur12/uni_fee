# ✅ Local Setup Verification Checklist

Use this checklist to verify everything is set up correctly.

---

## Pre-Setup Requirements
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git repository cloned locally
- [ ] Supabase project created and active
- [ ] You have admin access to Supabase dashboard

---

## Step 1: Environment Configuration
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` from Supabase API settings
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase API settings
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` from Supabase API settings
- [ ] `.env.local` file is in `.gitignore` (don't commit credentials)

**Verification:**
```bash
# Check if .env.local exists and has content
cat .env.local
# Should show your Supabase credentials
```

---

## Step 2: Database Schema Setup
- [ ] Opened Supabase SQL Editor
- [ ] Copied entire content from `scripts/001_create_schema.sql`
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked **Run** and waited for completion
- [ ] No SQL errors appeared in Supabase

**Verification in Supabase:**
- [ ] Table `batches` exists (check in Table Editor)
- [ ] Table `students` exists
- [ ] Table `staff_profiles` exists
- [ ] Table `fee_submissions` exists
- [ ] Table `permission_slips` exists
- [ ] All other tables exist (9 total)

---

## Step 3: Authentication Provider Setup
- [ ] Went to Supabase → Authentication → Providers → Email
- [ ] Set "Confirm email" to **OFF** (for development)
- [ ] Clicked Save

**Why:** Allows instant login without email verification during development.

---

## Step 4: Admin User Creation
- [ ] Created user in Supabase Auth with email `admin@unifee.com`
- [ ] Password set to `Admin@123456` (or your own choice)
- [ ] Copied the new user's **UUID**
- [ ] Created record in `staff_profiles` table using that UUID
- [ ] Set role to `'Admin'` in the staff profile

**SQL Verification (run in Supabase SQL Editor):**
```sql
-- Check admin user exists
SELECT id, email FROM auth.users WHERE email = 'admin@unifee.com';

-- Check staff profile exists
SELECT id, role FROM staff_profiles WHERE role = 'Admin';
```
- [ ] Both queries return exactly 1 row
- [ ] UUIDs match between auth.users and staff_profiles

---

## Step 5: Dependencies Installation
- [ ] Ran `npm install` in project root
- [ ] No errors appeared during installation
- [ ] `node_modules` folder was created
- [ ] `package-lock.json` updated

---

## Step 6: Development Server
- [ ] Ran `npm run dev`
- [ ] Server started at `http://localhost:3000`
- [ ] No "Supabase credentials" error messages

---

## Step 7: Admin Login Test
- [ ] Opened `http://localhost:3000` in browser
- [ ] Clicked **Sign In** button
- [ ] Entered email: `admin@unifee.com`
- [ ] Entered password: `Admin@123456`
- [ ] Clicked **Sign In**
- [ ] **Page redirects to `/admin/dashboard`** ✅

---

## Step 8: Debug Verification
- [ ] Opened browser Developer Console (F12)
- [ ] Looked for messages starting with `[v0]`
- [ ] Should see: `[v0] Admin user detected with role: Admin redirecting to admin dashboard`

---

## Troubleshooting Matrix

| Issue | Cause | Solution |
|-------|-------|----------|
| "Your project's URL and Key are required" | `.env.local` missing/wrong | Re-read Step 1, restart server with `npm run dev` |
| "Table does not exist" | Schema not created | Run SQL from Step 2 in Supabase SQL Editor |
| "401 Unauthorized" | Missing/wrong API key | Verify `.env.local` values match Supabase API settings |
| Redirects to student dashboard | Staff profile missing | Create staff_profiles record with admin UUID (Step 4) |
| Hydration mismatch warning | Browser extension | Disable Grammarly/similar extensions, not a code issue |
| Login doesn't work at all | Email verification enabled | Disable email confirmation in Supabase Auth settings |

---

## If Everything Works ✅

1. You should see the Admin Dashboard
2. Navigation shows Admin menu items
3. You can access admin features
4. No error messages in console

---

## Next Steps After Local Setup

1. Create student test accounts
2. Test student dashboard
3. Create additional staff accounts (Accountant, Registrar)
4. Test fee submission workflow
5. Test permission slip generation

---

## Documentation Reference

- **Full Setup Guide:** `COMPLETE_LOCAL_SETUP.md`
- **Quick Reference:** `QUICK_LOCAL_SETUP.txt`
- **Admin Auth Fix:** `ADMIN_AUTH_FIX.md`
- **Environment Setup:** `ENV_SETUP_INSTRUCTIONS.md`

---

## Version Info
- Created: 2026-03-30
- Node.js: 18+
- Next.js: 16+
- Supabase: Latest
