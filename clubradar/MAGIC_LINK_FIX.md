# 🔧 Magic Link Fix - Complete Guide

## Problem
Magic link redirects to `about:blank` or doesn't work properly.

## Root Cause
1. Gmail wraps links for security
2. Supabase sends `token` + `type=magiclink` parameters
3. Callback route needs to handle these parameters correctly

---

## Solution Applied

### 1. Updated Callback Route
The callback route now:
- ✅ Handles `token` + `type=magiclink` (most common)
- ✅ Handles `code` parameter (PKCE flow)
- ✅ Handles `token_hash` (legacy)
- ✅ Better error logging
- ✅ Proper session handling

### 2. Supabase Configuration Required

**IMPORTANT**: You must configure Supabase correctly:

1. **Go to Supabase Dashboard**
   - Authentication → URL Configuration

2. **Set Site URL**:
   ```
   http://localhost:3000
   ```

3. **Add Redirect URLs**:
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```

4. **Save Settings**

---

## How It Works Now

1. User enters email → clicks "Send Magic Link"
2. Supabase sends email with link like:
   ```
   https://your-project.supabase.co/auth/v1/verify?token=xxx&type=magiclink&redirect_to=http://localhost:3000/auth/callback
   ```
3. User clicks link (Gmail may wrap it)
4. Supabase redirects to: `http://localhost:3000/auth/callback?token=xxx&type=magiclink`
5. Callback route verifies token → creates session → redirects to `/discover`

---

## Testing Steps

1. **Check Supabase Settings**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

2. **Request Magic Link**:
   - Go to `/login`
   - Enter email
   - Click "Send Magic Link"

3. **Check Email**:
   - Open email (check spam if needed)
   - Click the "Log In" button

4. **Check Browser**:
   - Should redirect to `/auth/callback?token=...&type=magiclink`
   - Then automatically redirect to `/discover`
   - You should be logged in

5. **Check Terminal/Console**:
   - Look for logs like:
     ```
     === AUTH CALLBACK ===
     Full URL: http://localhost:3000/auth/callback?token=...
     Params: { token: '...', type: 'magiclink' }
     Trying token verification with type: magiclink...
     Token verification successful: { user: '...@...', session: true }
     User authenticated: ...@...
     Redirecting to /discover
     ```

---

## Troubleshooting

### Issue: Still redirects to `about:blank`

**Solution**:
1. Check Supabase redirect URLs are set correctly
2. Make sure `emailRedirectTo` in code matches Supabase settings
3. Try copying the link directly (right-click → Copy link address)
4. Paste in new browser tab

### Issue: "No verification params" error

**Solution**:
1. Check terminal logs for what parameters are received
2. Verify Supabase is sending `token` and `type` parameters
3. Check if Gmail is modifying the URL

### Issue: "Token verification error"

**Solution**:
1. Token might be expired (request new magic link)
2. Check Supabase logs for errors
3. Verify email provider is enabled in Supabase

### Issue: Redirects to login with error

**Solution**:
1. Check terminal logs for exact error message
2. Verify user profile table exists in Supabase
3. Check RLS policies allow user creation

---

## Code Changes

### Callback Route (`app/auth/callback/route.ts`)
- ✅ Prioritizes `token` + `type` verification
- ✅ Better error handling
- ✅ Detailed logging
- ✅ Handles all Supabase magic link formats

### OTP Route (`app/api/auth/otp/route.ts`)
- ✅ Sets `emailRedirectTo` correctly
- ✅ Sends magic link (not OTP code)

---

## Next Steps

1. **Test the flow**:
   - Request magic link
   - Click link in email
   - Should redirect to `/discover` and be logged in

2. **Check logs**:
   - Terminal should show detailed callback logs
   - Share logs if still not working

3. **Verify Supabase**:
   - Settings are correct
   - Email provider enabled
   - Redirect URLs configured

---

## Still Not Working?

Share:
1. Terminal logs from callback route
2. Browser console errors
3. Supabase dashboard settings (Site URL, Redirect URLs)
4. Exact URL you're redirected to

The callback route now has extensive logging - check your terminal for detailed information! 🔍

