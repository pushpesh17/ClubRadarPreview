-- Manually Create User Records from Clerk
-- Use this to create user records in Supabase for users who have logged in on new domain
-- but their records weren't created automatically

-- ============================================
-- STEP 1: Get User IDs from Clerk Dashboard
-- ============================================

-- You need to get the NEW user IDs from Clerk Dashboard:
-- 1. Go to Clerk Dashboard → Users
-- 2. Find the users by email
-- 3. Copy their user IDs (they'll be different from the old ones)
-- 4. Use those IDs below

-- ============================================
-- STEP 2: Create User Records Manually
-- ============================================

-- Replace these with actual user IDs from Clerk Dashboard
-- Format: user_xxxxx (from Clerk)

-- For Pushpesh Lodiwal
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  'NEW_USER_ID_FROM_CLERK_1',  -- Replace with actual Clerk user_id
  'pushpeshlodiwal1711@gmail.com',
  'Pushpesh Lodiwal',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- For Vicky p
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  'NEW_USER_ID_FROM_CLERK_2',  -- Replace with actual Clerk user_id
  'pushpeshlodiyaee@gmail.com',
  'Vicky p',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- For Sneha Bodade
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  'NEW_USER_ID_FROM_CLERK_3',  -- Replace with actual Clerk user_id
  'bodadesneha2020@gmail.com',
  'Sneha Bodade',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- STEP 3: After Creating Users, Migrate Data
-- ============================================

-- After creating the user records, run the migration:
-- Use: supabase/force-migrate-to-current-user.sql → Step 2

-- ============================================
-- ALTERNATIVE: Get User IDs from Browser Console
-- ============================================

-- Instead of getting from Clerk Dashboard, you can:
-- 1. Log in on clubradar.in
-- 2. Open browser console (F12)
-- 3. Run: await fetch('/api/venues/status').then(r => r.json())
-- 4. Check the response or network tab to see your user_id
-- 5. Use that user_id in the INSERT statements above

