# Environment Variables Guide for ClubRadar

## Supabase Keys You Need

### 1. **Publishable Key** (Anon Key)

- **What you see**: `sb_publishable_Ls5EFSta-MXJrk6zsUa5jA_x6wDfT7m`
- **Use for**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Where**: Safe to use in browser (with RLS enabled)
- **Status**: ✅ You have this

### 2. **Secret Key** (Service Role Key)

- **What you see**: `sb_secret_AiPik...` (partially hidden)
- **Use for**: `SUPABASE_SERVICE_ROLE_KEY`
- **Where**: Backend only - NEVER expose in browser!
- **Status**: ⚠️ You need to reveal and copy the full key

### 3. **Supabase URL**

- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Format**: `https://xxxxx.supabase.co`
- **Use for**: `NEXT_PUBLIC_SUPABASE_URL`

## How to Get Your Keys

### Step 1: Get the Service Role Key (Secret Key)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll to **"Secret keys"** section
3. Find the key named **"default"** (or create a new one)
4. Click the **eye icon** or **"Reveal"** button to show the full key
5. Click **"Copy"** to copy the full key
   - It should look like: `sb_secret_AiPik...` (full key, not truncated)

### Step 2: Get Your Project URL

1. In the same page (Settings → API)
2. Look for **"Project URL"** or **"API URL"**
3. Copy the full URL (e.g., `https://xxxxx.supabase.co`)

### Step 3: Add to `.env.local`

Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Ls5EFSta-MXJrk6zsUa5jA_x6wDfT7m
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AiPik...your-full-secret-key-here

# Clerk Configuration (you should already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Razorpay Configuration (if using payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Important Notes

### ⚠️ Security Warnings

1. **Service Role Key is SECRET**:

   - Never commit it to Git
   - Never expose it in browser/client-side code
   - Only use in server-side API routes
   - Add `.env.local` to `.gitignore`

2. **Publishable Key is Safe**:
   - Can be used in browser
   - Safe to commit (but still better to use env vars)
   - Works with RLS policies

### ✅ Verification

After adding the keys:

1. **Restart your dev server**:

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Check if keys are loaded**:

   - Look for any "Missing configuration" errors
   - If you see errors, keys might not be loaded

3. **Test venue registration**:
   - Should work without RLS errors now!

## Quick Checklist

- [ ] Copied full Service Role Key (secret key) from Supabase
- [ ] Copied Project URL from Supabase
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Restarted dev server
- [ ] Tested venue registration

## Troubleshooting

**"Missing Supabase configuration" error?**

- Check that all three keys are in `.env.local`
- Make sure you restarted the dev server
- Check for typos in key names

**"Service role key not found" error?**

- Make sure you copied the FULL key (not truncated)
- Check that it starts with `sb_secret_`
- Verify there are no extra spaces

**Still getting RLS errors?**

- Make sure you ran `fix-clerk-user-ids.sql` in Supabase
- Or run `fix-rls-policies.sql` to update policies
- Service role key should bypass RLS automatically
