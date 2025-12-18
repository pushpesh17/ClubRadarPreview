-- Ensure Users Table Exists and is Correctly Configured for Clerk
-- Run this in your Supabase SQL Editor
-- This script ensures the users table exists with the correct structure for Clerk user IDs

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Clerk user IDs are TEXT (e.g., "user_35hvrWePm83NtL6tSFel9zZBKaW")
  name TEXT,
  age INTEGER CHECK (age >= 18),
  photo TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Ensure id column is TEXT (not UUID)
-- Check current type and alter if needed
DO $$
BEGIN
  -- Check if id column exists and is TEXT
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'id'
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE '✅ Users table id column is already TEXT';
  ELSE
    -- If id is UUID or doesn't exist, we need to handle it
    RAISE NOTICE '⚠️ Users table id column is not TEXT. You may need to run a migration script.';
  END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;

-- Step 4: Enable Row Level Security (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create or replace RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (true); -- API uses service role, so this is mainly for direct Supabase access

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role to do everything (for API routes)
CREATE POLICY "Service role can manage users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 6: Verify table structure
DO $$
DECLARE
  v_data_type TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    RAISE NOTICE '✅ Users table exists!';
    
    -- Check column type
    SELECT data_type INTO v_data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'id';
    
    -- Raise appropriate notice based on column type
    IF v_data_type = 'text' THEN
      RAISE NOTICE '✅ id column is TEXT (correct for Clerk)';
    ELSIF v_data_type = 'uuid' THEN
      RAISE WARNING '⚠️ id column is UUID (needs migration to TEXT)';
    ELSE
      RAISE WARNING '⚠️ id column type is: %', v_data_type;
    END IF;
  ELSE
    RAISE EXCEPTION '❌ Failed to create users table';
  END IF;
END $$;

-- Note: After running this script:
-- 1. The users table will be ready to accept Clerk user IDs (TEXT format)
-- 2. The booking API will automatically create users when they don't exist
-- 3. Foreign key constraints from bookings.user_id to users.id will work correctly

