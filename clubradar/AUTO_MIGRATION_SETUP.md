# Auto-Migration Setup - Migrate Data When Users Log In

## Overview

This system automatically migrates user data (venues, bookings, reviews) from old user IDs to new user IDs **when users log in** on the new domain. No manual migration needed!

---

## How It Works

1. **User logs in** on new domain (`clubradar.in`)
2. **Clerk creates** a new user_id for them
3. **User sync route** creates user record in Supabase
4. **Auto-migration function** is triggered automatically
5. **Function finds** old user_id by email
6. **Function migrates** venues, bookings, reviews to new user_id
7. **User sees their data** immediately!

---

## Setup Steps

### Step 1: Create the Auto-Migration Function

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/auto-migrate-user-by-email.sql`
3. Copy and paste the entire script
4. Click **"Run"**
5. You should see: "Success. No rows returned" (this is normal)

This creates a function that will automatically migrate data when called.

### Step 2: Update User Sync Route (Already Done!)

The user sync route (`app/api/users/sync/route.ts`) has been updated to:
- Automatically call the migration function when a new user is created
- Migrate data from old user_id to new user_id based on email
- Log the migration results

**No code changes needed** - it's already updated!

### Step 3: Deploy the Updated Code

1. **Commit the changes:**
   ```bash
   git add app/api/users/sync/route.ts
   git commit -m "feat: auto-migrate user data on login"
   git push
   ```

2. **Vercel will automatically deploy** the changes

### Step 4: Test the Migration

1. **Pick a test user** from your list (one who hasn't logged in yet)
2. **Have them log in** on the new domain
3. **Check the logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Logs
   - Look for: "Auto-migrated data for user..."
4. **Verify the data:**
   - User should see their venues and events
   - Check Supabase to confirm data was migrated

---

## For Your Current Users

Based on your query results, you have 4 users who need migration:

1. **pushpeshlodiwal1711@gmail.com** - 1 venue, 7 bookings
2. **pushpeshlodiyaee@gmail.com** - 1 venue, 5 bookings  
3. **bodadesneha2020@gmail.com** - 1 venue, 3 bookings
4. **user_36iDI0uuTaUMn3pWaUGSTiV0oTf** - 2 bookings (no email)

### What Happens When They Log In

1. They log in on `clubradar.in`
2. Clerk creates a new user_id
3. Auto-migration function runs automatically
4. Their data (venues, bookings) is migrated to the new user_id
5. They see everything immediately!

**No action needed from you** - it happens automatically!

---

## Manual Migration (If Needed)

If you want to manually migrate a specific user **before** they log in, you need their new user_id from Clerk:

### Option 1: Wait for Them to Log In (Recommended)

Just wait - the auto-migration will handle it when they log in.

### Option 2: Manual Migration After They Log In Once

1. **Have the user log in** on the new domain (even briefly)
2. **Get their new user_id** from Clerk Dashboard → Users
3. **Run this SQL:**

```sql
SELECT * FROM migrate_user_data_by_email(
  'NEW_USER_ID_FROM_CLERK',  -- Replace with their new Clerk user_id
  'user@example.com'         -- Replace with their email
);
```

---

## Monitoring Migration

### Check Which Users Have Been Migrated

```sql
-- Users who logged in recently and have data
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as logged_in_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users u2 
      WHERE u2.email = u.email 
        AND u2.id != u.id
        AND u2.created_at < u.created_at
    ) THEN 'HAS OLD ACCOUNT'
    ELSE 'NEW USER'
  END as account_type
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;
```

### Check Migration Logs

Check Vercel logs for migration messages:
- Look for: "Auto-migrated data for user..."
- Shows how many venues/bookings/reviews were migrated

---

## Troubleshooting

### Issue: Migration Not Happening

**Check:**
1. Is the function created? Run: `SELECT migrate_user_data_by_email('test', 'test@test.com');`
2. Are users logging in? Check Supabase `users` table for new entries
3. Check Vercel logs for errors

**Solution:**
- Verify the function exists in Supabase
- Check that the user sync route is being called
- Look for errors in Vercel deployment logs

### Issue: Data Not Migrating

**Possible causes:**
1. User's email doesn't match between old and new accounts
2. Old user record doesn't exist
3. Function not being called

**Solution:**
1. Verify email matches: `SELECT email, id FROM public.users WHERE email = 'user@example.com';`
2. Check if old user exists: `SELECT * FROM public.users WHERE email = 'user@example.com' ORDER BY created_at;`
3. Manually test the function: `SELECT * FROM migrate_user_data_by_email('new_id', 'email');`

### Issue: User Has No Email

For users without email (like `user_36iDI0uuTaUMn3pWaUGSTiV0oTf`):
- They need to log in and provide their email
- Once they have an email, migration can happen
- Or manually migrate using their user_id

---

## Summary

✅ **Auto-migration is set up** - users' data will migrate automatically when they log in  
✅ **No manual work needed** - just wait for users to log in  
✅ **Works for all users** - handles venues, bookings, and reviews  
✅ **Safe to run multiple times** - won't duplicate data  

**For your 4 users:**
- They just need to log in on the new domain
- Their data will automatically migrate
- They'll see everything immediately!

---

## Files Created

1. `supabase/auto-migrate-user-by-email.sql` - Migration function
2. `supabase/migrate-users-who-havent-logged-in.sql` - Monitoring queries
3. `app/api/users/sync/route.ts` - Updated to auto-migrate (already done)
4. `AUTO_MIGRATION_SETUP.md` - This guide

---

## Next Steps

1. ✅ Create the migration function in Supabase
2. ✅ Deploy the updated code to Vercel
3. ✅ Inform users to log in on the new domain
4. ✅ Monitor migrations in Vercel logs
5. ✅ Verify users can see their data

That's it! The system will handle everything automatically. 🎉

