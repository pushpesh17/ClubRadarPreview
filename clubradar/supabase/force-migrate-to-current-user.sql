-- Force Migrate Venues to Current User IDs
-- Use this if users have already logged in on new domain
-- This will migrate venues to the MOST RECENT user_id for each email

-- ============================================
-- STEP 1: See Current Situation
-- ============================================

SELECT 
  u.email,
  u.id as user_id,
  u.name,
  u.created_at,
  COUNT(DISTINCT v.id) as venue_count,
  'CURRENT' as user_type
FROM public.users u
LEFT JOIN public.venues v ON v.user_id = u.id
WHERE u.email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
GROUP BY u.id, u.email, u.name, u.created_at
ORDER BY u.email, u.created_at DESC;

-- ============================================
-- STEP 2: Force Migration - Move All Data to Most Recent User ID
-- ============================================

DO $$
DECLARE
  user_record RECORD;
  old_user_id TEXT;
  new_user_id TEXT;
  migrated_count INTEGER;
BEGIN
  -- For each email, migrate data to the most recent user_id
  FOR user_record IN
    SELECT DISTINCT email
    FROM public.users
    WHERE email IN (
      'pushpeshlodiwal1711@gmail.com',
      'pushpeshlodiyaee@gmail.com',
      'bodadesneha2020@gmail.com'
    )
  LOOP
    -- Get the most recent user_id (newest account)
    SELECT id INTO new_user_id
    FROM public.users
    WHERE email = user_record.email
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get all older user_ids for this email
    FOR old_user_id IN
      SELECT id
      FROM public.users
      WHERE email = user_record.email
        AND id != new_user_id
      ORDER BY created_at ASC
    LOOP
      RAISE NOTICE 'Migrating data for %: % → %', user_record.email, old_user_id, new_user_id;
      
      -- Migrate venues
      UPDATE public.venues
      SET user_id = new_user_id, updated_at = NOW()
      WHERE user_id = old_user_id;
      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      IF migrated_count > 0 THEN
        RAISE NOTICE '  Migrated % venues', migrated_count;
      END IF;
      
      -- Migrate bookings
      UPDATE public.bookings
      SET user_id = new_user_id, updated_at = NOW()
      WHERE user_id = old_user_id;
      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      IF migrated_count > 0 THEN
        RAISE NOTICE '  Migrated % bookings', migrated_count;
      END IF;
      
      -- Migrate reviews
      UPDATE public.venue_reviews
      SET user_id = new_user_id
      WHERE user_id = old_user_id;
      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      IF migrated_count > 0 THEN
        RAISE NOTICE '  Migrated % reviews', migrated_count;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Approve all venues
  UPDATE public.venues
  SET status = 'approved', updated_at = NOW()
  WHERE status = 'pending'
    AND user_id IN (
      SELECT id FROM public.users
      WHERE email IN (
        'pushpeshlodiwal1711@gmail.com',
        'pushpeshlodiyaee@gmail.com',
        'bodadesneha2020@gmail.com'
      )
    );
  
  RAISE NOTICE '✅ Migration complete! All venues approved.';
END $$;

-- ============================================
-- STEP 3: Verify Results
-- ============================================

SELECT 
  v.id as venue_id,
  v.name as venue_name,
  v.user_id,
  v.status,
  u.name as owner_name,
  u.email,
  u.created_at as user_created_at,
  CASE 
    WHEN v.status = 'approved' AND u.created_at = (
      SELECT MAX(created_at) FROM public.users WHERE email = u.email
    ) THEN '✅ Ready - Linked to newest account'
    WHEN v.status = 'approved' THEN '⚠️ Approved but linked to old account'
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

