-- Migrate Data for Users Who Haven't Logged In Yet
-- This script prepares data migration for users who have data on old domain
-- but haven't logged in on new domain yet
-- When they do log in, the auto-migration function will handle it

-- ============================================
-- STEP 1: See Users Who Need Migration
-- ============================================

-- Users with data who haven't logged in on new domain
SELECT 
  u.id as old_user_id,
  u.email,
  u.name,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count,
  COUNT(DISTINCT r.id) as review_count,
  'WILL AUTO-MIGRATE ON LOGIN' as status
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
LEFT JOIN public.venue_reviews r ON r.user_id = u.id
WHERE NOT EXISTS (
  -- User doesn't have a new account yet
  SELECT 1 FROM public.users u2 
  WHERE u2.email = u.email 
    AND u2.id != u.id
    AND u2.created_at > u.created_at
)
AND (
  EXISTS (SELECT 1 FROM public.venues WHERE user_id = u.id)
  OR EXISTS (SELECT 1 FROM public.bookings WHERE user_id = u.id)
  OR EXISTS (SELECT 1 FROM public.venue_reviews WHERE user_id = u.id)
)
GROUP BY u.id, u.email, u.name, u.created_at
ORDER BY venue_count DESC, booking_count DESC;

-- ============================================
-- STEP 2: Create Auto-Migration Function (If Not Exists)
-- ============================================

-- This function will be called automatically when users log in
-- See: supabase/auto-migrate-user-by-email.sql

-- ============================================
-- STEP 3: Test Migration for Specific Users
-- ============================================

-- You can test the migration function manually for users who will log in soon
-- Replace with actual user email and new user_id (from Clerk when they log in)

-- Example:
-- SELECT * FROM migrate_user_data_by_email(
--   'new_user_id_from_clerk',  -- This will be created when they log in
--   'user@example.com'          -- Their email
-- );

-- ============================================
-- STEP 4: Monitor Users Who Log In
-- ============================================

-- After users log in, check if migration happened:
SELECT 
  u.id as user_id,
  u.email,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT b.id) as booking_count,
  COUNT(DISTINCT r.id) as review_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users u2 
      WHERE u2.email = u.email 
        AND u2.id != u.id
        AND u2.created_at < u.created_at
    ) THEN 'HAS OLD ACCOUNT - CHECK IF MIGRATED'
    ELSE 'NO OLD ACCOUNT'
  END as migration_status
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.bookings b ON b.user_id = u.id
LEFT JOIN public.venue_reviews r ON r.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '7 days'  -- Users who logged in recently
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 5: Manual Migration for Specific Users (If Needed)
-- ============================================

-- If you know a user's new user_id (from Clerk), you can manually trigger migration:

-- DO $$
-- DECLARE
--   result RECORD;
-- BEGIN
--   SELECT * INTO result FROM migrate_user_data_by_email(
--     'NEW_USER_ID_HERE',  -- Replace with actual new user_id
--     'user@example.com'   -- Replace with user's email
--   );
--   
--   RAISE NOTICE 'Migration result: % venues, % bookings, % reviews migrated from old user %',
--     result.migrated_venues,
--     result.migrated_bookings,
--     result.migrated_reviews,
--     result.old_user_id;
-- END $$;

-- ============================================
-- SUMMARY
-- ============================================

-- The auto-migration system works like this:
-- 1. User logs in on new domain → Clerk creates new user_id
-- 2. User sync route creates user record in Supabase
-- 3. Auto-migration function is called automatically
-- 4. Function finds old user_id by email
-- 5. Function migrates venues, bookings, reviews to new user_id
-- 6. User sees their data immediately!

-- No manual intervention needed - it happens automatically when users log in!

