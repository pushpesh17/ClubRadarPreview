# Earnings & Payouts Setup Guide

## Overview

The Earnings & Payouts tab in the venue dashboard now shows real-time earnings data calculated from completed bookings and tracks payout history.

## Setup Steps

### 1. Create Payouts Table

Run the SQL script to create the payouts table:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open and run: `supabase/create-payouts-table.sql`

Or manually run:

```sql
-- Create payouts table for tracking venue payouts
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payouts_venue_id ON public.payouts(venue_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON public.payouts(requested_at DESC);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
```

### 2. Verify Environment Variables

Make sure your `.env.local` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. How It Works

#### Earnings Calculation

- **Total Earnings**: Sum of all completed bookings (`payment_status = 'completed'`) for events belonging to your venue
- **Pending Payout**: Total Earnings minus all completed payouts
- **Last Payout**: Most recent completed payout amount and date

#### Payout Flow

1. Venue earns money from completed bookings
2. Venue can request a payout (if pending amount > 0)
3. Payout request is created with status `pending`
4. Admin processes the payout (updates status to `completed`)
5. Pending payout amount decreases accordingly

### 4. API Endpoints

#### GET `/api/earnings`

Returns earnings data:

```json
{
  "earnings": {
    "totalEarnings": 100000,
    "pendingPayout": 45000,
    "lastPayout": {
      "amount": 80000,
      "date": "2024-01-01T00:00:00Z"
    },
    "payoutHistory": [
      {
        "id": "uuid",
        "amount": 80000,
        "date": "2024-01-01T00:00:00Z",
        "status": "completed"
      }
    ]
  }
}
```

#### POST `/api/payouts/request`

Creates a new payout request:

```json
{
  "success": true,
  "payout": {
    "id": "uuid",
    "amount": 45000,
    "status": "pending",
    "requestedAt": "2024-01-15T00:00:00Z"
  },
  "message": "Payout request submitted successfully"
}
```

### 5. Admin Payout Processing

To process a payout (mark as completed), update the payout record in Supabase:

```sql
UPDATE public.payouts
SET
  status = 'completed',
  processed_at = NOW(),
  transaction_id = 'TXN123456', -- Optional: external transaction ID
  notes = 'Processed via bank transfer' -- Optional: notes
WHERE id = 'payout-uuid';
```

Or use the Supabase Dashboard:

1. Go to **Table Editor** → `payouts`
2. Find the payout request
3. Update:
   - `status` → `completed`
   - `processed_at` → Current timestamp
   - `transaction_id` → (optional) External transaction ID
   - `notes` → (optional) Processing notes

### 6. Features

- ✅ Real-time earnings calculation from bookings
- ✅ Pending payout tracking
- ✅ Payout history with status badges
- ✅ Request payout button (disabled when no pending amount)
- ✅ Loading states and empty states
- ✅ Responsive design for mobile and desktop

### 7. Status Badges

- **completed**: Green/default badge
- **pending**: Gray/secondary badge
- **processing**: Outline badge
- **failed**: Red/destructive badge

### 8. Troubleshooting

#### "No approved venue found"

- Make sure your venue is approved
- Check that you're logged in with the correct account

#### Earnings showing ₹0

- Check that you have bookings with `payment_status = 'completed'`
- Verify that bookings are linked to your venue's events

#### Payout request fails

- Ensure pending payout > 0
- Check that you don't have an existing pending/processing payout
- Verify the payouts table exists

#### Payout history not showing

- Check that payouts exist in the database
- Verify the payouts table was created correctly
- Ensure RLS policies allow reading payouts
