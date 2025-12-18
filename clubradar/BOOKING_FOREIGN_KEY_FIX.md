# Fix: Booking Foreign Key Constraint Error

## Problem

When users try to book an event, they get this error:

```
insert or update on table "bookings" violates foreign key constraint "bookings_user_id_fkey"
```

## Root Cause

The `bookings` table has a foreign key constraint that requires `user_id` to exist in the `users` table. However, when a user logs in with Clerk, their account might not be automatically synced to the Supabase `users` table, causing the foreign key constraint to fail when trying to create a booking.

## Solution Implemented

### 1. Automatic User Creation in Booking Endpoint

The booking creation endpoint (`/api/bookings`) now:

- **Checks if the user exists** in the `users` table before creating a booking
- **Automatically creates the user** if they don't exist (with minimal data)
- **Provides better error messages** if something goes wrong

### 2. Improved Error Handling

The endpoint now specifically catches foreign key constraint errors and provides helpful messages to users.

## What You Need to Do

### Step 1: Run the SQL Script (Optional but Recommended)

If the foreign key constraint doesn't exist or is misconfigured, run this in Supabase SQL Editor:

```sql
-- File: supabase/fix-bookings-foreign-key.sql
```

This ensures the foreign key constraint is properly set up.

### Step 3: Deploy the Updated Code

The fix is already in the code. You just need to:

1. Commit and push the changes:
   ```bash
   git add app/api/bookings/route.ts
   git commit -m "fix: auto-create user if missing before booking"
   git push
   ```
2. Vercel will automatically redeploy

### Step 4: Test

After deployment:

1. Log in with a user account
2. Try to book an event
3. The booking should now work without the foreign key error

## How It Works Now

1. **User tries to book an event**
2. **API uses UPSERT** to create or update user in `users` table:
   - If user exists: Updates (no-op if nothing changed)
   - If user doesn't exist: Creates minimal user record with `id` (Clerk user ID)
   - Handles race conditions (multiple concurrent requests)
3. **API verifies user exists** (double-check before booking)
4. **Then creates the booking** (foreign key constraint is satisfied)
5. **Returns success** to the user

### Why UPSERT?
- **Race condition safe**: Multiple booking requests won't conflict
- **Idempotent**: Can be called multiple times safely
- **Automatic**: No need to manually sync users before booking

## Future Improvement (Optional)

For a better user experience, you could also:

- **Sync user data on login** - Call `/api/users/sync` when user logs in to populate name, email, etc.
- **Update user data periodically** - Sync user info from Clerk to Supabase when it changes

## Verification

After deploying, you can verify the fix by:

1. Checking Vercel deployment logs for any errors
2. Testing a booking flow with a new user
3. Checking Supabase `users` table - new users should be created automatically

## Error Messages

If something still goes wrong, users will now see clearer error messages:

- **"User account not found"** - If user creation fails
- **"Failed to create user account"** - With details about what went wrong
- **"Database connection failed"** - If Supabase is unreachable

---

**The fix is complete and ready to deploy!** 🎉
