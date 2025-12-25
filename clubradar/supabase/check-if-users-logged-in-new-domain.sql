-- Check If Users Have Logged In on New Domain
-- This will show if users have duplicate accounts (old + new)

-- ============================================
-- STEP 1: Check for Duplicate Users
-- ============================================

SELECT 
  email,
  COUNT(*) as account_count,
  STRING_AGG(id::TEXT, ' | ' ORDER BY created_at) as user_ids,
  STRING_AGG(created_at::TEXT, ' | ' ORDER BY created_at) as created_dates,
  STRING_AGG(name::TEXT, ' | ' ORDER BY created_at) as names,
  CASE 
    WHEN COUNT(*) > 1 THEN '✅ HAS LOGGED IN ON NEW DOMAIN - Has duplicates'
    ELSE '❌ NOT LOGGED IN ON NEW DOMAIN - Only has old account'
  END as login_status
FROM public.users
WHERE email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
GROUP BY email
ORDER BY email;

-- ============================================
-- STEP 2: See All User Accounts for These Emails
-- ============================================

SELECT 
  id as user_id,
  email,
  name,
  created_at,
  CASE 
    WHEN created_at = (
      SELECT MAX(created_at) FROM public.users u2 WHERE u2.email = users.email
    ) THEN 'NEWEST (from new domain)'
    ELSE 'OLD (from old domain)'
  END as account_type,
  (SELECT COUNT(*) FROM public.venues WHERE user_id = users.id) as venue_count,
  (SELECT COUNT(*) FROM public.bookings WHERE user_id = users.id) as booking_count
FROM public.users
WHERE email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
ORDER BY email, created_at;

-- ============================================
-- STEP 3: Check What Happens When They Log In
-- ============================================

-- This shows what will happen when users log in on new domain:
-- 1. Clerk will create a NEW user_id
-- 2. Auto-migration function will run (if created)
-- 3. Data will migrate from old to new user_id

SELECT 
  'Current Status' as info,
  email,
  COUNT(*) as current_accounts,
  CASE 
    WHEN COUNT(*) = 1 THEN 'Will create new account when logs in on clubradar.in'
    ELSE 'Already has multiple accounts - migration should work'
  END as next_step
FROM public.users
WHERE email IN (
  'pushpeshlodiwal1711@gmail.com',
  'pushpeshlodiyaee@gmail.com',
  'bodadesneha2020@gmail.com'
)
GROUP BY email
ORDER BY email;

