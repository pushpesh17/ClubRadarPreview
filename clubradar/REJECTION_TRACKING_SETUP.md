# Rejection Tracking Setup

## Problem
When a venue is re-registered after rejection, the status changes from "rejected" to "pending", causing rejected venues to disappear from the admin dashboard. This makes it impossible to track rejection history.

## Solution
Added rejection tracking fields to preserve rejection history even when venues are re-registered.

## Database Migration

### Step 1: Run SQL Migration
Run the following SQL script in your Supabase SQL Editor:

```sql
-- File: supabase/add-venue-rejection-tracking.sql
```

This adds:
- `rejected_at` (TIMESTAMP) - When the venue was last rejected
- `rejection_count` (INTEGER) - How many times the venue has been rejected
- `rejection_reason` (TEXT) - The reason for rejection (separate from description)

## Changes Made

### 1. Reject API (`/api/admin/venues/[id]/reject`)
- Now sets `rejected_at` to current timestamp
- Increments `rejection_count`
- Stores rejection reason in `rejection_reason` field

### 2. Register API (`/api/venues/register`)
- When re-registering after rejection, preserves `rejected_at` and `rejection_count`
- Clears `rejection_reason` (since it's a new submission)
- Changes status from "rejected" to "pending"

### 3. Admin Venues API (`/api/admin/venues`)
- Returns `rejectedAt`, `rejectionCount`, and `rejectionReason` in venue data
- Orders rejected venues by `rejected_at` (most recent first)

### 4. Admin Dashboard
- Displays rejection count and date for rejected venues
- Shows rejection history even for venues that are now pending again

## How It Works

1. **When Admin Rejects a Venue:**
   - Status → "rejected"
   - `rejected_at` → Current timestamp
   - `rejection_count` → Incremented
   - `rejection_reason` → Stored

2. **When Owner Re-registers:**
   - Status → "pending" (for new review)
   - `rejected_at` → Preserved (history maintained)
   - `rejection_count` → Preserved (history maintained)
   - `rejection_reason` → Cleared (new submission)

3. **Admin Dashboard:**
   - Shows venues with `status = 'rejected'` (currently rejected)
   - Displays rejection count and date
   - Orders by most recently rejected first

## Testing

1. **Reject a venue** from admin dashboard
2. **Logout** from admin
3. **Login** as venue owner
4. **Re-register** the venue
5. **Logout** from owner
6. **Login** as admin
7. **Check rejected venues** - Should show the venue with rejection history
8. **Filter by "Rejected"** - Should show all currently rejected venues

## Notes

- Rejected venues are tracked even after re-registration
- Rejection history is preserved (count and date)
- Only venues with `status = 'rejected'` appear in rejected filter
- Re-registered venues appear as "pending" but retain rejection history

