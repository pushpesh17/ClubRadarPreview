# Verify Vercel Environment Variables - Fix 500 Errors

## The Error

```
GET https://www.clubradar.in/api/venues 500 (Internal Server Error)
Error: Server configuration error
```

This error means **Supabase environment variables are missing or incorrect** in Vercel production.

---

## Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Go to **Settings** → **Environment Variables**

### Check These Variables Exist:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**If any are missing, that's the problem!**

---

## Step 2: Verify They're Set for Production

**Critical:** Environment variables must be set for **"Production"** environment!

1. In Vercel Environment Variables page
2. For each variable, check the **"Environments"** column
3. Make sure **"Production"** is checked ✅
4. If not, click the variable → Edit → Check "Production" → Save

---

## Step 3: Get Supabase Keys

If variables are missing or incorrect:

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **ClubRadar** project
3. Go to **Settings** → **API**

### Copy These Values:

1. **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Use for: `NEXT_PUBLIC_SUPABASE_URL`

2. **anon public** key (starts with `eyJ...` or `sb_publishable_...`)
   - Use for: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **service_role** key (starts with `eyJ...` or `sb_secret_...`)
   - Click **"Reveal"** to see the full key
   - Use for: `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Keep this secret!**

---

## Step 4: Add/Update in Vercel

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. For each variable:

   **Add `NEXT_PUBLIC_SUPABASE_URL`:**
   - Click **"Add New"**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (from Supabase)
   - Environments: Check **"Production"**, **"Preview"**, **"Development"**
   - Click **"Save"**

   **Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`:**
   - Click **"Add New"**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (anon key from Supabase)
   - Environments: Check **"Production"**, **"Preview"**, **"Development"**
   - Click **"Save"**

   **Add `SUPABASE_SERVICE_ROLE_KEY`:**
   - Click **"Add New"**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (service_role key from Supabase - full key!)
   - Environments: Check **"Production"**, **"Preview"**, **"Development"**
   - Click **"Save"**

---

## Step 5: Redeploy

**IMPORTANT:** After updating environment variables, you MUST redeploy!

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

**Why redeploy?** Environment variables are only loaded when the app builds/deploys.

---

## Step 6: Verify It's Fixed

After redeploying:

1. Go to: https://www.clubradar.in/discover
2. Open browser console (F12)
3. Check for errors:
   - ✅ No "Server configuration error" = Fixed!
   - ❌ Still seeing error = Variables not set correctly

---

## Common Issues

### Issue 1: Variables Set for Wrong Environment

**Problem:** Variables are set for "Development" but not "Production"

**Solution:** Edit each variable → Check "Production" → Save → Redeploy

### Issue 2: Typo in Variable Name

**Problem:** Variable name has typo (e.g., `SUPABASE_SERVICE_ROLE_KEY` vs `SUPABASE_SERVICE_KEY`)

**Solution:** Double-check spelling - must be exact:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Issue 3: Missing Service Role Key

**Problem:** Only anon key is set, service_role key is missing

**Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` (this is critical for API routes!)

### Issue 4: Not Redeployed After Adding Variables

**Problem:** Added variables but didn't redeploy

**Solution:** Always redeploy after adding/updating environment variables

---

## Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` exists in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists in Vercel
- [ ] All three are set for **"Production"** environment
- [ ] Values are correct (no typos, full keys)
- [ ] Application redeployed after updating

---

## Test After Fixing

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Go to:** https://www.clubradar.in/discover
3. **Check console** - should see no errors
4. **Venues should load** - if approved, they'll show

---

## Still Not Working?

If you're still getting "Server configuration error" after:
- ✅ Adding all variables
- ✅ Setting for Production
- ✅ Redeploying

**Check Vercel logs:**
1. Go to **Deployments** → Latest deployment → **"Logs"**
2. Look for specific error messages
3. Check if variables are being loaded

**Or verify in code:**
The error comes from this check in API routes:
```typescript
if (!supabaseUrl || !supabaseServiceKey) {
  return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
}
```

This means either `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing/undefined.

---

## Summary

**The "Server configuration error" = Missing Supabase environment variables in Vercel**

**Fix:**
1. Add all 3 Supabase variables to Vercel
2. Set them for "Production" environment
3. Redeploy application
4. Test - errors should be gone!

The data migration will work once the API routes are working correctly.

