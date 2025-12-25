# Fix: Why Old Data Not Showing After Domain Migration

## The Real Problem

**It's NOT about test vs production keys!** Test keys work fine on your personal domain.

The issue is:
- ✅ Users logged in on **old Vercel domain** → Got user_id: `user_abc123`
- ✅ Users logged in on **new domain (clubradar.in)** → Got NEW user_id: `user_xyz789`
- ❌ Your venues/events are still linked to `user_abc123` (old user_id)
- ❌ When you log in on new domain, system looks for data under `user_xyz789` (new user_id)
- ❌ Result: Can't find your data!

## Solution: Migrate Data from Old User IDs to New User IDs

---

## Step 1: Create Auto-Migration Function in Supabase

This function will automatically migrate data when users log in.

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open: `supabase/auto-migrate-user-by-email.sql`
3. Copy the **entire script** and paste it
4. Click **"Run"**
5. You should see: "Success. No rows returned" (this is normal)

**This creates a function that migrates data automatically.**

---

## Step 2: Run Bulk Migration for Existing Users

If users have already logged in on the new domain, migrate their data now:

1. In **Supabase SQL Editor**, open: `supabase/bulk-migrate-all-users-after-domain-change.sql`
2. Scroll to the **"QUICK MIGRATION"** section (at the bottom)
3. Copy and paste that section
4. Click **"Run"**
5. Check the output - it will show how many users were migrated

**This migrates data for users who have already logged in on clubradar.in**

---

## Step 3: Approve All Venues

The discover page only shows venues with `status = 'approved'`. Even if data is migrated, if venues are "pending", they won't show.

1. In **Supabase SQL Editor**, open: `supabase/approve-existing-venues.sql`
2. Copy and paste the script
3. Click **"Run"**
4. This approves all pending venues

---

## Step 4: Verify Code Has Auto-Migration

The user sync route should automatically migrate data when new users log in. Let's verify:

1. Open: `app/api/users/sync/route.ts`
2. Look for this code (around line 135-160):

```typescript
// After creating new user, check if there's old data to migrate
if (email) {
  try {
    const { data: migrationResult, error: migrationError } =
      await supabase.rpc("migrate_user_data_by_email", {
        new_user_id: userId,
        user_email: email,
      });
    // ... migration logging
  }
}
```

**If this code exists**, it's ready. If not, it needs to be added.

---

## Step 5: Deploy Updated Code

If the auto-migration code is in your files but not deployed:

```bash
git add app/api/users/sync/route.ts
git commit -m "feat: add auto-migration for user data"
git push
```

Vercel will automatically deploy.

---

## Step 6: Test the Fix

### For Users Who Already Logged In

1. **Run the bulk migration** (Step 2)
2. **Approve venues** (Step 3)
3. **Log out and log back in** on clubradar.in
4. Check if you see your venues/events

### For Users Who Haven't Logged In Yet

1. **Create the auto-migration function** (Step 1)
2. **Deploy the code** (Step 5)
3. When they log in, data will migrate automatically
4. They'll see their data immediately

---

## Why This Happens

### On Old Domain (Vercel free domain):
- User logs in → Clerk creates: `user_abc123`
- User registers venue → Venue linked to: `user_abc123`
- Everything works ✅

### On New Domain (clubradar.in):
- Same user logs in → Clerk creates: `user_xyz789` (NEW ID!)
- System looks for venues under: `user_xyz789`
- But venues are still under: `user_abc123`
- Result: Can't find data ❌

### The Fix:
- Migration function matches users by **email**
- Finds old user_id (`user_abc123`) by email
- Moves venues/events to new user_id (`user_xyz789`)
- Now data is found ✅

---

## Quick Checklist

- [ ] Auto-migration function created in Supabase
- [ ] Bulk migration run for existing users
- [ ] All venues approved (status = 'approved')
- [ ] User sync route has auto-migration code
- [ ] Code deployed to Vercel
- [ ] Tested login on new domain

---

## Test Keys Are Fine!

**You can keep using `pk_test_` keys** - they work on any domain, including your personal domain.

The only difference:
- **Test keys** (`pk_test_`) - Work everywhere, but have rate limits
- **Production keys** (`pk_live_`) - Better for high traffic, but require paid plan

**For now, test keys are perfectly fine!** The issue is purely data migration, not the keys.

---

## Summary

**The problem:** Data is linked to old user IDs, but users have new user IDs on the new domain.

**The solution:**
1. Create migration function in Supabase
2. Run bulk migration for existing users
3. Approve all venues
4. Deploy code with auto-migration
5. Test login

**Test keys work fine** - no need to upgrade to production mode yet!

---

## Files to Use

1. `supabase/auto-migrate-user-by-email.sql` - Create migration function
2. `supabase/bulk-migrate-all-users-after-domain-change.sql` - Migrate existing users
3. `supabase/approve-existing-venues.sql` - Approve all venues
4. `app/api/users/sync/route.ts` - Should have auto-migration code

All these are in your project already!

