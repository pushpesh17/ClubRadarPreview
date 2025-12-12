-- Fix Users Table for Clerk Integration
-- Run this in your Supabase SQL Editor
-- This removes the foreign key constraint to auth.users since we're using Clerk

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Change the id column to be a regular UUID (not referencing auth.users)
-- Note: This will fail if there's existing data that references auth.users
-- If you have existing data, you may need to migrate it first

-- Alternative: Keep the constraint but make it optional
-- Or: Remove the constraint entirely since we're using Clerk

-- Step 3: Update the venues table foreign key (it should still work)
-- The venues.user_id references users.id, which is fine

-- Verify the change:
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.table_name = 'users';

