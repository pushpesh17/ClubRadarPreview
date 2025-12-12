-- Create payouts table for tracking venue payouts
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT, -- e.g., 'bank_transfer', 'upi', etc.
  transaction_id TEXT, -- External payment transaction ID
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payouts_venue_id ON public.payouts(venue_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON public.payouts(requested_at DESC);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using service role key in API, but good to have)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Venue owners can view own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Venue owners can create payout requests" ON public.payouts;

CREATE POLICY "Venue owners can view own payouts"
ON public.payouts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = payouts.venue_id 
    AND venues.user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Venue owners can create payout requests"
ON public.payouts FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = payouts.venue_id 
    AND venues.user_id = auth.jwt() ->> 'sub'
    AND venues.status = 'approved'
  )
);

-- Function for updating updated_at timestamp
-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_payouts_updated_at ON public.payouts;

-- Create trigger (assuming update_updated_at_column function already exists from other tables)
CREATE TRIGGER update_payouts_updated_at 
BEFORE UPDATE ON public.payouts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

