# Event Images Storage Setup Guide

## Overview
The event creation form now supports uploading 2-3 images per event. These images are stored in Supabase Storage and displayed in the discover section.

## Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `event-images` (exactly this name, no spaces)
   - **Public bucket**: **ON** (checked) - images should be publicly accessible
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
5. Click **"Create bucket"**

### 2. Set Up Storage Policies

Since we're using Clerk for authentication, we use the service role key for uploads:

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy your **Service Role Key** (keep this secret!)
3. Make sure it's in your `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. Storage Policies (Optional)

If you want to add RLS policies for additional security:

1. Go to **Storage** → Click `event-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Fill in:
   - **Policy name**: `Public Read Access`
   - **Allowed operation**: Select **SELECT** (for reading files)
   - **Policy definition**: 
     ```
     bucket_id = 'event-images'::text
     ```
6. Click **"Review"** then **"Save policy"**

For uploads (if you want RLS):
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: Select **INSERT**
- **Policy definition**: 
  ```
  bucket_id = 'event-images'::text AND auth.role() = 'authenticated'
  ```

## File Structure

Files are stored in Supabase Storage as:
```
event-images/
  {clerk_user_id}/
    events/
      {timestamp}-{random}.{ext}
```

Example:
```
event-images/
  user_2abc123xyz/
    events/
      1704067200000-xyz789.jpg
      1704067200001-abc456.png
```

## Usage

1. Go to `/venue/dashboard`
2. Click **"Create Event"**
3. Fill out the event details
4. In the **"Event Images"** section:
   - Click **"Choose Files"** or use the file input
   - Select 1-3 images (JPEG, PNG, or WebP)
   - Images will show previews
   - Click the X button on any preview to remove it
5. Click **"Create Event"**
6. Images will be uploaded first, then the event will be created with image URLs
7. The event will appear in the discover section with the uploaded images

## Image Requirements

- **Format**: JPEG, JPG, PNG, or WebP
- **Size**: Maximum 5MB per image
- **Quantity**: 1-3 images per event
- **Recommended**: Use high-quality images (800x600 or larger) for best display

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket is named exactly `event-images` (case-sensitive)
- Check that the bucket exists in Supabase Storage

### "Failed to upload" error
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart your dev server after adding the key
- Verify the bucket is public or has proper RLS policies

### Images not showing in discover section
- Check that images were uploaded successfully (check browser console)
- Verify the event was created with image URLs
- Check that the `/api/events` route is working correctly

