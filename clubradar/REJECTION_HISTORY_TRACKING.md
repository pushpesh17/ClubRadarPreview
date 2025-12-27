# Rejection History Tracking System

## Overview
A comprehensive rejection history tracking system that stores snapshots of venue data at the time of rejection, allowing admins to compare previous submissions with current ones.

## Database Setup

### Step 1: Create Rejection History Table
Run the SQL script in Supabase SQL Editor:

```sql
-- File: supabase/create-venue-rejection-history-table.sql
```

This creates the `venue_rejection_history` table with:
- `id` - Unique identifier
- `venue_id` - Reference to the venue
- `rejection_reason` - Why it was rejected
- `rejected_by` - Admin email who rejected
- `rejected_at` - Timestamp of rejection
- `rejection_number` - Which rejection this is (1st, 2nd, 3rd, etc.)
- `venue_snapshot` - JSONB field storing complete venue data at time of rejection

## Features

### 1. **Automatic Snapshot Creation**
When an admin rejects a venue, the system automatically:
- Captures a complete snapshot of all venue data
- Stores owner information
- Saves all documents and images
- Records KYC details (GST, PAN, License, Bank details)
- Tracks which admin rejected it and when

### 2. **Rejection History Display**
In the admin dashboard venue details modal:
- Shows all rejection history for the venue
- Displays rejection number, date, reason, and admin
- Shows comparison between previous and current submission
- Highlights what changed (name, address, documents, etc.)

### 3. **Comparison View**
- **Changes Detected Badge**: Shows if current submission differs from previous
- **Side-by-side Comparison**: Shows old value (strikethrough) vs new value (green)
- **Previous Details**: Expandable section to view complete previous submission
- **Document Count**: Shows if number of documents changed

### 4. **Complete History Tracking**
- Tracks all rejections, not just the latest
- Each rejection stores a complete snapshot
- Admin can see the progression of changes over time
- Helps identify patterns (e.g., same issues repeated)

## API Changes

### `/api/admin/venues/[id]/reject` (POST)
- Now saves a complete snapshot before rejecting
- Stores rejection reason, admin email, and timestamp
- Increments rejection count

### `/api/admin/venues/[id]` (GET)
- Returns rejection history along with venue details
- Includes all previous rejection snapshots
- Ordered by most recent first

## Admin Dashboard Features

### Venue Details Modal
1. **Rejection History Section**
   - Shows all rejections with numbers (#1, #2, #3, etc.)
   - Displays rejection date and admin who rejected
   - Shows rejection reason prominently

2. **Comparison View**
   - Automatically detects changes between submissions
   - Highlights differences in:
     - Venue name
     - Address and city
     - Contact information
     - KYC details (GST, PAN, License)
     - Document count

3. **Previous Submission Details**
   - Expandable section to view complete previous data
   - Shows all fields from the rejected submission
   - Helps admin understand what was submitted before

## Benefits

1. **Better Decision Making**: Admin can see what changed and why it was rejected before
2. **Pattern Detection**: Identify venues that repeatedly submit incorrect information
3. **Audit Trail**: Complete history of all rejections and who made them
4. **Comparison**: Easy to see if owner fixed the issues mentioned in rejection
5. **Documentation**: Full record of what was submitted at each rejection

## Usage

1. **When Rejecting a Venue**:
   - Admin enters rejection reason
   - System automatically saves snapshot
   - Venue status changes to "rejected"

2. **When Viewing Venue Details**:
   - Admin sees current submission
   - Rejection history section shows all previous rejections
   - Comparison view highlights changes
   - Can expand to see full previous submission details

3. **When Owner Re-registers**:
   - New submission is compared with previous
   - Changes are automatically detected
   - Admin can quickly see if issues were addressed

## Database Schema

```sql
venue_rejection_history
├── id (UUID)
├── venue_id (UUID) → venues.id
├── rejection_reason (TEXT)
├── rejected_by (TEXT) - Admin email
├── rejected_at (TIMESTAMP)
├── rejection_number (INTEGER) - 1st, 2nd, 3rd rejection
├── venue_snapshot (JSONB) - Complete venue data
└── created_at (TIMESTAMP)
```

## Next Steps

1. Run the SQL migration script in Supabase
2. Test rejecting a venue - snapshot should be saved
3. Re-register the venue with different details
4. View venue details - should see rejection history and comparison

