-- Bulk Migrate All Users After Domain Change
-- This script migrates data for ALL users who logged in on the old domain
-- It matches users by email and transfers venues, bookings, and reviews
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Preview What Will Be Migrated
-- ============================================

-- See all users and their data before migration
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.created_at as user_created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT e.id) as event_count,
  COUNT(DISTINCT b.id) as booking_count,
  COUNT(DISTINCT r.id) as review_count
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.events e ON e.venue_id = v.id
LEFT JOIN public.bookings b ON b.user_id = u.id
LEFT JOIN public.venue_reviews r ON r.user_id = u.id
GROUP BY u.id, u.email, u.name, u.created_at
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 2: Find Users with Duplicate Emails (Old + New)
-- ============================================

-- This shows users who have accounts on both old and new domains
SELECT 
  email,
  COUNT(*) as user_count,
  STRING_AGG(id::TEXT, ', ' ORDER BY created_at) as user_ids,
  STRING_AGG(created_at::TEXT, ', ' ORDER BY created_at) as created_dates
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;

-- ============================================
-- STEP 3: Create Migration Mapping Table
-- ============================================

-- Create a temporary table to store old -> new user ID mappings
CREATE TEMP TABLE IF NOT EXISTS user_migration_map (
  email TEXT,
  old_user_id TEXT,
  new_user_id TEXT,
  old_created_at TIMESTAMP,
  new_created_at TIMESTAMP,
  venue_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0
);

-- Populate the mapping table with users who have duplicate emails
INSERT INTO user_migration_map (email, old_user_id, new_user_id, old_created_at, new_created_at)
SELECT 
  u1.email,
  u1.id as old_user_id,  -- Older user (created first)
  u2.id as new_user_id,   -- Newer user (created later)
  u1.created_at as old_created_at,
  u2.created_at as new_created_at
FROM public.users u1
JOIN public.users u2 ON u1.email = u2.email
WHERE u1.id < u2.id  -- Ensure we get the older user as old_user_id
  AND u1.created_at < u2.created_at;  -- Double check: older is old

-- Update counts for verification
UPDATE user_migration_map m
SET 
  venue_count = (SELECT COUNT(*) FROM public.venues WHERE user_id = m.old_user_id),
  booking_count = (SELECT COUNT(*) FROM public.bookings WHERE user_id = m.old_user_id),
  review_count = (SELECT COUNT(*) FROM public.venue_reviews WHERE user_id = m.old_user_id);

-- Show the migration plan
SELECT 
  email,
  old_user_id,
  new_user_id,
  venue_count,
  booking_count,
  review_count,
  CASE 
    WHEN venue_count > 0 OR booking_count > 0 OR review_count > 0 
    THEN 'HAS DATA TO MIGRATE'
    ELSE 'NO DATA'
  END as migration_status
FROM user_migration_map
ORDER BY (venue_count + booking_count + review_count) DESC;

-- ============================================
-- STEP 4: SAFE MIGRATION (With Verification)
-- ============================================

-- This migration script is safe and can be run multiple times
-- It only migrates data that hasn't been migrated yet

DO $$
DECLARE
  migration_record RECORD;
  migrated_venues INTEGER := 0;
  migrated_bookings INTEGER := 0;
  migrated_reviews INTEGER := 0;
  total_migrated INTEGER := 0;
BEGIN
  -- Loop through each user that needs migration
  FOR migration_record IN 
    SELECT * FROM user_migration_map
    WHERE venue_count > 0 OR booking_count > 0 OR review_count > 0
  LOOP
    -- Migrate venues
    UPDATE public.venues
    SET user_id = migration_record.new_user_id,
        updated_at = NOW()
    WHERE user_id = migration_record.old_user_id
      AND user_id != migration_record.new_user_id;  -- Safety check
    
    GET DIAGNOSTICS migrated_venues = ROW_COUNT;
    
    -- Migrate bookings
    UPDATE public.bookings
    SET user_id = migration_record.new_user_id,
        updated_at = NOW()
    WHERE user_id = migration_record.old_user_id
      AND user_id != migration_record.new_user_id;  -- Safety check
    
    GET DIAGNOSTICS migrated_bookings = ROW_COUNT;
    
    -- Migrate reviews
    UPDATE public.venue_reviews
    SET user_id = migration_record.new_user_id
    WHERE user_id = migration_record.old_user_id
      AND user_id != migration_record.new_user_id;  -- Safety check
    
    GET DIAGNOSTICS migrated_reviews = ROW_COUNT;
    
    total_migrated := total_migrated + migrated_venues + migrated_bookings + migrated_reviews;
    
    -- Log the migration
    RAISE NOTICE 'Migrated user %: % venues, % bookings, % reviews', 
      migration_record.email, 
      migrated_venues, 
      migrated_bookings, 
      migrated_reviews;
  END LOOP;
  
  RAISE NOTICE 'Migration complete! Total records migrated: %', total_migrated;
END $$;

-- ============================================
-- STEP 5: Verify Migration Results
-- ============================================

-- Check if all data was migrated successfully
SELECT 
  m.email,
  m.old_user_id,
  m.new_user_id,
  -- Count remaining data on old user_id (should be 0)
  (SELECT COUNT(*) FROM public.venues WHERE user_id = m.old_user_id) as remaining_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = m.old_user_id) as remaining_bookings,
  (SELECT COUNT(*) FROM public.venue_reviews WHERE user_id = m.old_user_id) as remaining_reviews,
  -- Count data on new user_id (should match original counts)
  (SELECT COUNT(*) FROM public.venues WHERE user_id = m.new_user_id) as migrated_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = m.new_user_id) as migrated_bookings,
  (SELECT COUNT(*) FROM public.venue_reviews WHERE user_id = m.new_user_id) as migrated_reviews,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.venues WHERE user_id = m.old_user_id) = 0
     AND (SELECT COUNT(*) FROM public.bookings WHERE user_id = m.old_user_id) = 0
     AND (SELECT COUNT(*) FROM public.venue_reviews WHERE user_id = m.old_user_id) = 0
    THEN 'SUCCESS'
    ELSE 'INCOMPLETE'
  END as migration_status
FROM user_migration_map m
WHERE m.venue_count > 0 OR m.booking_count > 0 OR m.review_count > 0;

-- ============================================
-- STEP 6: Handle Users Who Only Exist on Old Domain
-- ============================================

-- Some users might have data on old domain but haven't logged in on new domain yet
-- We can't migrate their data until they log in (which will create their new user record)
-- But we can identify them:

SELECT 
  u.id as old_user_id,
  u.email,
  u.name,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count,
  'NEEDS LOGIN ON NEW DOMAIN' as status
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
WHERE NOT EXISTS (
  -- User doesn't have a new account yet
  SELECT 1 FROM public.users u2 
  WHERE u2.email = u.email 
    AND u2.id != u.id
    AND u2.created_at > u.created_at
)
AND (EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
     OR EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id))
GROUP BY u.id, u.email, u.name, u.created_at
ORDER BY venue_count DESC, booking_count DESC;

-- These users will need to log in on the new domain first,
-- then you can run a migration for them individually

-- ============================================
-- STEP 7: Clean Up Old User Records (OPTIONAL - DO THIS LAST!)
-- ============================================

-- ONLY run this after verifying all migrations are complete!
-- This deletes old user records that have no data left

-- First, see what will be deleted:
SELECT 
  u.id as old_user_id,
  u.email,
  u.created_at,
  (SELECT COUNT(*) FROM public.venues WHERE user_id = u.id) as remaining_venues,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = u.id) as remaining_bookings,
  (SELECT COUNT(*) FROM public.venue_reviews WHERE user_id = u.id) as remaining_reviews
FROM public.users u
WHERE EXISTS (
  -- User has a newer account with same email
  SELECT 1 FROM public.users u2 
  WHERE u2.email = u.email 
    AND u2.id != u.id
    AND u2.created_at > u.created_at
)
AND NOT EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id)
AND NOT EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u.id);

-- If the above query shows users with 0 remaining data, you can delete them:
-- DELETE FROM public.users 
-- WHERE id IN (
--   SELECT u.id
--   FROM public.users u
--   WHERE EXISTS (
--     SELECT 1 FROM public.users u2 
--     WHERE u2.email = u.email 
--       AND u2.id != u.id
--       AND u2.created_at > u.created_at
--   )
--   AND NOT EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
--   AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id)
--   AND NOT EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u.id)
-- );

-- ============================================
-- QUICK MIGRATION (One Command)
-- ============================================

-- If you want to run everything at once, use this simplified version:

DO $$
DECLARE
  user_pair RECORD;
  total_migrated INTEGER := 0;
BEGIN
  -- Find all user pairs (old + new) with same email
  FOR user_pair IN
    SELECT 
      u1.email,
      u1.id as old_id,
      u2.id as new_id
    FROM public.users u1
    JOIN public.users u2 ON u1.email = u2.email
    WHERE u1.created_at < u2.created_at
      AND (
        EXISTS (SELECT 1 FROM public.venues WHERE user_id = u1.id)
        OR EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u1.id)
        OR EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u1.id)
      )
  LOOP
    -- Migrate venues
    UPDATE public.venues 
    SET user_id = user_pair.new_id, updated_at = NOW()
    WHERE user_id = user_pair.old_id;
    
    -- Migrate bookings
    UPDATE public.bookings 
    SET user_id = user_pair.new_id, updated_at = NOW()
    WHERE user_id = user_pair.old_id;
    
    -- Migrate reviews
    UPDATE public.venue_reviews 
    SET user_id = user_pair.new_id
    WHERE user_id = user_pair.old_id;
    
    total_migrated := total_migrated + 1;
    RAISE NOTICE 'Migrated data for user: %', user_pair.email;
  END LOOP;
  
  RAISE NOTICE 'Bulk migration complete! Migrated % users', total_migrated;
END $$;

