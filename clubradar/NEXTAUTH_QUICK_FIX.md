# 🚨 NextAuth Quick Fix - Missing Environment Variables

## Error You're Seeing

```
GET /api/auth/session 500 (Internal Server Error)
ClientFetchError: Unexpected end of JSON input
```

## Cause

Missing required environment variables in `.env.local`.

---

## Quick Fix (5 minutes)

### Step 1: Generate NextAuth Secret

Run this in your terminal:

```bash
openssl rand -base64 32
```

**Copy the output** - you'll need it.

---

### Step 2: Get Supabase Service Role Key

1. Go to **Supabase Dashboard**
2. **Settings** → **API**
3. Scroll to **"service_role"** key
4. **Copy it** (it's different from the anon key!)

---

### Step 3: Create/Update `.env.local`

Create or update `.env.local` in your project root (`clubradar/.env.local`):

```env
# NextAuth (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=paste-your-generated-secret-here

# Supabase (REQUIRED - you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here

# Email (OPTIONAL for now - can test without it)
# EMAIL_SERVER=smtp://...
# EMAIL_FROM=noreply@clubradar.com
```

---

### Step 4: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## What Changed

The code now:
- ✅ Handles missing env vars gracefully
- ✅ Falls back to JWT strategy if adapter not configured
- ✅ Shows helpful error messages
- ✅ Won't crash on startup

---

## Test

1. **Restart your dev server**
2. **Check console** - should see no errors
3. **Go to** `/login`
4. **Try sending a magic link** (will fail without email, but won't crash)

---

## Next Steps

Once the 500 error is fixed:

1. **Set up email service** (see `NEXTAUTH_SETUP.md`)
2. **Create NextAuth tables in Supabase** (see `NEXTAUTH_SETUP.md`)
3. **Test the full login flow**

---

## Still Getting Errors?

Check:
- ✅ `.env.local` file exists in `clubradar/` folder
- ✅ All variables are set (no empty values)
- ✅ No typos in variable names
- ✅ Dev server was restarted after adding vars

