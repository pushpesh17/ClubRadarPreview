# Fix: Venue Not Showing in Discover Page

## Problem

After logging in on the new domain, your venue is not showing in the discover page, even though:
- ✅ You registered the venue
- ✅ You logged in on the new domain
- ✅ Auto-migration should have run

## Why This Happens

There are **two possible issues**:

1. **Venue not migrated** - Venue is still linked to old user_id
2. **Venue status is "pending"** - Discover page only shows venues with `status = "approved"`

## Quick Fix

### Step 1: Run the Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/fix-venue-not-showing.sql`
3. **Scroll to the bottom** and find the "QUICK FIX" section
4. The script is already set up for `pushpeshlodiwal1711@gmail.com`
5. Click **"Run"**

This will:
- ✅ Migrate venue from old user_id to new user_id
- ✅ Migrate bookings and reviews
- ✅ Approve the venue (change status from "pending" to "approved")
- ✅ Verify everything is fixed

### Step 2: Verify It Worked

After running the script, check the output. You should see:
```
✅ READY - Should show in discover
```

### Step 3: Refresh Discover Page

1. Go to: https://clubradar.in/discover
2. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Your venue should now be visible!

---

## For Other Users

If you need to fix venues for other users, modify the script:

1. Change `'pushpeshlodiwal1711@gmail.com'` to their email
2. Run the script
3. Their venue will be migrated and approved

---

## Manual Steps (If Script Doesn't Work)

### Step 1: Check Venue Status

Run this in Supabase SQL Editor:

```sql
SELECT 
  v.id,
  v.name,
  v.status,
  v.user_id,
  u.email
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com';
```

**If status is "pending":**
- The venue won't show in discover
- You need to approve it

### Step 2: Migrate Venue (If Needed)

If the venue is linked to old user_id:

```sql
-- Get new user_id (most recent)
SELECT id 
FROM public.users 
WHERE email = 'pushpeshlodiwal1711@gmail.com' 
ORDER BY created_at DESC 
LIMIT 1;

-- Update venue to use new user_id (replace NEW_USER_ID)
UPDATE public.venues
SET user_id = 'NEW_USER_ID',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at ASC LIMIT 1);
```

### Step 3: Approve Venue

```sql
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at DESC LIMIT 1)
AND status = 'pending';
```

---

## Why Discover Page Only Shows Approved Venues

The discover page API (`/api/venues`) filters venues by:
```typescript
.eq("status", "approved")
```

This is intentional - it ensures only verified venues are shown to users.

---

## After Fixing

1. ✅ Venue is linked to your new user_id
2. ✅ Venue status is "approved"
3. ✅ Venue should appear in discover page
4. ✅ You can see it in your venue dashboard

---

## Troubleshooting

### Issue: Still Not Showing After Fix

**Check:**
1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Check if venue status is actually "approved":
   ```sql
   SELECT status FROM public.venues WHERE user_id = 'YOUR_NEW_USER_ID';
   ```
4. Check if venue is linked to correct user_id:
   ```sql
   SELECT v.*, u.email 
   FROM public.venues v 
   JOIN public.users u ON v.user_id = u.id 
   WHERE u.email = 'pushpeshlodiwal1711@gmail.com';
   ```

### Issue: Multiple Venues

If you see multiple venues for the same user:
- One might be on old user_id
- One might be on new user_id
- Run the migration script to consolidate them

---

## Summary

**The fix script does everything automatically:**
1. ✅ Migrates venue to new user_id
2. ✅ Approves the venue
3. ✅ Verifies it's ready

**Just run the script and refresh the discover page!**

The script is in: `supabase/fix-venue-not-showing.sql`

