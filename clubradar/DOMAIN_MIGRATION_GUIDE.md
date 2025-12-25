# Domain Migration Guide - Fixing Venues & User Sessions

## Issues After Domain Change

After migrating from `club-radarpublic-v8hg.vercel.app` to `clubradar.in`, you may experience:
1. **Venues not showing on discover page** - Venues need to be approved
2. **Users can't log in** - Clerk needs to be updated with new domain

---

## Issue 1: Venues Not Showing on Discover Page

### Problem
The discover page only shows venues with `status = 'approved'`, but newly registered venues are created with `status = 'pending'`.

### Solution: Approve Existing Venues

#### Option A: Approve All Pending Venues (Quick Fix)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your ClubRadar project
3. Click on **"SQL Editor"** in the left sidebar
4. Run this SQL script:

```sql
-- Approve all pending venues
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE status = 'pending';
```

5. Click **"Run"** to execute
6. Verify by checking the venues table - all should now have `status = 'approved'`

#### Option B: Approve Specific Venues (Selective)

If you want to review and approve venues one by one:

1. Go to **Supabase Dashboard** → **Table Editor** → **venues** table
2. Find venues with `status = 'pending'`
3. Click on each venue row
4. Change `status` from `'pending'` to `'approved'`
5. Click **"Save"**

#### Option C: Use the SQL Script File

A SQL script has been created at `supabase/approve-existing-venues.sql`. You can:
1. Open it in your editor
2. Copy the SQL
3. Paste it into Supabase SQL Editor
4. Run it

### Verify Venues Are Showing

1. Go to your website: https://www.clubradar.in/discover
2. You should now see all approved venues
3. If still not showing, check browser console for errors

---

## Issue 2: Users Can't Log In (Clerk Configuration)

### Problem
After changing domains, Clerk needs to be updated with the new domain URLs.

### Solution: Update Clerk Configuration

#### Step 1: Update Clerk Dashboard Settings

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Select your ClubRadar application
3. Go to **"Configure"** → **"Domains"** (or **"Settings"** → **"Domains"**)

#### Step 2: Add New Domain

1. Add your new domain: `clubradar.in`
2. Also add: `www.clubradar.in` (if you're using www)
3. Remove the old Vercel domain if you're no longer using it

#### Step 3: Update Redirect URLs

1. Go to **"Configure"** → **"Paths"** (or **"Settings"** → **"Paths"**)
2. Update the following URLs:

**Allowed Redirect URLs:**
```
https://www.clubradar.in/**
https://clubradar.in/**
https://www.clubradar.in/sso-callback
https://clubradar.in/sso-callback
```

**Sign-in Redirect URL:**
```
https://www.clubradar.in/discover
```

**Sign-up Redirect URL:**
```
https://www.clubradar.in/discover
```

#### Step 4: Update Environment Variables in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your ClubRadar project
3. Go to **"Settings"** → **"Environment Variables"**
4. Verify these variables are set correctly:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
CLERK_SECRET_KEY=sk_live_... (or sk_test_...)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

5. If you changed from test to production keys, update them here
6. **Redeploy** your application after updating environment variables

#### Step 5: Verify Clerk is Working

1. Go to https://www.clubradar.in/login
2. Try logging in with an existing user
3. If it works, you should be redirected to `/discover`
4. If it doesn't work, check:
   - Browser console for errors
   - Vercel logs for API errors
   - Clerk dashboard for any warnings

---

## Issue 3: Old Users Not Showing (Session Issues)

### Problem
After domain change, existing users might need to log in again because cookies are domain-specific.

### Solution

This is **normal behavior**. Users need to:
1. Log out (if they're still logged in on old domain)
2. Log in again on the new domain
3. Their data will still be there - it's just a new session

### If Users Can't Access Their Data

1. **Check if user exists in Supabase:**
   - Go to Supabase Dashboard → Table Editor → `users` table
   - Search for the user's email
   - If not found, they need to log in again (which will create the user record)

2. **Check if venue exists:**
   - Go to Supabase Dashboard → Table Editor → `venues` table
   - Search for venues by owner email or user_id
   - If venue exists but status is "pending", approve it (see Issue 1)

3. **Verify Clerk user exists:**
   - Go to Clerk Dashboard → Users
   - Search for the user's email
   - If user exists, they should be able to log in
   - If not, they need to sign up again

---

## Quick Checklist

- [ ] Approve all pending venues in Supabase
- [ ] Update Clerk domain settings
- [ ] Update Clerk redirect URLs
- [ ] Verify environment variables in Vercel
- [ ] Redeploy application on Vercel
- [ ] Test login on new domain
- [ ] Test venue discovery page
- [ ] Test venue dashboard access

---

## Troubleshooting

### Venues Still Not Showing

1. **Check browser console** for API errors
2. **Check Vercel logs** for server errors
3. **Verify venue status** in Supabase (should be "approved")
4. **Check API route** `/api/venues` is accessible

### Users Still Can't Log In

1. **Check Clerk dashboard** for any errors or warnings
2. **Verify redirect URLs** are correct in Clerk
3. **Check Vercel environment variables** are set
4. **Clear browser cookies** and try again
5. **Check Vercel logs** for authentication errors

### Old Users Can't See Their Venues

1. **Verify venue exists** in Supabase
2. **Check venue status** (should be "approved")
3. **Verify user_id** matches between Clerk and Supabase
4. **Check if user is logged in** with correct account

---

## Need Help?

If issues persist:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check Clerk dashboard for errors
4. Review browser console for client-side errors

