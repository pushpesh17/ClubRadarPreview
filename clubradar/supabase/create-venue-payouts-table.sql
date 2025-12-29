-- Create venue_payouts table to track payments to venues
-- Similar to how Zomato/Swiggy manage restaurant payouts

CREATE TABLE IF NOT EXISTS public.venue_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  
  -- Payout Details
  payout_amount DECIMAL(10, 2) NOT NULL CHECK (payout_amount >= 0), -- Allow 0 for record keeping
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Platform commission percentage (default 10%)
  commission_amount DECIMAL(10, 2) NOT NULL, -- Amount deducted as commission
  net_amount DECIMAL(10, 2) NOT NULL, -- Amount to be paid to venue (payout_amount - commission_amount)
  
  -- Booking Period
  period_start_date DATE NOT NULL, -- Start of booking period
  period_end_date DATE NOT NULL, -- End of booking period
  
  -- Payment Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'cancelled')),
  
  -- Payment Method
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'upi', 'neft', 'rtgs')),
  
  -- Bank Details (from venue)
  bank_account TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  
  -- Transaction Details
  transaction_id TEXT, -- External transaction ID (NEFT/RTGS reference)
  transaction_date TIMESTAMP WITH TIME ZONE,
  processed_by TEXT, -- Admin email who processed the payment
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT, -- Admin notes about the payout
  
  -- Metadata
  booking_count INTEGER DEFAULT 0, -- Number of bookings in this period
  total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Total revenue from bookings (can be 0)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_venue_payouts_venue_id ON public.venue_payouts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_payouts_status ON public.venue_payouts(status);
CREATE INDEX IF NOT EXISTS idx_venue_payouts_period ON public.venue_payouts(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_venue_payouts_created_at ON public.venue_payouts(created_at DESC);

-- Add RLS policies
ALTER TABLE public.venue_payouts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can access all (for API)
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Service role can access all payouts" ON public.venue_payouts;
CREATE POLICY "Service role can access all payouts"
  ON public.venue_payouts
  FOR ALL
  USING (true);

-- Verify the table was created
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'venue_payouts'
ORDER BY ordinal_position;

