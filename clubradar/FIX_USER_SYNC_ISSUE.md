# Fix: Users Not Being Created in Supabase

## Problem

Users have logged in on the new domain (`clubradar.in`), but:
- ❌ Their user records aren't being created in Supabase
- ❌ Migration can't find new user IDs (because they don't exist in database)
- ❌ Data stays linked to old user IDs

## Root Cause

The **user sync route** (`/api/users/sync`) isn't being called automatically when users log in with Clerk. The SSO callback page doesn't sync users to Supabase.

---

## Solution 1: Update SSO Callback (Recommended)

I've updated the SSO callback to automatically sync users when they log in.

### Step 1: Deploy the Updated Code

The `app/sso-callback/page.tsx` has been updated to:
- Get user data from Clerk
- Call `/api/users/sync` automatically
- Trigger auto-migration

**Deploy it:**

```bash
git add app/sso-callback/page.tsx
git commit -m "fix: auto-sync users to Supabase on login"
git push
```

### Step 2: Test

1. **Log out** from clubradar.in
2. **Log back in** with one of the users
3. **Check Supabase** - new user record should be created
4. **Check Vercel logs** - should see "Auto-migrated data for user..."

---

## Solution 2: Manual Fix for Existing Users

If users have already logged in but records weren't created:

### Step 1: Get New User IDs from Clerk

1. Go to **Clerk Dashboard** → **Users**
2. Search for each email:
   - `pushpeshlodiwal1711@gmail.com`
   - `pushpeshlodiyaee@gmail.com`
   - `bodadesneha2020@gmail.com`
3. **Copy their user IDs** (they'll be different from old ones)
4. They look like: `user_xxxxx` (different from the old ones)

### Step 2: Create User Records Manually

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open: `supabase/manually-create-users-from-clerk.sql`
3. **Replace** `NEW_USER_ID_FROM_CLERK_1`, `NEW_USER_ID_FROM_CLERK_2`, etc. with actual Clerk user IDs
4. Run the script

### Step 3: Migrate Data

After creating user records:

1. Run: `supabase/force-migrate-to-current-user.sql` → Step 2
2. This will migrate venues, bookings, reviews to new user IDs

---

## Solution 3: Get User IDs from Browser

If you can't access Clerk Dashboard:

1. **Log in** on `clubradar.in` with one of the users
2. **Open browser console** (F12)
3. **Go to Network tab**
4. **Make any API call** (like going to venue dashboard)
5. **Check the request headers** - your user_id should be in there
6. **Or check Vercel logs** - they show the user_id in API calls

---

## Why This Happens

**The flow should be:**
1. User logs in → Clerk authenticates
2. SSO callback → Should call `/api/users/sync`
3. User sync → Creates user record in Supabase
4. Auto-migration → Migrates data from old to new user_id

**But currently:**
- Step 2 is missing → User sync isn't called
- Step 3 doesn't happen → No user record created
- Step 4 can't run → No new user_id to migrate to

**The fix:** Update SSO callback to call user sync automatically.

---

## After Fixing

1. ✅ Users will be automatically synced when they log in
2. ✅ Auto-migration will run automatically
3. ✅ Data will be migrated to new user IDs
4. ✅ Users will see their venues/events

---

## Quick Action

**Option A: Deploy Updated Code (Best)**
1. Code is already updated
2. Just deploy: `git push`
3. Have users log out and log back in
4. Everything will work automatically

**Option B: Manual Fix (If Needed)**
1. Get user IDs from Clerk Dashboard
2. Create user records manually
3. Run migration script
4. Test login

---

## Files Updated

- `app/sso-callback/page.tsx` - Now syncs users automatically
- `supabase/manually-create-users-from-clerk.sql` - Manual fix script

**Deploy the updated code and have users log in again - it should work!**

