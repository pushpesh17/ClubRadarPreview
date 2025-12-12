# How to Approve Venues in Supabase

## Overview
After a venue owner registers their venue, it needs to be approved by an admin before they can create events. This guide shows you how to approve (or reject) venues in Supabase.

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your ClubRadar project
3. Click on **"Table Editor"** in the left sidebar

### Step 2: View Pending Venues
1. Click on the **`venues`** table
2. You'll see all registered venues
3. Look for venues with `status = 'pending'` (these need approval)

### Step 3: Review Venue Details
1. Click on a venue row to view all details:
   - Venue name, address, city
   - Owner name, phone, email
   - KYC documents (GST, License, PAN, Bank details)
   - Document URLs (click to view uploaded files)
   - Registration date

### Step 4: Approve or Reject
1. **To Approve:**
   - Click on the venue row
   - Find the `status` column
   - Change `status` from `'pending'` to `'approved'`
   - Click **"Save"** or press Enter

2. **To Reject:**
   - Click on the venue row
   - Find the `status` column
   - Change `status` from `'pending'` to `'rejected'`
   - Optionally, you can add a note in the `description` field explaining why
   - Click **"Save"** or press Enter

## Method 2: Using SQL Editor (Bulk Operations)

### Approve a Single Venue
```sql
-- Replace 'venue-id-here' with the actual venue ID
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE id = 'venue-id-here';
```

### Approve All Pending Venues (Use with Caution!)
```sql
UPDATE public.venues
SET status = 'approved',
    updated_at = NOW()
WHERE status = 'pending';
```

### Reject a Venue
```sql
UPDATE public.venues
SET status = 'rejected',
    updated_at = NOW()
WHERE id = 'venue-id-here';
```

### View All Pending Venues
```sql
SELECT 
  id,
  name,
  city,
  owner_name,
  phone,
  email,
  status,
  created_at
FROM public.venues
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### View Venue with All Details
```sql
SELECT 
  v.*,
  u.name as user_name,
  u.email as user_email
FROM public.venues v
LEFT JOIN public.users u ON v.user_id = u.id
WHERE v.id = 'venue-id-here';
```

## Method 3: Create an Admin Dashboard (Future Enhancement)

For a better experience, you can create an admin dashboard page at `/admin/dashboard` that:
- Lists all pending venues
- Shows venue details in a nice UI
- Has "Approve" and "Reject" buttons
- Sends email notifications to venue owners

## Status Values

- **`pending`**: Venue registration submitted, awaiting approval
- **`approved`**: Venue approved, owner can now create events
- **`rejected`**: Venue registration rejected

## What Happens After Approval?

1. **Venue owner can:**
   - Access the venue dashboard
   - Create and manage events
   - View bookings and earnings

2. **Venue owner cannot:**
   - Create events if status is `pending` or `rejected`
   - Access certain dashboard features

## Quick Approval Checklist

Before approving a venue, verify:
- [ ] Venue name and address are valid
- [ ] Contact information (phone, email) is correct
- [ ] KYC documents are uploaded
- [ ] License number is provided
- [ ] Bank account details are provided (for payouts)
- [ ] All required fields are filled

## Tips

1. **Review Documents:** Click on document URLs to view uploaded files (license, PAN, bank statement)
2. **Check Duplicates:** Verify the venue isn't already registered
3. **Contact Owner:** If information is unclear, contact the owner using the provided email/phone
4. **Bulk Operations:** Use SQL for bulk approvals, but be careful!

## Troubleshooting

**Q: I can't see the `status` column?**
- Make sure you're viewing the `venues` table
- Check if the column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'venues';`

**Q: How do I view uploaded documents?**
- Documents are stored as URLs in the `documents` array column
- Copy the URL and paste it in a browser to view
- Or check Supabase Storage bucket `venue-documents`

**Q: Can I change a venue's status back to pending?**
- Yes, just update the `status` column to `'pending'` again

