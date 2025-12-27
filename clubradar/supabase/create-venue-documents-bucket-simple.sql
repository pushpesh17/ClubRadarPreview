-- Simple script to create venue-documents bucket
-- Run this in Supabase SQL Editor
-- This will create the bucket if it doesn't exist

-- Check if bucket exists first
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-documents';

-- Create bucket if it doesn't exist
-- Note: If you get an error that bucket already exists, that's fine - it means it's already created
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  false,  -- PRIVATE bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created/updated
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-documents';

-- Expected: Should show one row with the bucket details

