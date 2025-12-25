-- Approve All Existing Pending Venues
-- This script will approve all venues that are currently in "pending" status
-- Run this in your Supabase SQL Editor

-- First, let's see what venues we have
SELECT 
  id,
  name,
  city,
  owner_name,
  phone,
  email,
  status,
  created_at
FROM public.venues
ORDER BY created_at DESC;

-- Approve all pending venues
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE status = 'pending';

-- Verify the update
SELECT 
  id,
  name,
  city,
  status,
  updated_at
FROM public.venues
WHERE status = 'approved'
ORDER BY updated_at DESC;

-- If you want to approve only specific venues, use this instead:
-- UPDATE public.venues
-- SET status = 'approved',
--     updated_at = NOW()
-- WHERE id = 'venue-id-here';

