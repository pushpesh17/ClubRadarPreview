# ⚠️ URGENT: Create venue-documents Bucket

## The Problem
You're getting `"Bucket not found"` error because the `venue-documents` bucket doesn't exist in your Supabase Storage.

## ✅ SOLUTION: Create the Bucket (Takes 2 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. **Select your ClubRadar project**

### Step 2: Navigate to Storage
1. In the **left sidebar**, click **"Storage"**
2. You should see a list of buckets (or it might be empty)

### Step 3: Create New Bucket
1. Click the **"New bucket"** button (usually top right, blue button)
2. Fill in the form:
   - **Name**: Type exactly: `venue-documents`
     - ⚠️ Must be lowercase
     - ⚠️ No spaces
     - ⚠️ Exact spelling: `venue-documents`
   - **Public bucket**: ✅ **CHECK THIS BOX** (make it public)
   - **File size limit**: Type `5242880` (this is 5MB) OR leave empty
   - **Allowed MIME types**: Leave empty (or add: `image/jpeg,image/png,application/pdf`)
3. Click **"Create bucket"** button

### Step 4: Verify
1. You should now see `venue-documents` in your bucket list
2. Click on it to open it (it will be empty, that's normal)

### Step 5: Test
1. Go back to your admin dashboard
2. Click **"View Details"** on any venue
3. Documents should now open! ✅

## Still Not Working?

### Check These:
1. ✅ Bucket name is exactly `venue-documents` (case-sensitive, no spaces)
2. ✅ Bucket is set to **PUBLIC** (checkbox is checked)
3. ✅ You're in the correct Supabase project
4. ✅ Refresh your admin dashboard after creating the bucket

### Alternative: Use SQL (If Dashboard Doesn't Work)

Run this in **Supabase SQL Editor**:

```sql
-- Create venue-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  true,  -- PUBLIC
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Verify it was created
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'venue-documents';
```

## Why This Happens

The code tries to access documents from the `venue-documents` bucket, but if the bucket doesn't exist, Supabase returns "Bucket not found" error.

Once you create the bucket, everything will work! 🎉

