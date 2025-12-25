# Bulk User Migration After Domain Change - Complete Guide

## Problem

After migrating to a new domain, **multiple users** have lost access to their data because:
- Clerk created new user IDs for the same emails on the new domain
- Old venues/events/bookings are still linked to old user IDs
- New logins use new user IDs, so data can't be found

## Solution: Bulk Migration Script

This guide shows you how to migrate **ALL users at once** using an automated script.

---

## Step 1: Understand the Migration Process

The script will:
1. ✅ Find all users with duplicate emails (old + new accounts)
2. ✅ Match them by email address
3. ✅ Migrate venues, bookings, and reviews from old user_id to new user_id
4. ✅ Verify the migration was successful
5. ✅ Report any issues

---

## Step 2: Preview What Will Be Migrated

**Before running the migration**, see what data exists:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query to see all users and their data:

```sql
-- See all users and their data
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT e.id) as event_count,
  COUNT(DISTINCT b.id) as booking_count
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.events e ON e.venue_id = v.id
LEFT JOIN public.bookings b ON b.user_id = u.id
GROUP BY u.id, u.email, u.name, u.created_at
ORDER BY u.created_at DESC;
```

3. This shows you:
   - How many users have data
   - Which users need migration
   - How much data each user has

---

## Step 3: Find Users with Duplicate Emails

Run this to see which users have accounts on both old and new domains:

```sql
-- Find users with duplicate emails
SELECT 
  email,
  COUNT(*) as account_count,
  STRING_AGG(id::TEXT, ', ' ORDER BY created_at) as user_ids,
  STRING_AGG(created_at::TEXT, ', ' ORDER BY created_at) as created_dates
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;
```

This shows:
- Users who logged in on both old and new domains
- Their user IDs (old and new)
- When each account was created

---

## Step 4: Run the Bulk Migration

### Option A: Full Migration Script (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/bulk-migrate-all-users-after-domain-change.sql`
3. **Read through the script** to understand what it does
4. Run **Step 1-3** first to preview the migration
5. Then run **Step 4** to execute the migration
6. Finally run **Step 5** to verify results

### Option B: Quick Migration (One Command)

If you want to migrate everything at once:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this script:

```sql
DO $$
DECLARE
  user_pair RECORD;
  total_migrated INTEGER := 0;
BEGIN
  -- Find all user pairs (old + new) with same email
  FOR user_pair IN
    SELECT 
      u1.email,
      u1.id as old_id,
      u2.id as new_id
    FROM public.users u1
    JOIN public.users u2 ON u1.email = u2.email
    WHERE u1.created_at < u2.created_at
      AND (
        EXISTS (SELECT 1 FROM public.venues WHERE user_id = u1.id)
        OR EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u1.id)
        OR EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u1.id)
      )
  LOOP
    -- Migrate venues
    UPDATE public.venues 
    SET user_id = user_pair.new_id, updated_at = NOW()
    WHERE user_id = user_pair.old_id;
    
    -- Migrate bookings
    UPDATE public.bookings 
    SET user_id = user_pair.new_id, updated_at = NOW()
    WHERE user_id = user_pair.old_id;
    
    -- Migrate reviews
    UPDATE public.venue_reviews 
    SET user_id = user_pair.new_id
    WHERE user_id = user_pair.old_id;
    
    total_migrated := total_migrated + 1;
    RAISE NOTICE 'Migrated data for user: %', user_pair.email;
  END LOOP;
  
  RAISE NOTICE 'Bulk migration complete! Migrated % users', total_migrated;
END $$;
```

3. Click **"Run"**
4. Check the output - it will show how many users were migrated

---

## Step 5: Verify Migration Results

After running the migration, verify it worked:

```sql
-- Check migration results
SELECT 
  email,
  old_user_id,
  new_user_id,
  -- Should be 0 (all data migrated)
  (SELECT COUNT(*) FROM public.venues WHERE user_id = old_user_id) as remaining_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = old_user_id) as remaining_bookings,
  -- Should show migrated data
  (SELECT COUNT(*) FROM public.venues WHERE user_id = new_user_id) as migrated_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = new_user_id) as migrated_bookings
FROM (
  SELECT 
    u1.email,
    u1.id as old_user_id,
    u2.id as new_user_id
  FROM public.users u1
  JOIN public.users u2 ON u1.email = u2.email
  WHERE u1.created_at < u2.created_at
) user_pairs;
```

All `remaining_*` columns should be **0**, and `migrated_*` columns should show the data.

---

## Step 6: Handle Users Who Haven't Logged In Yet

Some users might have data on the old domain but haven't logged in on the new domain yet. You can identify them:

```sql
-- Users with data who haven't logged in on new domain
SELECT 
  u.id as old_user_id,
  u.email,
  u.name,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count,
  'NEEDS TO LOGIN ON NEW DOMAIN' as action_required
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u2 
  WHERE u2.email = u.email 
    AND u2.id != u.id
    AND u2.created_at > u.created_at
)
AND (EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
     OR EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id))
GROUP BY u.id, u.email, u.name
ORDER BY venue_count DESC;
```

**For these users:**
- They need to log in on the new domain first (which will create their new user record)
- Then you can run the migration again, or migrate them individually

---

## Step 7: Test the Migration

1. **Pick a test user** from the migration results
2. **Log in as that user** on the new domain
3. **Check their venue dashboard** - they should see their venues and events
4. **Verify bookings** are still there
5. If everything looks good, the migration was successful!

---

## Step 8: Clean Up (Optional - Do This Last!)

After verifying all migrations are complete, you can optionally delete old user records:

**⚠️ WARNING: Only do this after verifying all data is migrated!**

```sql
-- First, see what will be deleted
SELECT 
  u.id as old_user_id,
  u.email,
  (SELECT COUNT(*) FROM public.venues WHERE user_id = u.id) as remaining_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = u.id) as remaining_bookings
FROM public.users u
WHERE EXISTS (
  SELECT 1 FROM public.users u2 
  WHERE u2.email = u.email 
    AND u2.id != u.id
    AND u2.created_at > u.created_at
)
AND NOT EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u.id);
```

If all counts are 0, you can safely delete:

```sql
-- DELETE old user records (only if all data is migrated!)
DELETE FROM public.users 
WHERE id IN (
  SELECT u.id
  FROM public.users u
  WHERE EXISTS (
    SELECT 1 FROM public.users u2 
    WHERE u2.email = u.email 
      AND u2.id != u.id
      AND u2.created_at > u.created_at
  )
  AND NOT EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u.id)
);
```

---

## Migration Checklist

- [ ] Previewed all users and their data
- [ ] Identified users with duplicate emails
- [ ] Ran the bulk migration script
- [ ] Verified migration results (all data moved)
- [ ] Tested with at least one user
- [ ] Identified users who need to log in first
- [ ] (Optional) Cleaned up old user records

---

## Troubleshooting

### Issue: Migration Script Shows 0 Users Migrated

**Possible causes:**
1. No users have logged in on the new domain yet
2. Users don't have duplicate emails (they're using different emails)
3. All data was already migrated

**Solution:**
- Check if users have logged in on the new domain
- Verify users have accounts with the same email on both domains
- Run the preview queries to see what data exists

### Issue: Some Data Not Migrated

**Solution:**
1. Check the verification query - it shows which users have remaining data
2. For those users, run individual migration (see single-user guide)
3. Check for any errors in the SQL Editor output

### Issue: Users Still Can't See Their Data

**Solution:**
1. Verify the migration actually ran (check verification query)
2. Ask users to **log out and log back in**
3. Clear browser cache
4. Check if the new user_id has the data:
   ```sql
   SELECT * FROM public.venues WHERE user_id = 'NEW_USER_ID';
   ```

---

## Automation: Run Migration Periodically

If users are still logging in on the old domain, you can set up a scheduled migration:

1. **Create a function** that runs the migration
2. **Schedule it** to run daily/weekly
3. **Monitor** the results

Or simply **run the migration script again** whenever needed - it's safe to run multiple times (it only migrates data that hasn't been migrated yet).

---

## Summary

1. ✅ **Preview** all users and their data
2. ✅ **Run bulk migration** script (matches users by email)
3. ✅ **Verify** all data was migrated
4. ✅ **Test** with real users
5. ✅ **Handle** users who haven't logged in yet
6. ✅ **Clean up** old user records (optional)

The bulk migration script handles **all users automatically** by matching them by email address. No need to migrate each user individually!

---

## Files Created

- `supabase/bulk-migrate-all-users-after-domain-change.sql` - Complete bulk migration script
- `BULK_USER_MIGRATION_GUIDE.md` - This guide

The script is **safe to run multiple times** - it won't duplicate data or cause issues.

