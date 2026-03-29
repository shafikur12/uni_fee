# How to Fix the Supabase Error in Your Local Environment

## The Problem
Your local environment is missing the Supabase environment variables. The error shows:
```
Error: Your project's URL and Key are required to create a Supabase client!
```

## Solution: Create `.env.local` File

1. **In your project root**, create a file named `.env.local` (in the same directory as `package.json`)

2. **Add these environment variables** (Get the actual values from your Supabase project):

```env
# Get these from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Optional: Blob storage (if using Vercel Blob)
BLOB_READ_WRITE_TOKEN=YOUR_BLOB_TOKEN_HERE
```

## How to Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → paste as `SUPABASE_SERVICE_ROLE_KEY`

## Example `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## After Creating `.env.local`

1. **Stop the dev server** (Ctrl+C in terminal)
2. **Start it again** with `npm run dev`
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Hard refresh** the page (Ctrl+Shift+R)

## Verify It Works

- The Supabase errors should disappear
- You should see the login page load
- The hydration warning will also disappear once Supabase is working

## Important Note

⚠️ **Never commit `.env.local` to Git!** It's already in `.gitignore` (verify by checking the file exists).

The `.env.local` file should be:
- ✅ In your project root (same directory as package.json)
- ✅ Listed in `.gitignore`
- ✅ Only on your local machine
