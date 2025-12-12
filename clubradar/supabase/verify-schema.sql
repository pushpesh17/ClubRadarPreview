-- Verification Query: Check if Schema is Updated for Clerk
-- Run this in Supabase SQL Editor to verify the migration worked

-- Check users table
SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check venues table
SELECT 
  'venues' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'venues' AND column_name = 'user_id';

-- Check bookings table
SELECT 
  'bookings' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'user_id';

-- Check reviews table
SELECT 
  'reviews' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'user_id';

-- Expected Results:
-- All 'id' and 'user_id' columns should show data_type = 'text'
-- If you see 'uuid', the migration hasn't been run yet

