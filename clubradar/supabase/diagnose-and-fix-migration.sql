-- Diagnose and Fix Migration Issues
-- Run this to see what's wrong and fix it

-- ============================================
-- STEP 1: Check All Users and Their Data
-- ============================================

SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT e.id) as event_count,
  COUNT(DISTINCT b.id) as booking_count,
  STRING_AGG(DISTINCT v.status, ', ') as venue_statuses
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.events e ON e.venue_id = v.id
LEFT JOIN public.bookings b ON b.user_id = u.id
GROUP BY u.id, u.name, u.email, u.created_at
ORDER BY u.created_at;

-- ============================================
-- STEP 2: Check for Duplicate Users (Old + New)
-- ============================================

-- Find users with same email but different IDs (old + new accounts)
SELECT 
  email,
  COUNT(*) as account_count,
  STRING_AGG(id::TEXT, ' | ' ORDER BY created_at) as user_ids,
  STRING_AGG(created_at::TEXT, ' | ' ORDER BY created_at) as created_dates,
  STRING_AGG(name::TEXT, ' | ' ORDER BY created_at) as names
FROM public.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;

-- ============================================
-- STEP 3: Check Which User IDs Have Venues
-- ============================================

SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.user_id,
  v.status,
  v.created_at as venue_created_at,
  u.name as owner_name,
  u.email,
  u.created_at as user_created_at,
  CASE 
    WHEN u.created_at < (SELECT MIN(created_at) FROM public.users WHERE email = u.email AND id != u.id) THEN 'OLD USER'
    ELSE 'NEW USER'
  END as user_type
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
ORDER BY v.created_at;

-- ============================================
-- STEP 4: Check if Migration Function Exists
-- ============================================

SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'migrate_user_data_by_email';

-- If this returns nothing, the function doesn't exist - you need to create it!

-- ============================================
-- STEP 5: Manual Migration for Specific Users
-- ============================================

-- For Pushpesh Lodiwal (pushpeshlodiwal1711@gmail.com)
DO $$
DECLARE
  old_user_id TEXT;
  new_user_id TEXT;
  venue_count INTEGER;
  booking_count INTEGER;
BEGIN
  -- Get old user_id (created first)
  SELECT id INTO old_user_id
  FROM public.users
  WHERE (email = 'pushpeshlodiwal1711@gmail.com' OR id = 'user_35hvrWePm83NtL6tSFel9zZBKaW')
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Get new user_id (created last)
  SELECT id INTO new_user_id
  FROM public.users
  WHERE (email = 'pushpeshlodiwal1711@gmail.com' OR id = 'user_35hvrWePm83NtL6tSFel9zZBKaW')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If only one user exists, they're the same
  IF old_user_id = new_user_id THEN
    RAISE NOTICE 'Only one user found: %. User may need to log in on new domain first.', old_user_id;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Old user_id: %, New user_id: %', old_user_id, new_user_id;
  
  -- Migrate venues
  UPDATE public.venues
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  GET DIAGNOSTICS venue_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % venues', venue_count;
  
  -- Migrate bookings
  UPDATE public.bookings
  SET user_id = new_user_id, updated_at = NOW()
  WHERE user_id = old_user_id;
  GET DIAGNOSTICS booking_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % bookings', booking_count;
  
  -- Approve venues
  UPDATE public.venues
  SET status = 'approved', updated_at = NOW()
  WHERE user_id = new_user_id AND status = 'pending';
  
  RAISE NOTICE 'Migration complete for Pushpesh Lodiwal';
END $$;

-- ============================================
-- STEP 6: Migrate ALL Users at Once
-- ============================================

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
    RAISE NOTICE 'Migrated data for user: % (old: %, new: %)', 
      user_pair.email, user_pair.old_id, user_pair.new_id;
  END LOOP;
  
  -- If no duplicates found, check if users need to log in first
  IF total_migrated = 0 THEN
    RAISE NOTICE 'No duplicate users found. Users may need to log in on new domain first.';
    RAISE NOTICE 'Or check if venues are linked to the correct user_id.';
  ELSE
    RAISE NOTICE 'Bulk migration complete! Migrated % users', total_migrated;
  END IF;
  
  -- Approve all venues
  UPDATE public.venues
  SET status = 'approved', updated_at = NOW()
  WHERE status = 'pending';
  
  RAISE NOTICE 'All pending venues approved';
END $$;

-- ============================================
-- STEP 7: Verify Migration Results
-- ============================================

SELECT 
  'After Migration' as check_type,
  u.id as user_id,
  u.name,
  u.email,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT e.id) as event_count,
  COUNT(DISTINCT b.id) as booking_count,
  STRING_AGG(DISTINCT v.status, ', ') as venue_statuses
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
LEFT JOIN public.events e ON e.venue_id = v.id
LEFT JOIN public.bookings b ON b.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 8: Check Venues Status
-- ============================================

SELECT 
  v.id,
  v.name,
  v.status,
  v.user_id,
  u.name as owner_name,
  u.email,
  CASE 
    WHEN v.status = 'approved' THEN '✅ Will show in discover'
    WHEN v.status = 'pending' THEN '❌ Needs approval'
    ELSE '⚠️ Check status'
  END as discover_status
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
ORDER BY v.created_at;

