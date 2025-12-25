# Diagnose and Fix Migration Issue

## Problem

You've run all three steps but data still isn't showing. Let's diagnose what's wrong.

---

## Step 1: Run Diagnostic Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open: `supabase/diagnose-and-fix-migration.sql`
3. Run **Step 1** first to see all users and their data
4. This will show you:
   - Which users have venues/events
   - Which user IDs they're linked to
   - If there are duplicate users (old + new)

---

## Step 2: Check for Duplicate Users

Run **Step 2** of the diagnostic script. This will show:
- Users with same email but different IDs
- Old user_id vs new user_id
- When each account was created

**If you see duplicates:**
- You have old + new accounts
- Data needs to be migrated from old to new

**If you DON'T see duplicates:**
- Users haven't logged in on new domain yet
- They need to log in first (which will create new user_id)
- Then migration will happen automatically

---

## Step 3: Check Which User IDs Have Venues

Run **Step 3** to see:
- Which venues exist
- Which user_id they're linked to
- If they're linked to old or new user_id

**If venues are linked to old user_id:**
- You need to migrate them to new user_id
- Run Step 6 (bulk migration)

---

## Step 4: Verify Migration Function Exists

Run **Step 4** to check if the migration function was created.

**If it returns nothing:**
- The function doesn't exist
- You need to create it: Run `supabase/auto-migrate-user-by-email.sql`

**If it returns the function name:**
- Function exists ✅
- Move to next step

---

## Step 5: Run Bulk Migration

Run **Step 6** (the bulk migration section). This will:
- Find all users with duplicate accounts
- Migrate venues, bookings, reviews from old to new user_id
- Approve all pending venues

**Check the output** - it will tell you:
- How many users were migrated
- If no duplicates were found (users need to log in first)

---

## Step 6: Verify Results

Run **Step 7** to see if migration worked:
- Check if venues are now linked to new user_ids
- Check if venues are approved
- Check event and booking counts

---

## Common Issues and Solutions

### Issue 1: No Duplicate Users Found

**Meaning:** Users haven't logged in on the new domain yet.

**Solution:**
1. Users need to log in on `clubradar.in` first
2. This will create their new user_id
3. Auto-migration will run automatically
4. Or run Step 5 (manual migration for specific user) after they log in

### Issue 2: Venues Linked to Old User ID

**Meaning:** Migration didn't run or failed.

**Solution:**
1. Run Step 6 (bulk migration) again
2. Or run Step 5 (manual migration for specific user)
3. Check if migration function exists (Step 4)

### Issue 3: Venues Are "Pending"

**Meaning:** Venues exist but aren't approved.

**Solution:**
1. Run Step 6 (it also approves venues)
2. Or run: `UPDATE public.venues SET status = 'approved' WHERE status = 'pending';`

### Issue 4: Migration Function Doesn't Exist

**Meaning:** Step 1 wasn't completed.

**Solution:**
1. Go to Supabase SQL Editor
2. Run: `supabase/auto-migrate-user-by-email.sql`
3. Verify with Step 4

---

## Quick Fix: Run Everything at Once

If you want to fix everything at once:

1. **Create migration function** (if not exists):
   - Run: `supabase/auto-migrate-user-by-email.sql`

2. **Run bulk migration**:
   - Run **Step 6** from `diagnose-and-fix-migration.sql`

3. **Verify**:
   - Run **Step 7** to check results

---

## What to Look For

After running the diagnostic:

1. **Do you see duplicate users?**
   - Yes → Run bulk migration (Step 6)
   - No → Users need to log in on new domain first

2. **Are venues linked to old user_id?**
   - Yes → Migration didn't work, run Step 6 again
   - No → Check if venues are approved

3. **Are venues approved?**
   - Yes → Should show in discover
   - No → Run approval script

---

## Test After Fix

1. **Log out** from clubradar.in
2. **Log back in**
3. **Check venue dashboard** - should see venues
4. **Check discover page** - should see venues

---

## Still Not Working?

If data still doesn't show after running all steps:

1. **Check Vercel logs** for errors
2. **Check browser console** (F12) for errors
3. **Verify environment variables** in Vercel are set
4. **Check if code is deployed** (user sync route with auto-migration)

Share the output from Step 1 and Step 2, and I can help debug further!

