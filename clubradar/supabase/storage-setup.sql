-- Supabase Storage Setup for Venue Documents
-- Run this in your Supabase SQL Editor

-- Create storage bucket for venue documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-documents', 'venue-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for venue-documents bucket

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own venue documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'venue-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own venue documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'venue-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own venue documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'venue-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: Since we're using Clerk for auth, we need to handle this differently
-- The storage policies above use Supabase auth.uid()
-- For Clerk integration, we'll need to:
-- 1. Either use service role key for uploads (server-side only)
-- 2. Or create a mapping between Clerk user_id and Supabase auth.users
-- 3. Or use a different approach with public URLs and signed URLs

-- For now, we'll use the service role key approach in the API route
-- which bypasses RLS policies. Make sure your API route uses the service role key
-- for storage operations, not the anon key.

