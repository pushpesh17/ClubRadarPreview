-- Safe Migration: Change User IDs from UUID to TEXT for Clerk
-- This preserves existing data (if any)
-- Run this in your Supabase SQL Editor

-- Step 1: Drop foreign key constraints temporarily
ALTER TABLE public.venues 
DROP CONSTRAINT IF EXISTS venues_user_id_fkey;

ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Step 2: Change users.id from UUID to TEXT
-- Create a new column with TEXT type
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS id_text TEXT;

-- Copy UUID values to TEXT (if you have existing data)
-- For new Clerk users, this will be empty
UPDATE public.users 
SET id_text = id::TEXT 
WHERE id_text IS NULL;

-- Drop the old primary key constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_pkey;

-- Drop the old UUID column
ALTER TABLE public.users 
DROP COLUMN IF EXISTS id;

-- Rename the new column
ALTER TABLE public.users 
RENAME COLUMN id_text TO id;

-- Set as primary key
ALTER TABLE public.users 
ADD PRIMARY KEY (id);

-- Step 3: Change venues.user_id from UUID to TEXT
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS user_id_text TEXT;

-- Copy UUID values to TEXT (if you have existing data)
UPDATE public.venues 
SET user_id_text = user_id::TEXT 
WHERE user_id_text IS NULL;

-- Drop the old column
ALTER TABLE public.venues 
DROP COLUMN IF EXISTS user_id;

-- Rename the new column
ALTER TABLE public.venues 
RENAME COLUMN user_id_text TO user_id;

-- Add NOT NULL constraint
ALTER TABLE public.venues 
ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Change bookings.user_id from UUID to TEXT
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id_text TEXT;

-- Copy UUID values to TEXT (if you have existing data)
UPDATE public.bookings 
SET user_id_text = user_id::TEXT 
WHERE user_id_text IS NULL;

-- Drop the old column
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS user_id;

-- Rename the new column
ALTER TABLE public.bookings 
RENAME COLUMN user_id_text TO user_id;

-- Add NOT NULL constraint
ALTER TABLE public.bookings 
ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Change reviews.user_id from UUID to TEXT
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS user_id_text TEXT;

-- Copy UUID values to TEXT (if you have existing data)
UPDATE public.reviews 
SET user_id_text = user_id::TEXT 
WHERE user_id_text IS NULL;

-- Drop the old column
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS user_id;

-- Rename the new column
ALTER TABLE public.reviews 
RENAME COLUMN user_id_text TO user_id;

-- Add NOT NULL constraint
ALTER TABLE public.reviews 
ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Recreate foreign key constraints
ALTER TABLE public.venues 
ADD CONSTRAINT venues_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 7: Update RLS policies to work with TEXT IDs
-- Note: RLS policies using auth.uid() may need adjustment
-- Clerk doesn't use Supabase auth, so these policies won't work as-is
-- You'll need to handle authorization in your API routes instead

-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Venue owners can create venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can update their venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can create events" ON public.events;
DROP POLICY IF EXISTS "Venue owners can update their events" ON public.events;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Create new policies that allow authenticated access
-- Authorization will be handled in API routes using Clerk
CREATE POLICY "Authenticated users can view users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view venues"
  ON public.venues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create venues"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update venues"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (true);

-- Note: Since we're using Clerk for auth, RLS policies are less strict
-- All authorization checks should be done in your API routes using Clerk's auth()

