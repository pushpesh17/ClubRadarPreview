-- Fix bookings table to use TEXT for booking ID instead of UUID
-- This allows custom booking IDs like "CR17637148883364966"
-- Run this in your Supabase SQL Editor

-- Option 1: If you have NO existing bookings (recommended for fresh setup)
-- Drop and recreate the table with TEXT id
DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY, -- Changed from UUID to TEXT for custom booking IDs
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  qr_code  TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);

-- Recreate RLS policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings (using service role key in API, but good to have)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (user_id = auth.jwt() ->> 'sub');

-- Recreate trigger for updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at 
BEFORE UPDATE ON public.bookings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Verify the change
SELECT 
  'bookings.id' as column_check,
  data_type,
  CASE 
    WHEN data_type = 'text' THEN '✅ CORRECT - Ready for custom booking IDs'
    WHEN data_type = 'uuid' THEN '❌ WRONG - Still UUID'
    ELSE '⚠️ UNKNOWN'
  END as status
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'id';
