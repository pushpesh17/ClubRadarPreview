-- Check and Migrate Specific Users
-- Run this to check if users have logged in on new domain and migrate their data

-- ============================================
-- STEP 1: Check for Duplicate Users (Old + New)
-- ============================================

SELECT 
  email,
  COUNT(*) as account_count,
  STRING_AGG(id::TEXT, ' | ' ORDER BY created_at) as user_ids,
  STRING_AGG(created_at::TEXT, ' | ' ORDER BY created_at) as created_dates,
  STRING_AGG(name::TEXT, ' | ' ORDER BY created_at) as names,
  CASE 
    WHEN COUNT(*) > 1 THEN 'HAS DUPLICATES - NEEDS MIGRATION'
    ELSE 'NO DUPLICATES - USER NEEDS TO LOGIN ON NEW DOMAIN'
  END as status
FROM public.users
WHERE email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
GROUP BY email
ORDER BY email;

-- ============================================
-- STEP 2: Check Current Venue Ownership
-- ============================================

SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.user_id as current_user_id,
  v.status,
  u.name as owner_name,
  u.email,
  u.created_at as user_created_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users u2 
      WHERE u2.email = u.email 
        AND u2.id != u.id
        AND u2.created_at > u.created_at
    ) THEN 'HAS NEWER ACCOUNT - NEEDS MIGRATION'
    ELSE 'NO NEWER ACCOUNT - USER NEEDS TO LOGIN'
  END as migration_status
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
ORDER BY u.email, v.name;

-- ============================================
-- STEP 3: Migrate Data for Users Who Have Logged In
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
      AND u1.email IN (
        'pushpeshlodiwal1711@gmail.com',
        'pushpeshlodiyaee@gmail.com',
        'bodadesneha2020@gmail.com'
      )
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
    RAISE NOTICE '✅ Migrated data for: % (old: % → new: %)', 
      user_pair.email, user_pair.old_id, user_pair.new_id;
  END LOOP;
  
  IF total_migrated = 0 THEN
    RAISE NOTICE '⚠️ No duplicates found. Users need to log in on clubradar.in first.';
    RAISE NOTICE 'After they log in, run this script again or the auto-migration will handle it.';
  ELSE
    RAISE NOTICE '✅ Migration complete! Migrated % users', total_migrated;
  END IF;
END $$;

-- ============================================
-- STEP 4: Verify Migration Results
-- ============================================

SELECT 
  'After Migration' as check_type,
  v.id as venue_id,
  v.name as venue_name,
  v.user_id,
  v.status,
  u.name as owner_name,
  u.email,
  u.created_at as user_created_at,
  CASE 
    WHEN v.status = 'approved' THEN '✅ Ready for discover'
    ELSE '❌ Needs approval'
  END as status_check
FROM public.venues v
JOIN public.users u ON v.user_id = u.id
WHERE u.email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
ORDER BY u.email, v.name;

