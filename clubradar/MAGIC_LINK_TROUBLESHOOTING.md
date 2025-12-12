# 🔧 Magic Link Troubleshooting Guide

## Problem: Getting `auth_failed` Error

When clicking the magic link, you're redirected to `/login?error=auth_failed`.

---

## Common Causes & Solutions

### 1. **Site URL Not Configured in Supabase** ⚠️ MOST COMMON

**Problem**: Supabase doesn't know where to redirect after magic link click.

**Solution**:
1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration** (or **Settings**)
3. **Site URL**: `http://localhost:3000`
4. **Redirect URLs**: Add:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
5. **Save**

**This is the #1 cause of magic link failures!**

---

### 2. **Redirect URL Mismatch**

**Problem**: The `emailRedirectTo` in code doesn't match Supabase settings.

**Check**:
- Code uses: `http://localhost:3000/auth/callback`
- Supabase must have: `http://localhost:3000/**` in Redirect URLs

**Solution**: Make sure both match or use wildcard `/**` in Supabase.

---

### 3. **Email Provider Not Enabled**

**Problem**: Email authentication is disabled.

**Solution**:
1. **Authentication** → **Providers** → **Email**
2. Make sure **"Enable email provider"** is **ON**
3. **Save**

---

### 4. **Magic Link Expired**

**Problem**: Magic links expire after 24 hours (default).

**Solution**: Request a new magic link.

---

### 5. **Check Browser Console**

**Problem**: There might be errors in the browser console.

**Solution**: 
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Click magic link
4. Check for any errors
5. Share the error message

---

## Debugging Steps

### Step 1: Check Callback Route Logs

The callback route now logs all parameters. Check your terminal/console for:
```
Callback URL: http://localhost:3000/auth/callback?token_hash=...&type=...
Callback params: { token_hash: '...', type: '...' }
```

### Step 2: Verify Supabase Settings

1. **Site URL**: Must be `http://localhost:3000`
2. **Redirect URLs**: Must include `http://localhost:3000/**`
3. **Email Provider**: Must be enabled

### Step 3: Test the Flow

1. Send magic link
2. Check email
3. **Right-click** the link → **Copy link address**
4. Check what URL it's pointing to
5. It should be: `https://your-project.supabase.co/auth/v1/verify?token=...&type=...&redirect_to=http://localhost:3000/auth/callback`

---

## Quick Fix Checklist

- [ ] Site URL set to `http://localhost:3000` in Supabase
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email provider is enabled
- [ ] `emailRedirectTo` in code matches: `http://localhost:3000/auth/callback`
- [ ] Magic link is not expired (request new one)
- [ ] Check browser console for errors
- [ ] Check terminal/console for callback logs

---

## What the Magic Link Should Look Like

When you copy the magic link from email, it should look like:
```
https://xxxxx.supabase.co/auth/v1/verify?token=xxxxx&type=magiclink&redirect_to=http://localhost:3000/auth/callback
```

The `redirect_to` parameter should point to your callback route.

---

## Still Not Working?

1. **Check terminal logs** - The callback route logs all parameters
2. **Check browser console** - Look for JavaScript errors
3. **Verify Supabase settings** - Double-check Site URL and Redirect URLs
4. **Try a new magic link** - Request a fresh one

---

## Updated Code

The callback route has been updated to:
- ✅ Handle multiple magic link formats
- ✅ Log all parameters for debugging
- ✅ Try different verification methods
- ✅ Provide better error messages

**Check your terminal/console for detailed logs when clicking the magic link!**

