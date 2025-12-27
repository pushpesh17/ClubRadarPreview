-- Create venue_rejection_history table to track all rejection details
-- This stores a snapshot of venue data at the time of rejection

CREATE TABLE IF NOT EXISTS public.venue_rejection_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  rejection_reason TEXT NOT NULL,
  rejected_by TEXT, -- Admin email or user ID who rejected
  rejected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Snapshot of venue data at time of rejection
  venue_snapshot JSONB NOT NULL, -- Stores all venue details (name, address, documents, etc.)
  
  -- Metadata
  rejection_number INTEGER NOT NULL, -- Which rejection this is (1st, 2nd, 3rd, etc.)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_venue_rejection_history_venue_id ON public.venue_rejection_history(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_rejection_history_rejected_at ON public.venue_rejection_history(rejected_at DESC);

-- Add RLS policies
ALTER TABLE public.venue_rejection_history ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view rejection history (we'll use service role in API, so this is for direct access)
CREATE POLICY "Admins can view rejection history"
  ON public.venue_rejection_history
  FOR SELECT
  USING (true); -- Service role will be used in API, so allow all for now

-- Verify the table was created
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'venue_rejection_history'
ORDER BY ordinal_position;

