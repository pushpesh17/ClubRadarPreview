-- Update venue_payouts table to allow zero amounts
-- This is needed for record keeping when venues have no events/bookings

-- Remove the CHECK constraint that requires payout_amount > 0
ALTER TABLE public.venue_payouts
DROP CONSTRAINT IF EXISTS venue_payouts_payout_amount_check;

-- Add new constraint that allows >= 0
ALTER TABLE public.venue_payouts
ADD CONSTRAINT venue_payouts_payout_amount_check 
CHECK (payout_amount >= 0);

-- Update total_revenue to have default 0 (if not already)
ALTER TABLE public.venue_payouts
ALTER COLUMN total_revenue SET DEFAULT 0;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'venue_payouts'
  AND column_name IN ('payout_amount', 'total_revenue')
ORDER BY ordinal_position;









