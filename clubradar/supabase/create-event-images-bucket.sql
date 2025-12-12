-- Create storage bucket for event images
-- Run this in your Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,  -- Public bucket (images should be publicly accessible)
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Optional: Add RLS policy for public read access
-- (Not strictly necessary if bucket is public, but good for consistency)

-- Policy for reading (SELECT)
CREATE POLICY IF NOT EXISTS "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images'::text);

-- Policy for uploading (INSERT) - for authenticated users
-- Note: We use service role key in API, so this is optional
CREATE POLICY IF NOT EXISTS "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images'::text);

