# Troubleshooting: User Creation Error

## The Problem
You're getting "Failed to create user profile" when submitting venue registration.

## Possible Causes

### 1. Users Table Still Has UUID Type (Most Likely)

The `users.id` column might still be UUID instead of TEXT. Check this:

**Run in Supabase SQL Editor:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';
```

**If it shows `uuid`:**
- You need to run the migration script: `supabase/fix-clerk-user-ids.sql`
- This will recreate the table with TEXT id

**If it shows `text`:**
- The schema is correct, check other issues below

### 2. Unique Constraint Violation

If email or phone already exists, you'll get an error. Check:

```sql
-- Check if email already exists
SELECT id, email FROM public.users WHERE email = 'your-email@example.com';

-- Check if phone already exists
SELECT id, phone FROM public.users WHERE phone = 'your-phone-number';
```

### 3. Missing Required Fields

Check if there are any NOT NULL constraints we're missing.

## Quick Fix

### Option 1: Verify and Fix Schema

1. **Check the schema:**
   ```sql
   -- Run this in Supabase SQL Editor
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'users' AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

2. **If id is UUID, run the migration:**
   - Go to Supabase SQL Editor
   - Copy and run `supabase/fix-clerk-user-ids.sql`
   - This will recreate all tables with TEXT IDs

### Option 2: Manual User Creation (For Testing)

If you want to test without fixing the schema, manually create a user:

```sql
-- Replace with your actual Clerk user ID
INSERT INTO public.users (id, name, email, phone)
VALUES (
  'user_35hvrWePm83NtL6tSFel9zZBKaW',  -- Your Clerk user ID
  'Test User',
  'test@example.com',
  '+919876543210'
);
```

## Check Server Logs

Look at your Next.js server console for detailed error messages. The improved error handling will now show:
- Error code
- Error message
- Error hint (if available)
- User ID being used

## Common Error Codes

- **23505**: Duplicate key (email/phone already exists)
- **23502**: Not null violation (missing required field)
- **22P02**: Invalid input syntax (UUID vs TEXT mismatch)
- **PGRST116**: Not found (this is OK, means user doesn't exist)

## Next Steps

1. Check the server console for the detailed error
2. Run the verification SQL to check table schema
3. If needed, run the migration script
4. Try registration again

