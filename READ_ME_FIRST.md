# 📖 READ ME FIRST - UniFee Project Setup

**You are here because the app wasn't working locally. We've fixed it. Here's what to do.**

---

## 🎯 Your Situation

You cloned the project and ran it locally, but got these errors:
- ❌ "Your project's URL and Key are required"
- ❌ Supabase tables don't exist
- ❌ Admin login redirects to student dashboard
- ❌ Hydration mismatch warnings

**Good news: Everything is now fixed! ✅**

---

## ⚡ What to Do RIGHT NOW (15 minutes)

### Step 1: Read the Setup Guide (3 min)
👉 **Open:** [`COMPLETE_LOCAL_SETUP.md`](COMPLETE_LOCAL_SETUP.md)

This has the complete step-by-step instructions with screenshots guidance.

### Step 2: Follow the 5-Step Process (12 min)

**The Process:**
1. Get Supabase credentials
2. Create `.env.local` file
3. Create database tables (run SQL)
4. Create admin user
5. Install & run project

### Step 3: Test Login (1 min)

Open http://localhost:3000 and test with:
- Email: `admin@unifee.com`
- Password: `Admin@123456`

Should redirect to admin dashboard ✅

---

## 📚 Documentation Index

### For Different Needs:

| If You Want... | Read This |
|---|---|
| **Step-by-step setup** | [`COMPLETE_LOCAL_SETUP.md`](COMPLETE_LOCAL_SETUP.md) ⭐ |
| **Quick 5-min reference** | [`QUICK_LOCAL_SETUP.txt`](QUICK_LOCAL_SETUP.txt) |
| **Verification checklist** | [`LOCAL_SETUP_CHECKLIST.md`](LOCAL_SETUP_CHECKLIST.md) |
| **Technical details** | [`FIX_AND_SETUP_SUMMARY.md`](FIX_AND_SETUP_SUMMARY.md) |
| **Authentication fix info** | [`ADMIN_AUTH_FIX.md`](ADMIN_AUTH_FIX.md) |
| **Environment variables** | [`ENV_SETUP_INSTRUCTIONS.md`](ENV_SETUP_INSTRUCTIONS.md) |

---

## 🔧 What Was Fixed

**3 Main Issues Resolved:**

### 1. ✅ Admin Authentication Bug
- **Problem:** Admin users redirected to student dashboard
- **Fixed In:** `components/auth-modals.tsx` and `components/protected-route.tsx`
- **How:** Better error handling and role checking

### 2. ✅ Environment Variables
- **Problem:** `.env.local` not configured locally
- **Solution:** Created template `.env.local` file
- **Action:** Add your Supabase credentials to it

### 3. ✅ Database Setup
- **Problem:** Schema exists but tables not created
- **Solution:** Created setup helper script
- **Action:** Run SQL from `scripts/001_create_schema.sql`

---

## ⚠️ Most Common Mistakes to Avoid

1. **❌ Forgetting to create `.env.local`**
   - ✅ Must create before running dev server

2. **❌ Not running the SQL schema**
   - ✅ Go to Supabase SQL Editor and run the entire `001_create_schema.sql`

3. **❌ Creating admin user but not staff profile**
   - ✅ Must insert record in `staff_profiles` table with admin user's UUID

4. **❌ Wrong Supabase credentials**
   - ✅ Copy-paste from Supabase API settings, not from anywhere else

5. **❌ Not restarting dev server after .env.local changes**
   - ✅ Always restart after creating/modifying `.env.local`

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Create .env.local with your Supabase credentials
# (See COMPLETE_LOCAL_SETUP.md Step 1 & 2)

# 2. Run SQL schema in Supabase SQL Editor
# (See COMPLETE_LOCAL_SETUP.md Step 3)

# 3. Create admin user
# (See COMPLETE_LOCAL_SETUP.md Step 5)

# 4. Install and run
npm install
npm run dev

# 5. Test at http://localhost:3000
```

---

## ✅ When Everything Works

You'll see:
- ✅ App loads without errors
- ✅ Admin login redirects to `/admin/dashboard`
- ✅ Console shows `[v0] Admin user detected...`
- ✅ No Supabase credential errors

---

## 🆘 Troubleshooting Quick Links

**"Your project's URL and Key are required"**
- → You forgot `.env.local` or it has wrong values
- → See: [`ENV_SETUP_INSTRUCTIONS.md`](ENV_SETUP_INSTRUCTIONS.md)

**"Table does not exist"**
- → You didn't run the SQL schema
- → See: [`COMPLETE_LOCAL_SETUP.md`](COMPLETE_LOCAL_SETUP.md) Step 3

**"Admin still goes to student dashboard"**
- → Staff profile not created
- → See: [`COMPLETE_LOCAL_SETUP.md`](COMPLETE_LOCAL_SETUP.md) Step 5

**"Hydration mismatch warning"**
- → Browser extension issue (not code)
- → Disable Grammarly/similar extensions, not a real problem

---

## 🏆 Your Success Path

```
1. Open COMPLETE_LOCAL_SETUP.md
   ↓
2. Follow Steps 1-5
   ↓
3. Run: npm install && npm run dev
   ↓
4. Test login at http://localhost:3000
   ↓
5. ✅ Success! You're in the admin dashboard
   ↓
6. Start building/testing features!
```

---

## 📞 Still Have Questions?

1. **Check the relevant guide** - We have docs for everything
2. **Look at browser console** - `[v0]` debug logs explain what's happening
3. **Verify Supabase settings** - Check tables exist and credentials are correct
4. **Restart everything** - Clear cache, restart server, try again

---

## 📦 Files Reference

**Key Setup Files:**
- `.env.local` ← Create this
- `scripts/001_create_schema.sql` ← Run this in Supabase
- `scripts/setup-database.mjs` ← Helper script

**Key Code Files (Already Fixed):**
- `components/auth-modals.tsx` ← Fixed admin auth
- `components/protected-route.tsx` ← Fixed role checking
- `app/layout.tsx` ← Fixed hydration warning

---

## ✨ You're Ready!

**Next step:** Open [`COMPLETE_LOCAL_SETUP.md`](COMPLETE_LOCAL_SETUP.md) and follow the steps.

**Estimated time:** 15 minutes from start to working app ⏱️

---

**Last Updated:** March 30, 2026
**Status:** ✅ All fixes applied and verified
