# Fix Database Schema for Clerk Integration

## Problem
The `users` table has a foreign key constraint to `auth.users(id)`, but we're using Clerk for authentication. Clerk user IDs don't exist in Supabase's `auth.users` table, causing foreign key constraint errors.

## Solution

### Option 1: Remove Foreign Key Constraint (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- Remove the foreign key constraint from users table
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Verify the constraint is removed
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' AND tc.constraint_type = 'FOREIGN KEY';
```

### Option 2: Update Schema to Not Reference auth.users

If you want to keep the schema clean, update the users table definition:

```sql
-- Drop and recreate users table without foreign key
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Changed from UUID to TEXT for Clerk IDs
  name TEXT,
  age INTEGER CHECK (age >= 18),
  photo TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update venues table to use TEXT for user_id
ALTER TABLE public.venues 
ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key (now it references users.id, not auth.users)
ALTER TABLE public.venues
ADD CONSTRAINT venues_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
```

**Note:** Option 2 requires updating all related tables. Option 1 is simpler and recommended.

## After Running the Fix

1. The API routes will work correctly
2. Clerk user IDs can be stored in the users table
3. Venues can reference Clerk user IDs
4. No more foreign key constraint errors

## Verify the Fix

After running the SQL, test by:
1. Registering a venue
2. Checking venue status in dashboard
3. The 500 errors should be gone

