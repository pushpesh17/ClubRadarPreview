-- Quick Verification: Check if User IDs are now TEXT
-- Run this in Supabase SQL Editor after the migration

-- Check users.id column type
SELECT 
  'users.id' as column_check,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT - Ready for Clerk IDs'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Still UUID, migration failed'
    ELSE '⚠️ UNKNOWN - Unexpected type: ' || data_type
  END as status
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';

-- Check venues.user_id column type
SELECT 
  'venues.user_id' as column_check,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Still UUID'
    ELSE '⚠️ UNKNOWN: ' || data_type
  END as status
FROM information_schema.columns 
WHERE table_name = 'venues' AND column_name = 'user_id';

-- Check bookings.user_id column type
SELECT 
  'bookings.user_id' as column_check,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Still UUID'
    ELSE '⚠️ UNKNOWN: ' || data_type
  END as status
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'user_id';

-- Check reviews.user_id column type
SELECT 
  'reviews.user_id' as column_check,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Still UUID'
    ELSE '⚠️ UNKNOWN: ' || data_type
  END as status
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'user_id';

-- All should show data_type = 'text' and status = '✅ CORRECT'

