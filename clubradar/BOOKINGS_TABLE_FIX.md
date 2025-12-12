# 🔧 Fix: "Could not find the table 'public.bookings' in the schema cache"

## Problem
You're seeing this error:
```
Could not find the table 'public.bookings' in the schema cache
code: 'PGRST205'
```

This means the `bookings` table doesn't exist in your Supabase database.

---

## ✅ Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the SQL Script

1. Click **New Query**
2. Open the file: `clubradar/supabase/create-bookings-table.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify Table Was Created

You should see a success message:
```
✅ Bookings table exists!
```

### Step 4: Refresh and Test

1. Wait 5-10 seconds for Supabase's schema cache to refresh
2. Go back to your app
3. Click **"Retry"** on the bookings page
4. The error should be gone! 🎉

---

## 📋 What the Script Does

The `create-bookings-table.sql` script:
- ✅ Creates the `bookings` table with correct structure
- ✅ Sets up indexes for better performance
- ✅ Enables Row Level Security (RLS)
- ✅ Creates RLS policies
- ✅ Sets up auto-update triggers

---

## 🔍 Verify Table Exists

If you want to double-check, run this in SQL Editor:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;
```

You should see all the columns:
- `id` (TEXT)
- `user_id` (TEXT)
- `event_id` (UUID)
- `number_of_people` (INTEGER)
- `total_amount` (DECIMAL)
- `payment_status` (TEXT)
- `qr_code` (TEXT)
- `checked_in` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🐛 Still Getting Errors?

### Error: "relation already exists"
- The table already exists! This is fine - the script uses `CREATE TABLE IF NOT EXISTS`
- Just wait a few seconds and try again

### Error: "permission denied"
- Make sure you're logged into Supabase Dashboard
- Check that you have admin access to the project

### Error persists after running script
1. **Wait longer** - Schema cache can take 10-30 seconds to refresh
2. **Restart dev server** - Stop and restart `npm run dev`
3. **Check Supabase Dashboard** - Go to Table Editor → Verify `bookings` table appears
4. **Check API logs** - Look at your terminal for any other errors

---

## 📝 Table Structure

The bookings table structure:
```sql
CREATE TABLE public.bookings (
  id TEXT PRIMARY KEY,                    -- Custom booking ID (e.g., "CR17637148883364966")
  user_id TEXT NOT NULL,                  -- Clerk user ID
  event_id UUID NOT NULL,                 -- References events table
  number_of_people INTEGER NOT NULL,      -- Number of tickets
  total_amount DECIMAL(10, 2) NOT NULL,   -- Total price
  payment_status TEXT DEFAULT 'pending',  -- Payment status
  payment_id TEXT,                        -- Razorpay payment ID (optional)
  qr_code TEXT,                           -- QR code for entry pass
  checked_in BOOLEAN DEFAULT FALSE,       -- Check-in status
  created_at TIMESTAMP WITH TIME ZONE,    -- Booking creation time
  updated_at TIMESTAMP WITH TIME ZONE     -- Last update time
);
```

---

## ✅ Success!

Once the table is created, you should be able to:
- ✅ View your bookings on `/bookings` page
- ✅ Create new bookings from the discover page
- ✅ See bookings in the venue dashboard

If you still have issues, check the console for any other error messages!

