-- Add booking pause toggle to venues
-- Run this in Supabase SQL Editor

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS booking_paused BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_venues_booking_paused ON public.venues(booking_paused);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='venues' AND column_name='booking_paused'
  ) THEN
    RAISE NOTICE '✅ venues.booking_paused column exists';
  ELSE
    RAISE EXCEPTION '❌ Failed to add venues.booking_paused';
  END IF;
END $$;


