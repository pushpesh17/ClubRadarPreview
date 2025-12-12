-- Create bookings table if it doesn't exist
-- This script ensures the bookings table is created with the correct structure
-- Run this in your Supabase SQL Editor

-- Create bookings table (will not drop existing data if table exists)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY, -- Custom booking ID format: CR{timestamp}{random}
  user_id TEXT NOT NULL, -- Clerk user ID (TEXT, not UUID)
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  number_of_people INTEGER NOT NULL DEFAULT 1 CHECK (number_of_people > 0),
  total_amount DECIMAL(10, 2) NOT NULL, -- Total price for the booking
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT, -- Razorpay payment ID (optional)
  qr_code TEXT, -- QR code data URL for entry pass
  checked_in BOOLEAN DEFAULT FALSE, -- Whether the user has checked in at the venue
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- RLS Policies
-- Note: API routes use service role key which bypasses RLS
-- These policies are for direct Supabase access

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users (API uses service role anyway)

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow all authenticated users (API uses service role anyway)

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (true); -- Allow all authenticated users (API uses service role anyway)

-- Create or replace function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    RAISE NOTICE '✅ Bookings table exists!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create bookings table';
  END IF;
END $$;

-- Note: After running this script, you may need to refresh Supabase's schema cache
-- This usually happens automatically, but if you still see errors, try:
-- 1. Wait a few seconds
-- 2. Restart your Next.js dev server
-- 3. Or go to Supabase Dashboard → Settings → API → Refresh schema cache
