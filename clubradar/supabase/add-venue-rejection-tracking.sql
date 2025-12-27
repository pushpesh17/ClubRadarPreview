-- Add rejection tracking fields to venues table
-- This allows us to track rejection history even when venues are re-registered

-- Add rejected_at timestamp (when venue was last rejected)
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Add rejection_count (how many times venue has been rejected)
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0;

-- Add rejection_reason (separate from description to preserve original description)
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for better query performance on rejected venues
CREATE INDEX IF NOT EXISTS idx_venues_rejected_at ON public.venues(rejected_at) 
WHERE rejected_at IS NOT NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'venues'
  AND column_name IN ('rejected_at', 'rejection_count', 'rejection_reason')
ORDER BY column_name;

