# ✅ Enable Sign-Ups in Clerk Dashboard - Step-by-Step Guide

## 🎯 Problem
You're seeing this error: **"Sign-up request timed out. This usually means sign-ups are disabled in Clerk Dashboard."**

This happens when email/password sign-ups are disabled in your Clerk Dashboard settings.

---

## 🚀 Solution: Enable Sign-Ups (5 minutes)

### Step 1: Open Clerk Dashboard

1. Go to **[Clerk Dashboard](https://dashboard.clerk.com)**
2. **Sign in** to your Clerk account
3. **Select your application** (the one you're using for this project)

---

### Step 2: Navigate to User & Authentication Settings

1. In the left sidebar, click **"User & Authentication"**
2. Then click **"Email, Phone, Username"** (or just "Email, Phone, Username" if it's directly visible)

---

### Step 3: Enable Sign-Ups

1. Look for a section called **"Sign-up"** or **"Allow sign-ups"**
2. You should see a **toggle switch** or **checkbox**
3. **Turn it ON** ✅ (toggle to the right/enabled position)
4. If you don't see this option, look for:
   - **"Allow users to sign up"**
   - **"Enable sign-ups"**
   - **"Sign-up restrictions"** (and make sure it's not blocking sign-ups)

---

### Step 4: Verify Email Settings

Still in the **"Email, Phone, Username"** section:

1. Find the **"Email address"** subsection
2. Make sure:
   - ✅ **"Enable email address"** is **ON**
   - ✅ **"Email code"** is **enabled** (this is for OTP verification)
   - ✅ **"Password"** is **enabled** (if you want password sign-up)

3. If you see **"Verification"** options:
   - Make sure **"Email code"** is selected/enabled
   - This allows users to verify their email with a 6-digit code

---

### Step 5: Check Restrictions (Important!)

1. In the left sidebar, click **"Restrictions"** (or go to **"User & Authentication"** → **"Restrictions"**)
2. Look for **"Sign-up restrictions"** or **"Email sign-up restrictions"**
3. Make sure:
   - ❌ Your email domain (e.g., `gmail.com`) is **NOT** in a blocklist
   - ✅ If there's an **allowlist**, add your email domain
   - ✅ **No restrictions** are blocking sign-ups

---

### Step 6: Save Changes

1. Click **"Save"** or **"Apply"** button (usually at the top or bottom of the page)
2. Wait for confirmation that changes are saved

---

### Step 7: Restart Your Dev Server

**Important!** After making changes in Clerk Dashboard:

1. **Stop** your dev server (press `Ctrl+C` in terminal)
2. **Restart** it:
   ```bash
   npm run dev
   ```

---

### Step 8: Clear Browser Cache

1. **Clear your browser cache** OR
2. Use **Incognito/Private mode** OR
3. **Hard refresh** the page (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)

---

### Step 9: Test Sign-Up

1. Go to `/signup` page
2. Fill in the form:
   - First name (optional)
   - Last name (optional)
   - Email address
   - Password (at least 8 characters)
3. Click **"Continue"**
4. Should work now! ✅

---

## 🔄 Alternative: Use Google Sign-Up

If email sign-up still doesn't work, you can use **Google sign-up** as a workaround:

1. On the sign-up page, click **"Continue with Google"** button
2. This will redirect you to Google's sign-in page
3. After signing in with Google, you'll be redirected back
4. Your account will be created automatically
5. You can still use email/password for future logins (if enabled)

**Note:** Google sign-up works even if email sign-ups are disabled!

---

## 📋 Checklist

Before trying again, make sure:

- [ ] Sign-ups are **enabled** in Clerk Dashboard
- [ ] Email address is **enabled** in Clerk Dashboard
- [ ] Email code is **enabled** in Clerk Dashboard
- [ ] Password is **enabled** (if using password sign-up)
- [ ] No **restrictions** are blocking your email domain
- [ ] Changes are **saved** in Clerk Dashboard
- [ ] Dev server has been **restarted**
- [ ] Browser cache has been **cleared**

---

## 🐛 Still Not Working?

### Check Browser Console

1. Open **DevTools** (press `F12`)
2. Go to **"Console"** tab
3. Try signing up again
4. Look for **new error messages**
5. Share the error message for help

### Check Network Tab

1. Open **DevTools** (press `F12`)
2. Go to **"Network"** tab
3. Try signing up again
4. Look for requests to `clerk.accounts.dev` or `api.clerk.com`
5. Check the **status code**:
   - ✅ **200** = Success (should work)
   - ❌ **422** = Configuration issue (sign-ups disabled)
   - ❌ **403** = Permission issue
   - ❌ **Pending** = Timeout (sign-ups disabled)

### Verify Your Clerk Keys

Make sure your `.env.local` file has the correct keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

1. Go to Clerk Dashboard → **"API Keys"**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)
4. Make sure they match what's in `.env.local`
5. **Restart dev server** after updating

---

## ✅ Expected Behavior After Fix

Once sign-ups are enabled:

1. ✅ Sign-up button should complete in **< 2 seconds** (not timeout)
2. ✅ You'll see **"Verification code sent to your email!"** message
3. ✅ **OTP input** will appear on the same page
4. ✅ You'll receive an **email with 6-digit code** within seconds
5. ✅ After entering OTP, account will be created
6. ✅ You'll be **redirected to `/discover`**

---

## 🆘 Need More Help?

1. **Check Clerk Status**: https://status.clerk.com (might be a service outage)
2. **Try Google Sign-Up**: Works even if email sign-ups are disabled
3. **Check Clerk Documentation**: https://clerk.com/docs
4. **Contact Support**: If nothing works, there might be an account-level restriction

---

## 📸 Visual Guide

If you're having trouble finding the settings:

1. **Clerk Dashboard** → **"User & Authentication"** → **"Email, Phone, Username"**
2. Look for a toggle that says **"Sign-up"** or **"Allow sign-ups"**
3. It should be in the **top section** of the page
4. Make sure it's **turned ON** (green/enabled)

---

**Last Updated**: Based on Clerk Dashboard interface as of 2024.

