# Fix for Clerk User ID Type Mismatch

## Problem
Clerk user IDs are strings like `"user_35hvrWePm83NtL6tSFel9zZBKaW"`, but the database schema expects UUIDs. This causes the error:
```
invalid input syntax for type uuid: "user_35hvrWePm83NtL6tSFel9zZBKaW"
```

## Solution

You have two options:

### Option 1: Update Schema to Use TEXT (Recommended)

Run the SQL script `supabase/fix-clerk-user-ids.sql` in your Supabase SQL Editor. This will:
- Change `users.id` from UUID to TEXT
- Change all `user_id` foreign keys from UUID to TEXT
- Recreate all tables with the correct types
- Recreate indexes and RLS policies

**⚠️ Warning:** This will **DROP ALL EXISTING DATA**. Only use this if you don't have important data yet.

### Option 2: Update Existing Schema (If You Have Data)

If you have existing data, you'll need to migrate it:

```sql
-- Step 1: Create a temporary column
ALTER TABLE public.users ADD COLUMN id_temp TEXT;

-- Step 2: Migrate data (if you have any)
-- You'll need to map UUIDs to Clerk IDs somehow

-- Step 3: Drop old column and rename
ALTER TABLE public.users DROP CONSTRAINT users_pkey;
ALTER TABLE public.users DROP COLUMN id;
ALTER TABLE public.users RENAME COLUMN id_temp TO id;
ALTER TABLE public.users ADD PRIMARY KEY (id);

-- Repeat for venues, bookings, reviews tables...
```

## After Running the Fix

1. The API routes will work correctly
2. Clerk user IDs can be stored directly
3. No more UUID conversion errors

## Verify the Fix

After running the SQL, test by:
1. Registering a venue
2. Checking venue status in dashboard
3. The 500 errors should be gone

