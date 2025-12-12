# 🔧 Sign-Up Not Working - Quick Fix Guide

## Problem: Sign-Up Button Stuck Loading

If the sign-up button is stuck loading after clicking "Continue", this usually means **sign-ups are disabled in Clerk Dashboard**.

---

## ✅ Quick Fix (2 minutes)

### Step 1: Enable Sign-Ups in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"User & Authentication"** → **"Email, Phone, Username"**
4. Look for **"Sign-up"** or **"Allow sign-ups"** toggle
5. **Enable it** (turn ON) ✅
6. Click **"Save"**

### Step 2: Verify Email Settings

1. Still in **"User & Authentication"** → **"Email, Phone, Username"**
2. Under **"Email address"**:
   - ✅ **"Enable email address"** should be ON
   - ✅ **"Email code"** should be enabled (for OTP verification)
3. Click **"Save"**

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Try Again

1. Clear your browser cache (or use incognito mode)
2. Go to `/signup`
3. Fill in the form
4. Click "Continue"
5. Should work now! ✅

---

## 🔄 Alternative: Use Google Sign-Up

If email sign-up still doesn't work, you can use Google sign-up as a workaround:

1. On the sign-up page, click **"Sign up with Google"**
2. This will work even if email sign-ups are disabled
3. After signing up with Google, you can still use email/password for future logins

---

## 🐛 Still Not Working?

### Check Browser Console

1. Open DevTools (F12)
2. Go to **"Console"** tab
3. Look for error messages
4. Share the error message for help

### Check Network Tab

1. Open DevTools (F12)
2. Go to **"Network"** tab
3. Try signing up again
4. Look for requests to `clerk.accounts.dev`
5. Check if they're:
   - ❌ **Pending** (never complete) = Timeout issue
   - ❌ **Failed** (4xx/5xx) = Configuration issue
   - ✅ **Success** (200) = Should work

### Common Issues

1. **"Sign-ups are disabled"**
   - Fix: Enable sign-ups in Clerk Dashboard (see Step 1 above)

2. **"Request timed out"**
   - Fix: Enable sign-ups in Clerk Dashboard
   - Alternative: Use Google sign-up

3. **"Email code verification not available"**
   - Fix: Enable "Email code" in Clerk Dashboard → Email settings

4. **"Couldn't find your account"** (on login)
   - This is normal - you'll be redirected to sign-up page

---

## 📋 Checklist

Before reporting an issue, make sure:

- [ ] Sign-ups are **enabled** in Clerk Dashboard
- [ ] Email address is **enabled** in Clerk Dashboard
- [ ] Email code is **enabled** in Clerk Dashboard
- [ ] Dev server has been **restarted** after changes
- [ ] Browser cache has been **cleared**
- [ ] You've tried **Google sign-up** as alternative
- [ ] You've checked the **browser console** for errors

---

## 🆘 Need More Help?

If none of the above works:

1. Check [Clerk Status](https://status.clerk.com) - might be a service outage
2. Try a different email address
3. Try Google sign-up instead
4. Check your `.env.local` file has correct Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

---

## ✅ Expected Behavior After Fix

Once sign-ups are enabled:

- ✅ Sign-up button should complete in < 2 seconds
- ✅ You'll see "Verification code sent to your email!" message
- ✅ OTP input will appear on the same page
- ✅ You'll receive an email with 6-digit code
- ✅ After entering OTP, account will be created
- ✅ You'll be redirected to `/discover`

---

**Last Updated**: Based on current implementation with email + password sign-up and email code verification.

