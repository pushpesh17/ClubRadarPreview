# Document Upload Setup Guide

## Overview
The venue registration form now supports document uploads (license, PAN card, bank statements) to Supabase Storage.

## Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `venue-documents`
   - **Public bucket**: **OFF** (unchecked) - documents should be private
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/png,application/pdf`
5. Click **"Create bucket"**

### 2. Set Up Storage Policies

Since we're using Clerk for authentication, we need to use the service role key for uploads:

**Option A: Use Service Role Key (Recommended)**

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy your **Service Role Key** (keep this secret!)
3. Add it to your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

**Option B: Make Bucket Public (Not Recommended for Production)**

1. Edit the `venue-documents` bucket
2. Check **"Public bucket"**
3. Files will be accessible via public URLs

### 3. Update Environment Variables

Make sure your `.env.local` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Required for uploads
```

### 4. Test the Upload

1. Go to `/venue/signup`
2. Fill out the form and navigate to Step 3 (KYC Documents)
3. Click **"Choose Files"** button
4. Select one or more files (PDF, JPG, PNG)
5. Files should upload and appear in the list below
6. You can remove files by clicking the X button
7. Submit the form - document URLs will be saved with the venue registration

## File Structure

Files are stored in Supabase Storage as:
```
venue-documents/
  {clerk_user_id}/
    {timestamp}-{random}.{ext}
```

Example:
```
venue-documents/
  user_2abc123xyz/
    1704067200000-xyz789.pdf
    1704067201000-abc123.jpg
```

## Features

- ✅ Multiple file upload
- ✅ File type validation (PDF, JPG, JPEG, PNG, WEBP)
- ✅ File size validation (max 5MB per file)
- ✅ Upload progress indicator
- ✅ List of uploaded documents
- ✅ Remove documents before submission
- ✅ Document URLs saved with venue registration

## API Endpoint

**POST** `/api/venues/upload-documents`

- **Authentication**: Required (Clerk)
- **Content-Type**: `multipart/form-data`
- **Body**: FormData with `files` field (array of files)
- **Response**: 
  ```json
  {
    "success": true,
    "files": [
      {
        "name": "license.pdf",
        "url": "https://..."
      }
    ],
    "message": "Successfully uploaded 1 file(s)"
  }
  ```

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket `venue-documents` exists in Supabase Storage
- Check the bucket name matches exactly

### Error: "New row violates row-level security policy"
- You're using anon key with RLS enabled
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- The API route will automatically use it

### Error: "File too large"
- Check file size (max 5MB per file)
- Compress images if needed
- Split large PDFs if necessary

### Files not uploading
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check network tab for API response
- Make sure you're logged in with Clerk

### Files not accessible after upload
- If using private bucket, you'll need signed URLs to access
- For now, document URLs are stored but may need authentication to view
- Consider making bucket public for MVP, or implement signed URL generation

## Security Notes

1. **Service Role Key**: Never expose this to the client. It's only used server-side.
2. **File Validation**: Always validate file types and sizes on both client and server.
3. **Access Control**: Documents are stored per user, but consider additional access controls.
4. **Malware Scanning**: Consider adding virus scanning for production (future enhancement).

## Next Steps

- [ ] Add document preview functionality
- [ ] Implement signed URLs for secure document access
- [ ] Add document download functionality for admins
- [ ] Add virus/malware scanning
- [ ] Add document expiration/cleanup for old files

