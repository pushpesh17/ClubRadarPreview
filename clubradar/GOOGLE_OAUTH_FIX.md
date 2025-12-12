# 🔧 Google OAuth Not Working - Quick Fix Guide

## Issue: Button Stuck Loading, No Redirect

If you see "Starting Google OAuth..." in console but nothing happens, follow these steps:

---

## ✅ Step 1: Verify Google OAuth is Enabled

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your ClubRadar app**
3. **Navigate to**: User & Authentication → Social Connections
4. **Find "Google"** in the list
5. **Make sure toggle is ON** (green/enabled)
6. **Click "Save"** if you made changes

---

## ✅ Step 2: Check Redirect URLs

1. **In Clerk Dashboard**, go to **"Paths"** (left sidebar)
2. **Scroll to "Redirect URLs"** section
3. **Add these URLs** (one per line):
   ```
   http://localhost:3001/sso-callback
   http://localhost:3000/sso-callback
   ```
4. **Also check**:
   - **After sign-in**: Should be `/discover`
   - **After sign-up**: Should be `/discover`
5. **Click "Save"**

---

## ✅ Step 3: Verify Environment Variables

1. **Open `.env.local`** in your project
2. **Make sure you have**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. **Restart your dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## ✅ Step 4: Test Again

1. **Clear browser cache** (or use incognito)
2. **Go to** `/login` or `/signup`
3. **Click "Continue with Google"**
4. **Check console** for:
   - "Starting Google OAuth..." ✅ (you're seeing this)
   - Any red errors ❌ (check these)
   - "Redirect did not happen" warning (means redirect failed)

---

## 🔍 What to Check in Console

After clicking the button, you should see:

1. ✅ "Starting Google OAuth..." - **You're seeing this**
2. ❓ **Do you see any red errors?** - Share these
3. ❓ **Do you see "Redirect did not happen"?** - Means redirect failed
4. ❓ **Any network requests?** - Check Network tab

---

## 🚨 Most Common Issue

**Google OAuth not enabled in Clerk Dashboard**

This is the #1 reason the button gets stuck. Even if you think it's enabled, double-check:

1. Go to Clerk Dashboard
2. User & Authentication → Social Connections
3. **Google toggle must be ON**
4. **Save changes**

---

## 💡 Alternative: Use Clerk's Pre-built Components

If custom implementation continues to fail, you can use Clerk's pre-built components which handle everything automatically:

```tsx
import { SignInButton, SignUpButton } from "@clerk/nextjs";

// Simple button
<SignInButton mode="modal">
  <Button>Continue with Google</Button>
</SignInButton>
```

This is the easiest solution and works 100% of the time.

---

## 📋 Quick Checklist

- [ ] Google OAuth enabled in Clerk Dashboard
- [ ] Redirect URLs added in Clerk Dashboard
- [ ] Environment variables set correctly
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Checked console for errors

---

## 🆘 Still Not Working?

**Share these details:**

1. **Console output** - Copy all console messages
2. **Clerk Dashboard screenshot** - Show Google OAuth settings
3. **Network tab** - Any failed requests when clicking button?

This will help identify the exact issue!

