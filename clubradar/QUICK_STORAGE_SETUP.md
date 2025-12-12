# Quick Fix: Create Storage Bucket for Venue Documents

## The Problem
You're getting the error: **"Bucket not found"** when trying to upload KYC documents.

## Solution: Create the Storage Bucket

### Method 1: Using Supabase Dashboard (Easiest - Recommended)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your ClubRadar project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - Click **"New bucket"** button

3. **Configure the Bucket**
   - **Name**: `venue-documents` (exactly this name, no spaces)
   - **Public bucket**: **OFF** (unchecked) - keep it private
   - **File size limit**: `5242880` (5MB in bytes) or leave empty
   - **Allowed MIME types**: Leave empty (or add: `image/jpeg,image/png,application/pdf`)

4. **Create the Bucket**
   - Click **"Create bucket"**
   - You should see the bucket appear in the list

5. **Test the Upload**
   - Go back to your app
   - Try uploading a document again
   - It should work now! ✅

### Method 2: Using SQL (Alternative)

If you prefer SQL, run this in Supabase SQL Editor:

```sql
-- Create storage bucket for venue documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents',
  'venue-documents',
  false,  -- Private bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;
```

## Important Notes

1. **Bucket Name Must Match**: The bucket must be named exactly `venue-documents` (case-sensitive)

2. **Service Role Key**: Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   - Get it from: Supabase Dashboard → Settings → API → Service Role Key

3. **Private vs Public**: 
   - Keep it **private** (unchecked) for security
   - The API route uses service role key to upload files
   - Documents are accessed via signed URLs or service role

## Verify It Works

After creating the bucket:
1. Go to `/venue/signup` in your app
2. Navigate to Step 3 (KYC Documents)
3. Click "Choose Files"
4. Select a file (PDF, JPG, or PNG)
5. The file should upload successfully! ✅

## Troubleshooting

**Still getting "Bucket not found"?**
- Double-check the bucket name is exactly `venue-documents`
- Make sure you're in the correct Supabase project
- Refresh the page and try again

**Getting permission errors?**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart your Next.js dev server after adding the key

**Files not uploading?**
- Check file size (must be under 5MB)
- Check file type (only PDF, JPG, PNG, WEBP allowed)
- Check browser console for detailed error messages

