# SQL Files Guide - Which One to Use?

## ✅ **USE THIS ONE: `fix-clerk-user-ids.sql`**

This is the **CORRECT** migration script that:

- Creates `users.id` as **TEXT** (for Clerk user IDs)
- Creates `venues.user_id` as **TEXT**
- Creates `bookings.user_id` as **TEXT**
- Creates `reviews.user_id` as **TEXT**
- Includes all KYC fields (owner_name, capacity, gst_number, etc.)
- Has proper RLS policies

**Action:** Run this file in Supabase SQL Editor to fix your database schema.

---

## ❌ **DON'T USE: "ClubRadar Schema & Row-Level Security"**

This file is the **OLD** schema that:

- Creates `users.id` as **UUID** (WRONG for Clerk!)
- Will cause errors when trying to create users
- Doesn't have KYC fields

**Action:** Delete or ignore this file. Don't run it!

---

## ✅ **VERIFICATION FILES (Optional - Run After Migration)**

These files are fine to use for checking if the migration worked:

1. **"User ID Type Check"** - Quick check
2. **"User ID Type Verification"** - Detailed check

**Action:** Run one of these AFTER running the migration to verify it worked.

---

## 📋 **Step-by-Step Instructions**

1. **Open Supabase SQL Editor**

   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" → "New query"

2. **Run the Migration**

   - Open `fix-clerk-user-ids.sql` from your project
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)
   - You should see: "Success. No rows returned"

3. **Verify It Worked**

   - Run one of the verification queries
   - Should show: `data_type = 'text'` and `✅ CORRECT`

4. **Test Your App**
   - Try venue registration again
   - Should work now! ✅

---

## ⚠️ **Important Notes**

- The migration script will **DROP ALL EXISTING DATA**
- If you have important data, use the migration script instead: `supabase/migrate-to-clerk-ids.sql`
- After running the migration, your database will be ready for Clerk user IDs

---

## 🔍 **Quick Check**

After running the migration, verify with:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';
```

Should show: `data_type = 'text'` ✅
