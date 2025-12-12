# Supabase Storage Setup for Venue Documents

## Overview
This guide explains how to set up Supabase Storage for venue document uploads in ClubRadar.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure:
   - **Name**: `venue-documents`
   - **Public bucket**: **OFF** (unchecked) - documents should be private
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,application/pdf`
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

Since we're using Clerk for authentication (not Supabase Auth), we have two options:

### Option A: Use Service Role Key (Recommended for MVP)

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy your **Service Role Key** (keep this secret!)
3. Add it to your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Update the upload API route to use service role key for storage operations
5. **Disable RLS** on the bucket (or create policies that allow service role)

### Option B: Make Bucket Public (Not Recommended for Production)

1. Make the `venue-documents` bucket public
2. Files will be accessible via public URLs
3. **Security Risk**: Anyone with the URL can access documents

### Option C: Use Signed URLs (Best for Production)

1. Keep bucket private
2. Generate signed URLs when documents need to be accessed
3. Requires service role key for URL generation

## Step 3: Update API Route

The upload route (`/api/venues/upload-documents/route.ts`) currently uses the anon key. For Clerk integration, you should:

1. Create a server-side Supabase client with service role key:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
     {
       auth: {
         autoRefreshToken: false,
         persistSession: false
       }
     }
   );
   ```

2. Use this client for storage operations

## Step 4: File Structure

Files will be stored as:
```
venue-documents/
  {clerk_user_id}/
    {timestamp}-{random}.{ext}
```

Example:
```
venue-documents/
  user_2abc123/
    1704067200000-xyz789.pdf
    1704067201000-abc123.jpg
```

## Step 5: Access Control

Since we're using Clerk:
- **Upload**: Server-side API route validates Clerk session, then uploads with service role
- **View**: Generate signed URLs when documents need to be viewed
- **Delete**: Server-side API route validates ownership, then deletes with service role

## Security Considerations

1. **Never expose service role key** to the client
2. **Validate file types** on both client and server
3. **Validate file sizes** to prevent abuse
4. **Use signed URLs** for document access (time-limited)
5. **Implement rate limiting** on upload endpoint
6. **Scan uploaded files** for malware (future enhancement)

## Testing

1. Register a venue and upload documents
2. Check Supabase Storage dashboard to verify files are uploaded
3. Verify file URLs are stored in venue record
4. Test file access (should require authentication)

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket `venue-documents` exists in Supabase Storage

### Error: "New row violates row-level security policy"
- You're using anon key with RLS enabled
- Switch to service role key for storage operations

### Error: "File too large"
- Check file size limits in bucket settings
- Update validation in API route if needed

### Files not accessible
- Check if bucket is public or if you're using signed URLs
- Verify file paths are correct

