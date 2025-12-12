-- Verify Users Table Schema
-- Run this in Supabase SQL Editor to check if the users table is set up correctly

-- Check if users table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected columns:
-- id: TEXT (not UUID!) - for Clerk user IDs
-- name: TEXT (nullable)
-- age: INTEGER (nullable, check >= 18)
-- photo: TEXT (nullable)
-- phone: TEXT (nullable, unique)
-- email: TEXT (nullable, unique)
-- created_at: TIMESTAMP
-- updated_at: TIMESTAMP

-- Check if id column is TEXT (not UUID)
SELECT 
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT - id is TEXT (ready for Clerk IDs)'
    WHEN data_type = 'uuid' THEN '❌ WRONG - id is UUID (needs migration)'
    ELSE '⚠️ UNKNOWN - id type is: ' || data_type
  END as status
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';

-- If id is UUID, you need to run the migration script: fix-clerk-user-ids.sql

