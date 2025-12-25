# Data Migration After Domain Change - Complete Guide

## Problem

After migrating from the old Vercel domain to `clubradar.in`, you're seeing:
- ❌ No venues when you log in
- ❌ No events
- ❌ System treats you as a new user
- ❌ Asking you to register venue again

## Root Cause

**Clerk creates a NEW user ID for the same email on a new domain.**

- **Old domain**: Clerk user ID = `user_abc123` (example)
- **New domain**: Clerk user ID = `user_xyz789` (example)
- **Your venues/events**: Still linked to `user_abc123` (old ID)
- **Current login**: Using `user_xyz789` (new ID)
- **Result**: System can't find your data because it's looking for the wrong user ID

---

## Solution: Migrate Data from Old User ID to New User ID

### Step 1: Find Your Old User ID

#### Option A: Check Supabase Database

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your ClubRadar project
3. Click **"Table Editor"** → **"venues"** table
4. Look at the `user_id` column - this is your **OLD user ID**
5. Copy it (it looks like `user_35hvrWePm83NtL6tSFel9zZBKaW`)

#### Option B: Use SQL Query

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your email):

```sql
-- Find venues and their user IDs
SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.user_id as old_user_id,
  v.status,
  u.email as owner_email
FROM public.venues v
LEFT JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email
```

3. The `old_user_id` column shows your **OLD user ID**

#### Option C: Check Clerk Dashboard

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Click **"Users"** in the left sidebar
3. Search for your email
4. You might see **TWO users** with the same email:
   - One created on the old domain (this is your OLD user ID)
   - One created on the new domain (this is your NEW user ID)
5. Copy both user IDs

---

### Step 2: Find Your New User ID

#### Option A: From Browser Console

1. Log into your app at `https://clubradar.in`
2. Open browser console (Press F12)
3. Go to **"Console"** tab
4. Run this command:

```javascript
// Get your current user ID
fetch('/api/venues/status')
  .then(r => r.json())
  .then(data => {
    console.log('Current user data:', data);
    // The user_id is in the Clerk session
  });
```

#### Option B: From Clerk Dashboard

1. Go to **Clerk Dashboard** → **"Users"**
2. Find your email
3. Look for the user created most recently (after domain change)
4. Copy the user ID (this is your **NEW user ID**)

#### Option C: Use SQL Query

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:

```sql
-- Find all users with your email
SELECT 
  id as user_id,
  email,
  name,
  created_at
FROM public.users
WHERE email = 'your-email@example.com'  -- Replace with your email
ORDER BY created_at DESC;
```

3. The **most recent** user_id is your **NEW user ID**

---

### Step 3: Migrate Your Data

#### Option A: Use the Migration Script (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/migrate-user-data-after-domain-change.sql`
3. **Replace these values** in the script:
   - `OLD_USER_ID_HERE` → Your old Clerk user ID (from Step 1)
   - `NEW_USER_ID_HERE` → Your new Clerk user ID (from Step 2)
4. Run the script
5. Verify the migration worked (see Step 4)

#### Option B: Manual Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run these commands one by one (replace the user IDs):

```sql
-- Step 1: Update venues
UPDATE public.venues
SET user_id = 'NEW_USER_ID',  -- Replace with your new user_id
    updated_at = NOW()
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id

-- Step 2: Update bookings (if any)
UPDATE public.bookings
SET user_id = 'NEW_USER_ID',  -- Replace with your new user_id
    updated_at = NOW()
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id

-- Step 3: Update reviews (if any)
UPDATE public.venue_reviews
SET user_id = 'NEW_USER_ID'  -- Replace with your new user_id
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id
```

---

### Step 4: Verify Migration

1. **Check venues are linked to new user:**
```sql
SELECT 
  id,
  name,
  user_id,
  status
FROM public.venues
WHERE user_id = 'NEW_USER_ID';  -- Replace with your new user_id
```

2. **Check events are still there:**
```sql
SELECT 
  e.id,
  e.name,
  e.date,
  v.name as venue_name
FROM public.events e
JOIN public.venues v ON e.venue_id = v.id
WHERE v.user_id = 'NEW_USER_ID';  -- Replace with your new user_id
```

3. **Log out and log back in** to your app
4. **Check your venue dashboard** - you should see your venues and events!

---

### Step 5: Clean Up (Optional)

After verifying everything works, you can optionally delete the old user record:

```sql
-- First, verify no data is left
SELECT 
  'venues' as table_name, 
  COUNT(*) as count 
FROM public.venues 
WHERE user_id = 'OLD_USER_ID'  -- Replace with old user_id
UNION ALL
SELECT 'bookings', COUNT(*) FROM public.bookings WHERE user_id = 'OLD_USER_ID'
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.venue_reviews WHERE user_id = 'OLD_USER_ID';

-- If all counts are 0, you can delete the old user
-- DELETE FROM public.users WHERE id = 'OLD_USER_ID';
```

---

## Quick Reference: User ID Format

Clerk user IDs look like this:
- `user_35hvrWePm83NtL6tSFel9zZBKaW`
- `user_2abc123def456ghi789`
- Always start with `user_`

---

## Troubleshooting

### Issue: Can't Find Old User ID

**Solution:**
1. Check if you have any venues in the database
2. If yes, the `user_id` in the venues table is your old user ID
3. If no venues exist, you might need to re-register (data might have been lost)

### Issue: Migration Doesn't Work

**Solution:**
1. Make sure you're using the correct user IDs (check format: `user_...`)
2. Verify the old user_id actually has data:
   ```sql
   SELECT COUNT(*) FROM public.venues WHERE user_id = 'OLD_USER_ID';
   ```
3. Check for any errors in the SQL Editor

### Issue: Still Can't See Data After Migration

**Solution:**
1. **Clear browser cache and cookies**
2. **Log out completely** from your app
3. **Log back in**
4. Check the venue dashboard again
5. If still not working, verify the migration:
   ```sql
   SELECT * FROM public.venues WHERE user_id = 'NEW_USER_ID';
   ```

---

## Prevention: For Future Domain Changes

To avoid this issue in the future:

1. **Before changing domains**, note down your current Clerk user ID
2. **After changing domains**, immediately migrate data using this guide
3. **Consider using email as the primary identifier** instead of user_id (requires code changes)

---

## Summary

1. ✅ Find your **OLD user ID** (from venues table or Clerk dashboard)
2. ✅ Find your **NEW user ID** (from current login or Clerk dashboard)
3. ✅ Run the migration script to update venues/bookings/reviews
4. ✅ Verify data is migrated correctly
5. ✅ Log out and log back in
6. ✅ Your venues and events should now be visible!

---

## Need Help?

If you're stuck:
1. Take a screenshot of your venues table (showing user_id column)
2. Check Clerk Dashboard → Users (screenshot both user records)
3. Share the user IDs (you can partially hide them for privacy: `user_...abc123`)

The migration script is in: `supabase/migrate-user-data-after-domain-change.sql`

