-- Create venue_reviews table (real review system for venues)
-- Only users who booked can review (enforced in API), one review per user per venue.
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.venue_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One review per user per venue
CREATE UNIQUE INDEX IF NOT EXISTS uniq_venue_reviews_venue_user
ON public.venue_reviews (venue_id, user_id);

-- Useful indexes for large scale queries
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_created
ON public.venue_reviews (venue_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_helpful
ON public.venue_reviews (venue_id, helpful_count DESC);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_rating
ON public.venue_reviews (venue_id, rating DESC);

ALTER TABLE public.venue_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read reviews (discover/venue page)
DROP POLICY IF EXISTS "Anyone can view venue reviews" ON public.venue_reviews;
CREATE POLICY "Anyone can view venue reviews"
ON public.venue_reviews FOR SELECT
TO anon, authenticated
USING (true);

-- Inserts/updates should be done through API (service role)
DROP POLICY IF EXISTS "Service role can manage venue reviews" ON public.venue_reviews;
CREATE POLICY "Service role can manage venue reviews"
ON public.venue_reviews
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='venue_reviews') THEN
    RAISE NOTICE '✅ venue_reviews table is ready';
  ELSE
    RAISE EXCEPTION '❌ Failed to create venue_reviews table';
  END IF;
END $$;


