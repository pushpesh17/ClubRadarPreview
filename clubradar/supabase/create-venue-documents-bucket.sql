-- Quick SQL Script to Create venue-documents Storage Bucket
-- Run this in Supabase SQL Editor if you prefer SQL over Dashboard

-- Create storage bucket for venue documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  false,  -- Private bucket (not public)
  5242880,  -- 5MB file size limit (5 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-documents';

-- Expected result: Should show one row with the bucket details

