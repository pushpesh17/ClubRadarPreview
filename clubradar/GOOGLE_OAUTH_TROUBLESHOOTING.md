# 🔍 Google OAuth Troubleshooting Guide

## Issue: Google Sign-In Button Stuck Loading

If the "Continue with Google" button is stuck in a loading state, check the following:

---

## ✅ Quick Checks

### 1. **Check Clerk Dashboard Configuration**

1. Go to **Clerk Dashboard** → **User & Authentication** → **Social Connections**
2. Verify **Google** is **enabled** (toggle should be ON)
3. If using Clerk's default OAuth (recommended), no additional setup needed
4. If using custom Google OAuth, verify Client ID and Secret are correct

### 2. **Check Redirect URLs in Clerk Dashboard**

1. Go to **Clerk Dashboard** → **Paths**
2. Verify these URLs are set:
   - **After sign-in**: `/discover`
   - **After sign-up**: `/discover`
   - **Redirect URLs** (allowed list):
     - `http://localhost:3001/sso-callback`
     - `http://localhost:3000/sso-callback` (if using port 3000)
     - Your production URL when ready

### 3. **Check Environment Variables**

Make sure `.env.local` has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Restart your dev server** after adding/updating these!

---

## 🔧 Common Issues & Fixes

### Issue 1: Button Stuck Loading, No Redirect

**Symptoms:**
- Button shows loading spinner
- Nothing happens when clicked
- Console shows CSP warnings

**Possible Causes:**
1. Google OAuth not enabled in Clerk Dashboard
2. Redirect URLs not configured
3. Browser blocking the redirect
4. Network/firewall blocking Google OAuth

**Solutions:**
1. ✅ Verify Google is enabled in Clerk Dashboard
2. ✅ Check redirect URLs are set correctly
3. ✅ Try in incognito/private window (disables extensions)
4. ✅ Check browser console for errors
5. ✅ Try different browser

---

### Issue 2: "No challenge" Error

**Symptoms:**
- Console shows "No challenge" error
- OAuth flow doesn't start

**Solutions:**
1. Make sure Google OAuth is enabled in Clerk Dashboard
2. Check that redirect URLs match exactly (including protocol)
3. Verify API keys are correct
4. Restart dev server

---

### Issue 3: Redirects to Error Page

**Symptoms:**
- Redirects to `/login?error=...`
- OAuth flow starts but fails

**Solutions:**
1. Check Clerk Dashboard → **Email Logs** for errors
2. Verify redirect URLs are in allowed list
3. Check browser console for specific error messages
4. Make sure you're using the correct redirect URL format

---

### Issue 4: CSP (Content Security Policy) Warnings

**Symptoms:**
- Console shows script-src warnings
- OAuth might still work but shows warnings

**Solutions:**
- These are usually just warnings, not errors
- OAuth should still work
- If it doesn't work, check other issues above

---

## 🧪 Testing Steps

1. **Clear Browser Cache & Cookies**
   - Clear all site data for localhost
   - Try again

2. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red errors
   - Share error messages if any

3. **Test in Incognito Window**
   - Open incognito/private window
   - Try Google sign-in
   - This disables extensions that might interfere

4. **Check Network Tab**
   - Open DevTools → Network tab
   - Click "Continue with Google"
   - Look for failed requests (red)
   - Check what URLs are being called

---

## 📋 Debug Checklist

- [ ] Google OAuth enabled in Clerk Dashboard
- [ ] Redirect URLs configured in Clerk Dashboard
- [ ] Environment variables set correctly
- [ ] Dev server restarted after env changes
- [ ] Browser console checked for errors
- [ ] Tried in incognito window
- [ ] Network tab checked for failed requests
- [ ] API keys are correct (test keys start with `pk_test_` and `sk_test_`)

---

## 🔍 What to Check in Console

When you click "Continue with Google", check the console for:

1. **Any red errors** - These indicate what's failing
2. **Network requests** - Check if requests to Clerk/Google are being made
3. **Redirect attempts** - See if redirect is being attempted

---

## 💡 Alternative: Use Clerk's Pre-built Components

If custom implementation continues to have issues, you can use Clerk's pre-built components:

```tsx
import { SignIn, SignUp } from "@clerk/nextjs";

// In your login page
<SignIn 
  routing="path" 
  path="/login"
  signUpUrl="/signup"
/>

// In your signup page
<SignUp 
  routing="path" 
  path="/signup"
  signInUrl="/login"
/>
```

This is the easiest way and handles all OAuth flows automatically.

---

## 🆘 Still Not Working?

If none of the above fixes work:

1. **Check Clerk Dashboard Logs**
   - Go to Clerk Dashboard → **Logs**
   - Look for authentication attempts
   - Check for errors

2. **Verify Google OAuth Setup**
   - If using custom Google OAuth, verify credentials in Google Cloud Console
   - Check redirect URIs match Clerk's callback URL

3. **Contact Support**
   - Clerk Support: https://clerk.com/support
   - Or check Clerk Discord/Community

---

## ✅ Expected Behavior

When working correctly:
1. Click "Continue with Google"
2. Button shows loading state
3. **Immediately redirects** to Google sign-in page
4. After Google approval, redirects to `/sso-callback`
5. Then redirects to `/discover`
6. Navbar shows profile icon

If step 3 doesn't happen (no redirect), that's the issue we need to fix.

