-- Add images column to venues table
-- This allows venue owners to upload sample images of their venue
-- Run this in your Supabase SQL Editor

-- Add images column (array of image URLs)
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add other useful columns for venue details
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}';

ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_venues_city_status ON public.venues(city, status);

-- Verify the changes
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'venues'
  AND column_name IN ('images', 'amenities', 'opening_hours', 'rating')
ORDER BY column_name;

