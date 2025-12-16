-- Fix bookings table foreign key constraint
-- This ensures the bookings table has the correct foreign key to users table
-- Run this in your Supabase SQL Editor

-- Step 1: Check if foreign key constraint exists
-- If it doesn't exist, we'll add it
-- If it exists but is wrong, we'll drop and recreate it

-- Drop existing constraint if it exists (to avoid conflicts)
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Add the foreign key constraint
-- This ensures that user_id in bookings must exist in users table
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Verify the constraint was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'bookings' 
    AND constraint_name = 'bookings_user_id_fkey'
  ) THEN
    RAISE NOTICE '✅ Foreign key constraint bookings_user_id_fkey exists!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create foreign key constraint';
  END IF;
END $$;

-- Note: After running this script, the bookings table will require that
-- any user_id being inserted must already exist in the users table.
-- The booking API endpoint now automatically creates users if they don't exist,
-- so this should work seamlessly.

