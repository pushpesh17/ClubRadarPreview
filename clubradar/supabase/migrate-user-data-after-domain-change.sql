-- Migrate User Data After Domain Change
-- This script helps you transfer venues, events, and bookings from old user_id to new user_id
-- Run this in your Supabase SQL Editor

-- IMPORTANT: You need to know your OLD user_id and NEW user_id
-- To find these, see the instructions below

-- ============================================
-- STEP 1: Find Your User IDs
-- ============================================

-- Option A: Find all users with your email
SELECT 
  id as user_id,
  email,
  name,
  created_at
FROM public.users
WHERE email = 'your-email@example.com';  -- Replace with your actual email

-- Option B: Find all venues to see which user_id they belong to
SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.user_id as old_user_id,
  v.status,
  v.created_at,
  u.email as owner_email
FROM public.venues v
LEFT JOIN public.users u ON v.user_id = u.id
ORDER BY v.created_at DESC;

-- Option C: Find your current (new) user_id from Clerk
-- You can get this by:
-- 1. Logging into your app on the new domain
-- 2. Opening browser console (F12)
-- 3. Running: await fetch('/api/venues/status').then(r => r.json())
-- 4. Or check Clerk Dashboard → Users → Find your email → Copy the user ID

-- ============================================
-- STEP 2: Update User Record (Merge Old and New)
-- ============================================

-- Replace 'OLD_USER_ID' with your old Clerk user ID
-- Replace 'NEW_USER_ID' with your new Clerk user ID
-- Replace 'your-email@example.com' with your email

-- First, let's see what data exists for both users
SELECT 'OLD USER DATA' as source, * FROM public.users WHERE id = 'OLD_USER_ID'
UNION ALL
SELECT 'NEW USER DATA' as source, * FROM public.users WHERE id = 'NEW_USER_ID';

-- ============================================
-- STEP 3: Migrate Venues to New User ID
-- ============================================

-- Update all venues from old user_id to new user_id
UPDATE public.venues
SET user_id = 'NEW_USER_ID',  -- Replace with your new user_id
    updated_at = NOW()
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id

-- Verify the update
SELECT 
  id,
  name,
  user_id,
  status,
  created_at
FROM public.venues
WHERE user_id = 'NEW_USER_ID';  -- Should show your venues

-- ============================================
-- STEP 4: Migrate Events (Automatic - via venue_id)
-- ============================================

-- Events are linked via venue_id, so they should automatically be associated
-- with the new user once venues are updated. But let's verify:

SELECT 
  e.id as event_id,
  e.name as event_name,
  e.date,
  e.time,
  v.name as venue_name,
  v.user_id
FROM public.events e
JOIN public.venues v ON e.venue_id = v.id
WHERE v.user_id = 'NEW_USER_ID';  -- Replace with your new user_id

-- ============================================
-- STEP 5: Migrate Bookings (Optional - if you want to keep booking history)
-- ============================================

-- If you have bookings linked to the old user_id, update them too
UPDATE public.bookings
SET user_id = 'NEW_USER_ID',  -- Replace with your new user_id
    updated_at = NOW()
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id

-- Verify bookings
SELECT 
  id,
  event_id,
  user_id,
  payment_status,
  created_at
FROM public.bookings
WHERE user_id = 'NEW_USER_ID';  -- Replace with your new user_id

-- ============================================
-- STEP 6: Migrate Reviews (Optional)
-- ============================================

-- If you have reviews, update them too
UPDATE public.venue_reviews
SET user_id = 'NEW_USER_ID',  -- Replace with your new user_id
    updated_at = NOW()
WHERE user_id = 'OLD_USER_ID';  -- Replace with your old user_id

-- ============================================
-- STEP 7: Clean Up Old User Record (Optional)
-- ============================================

-- After migrating all data, you can optionally delete the old user record
-- BE CAREFUL: Only do this after verifying all data is migrated!

-- First, verify no data is left linked to old user_id
SELECT 'venues' as table_name, COUNT(*) as count FROM public.venues WHERE user_id = 'OLD_USER_ID'
UNION ALL
SELECT 'bookings', COUNT(*) FROM public.bookings WHERE user_id = 'OLD_USER_ID'
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.venue_reviews WHERE user_id = 'OLD_USER_ID';

-- If all counts are 0, you can safely delete the old user
-- DELETE FROM public.users WHERE id = 'OLD_USER_ID';

-- ============================================
-- QUICK MIGRATION SCRIPT (Fill in your IDs)
-- ============================================

-- Replace these values:
-- OLD_USER_ID: Your Clerk user ID from the old domain
-- NEW_USER_ID: Your Clerk user ID from the new domain

DO $$
DECLARE
  old_user_id TEXT := 'OLD_USER_ID_HERE';  -- Replace this!
  new_user_id TEXT := 'NEW_USER_ID_HERE';  -- Replace this!
BEGIN
  -- Update venues
  UPDATE public.venues
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  
  -- Update bookings
  UPDATE public.bookings
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  
  -- Update reviews
  UPDATE public.venue_reviews
  SET user_id = new_user_id
  WHERE user_id = old_user_id;
  
  RAISE NOTICE 'Migration complete! Updated venues, bookings, and reviews from % to %', old_user_id, new_user_id;
END $$;

