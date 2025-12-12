# Quick Fix: Run SQL Migration in Supabase

## Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your ClubRadar project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration Script**
   - Copy the entire contents of `supabase/fix-clerk-user-ids.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify the Migration**
   - Run this query to check if the schema was updated:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'id';
   ```
   - You should see `data_type = 'text'` (not 'uuid')

5. **Test Your App**
   - Refresh your app
   - Try accessing the venue dashboard
   - The error should be gone!

## Alternative: If You Have Existing Data

If you have data you want to keep, use `supabase/migrate-to-clerk-ids.sql` instead.

## Still Getting Errors?

If you still see UUID errors after running the migration:
1. Make sure you ran the entire SQL script (not just part of it)
2. Check for any error messages in the SQL Editor
3. Verify the schema change with the query above

