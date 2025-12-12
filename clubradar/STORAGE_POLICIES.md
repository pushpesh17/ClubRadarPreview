# 📦 Supabase Storage Policies Setup

## Quick Answer

**Use only the condition part** (without extra parentheses):
```
bucket_id = 'event-images'::text
```

---

## Detailed Setup for Each Bucket

### For `event-images` Bucket

1. Go to Storage → Click `event-images` bucket
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
   - **Check expression**: (leave empty or same as policy definition)
6. Click **"Review"** then **"Save policy"**

### For `venue-images` Bucket

Same steps, but use:
- **Policy name**: `Public Read Access`
- **Policy definition**: 
  ```
  bucket_id = 'venue-images'::text
  ```

### For `user-photos` Bucket

Same steps, but use:
- **Policy name**: `Public Read Access`
- **Policy definition**: 
  ```
  bucket_id = 'user-photos'::text
  ```

---

## Additional Policies (Optional - for Uploading)

If you want users to upload images, add an INSERT policy:

1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated Upload`
   - **Allowed operation**: Select **INSERT**
   - **Policy definition**: 
     ```
     bucket_id = 'event-images'::text AND auth.role() = 'authenticated'
     ```
4. Click **"Review"** then **"Save policy"**

Repeat for `venue-images` and `user-photos` buckets.

---

## Visual Guide

When you see the policy definition field, it should look like this:

```
┌─────────────────────────────────────┐
│ Policy definition:                  │
│ ┌─────────────────────────────────┐ │
│ │ bucket_id = 'event-images'::text│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**NOT like this:**
```
┌─────────────────────────────────────┐
│ Policy definition:                  │
│ ┌─────────────────────────────────┐ │
│ │ (bucket_id = 'event-images'::text)│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Summary

✅ **Use**: `bucket_id = 'event-images'::text`  
❌ **Don't use**: `(bucket_id = 'event-images'::text)`

The parentheses are not needed in the policy definition field.

---

## Quick Copy-Paste

### For event-images:
```
bucket_id = 'event-images'::text
```

### For venue-images:
```
bucket_id = 'venue-images'::text
```

### For user-photos:
```
bucket_id = 'user-photos'::text
```

---

**That's it! Just paste the condition without extra parentheses.** ✅

