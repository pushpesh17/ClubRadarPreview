-- Check and Fix User Venue Migration
-- Run this to check if venue was migrated and fix issues

-- ============================================
-- STEP 1: Check Current User's Venue Status
-- ============================================

-- Replace 'YOUR_EMAIL' with the actual email
-- Replace 'YOUR_NEW_USER_ID' with your current Clerk user ID (from new domain)

-- Check if you have a venue on new user_id
SELECT 
  'NEW USER VENUE' as check_type,
  v.id as venue_id,
  v.name as venue_name,
  v.user_id,
  v.status,
  v.created_at,
  u.email
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com'
  AND v.user_id = (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at DESC LIMIT 1);

-- Check if you have a venue on old user_id
SELECT 
  'OLD USER VENUE' as check_type,
  v.id as venue_id,
  v.name as venue_name,
  v.user_id,
  v.status,
  v.created_at,
  u.email
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com'
  AND v.user_id = (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at ASC LIMIT 1);

-- ============================================
-- STEP 2: See All Users with This Email
-- ============================================

SELECT 
  id as user_id,
  email,
  name,
  created_at,
  (SELECT COUNT(*) FROM public.venues WHERE user_id = users.id) as venue_count
FROM public.users
WHERE email = 'pushpeshlodiwal1711@gmail.com'
ORDER BY created_at;

-- ============================================
-- STEP 3: Manual Migration (If Needed)
-- ============================================

-- Get old and new user IDs
DO $$
DECLARE
  old_user_id TEXT;
  new_user_id TEXT;
  venue_count INTEGER;
BEGIN
  -- Get old user_id (created first)
  SELECT id INTO old_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Get new user_id (created last)
  SELECT id INTO new_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;
  
  RAISE NOTICE 'Old user_id: %, New user_id: %', old_user_id, new_user_id;
  
  -- Migrate venues
  UPDATE public.venues
  SET user_id = new_user_id,
      updated_at = NOW()
  WHERE user_id = old_user_id;
  
  GET DIAGNOSTICS venue_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % venues', venue_count;
  
  -- Migrate bookings
  UPDATE public.bookings
  SET user_id = new_user_id,
      updated_at = NOW()
  WHERE user_id = old_user_id;
  
  GET DIAGNOSTICS venue_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % bookings', venue_count;
  
  -- Migrate reviews
  UPDATE public.venue_reviews
  SET user_id = new_user_id
  WHERE user_id = old_user_id;
  
  GET DIAGNOSTICS venue_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % reviews', venue_count;
END $$;

-- ============================================
-- STEP 4: Approve Venue (If Status is Pending)
-- ============================================

-- Check venue status
SELECT 
  v.id,
  v.name,
  v.status,
  v.user_id,
  u.email
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com';

-- If status is 'pending', approve it:
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE id IN (
  SELECT v.id
  FROM public.venues v
  JOIN public.users u ON v.user_id = u.id
  WHERE u.email = 'pushpeshlodiwal1711@gmail.com'
    AND v.status = 'pending'
);

-- Verify the update
SELECT 
  v.id,
  v.name,
  v.status,
  'APPROVED - Should show in discover' as status_message
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com';

-- ============================================
-- QUICK FIX: Migrate and Approve in One Go
-- ============================================

DO $$
DECLARE
  old_user_id TEXT;
  new_user_id TEXT;
  venue_id_to_approve UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO old_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at ASC
  LIMIT 1;
  
  SELECT id INTO new_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Migrate venues
  UPDATE public.venues
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  
  -- Migrate bookings
  UPDATE public.bookings
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  
  -- Migrate reviews
  UPDATE public.venue_reviews
  SET user_id = new_user_id
  WHERE user_id = old_user_id;
  
  -- Get venue ID to approve
  SELECT id INTO venue_id_to_approve
  FROM public.venues
  WHERE user_id = new_user_id
  LIMIT 1;
  
  -- Approve venue
  IF venue_id_to_approve IS NOT NULL THEN
    UPDATE public.venues
    SET status = 'approved', updated_at = NOW()
    WHERE id = venue_id_to_approve;
    
    RAISE NOTICE 'Success! Migrated data and approved venue %', venue_id_to_approve;
  END IF;
END $$;

