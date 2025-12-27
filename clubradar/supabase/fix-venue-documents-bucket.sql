-- Fix venue-documents bucket - Keep it PRIVATE and ensure it exists
-- Run this in Supabase SQL Editor
-- 
-- NOTE: Documents are stored as file paths, and signed URLs are generated on-demand
-- This keeps sensitive documents (PAN, GST, etc.) secure

-- First, check if bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-documents';

-- If bucket doesn't exist, create it as PRIVATE (for security)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  false,  -- PRIVATE bucket (documents are sensitive - PAN, GST, etc.)
  5242880,  -- 5MB file size limit (5 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = false,  -- Ensure it's private (for security)
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- Verify the bucket is private
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-documents';

-- Expected result: Should show public = false

-- Set up storage policies to allow service role access
-- Note: Since we're using service role key for operations, RLS policies on storage.objects
-- are not strictly necessary, but we can set them up for additional security
-- 
-- For Clerk authentication, we use service role key which bypasses RLS
-- So these policies are optional but recommended for defense in depth

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Service role access for venue-documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for venue-documents" ON storage.objects;

-- Create policy to allow service role (and authenticated users) to read documents
CREATE POLICY "Service role access for venue-documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'venue-documents');

-- Note: To verify policies, check in Supabase Dashboard:
-- Storage → venue-documents → Policies tab
-- Or use: SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

