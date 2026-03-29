# Complete Local Setup Guide - UniFee Project

## Prerequisites
- Node.js 18+ installed
- Git cloned: `uni_fee` repository
- Supabase project created

---

## STEP 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy these values:

| Variable | Where to Find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Under "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Under "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Under "service_role secret" key |

---

## STEP 2: Create `.env.local` File

In the project root directory, create a file called `.env.local`:

```bash
# Open terminal in project root
cd uni_fee

# Create the file (or use your text editor)
touch .env.local
```

Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** Replace the placeholder values with your actual Supabase credentials!

---

## STEP 3: Create Database Tables

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/scripts/001_create_schema.sql`
4. Paste into the SQL Editor
5. Click **Run**
6. Wait for completion (usually 5-10 seconds)

### Option B: Using Node Script

```bash
# Install dependencies first
npm install

# Run the setup script
node scripts/setup-database.mjs
```

---

## STEP 4: Disable Email Verification (Optional but Recommended)

1. Go to Supabase Dashboard → **Authentication**
2. Navigate to **Providers** → **Email**
3. Under "Email Confirmations", toggle **OFF**
4. Save changes

This allows instant login without email verification.

---

## STEP 5: Create First Admin User

### Method 1: Via Supabase Auth Dashboard

1. Go to Supabase → **Authentication** → **Users**
2. Click **Add user**
3. Email: `admin@unifee.com`
4. Password: `Admin@123456` (or choose your own)
5. Click **Create user**
6. **Copy the User ID** (UUID format)

### Method 2: Create Staff Profile

1. Go to Supabase → **SQL Editor**
2. Create new query and run:

```sql
-- First, create the admin user (if not already created)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@unifee.com',
  crypt('Admin@123456', gen_salt('bf')),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Then create the staff profile
INSERT INTO public.staff_profiles (id, role, department)
SELECT id, 'Admin', 'Administration'
FROM auth.users
WHERE email = 'admin@unifee.com'
ON CONFLICT DO NOTHING;
```

---

## STEP 6: Install Dependencies & Run

```bash
# Install all dependencies
npm install

# Start development server
npm run dev
```

Server will start at: **http://localhost:3000**

---

## STEP 7: Test the Setup

### Login Test

1. Open **http://localhost:3000**
2. Click **Sign In**
3. Enter credentials:
   - Email: `admin@unifee.com`
   - Password: `Admin@123456`
4. Expected: Redirect to **Admin Dashboard** ✅

### Check Debug Logs

Open browser **Developer Console** (F12) and look for messages like:

```
[v0] Staff profile check: { staffProfile: { id: 'xxx', role: 'Admin' }, staffError: null, userId: 'xxx' }
[v0] Admin user detected with role: Admin redirecting to admin dashboard
```

---

## Troubleshooting

### "Your project's URL and Key are required"
- ❌ `.env.local` file missing or incorrect values
- ✅ Create `.env.local` with correct Supabase credentials
- ✅ Restart dev server after creating `.env.local`

### "Could not find table"
- ❌ Database tables not created
- ✅ Run SQL from `/scripts/001_create_schema.sql` in Supabase SQL Editor
- ✅ Verify tables exist in Supabase → Table Editor

### "Admin redirects to student dashboard"
- ❌ Staff profile not created
- ✅ Create staff profile record with admin user ID
- ✅ Verify `staff_profiles` table has a record with `role = 'Admin'`

### Hydration mismatch warning
- This is usually caused by browser extensions (Grammarly, etc)
- ⚠️ Not a code issue - can be ignored
- ✅ Disable extensions in browser for testing

---

## Quick Reference

```bash
# Clone and setup
git clone https://github.com/shafikur12/uni_fee.git
cd uni_fee

# Create .env.local (with your Supabase credentials)
echo "NEXT_PUBLIC_SUPABASE_URL=..." > .env.local

# Install and run
npm install
npm run dev

# Open in browser
# http://localhost:3000
```

---

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| `batches` | Academic batches/cohorts |
| `students` | Student records |
| `staff_profiles` | Admin/Accountant/Registrar accounts |
| `fee_submissions` | Student fee payment submissions |
| `permission_slips` | Exam permission documents |
| `audit_logs` | System activity logs |

---

## Getting Help

- Check browser console for `[v0]` debug messages
- Verify Supabase tables exist: Supabase Dashboard → SQL Editor
- Check `.env.local` values match Supabase credentials
- Restart dev server after any `.env.local` changes

---

**Last Updated:** 2026-03-30
**Version:** 1.0
