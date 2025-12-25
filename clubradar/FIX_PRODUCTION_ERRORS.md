# Fix Production Errors on clubradar.in

## Errors You're Seeing

1. ❌ **Clerk using development keys** - Should use production keys
2. ❌ **API routes returning 500** - "Server configuration error"
3. ❌ **Venues not loading** - API failing

---

## Issue 1: Clerk Development Keys in Production

### Problem
Clerk is using `pk_test_` keys instead of `pk_live_` keys in production.

### Solution

1. **Get Production Keys from Clerk:**
   - Go to **Clerk Dashboard** → **Developers** → **API Keys**
   - Look for **Production mode keys** (starts with `pk_live_` and `sk_live_`)
   - If you don't see them, you need to **enable production mode** first

2. **Update Vercel Environment Variables:**
   - Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
   - Find `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Update it to: `pk_live_...` (production key)
   - Find `CLERK_SECRET_KEY`
   - Update it to: `sk_live_...` (production secret key)
   - **Important:** Make sure these are set for **"Production"** environment

3. **Redeploy:**
   - After updating, **redeploy** your application
   - Go to **Deployments** → Click **"..."** → **"Redeploy"**

---

## Issue 2: Server Configuration Error (500)

### Problem
API routes are returning "Server configuration error" which means Supabase environment variables are missing or incorrect.

### Solution

1. **Check Vercel Environment Variables:**
   - Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
   - Verify these are set:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

2. **Get Supabase Keys:**
   - Go to **Supabase Dashboard** → **Settings** → **API**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret) → Use for `SUPABASE_SERVICE_ROLE_KEY`

3. **Add/Update in Vercel:**
   - Make sure all three variables are set
   - **Important:** Set for **"Production"** environment
   - Double-check there are no typos or extra spaces

4. **Redeploy:**
   - After updating, **redeploy** your application

---

## Complete Environment Variables Checklist

Make sure ALL these are set in Vercel for **Production**:

```env
# Clerk (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional but Recommended
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

---

## Step-by-Step Fix

### Step 1: Fix Clerk Keys

1. Go to **Clerk Dashboard** → **Developers** → **API Keys**
2. Enable production mode (if not enabled)
3. Copy `pk_live_...` and `sk_live_...` keys
4. Update in **Vercel** → **Settings** → **Environment Variables**
5. Make sure they're set for **"Production"**

### Step 2: Fix Supabase Keys

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy:
   - Project URL
   - anon/public key
   - service_role key (click "Reveal" to see full key)
3. Update in **Vercel** → **Settings** → **Environment Variables**
4. Make sure they're set for **"Production"**

### Step 3: Redeploy

1. After updating all variables, go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test

1. Go to: https://www.clubradar.in/discover
2. Check browser console (F12) - errors should be gone
3. Venues should load
4. Try logging in - should work

---

## Verify Environment Variables Are Set

### Check in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. You should see all the variables listed above
3. Make sure they're set for **"Production"** (not just Development/Preview)

### Test API Routes

After redeploying, check Vercel logs:
1. Go to **Deployments** → Click on latest deployment → **"Logs"**
2. Look for any errors about missing environment variables
3. If you see errors, the variables aren't set correctly

---

## Common Mistakes

1. **Using test keys in production** → Update to `pk_live_` and `sk_live_`
2. **Variables set for wrong environment** → Make sure they're set for "Production"
3. **Typos in variable names** → Double-check spelling
4. **Missing service_role key** → This is critical for API routes
5. **Not redeploying after updating** → Always redeploy after changing variables

---

## Quick Checklist

- [ ] Clerk production keys set (`pk_live_` and `sk_live_`)
- [ ] Supabase URL set (`NEXT_PUBLIC_SUPABASE_URL`)
- [ ] Supabase anon key set (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Supabase service role key set (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] All variables set for **"Production"** environment
- [ ] Application redeployed after updating variables
- [ ] Tested on production domain

---

## After Fixing

1. ✅ Clerk warning should disappear
2. ✅ API routes should work (no 500 errors)
3. ✅ Venues should load on discover page
4. ✅ Users can log in and see their data

---

## Still Getting Errors?

If you're still seeing "Server configuration error":

1. **Check Vercel logs** for specific error messages
2. **Verify variable names** are exactly correct (case-sensitive)
3. **Check if variables are set for Production** (not just Preview/Development)
4. **Try redeploying** again after double-checking

The issue is almost certainly missing or incorrect environment variables in Vercel!

