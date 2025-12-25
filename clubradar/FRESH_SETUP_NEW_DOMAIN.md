# Fresh Setup Guide for New Domain (clubradar.in)

## Problem

- ✅ **Localhost works** - All data shows correctly
- ❌ **Production (clubradar.in) doesn't work** - No data showing
- Users who registered on old domain can't see their venues/events on new domain

## Root Cause

The issue is likely:

1. Auto-migration function not created in Supabase production
2. Environment variables not set correctly in Vercel
3. Clerk redirect URLs not configured
4. Users need to log in again on new domain

---

## Complete Fresh Setup Checklist

### ✅ Step 1: Supabase Setup

#### 1.1 Create Auto-Migration Function

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **ClubRadar project**
3. Go to **SQL Editor**
4. Open: `supabase/auto-migrate-user-by-email.sql`
5. **Copy the entire script** and paste it into SQL Editor
6. Click **"Run"**
7. You should see: "Success. No rows returned" (this is normal)

**This function will automatically migrate user data when they log in.**

#### 1.2 Migrate Existing Users (Bulk Migration)

1. In **Supabase SQL Editor**, open: `supabase/bulk-migrate-all-users-after-domain-change.sql`
2. Scroll to **"QUICK MIGRATION"** section (at the bottom)
3. Copy and paste that section
4. Click **"Run"**
5. Check the output - it should show how many users were migrated

**This migrates data for users who have already logged in on the new domain.**

#### 1.3 Approve All Venues

1. In **Supabase SQL Editor**, open: `supabase/approve-existing-venues.sql`
2. Copy and paste the script
3. Click **"Run"**
4. This approves all pending venues so they show in discover page

**Important:** Discover page only shows venues with `status = 'approved'`

---

### ✅ Step 2: Clerk Setup

#### 2.1 Add New Domain to Clerk

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Select your **ClubRadar application**
3. In left sidebar, under **"<> Developers"**, click **"Domains"**
4. If you see your domain listed, click on it
5. If not, look for **"Add Domain"** or check **"Satellites"** tab
6. Add: `clubradar.in` and `www.clubradar.in` (if using www)

#### 2.2 Update Paths in Clerk

1. In Clerk Dashboard, go to **"<> Developers"** → **"Paths"**
2. Update these settings:

**For <SignIn />:**

- Select **"Sign-in page on development host"**
- Enter: `/login`

**For <SignUp />:**

- Select **"Sign-up page on development host"**
- Enter: `/signup`

#### 2.3 Add Redirect URLs

1. Go to **"Domains"** in Clerk Dashboard
2. Click on your domain (`clubradar.in`)
3. Look for **"Allowed redirect URLs"** or **"Redirect URLs"**
4. Add these URLs:
   ```
   https://clubradar.in/**
   https://www.clubradar.in/**
   https://clubradar.in/sso-callback
   https://www.clubradar.in/sso-callback
   https://clubradar.in/discover
   ```
5. Click **"Save"**

---

### ✅ Step 3: Vercel Environment Variables

#### 3.1 Go to Vercel Settings

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **ClubRadar project**
3. Click **"Settings"** → **"Environment Variables"**

#### 3.2 Get Your Clerk Keys

**How to Get Production Keys (`pk_live_` and `sk_live_`):**

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Select your **ClubRadar application**
3. In the left sidebar, under **"<> Developers"**, click **"API Keys"**
4. You'll see two sections:
   - **Test mode keys** (starts with `pk_test_` and `sk_test_`) - for development
   - **Production mode keys** (starts with `pk_live_` and `sk_live_`) - for production

**If you only see test keys:**

- You need to **enable production mode** first
- Look for a toggle or button that says **"Enable Production"** or **"Switch to Production"**
- Once enabled, you'll see the production keys

**Copy these keys:**

- **Publishable Key** (starts with `pk_live_`) → Use for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Secret Key** (starts with `sk_live_`) → Use for `CLERK_SECRET_KEY`

**Important:**

- **Production keys** (`pk_live_` / `sk_live_`) are for your live domain (clubradar.in)
- **Test keys** (`pk_test_` / `sk_test_`) are for development (localhost)
- Make sure you're copying the **production keys** for Vercel

#### 3.3 Add/Update Environment Variables in Vercel

Add or update these variables (make sure to select **"Production"**, **"Preview"**, and **"Development"**):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
CLERK_SECRET_KEY=sk_live_... (or sk_test_...)

# Clerk Paths (Optional but recommended)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for emails)
RESEND_API_KEY=re_... (if using email notifications)
RESEND_FROM_EMAIL=ClubRadar <noreply@clubradar.in>
```

**Important:**

- Use **`pk_live_`** and **`sk_live_`** for production (clubradar.in)
- Use **`pk_test_`** and **`sk_test_`** for development (localhost)
- Make sure all variables are set for **"Production"** environment

#### 3.4 Redeploy After Updating Variables

1. After updating environment variables, go to **"Deployments"** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

### ✅ Step 4: Verify Code is Deployed

#### 4.1 Check User Sync Route

Make sure the updated `app/api/users/sync/route.ts` is deployed. It should have the auto-migration code.

**Check if it's in your code:**

- Open: `app/api/users/sync/route.ts`
- Look for: `migrate_user_data_by_email` function call
- If it's there, it's ready to deploy

#### 4.2 Deploy to Vercel

```bash
git add .
git commit -m "feat: add auto-migration for user data"
git push
```

Vercel will automatically deploy.

---

### ✅ Step 5: Test the Setup

#### 5.1 Test Login

1. Go to: https://clubradar.in/login
2. Log in with an existing user (e.g., pushpeshlodiwal1711@gmail.com)
3. Check Vercel logs for: "Auto-migrated data for user..."
4. You should be redirected to `/discover`

#### 5.2 Check Venue Dashboard

1. After logging in, go to: https://clubradar.in/venue/dashboard
2. You should see your venue and events
3. If not, check the migration status (see Step 6)

#### 5.3 Check Discover Page

1. Go to: https://clubradar.in/discover
2. You should see approved venues
3. If not, check if venues are approved (see Step 1.3)

---

### ✅ Step 6: Manual Migration (If Auto-Migration Didn't Work)

If users still can't see their data after logging in:

#### 6.1 Check Migration Status

Run this in Supabase SQL Editor:

```sql
-- Check if user has data on old user_id
SELECT
  u.id as user_id,
  u.email,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com'
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at;
```

#### 6.2 Run Manual Migration

If you see data on old user_id, run:

```sql
-- Use the fix script
-- Open: supabase/fix-venue-not-showing.sql
-- Run the "QUICK FIX" section
```

---

## Complete Checklist

### Supabase ✅

- [ ] Auto-migration function created
- [ ] Bulk migration run for existing users
- [ ] All venues approved (status = 'approved')

### Clerk ✅

- [ ] New domain added (clubradar.in)
- [ ] SignIn path set to `/login` (development host)
- [ ] SignUp path set to `/signup` (development host)
- [ ] Redirect URLs added (https://clubradar.in/**)

### Vercel ✅

- [ ] Clerk publishable key set (pk*live*...)
- [ ] Clerk secret key set (sk*live*...)
- [ ] Supabase URL set
- [ ] Supabase keys set
- [ ] All variables set for "Production" environment
- [ ] Application redeployed after updating variables

### Code ✅

- [ ] User sync route has auto-migration code
- [ ] Code pushed to git and deployed

### Testing ✅

- [ ] Can log in on new domain
- [ ] Venue dashboard shows data
- [ ] Discover page shows venues
- [ ] Events are visible

---

## Quick Start Commands

### 1. Create Migration Function in Supabase

```sql
-- Copy from: supabase/auto-migrate-user-by-email.sql
-- Paste in Supabase SQL Editor and run
```

### 2. Migrate Existing Users

```sql
-- Copy from: supabase/bulk-migrate-all-users-after-domain-change.sql
-- Run the "QUICK MIGRATION" section
```

### 3. Approve All Venues

```sql
-- Copy from: supabase/approve-existing-venues.sql
-- Run the script
```

### 4. Update Vercel Environment Variables

1. Go to Vercel → Settings → Environment Variables
2. Add/update all variables listed above
3. Redeploy

---

## Troubleshooting

### Issue: Users Still Can't See Data

**Solution:**

1. Check if auto-migration function exists: `SELECT migrate_user_data_by_email('test', 'test@test.com');`
2. Check Vercel logs for migration messages
3. Run manual migration script for specific users
4. Verify venues are approved

### Issue: Discover Page Shows "No Venues Found"

**Solution:**

1. Check if venues exist: `SELECT * FROM public.venues;`
2. Check venue status: `SELECT status, COUNT(*) FROM public.venues GROUP BY status;`
3. Approve pending venues: Run `supabase/approve-existing-venues.sql`
4. Verify API is working: Check `/api/venues` endpoint

### Issue: Can't Log In

**Solution:**

1. Check Clerk redirect URLs are set
2. Verify environment variables in Vercel
3. Check Vercel logs for errors
4. Verify domain is added in Clerk

---

## Summary

**The main steps are:**

1. ✅ **Create auto-migration function** in Supabase
2. ✅ **Run bulk migration** for existing users
3. ✅ **Approve all venues** so they show in discover
4. ✅ **Configure Clerk** with new domain and redirect URLs
5. ✅ **Update Vercel environment variables** with correct keys
6. ✅ **Redeploy** application
7. ✅ **Test** login and data visibility

**After completing these steps, everything should work on your new domain!**

---

## Files to Use

1. `supabase/auto-migrate-user-by-email.sql` - Create migration function
2. `supabase/bulk-migrate-all-users-after-domain-change.sql` - Migrate existing users
3. `supabase/approve-existing-venues.sql` - Approve all venues
4. `supabase/fix-venue-not-showing.sql` - Fix specific user issues

All these files are in your `supabase/` folder.
