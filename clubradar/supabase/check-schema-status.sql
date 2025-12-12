-- Quick Check: Verify Database Schema Status
-- Run this in Supabase SQL Editor to check if migration was successful

-- Check users.id column type
SELECT 
  'users.id' as column_name,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT - Ready for Clerk'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Need to run fix-clerk-user-ids.sql'
    ELSE '⚠️ UNKNOWN: ' || data_type
  END as status
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';

-- Check venues.user_id column type
SELECT 
  'venues.user_id' as column_name,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Need to run fix-clerk-user-ids.sql'
    ELSE '⚠️ UNKNOWN: ' || data_type
  END as status
FROM information_schema.columns
WHERE table_name = 'venues' AND column_name = 'user_id' AND table_schema = 'public';

-- Check if users table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'users' AND table_schema = 'public'
    ) THEN '✅ users table exists'
    ELSE '❌ users table does NOT exist - Run fix-clerk-user-ids.sql'
  END as table_status;

-- Check if venues table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'venues' AND table_schema = 'public'
    ) THEN '✅ venues table exists'
    ELSE '❌ venues table does NOT exist - Run fix-clerk-user-ids.sql'
  END as table_status;

-- Check if venues table has KYC fields
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'venues' 
  AND column_name IN ('owner_name', 'capacity', 'gst_number', 'license_number', 'pan_number', 'bank_account', 'ifsc_code', 'documents')
  AND table_schema = 'public'
ORDER BY column_name;

-- If you see all KYC fields, the migration was successful!

