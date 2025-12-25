-- Fix Venue Not Showing in Discover Page
-- This script migrates venue to new user_id AND approves it

-- ============================================
-- STEP 1: Check Current Situation
-- ============================================

-- See all users with this email
SELECT 
  id as user_id,
  email,
  name,
  created_at,
  'OLD' as account_type
FROM public.users
WHERE email = 'pushpeshlodiwal1711@gmail.com'
ORDER BY created_at;

-- See venues for this email
SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.status,
  v.user_id,
  u.email,
  u.created_at as user_created_at,
  CASE 
    WHEN v.status = 'pending' THEN 'NEEDS APPROVAL'
    WHEN v.user_id != (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at DESC LIMIT 1) THEN 'NEEDS MIGRATION'
    ELSE 'OK'
  END as issue
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com';

-- ============================================
-- STEP 2: Migrate Venue to New User ID
-- ============================================

DO $$
DECLARE
  old_user_id TEXT;
  new_user_id TEXT;
  venue_id_to_migrate UUID;
  migrated_count INTEGER;
BEGIN
  -- Get old user_id (created first)
  SELECT id INTO old_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Get new user_id (created last - most recent)
  SELECT id INTO new_user_id
  FROM public.users
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;
  
  RAISE NOTICE 'Old user_id: %, New user_id: %', old_user_id, new_user_id;
  
  -- Only migrate if they're different
  IF old_user_id != new_user_id THEN
    -- Migrate venues
    UPDATE public.venues
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = old_user_id;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % venues', migrated_count;
    
    -- Migrate bookings
    UPDATE public.bookings
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = old_user_id;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % bookings', migrated_count;
    
    -- Migrate reviews
    UPDATE public.venue_reviews
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % reviews', migrated_count;
  ELSE
    RAISE NOTICE 'User IDs are the same, no migration needed';
  END IF;
END $$;

-- ============================================
-- STEP 3: Approve Venue (If Pending)
-- ============================================

-- Approve all venues for this user
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE user_id IN (
  SELECT id 
  FROM public.users 
  WHERE email = 'pushpeshlodiwal1711@gmail.com'
)
AND status = 'pending';

-- ============================================
-- STEP 4: Verify Everything is Fixed
-- ============================================

SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.status,
  v.user_id,
  u.email,
  CASE 
    WHEN v.status = 'approved' AND v.user_id = (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at DESC LIMIT 1) 
    THEN '✅ READY - Should show in discover'
    WHEN v.status = 'pending' 
    THEN '❌ NEEDS APPROVAL'
    WHEN v.user_id != (SELECT id FROM public.users WHERE email = 'pushpeshlodiwal1711@gmail.com' ORDER BY created_at DESC LIMIT 1)
    THEN '❌ NEEDS MIGRATION'
    ELSE '⚠️ CHECK MANUALLY'
  END as status_check
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email = 'pushpeshlodiwal1711@gmail.com';

-- ============================================
-- QUICK FIX: Do Everything at Once
-- ============================================

DO $$
DECLARE
  old_user_id TEXT;
  new_user_id TEXT;
  venue_count INTEGER;
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
  
  RAISE NOTICE '=== Starting Fix ===';
  RAISE NOTICE 'Old user_id: %', old_user_id;
  RAISE NOTICE 'New user_id: %', new_user_id;
  
  -- Step 1: Migrate venues
  IF old_user_id != new_user_id THEN
    UPDATE public.venues
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS venue_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % venues', venue_count;
    
    -- Migrate bookings
    UPDATE public.bookings
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS venue_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % bookings', venue_count;
    
    -- Migrate reviews
    UPDATE public.venue_reviews
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    GET DIAGNOSTICS venue_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % reviews', venue_count;
  END IF;
  
  -- Step 2: Approve venues
  UPDATE public.venues
  SET status = 'approved', updated_at = NOW()
  WHERE user_id = new_user_id
    AND status = 'pending';
  GET DIAGNOSTICS venue_count = ROW_COUNT;
  RAISE NOTICE 'Approved % venues', venue_count;
  
  RAISE NOTICE '=== Fix Complete ===';
  RAISE NOTICE 'Venue should now be visible in discover page!';
END $$;

