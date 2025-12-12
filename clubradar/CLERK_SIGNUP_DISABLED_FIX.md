# 🔧 Fix: Sign-Up Timeout (Sign-In Works, Sign-Up Doesn't)

## Problem
- ✅ **Sign-in with email OTP works** - You receive OTP emails
- ❌ **Sign-up with email OTP times out** - `signUp.create()` hangs

This means Clerk is configured correctly, but **sign-ups are likely disabled or restricted** in your Clerk Dashboard.

---

## Solution: Enable Sign-Ups in Clerk Dashboard

### Step 1: Check Sign-Up Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"User & Authentication"** → **"Email, Phone, Username"**

### Step 2: Enable Sign-Ups

1. Look for **"Sign-up"** or **"Allow sign-ups"** toggle
2. Make sure it's **enabled** (turned ON) ✅
3. If you see **"Sign-up restrictions"**, check that email sign-ups are allowed

### Step 3: Check Restrictions

1. Go to **"User & Authentication"** → **"Restrictions"**
2. Look for **"Sign-up restrictions"** or **"Email sign-up restrictions"**
3. Make sure:
   - Email sign-ups are **not blocked**
   - Your email domain (e.g., `gmail.com`) is **not in a blocklist**
   - If there's an allowlist, add your email domain

### Step 4: Verify Email Settings for Sign-Up

1. Go to **"User & Authentication"** → **"Email, Phone, Username"**
2. Under **"Email address"**:
   - ✅ **"Enable email address"** should be ON
   - ✅ **"Email code"** should be enabled (for OTP)
   - Check if there's a separate setting for **"Sign-up email verification"**

### Step 5: Check Paths/Redirects

1. Go to **"Paths"** in Clerk Dashboard
2. Make sure **"After sign-up"** is set (e.g., `/discover`)
3. This shouldn't cause timeouts, but it's good to verify

---

## Alternative: Check Browser Network Tab

While trying to sign up, check what's happening:

1. Open browser DevTools (F12)
2. Go to **"Network"** tab
3. Try to sign up again
4. Look for requests to:
   - `clerk.accounts.dev`
   - `api.clerk.com`
   - `*.clerk.com`

**What to look for:**
- ❌ **Pending requests** (never complete) = Timeout issue
- ❌ **Failed requests** (4xx/5xx errors) = Configuration issue
- ✅ **Successful requests** (200) = Should work (but might be blocked by settings)

---

## Quick Test: Use Google Sign-Up

If email sign-up still doesn't work:

1. Click **"Sign up with Google"** on the sign-up page
2. If this works, it confirms sign-ups are enabled, but email sign-ups are restricted
3. This helps narrow down the issue

---

## Most Common Issue

**"Sign-ups are disabled"** in Clerk Dashboard:

1. Clerk Dashboard → **"User & Authentication"**
2. Look for **"Sign-up"** or **"Allow sign-ups"** toggle
3. **Enable it** ✅
4. Save changes
5. Try again

---

## Still Not Working?

If sign-ups are enabled but still timing out:

1. **Check Clerk Status**: https://status.clerk.com
2. **Check Browser Console**: Look for specific error messages
3. **Try Different Email**: Some email providers might be blocked
4. **Use Google OAuth**: As a workaround until email sign-up is fixed

---

## Debugging Steps

After enabling sign-ups in Clerk Dashboard:

1. **Restart your dev server** (important!)
2. Clear browser cache
3. Try signing up again
4. Check browser console for new error messages
5. Check Network tab for actual HTTP requests/responses

---

## Expected Behavior After Fix

Once sign-ups are enabled:
- `signUp.create()` should complete in < 2 seconds
- You should see "Sign-up created successfully" in console
- OTP email should be sent immediately
- No more timeout errors

