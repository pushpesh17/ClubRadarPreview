# Fix "Bucket not found" Error - Quick Setup Guide

## The Problem
You're getting `"Bucket not found"` error when trying to view documents. This means the `venue-documents` bucket doesn't exist in your Supabase Storage.

## Solution: Create the Bucket (Choose One Method)

### Method 1: Using Supabase Dashboard (EASIEST - Recommended) ⭐

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your ClubRadar project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - You should see a list of buckets (or empty if none exist)

3. **Create New Bucket**
   - Click **"New bucket"** button (top right)
   - Fill in the form:
     - **Name**: `venue-documents` (exactly this, no spaces, lowercase)
     - **Public bucket**: ✅ **CHECK THIS** (make it public for now to get it working)
     - **File size limit**: `5242880` (5MB) or leave empty
     - **Allowed MIME types**: Leave empty (or add: `image/jpeg,image/png,application/pdf`)
   - Click **"Create bucket"**

4. **Verify**
   - You should see `venue-documents` in the bucket list
   - Click on it to see it's empty (ready for uploads)

5. **Test**
   - Go back to your admin dashboard
   - Click "View Details" on a venue
   - Documents should now open! ✅

### Method 2: Using SQL Script

Run this in Supabase SQL Editor:

```sql
-- Create venue-documents bucket (PUBLIC for now to get it working)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  true,  -- PUBLIC (we'll make it private later)
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,  -- Ensure it's public
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- Verify
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'venue-documents';
```

## Why Public for Now?

Making it **public** initially will:
- ✅ Get documents working immediately
- ✅ Avoid signed URL complexity during setup
- ✅ Allow you to test the full flow

## Later: Switch to Private (Optional)

Once everything is working, you can:
1. Make the bucket private in Supabase Dashboard
2. The code already supports signed URLs (it will automatically switch)
3. Documents will be more secure

## Troubleshooting

### Still getting "Bucket not found"?
1. Check the bucket name is exactly `venue-documents` (case-sensitive, no spaces)
2. Refresh your Supabase Dashboard
3. Check the bucket appears in Storage → Buckets list
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env.local`

### Documents still not opening?
1. Check browser console for errors
2. Verify the document URLs in the database
3. Make sure the bucket is public (for now)
4. Try uploading a new document to test

## Next Steps

After creating the bucket:
1. ✅ Test viewing documents in admin dashboard
2. ✅ Test uploading new documents
3. ✅ Once working, optionally switch to private bucket

