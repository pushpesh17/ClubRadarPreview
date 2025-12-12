# 🔧 Fix: "TypeError: fetch failed" - Supabase Connection Error

## Problem
You're seeing this error:
```
TypeError: fetch failed
GET /api/events 400 (Bad Request)
GET /api/bookings 400 (Bad Request)
```

This means your Next.js app **cannot connect to Supabase**.

---

## ✅ Quick Fix Checklist

### Step 1: Verify Environment Variables

1. **Open `.env.local`** in your project root (`clubradar/`)
2. **Check these two variables exist:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Make sure:**
   - ✅ No quotes around the values
   - ✅ No extra spaces
   - ✅ URLs start with `https://`
   - ✅ Service role key is the **full key** (starts with `eyJ...`)

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Important:** Use the **service_role** key (not the `anon` key) for `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Verify Your Supabase Project is Active

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Check if your project shows as **"Active"**
3. If it's **"Paused"**, click **"Resume"** or **"Restore"**

**Note:** Free tier projects pause after 7 days of inactivity.

### Step 4: Restart Your Dev Server

**Critical!** After updating `.env.local`:

1. **Stop** your dev server (press `Ctrl+C`)
2. **Restart** it:
   ```bash
   npm run dev
   ```

Environment variables are only loaded when the server starts!

---

## 🐛 Still Not Working?

### Check 1: Verify Environment Variables Are Loaded

Add this temporary check to see if variables are loaded:

```typescript
// In any API route, add this at the top:
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing");
console.log("Service Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing");
```

### Check 2: Test Supabase Connection

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Go to **Table Editor**
3. Try to view your `events` table
4. If this fails, your Supabase project might be paused or deleted

### Check 3: Check Network/Firewall

1. **Disable VPN** if enabled
2. **Check firewall** settings
3. **Try a different network** (mobile hotspot, etc.)

### Check 4: Verify Supabase URL Format

Your URL should look like:
```
✅ Correct: https://abcdefghijklmnop.supabase.co
❌ Wrong:   https://supabase.co
❌ Wrong:   http://abcdefghijklmnop.supabase.co (missing 's')
❌ Wrong:   abcdefghijklmnop.supabase.co (missing https://)
```

### Check 5: Verify Service Role Key

Your service role key should:
- ✅ Start with `eyJ` (JWT token)
- ✅ Be very long (hundreds of characters)
- ✅ Be from the **"service_role"** section (not "anon" or "service_role secret")

---

## 📋 Common Issues

### Issue 1: "Missing Supabase configuration"

**Fix:** Add both variables to `.env.local` and restart the server.

### Issue 2: "Invalid Supabase URL format"

**Fix:** Make sure the URL starts with `https://` and ends with `.supabase.co`

### Issue 3: "Database connection failed"

**Possible causes:**
- Supabase project is paused
- Wrong service role key
- Network connectivity issues
- Supabase project was deleted

**Fix:**
1. Check Supabase Dashboard → Project status
2. Verify service role key is correct
3. Check internet connection
4. Try accessing Supabase Dashboard in browser

### Issue 4: Environment variables not loading

**Fix:**
1. Make sure file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
2. File should be in project root (`clubradar/`)
3. Restart dev server after changes
4. No spaces around `=` sign: `KEY=value` (not `KEY = value`)

---

## ✅ Expected Behavior After Fix

Once fixed:
- ✅ `/api/events` returns 200 (not 400)
- ✅ `/api/bookings` returns 200 (not 400)
- ✅ Events load on `/discover` page
- ✅ Bookings load on `/bookings` page
- ✅ No "TypeError: fetch failed" errors

---

## 🆘 Still Having Issues?

1. **Check Server Logs:** Look at your terminal for detailed error messages
2. **Check Browser Console:** Look for specific error details
3. **Verify Supabase Status:** https://status.supabase.com
4. **Test in Supabase Dashboard:** Try querying tables directly

---

**Last Updated:** Based on current error handling implementation.

