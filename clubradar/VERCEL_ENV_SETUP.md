# Vercel Environment Variables Setup Guide

## Problem
After deploying to Vercel, you're seeing:
- **"Server configuration error"** when fetching bookings
- **No venues showing up** in the discover page

This happens because **environment variables are not configured in Vercel**. Your `.env.local` file is only for local development and is **not deployed** to Vercel.

---

## Required Environment Variables

You need to add these environment variables in your **Vercel Dashboard**:

### 1. Supabase Configuration (REQUIRED)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
- Go to your **Supabase Dashboard** → **Project Settings** → **API**
- **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** (secret) = `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

---

### 2. Clerk Authentication (REQUIRED)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Where to find these:**
- Go to your **Clerk Dashboard** → **API Keys**
- **Publishable key** = `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Secret key** = `CLERK_SECRET_KEY` ⚠️ **Keep this secret!**

---

### 3. Optional: Razorpay (if using payments)

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

### 4. Optional: NextAuth (if using)

```
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

---

## How to Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and log in
2. Select your project: **ClubRadarpublic**

### Step 2: Navigate to Settings
1. Click on your project
2. Go to **Settings** tab (top navigation)
3. Click **Environment Variables** in the left sidebar

### Step 3: Add Each Variable
For each environment variable:

1. Click **Add New**
2. Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter the **Value** (copy from your `.env.local` or Supabase/Clerk dashboard)
4. Select **Environments**:
   - ✅ **Production** (for live site)
   - ✅ **Preview** (for pull request previews)
   - ✅ **Development** (optional, for Vercel CLI)
5. Click **Save**

### Step 4: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeploy

---

## Quick Checklist

Copy this list and check off each variable as you add it:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `RAZORPAY_KEY_ID` (if using payments)
- [ ] `RAZORPAY_KEY_SECRET` (if using payments)
- [ ] `NEXTAUTH_SECRET` (if using NextAuth)
- [ ] `NEXTAUTH_URL` (if using NextAuth)

---

## Verify Environment Variables Are Set

After redeploying, you can verify by:

1. **Check Vercel Build Logs:**
   - Go to **Deployments** → Click on a deployment
   - Check the build logs for any "Missing Supabase configuration" errors

2. **Test the API:**
   - Visit: `https://your-app.vercel.app/api/health`
   - Should return environment variable status

3. **Test in Browser:**
   - Try fetching bookings: `/bookings`
   - Try viewing venues: `/discover`
   - Should work without "Server configuration error"

---

## Common Issues

### Issue 1: "Server configuration error" still appears
**Solution:**
- Make sure you **redeployed** after adding environment variables
- Check that variable names match **exactly** (case-sensitive)
- Verify values are correct (no extra spaces, quotes, or newlines)

### Issue 2: Variables work locally but not on Vercel
**Solution:**
- `.env.local` is **not deployed** to Vercel
- You **must** add them in Vercel Dashboard
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-only (more secure)

### Issue 3: "Unauthorized" errors
**Solution:**
- Check `CLERK_SECRET_KEY` is set correctly
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` matches your Clerk dashboard

### Issue 4: Database connection errors
**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (should start with `https://`)
- Check `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon key)
- Ensure your Supabase project is **active** (not paused)

---

## Security Notes

⚠️ **IMPORTANT:**
- **Never commit** `.env.local` to Git
- **Never share** `SUPABASE_SERVICE_ROLE_KEY` or `CLERK_SECRET_KEY` publicly
- Vercel encrypts environment variables at rest
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser (use carefully)

---

## Need Help?

If you're still seeing errors after setting up environment variables:

1. Check **Vercel Build Logs** for specific error messages
2. Verify your **Supabase project** is active and accessible
3. Test your **Clerk keys** are valid
4. Make sure you **redeployed** after adding variables

---

## Example: What Your Vercel Environment Variables Should Look Like

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abcdefghijklmnopqrstuvwxyz1234567890
CLERK_SECRET_KEY=sk_test_abcdefghijklmnopqrstuvwxyz1234567890
```

---

**After completing this setup, your Vercel deployment should work correctly!** 🎉

