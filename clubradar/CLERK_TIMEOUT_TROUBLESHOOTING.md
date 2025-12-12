# 🔧 Clerk Sign-Up Timeout Troubleshooting Guide

## Problem: `signUp.create()` Timing Out

If you're seeing "Request timeout - signUp.create() took too long", this means Clerk's API is not responding. Follow these steps:

---

## Step 1: Verify Clerk API Keys

### 1.1 Check `.env.local` File

1. Open `.env.local` in your project root (`clubradar/`)
2. Verify you have these two lines:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 1.2 Verify Keys Are Correct

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"API Keys"** in the left sidebar
4. Copy the **Publishable Key** (starts with `pk_test_`)
5. Copy the **Secret Key** (starts with `sk_test_`)
6. Make sure they match what's in your `.env.local`

### 1.3 Restart Dev Server

After updating `.env.local`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## Step 2: Enable Email Code in Clerk Dashboard

### 2.1 Navigate to Email Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"User & Authentication"** → **"Email, Phone, Username"**

### 2.2 Enable Email Address

1. Find **"Email address"** section
2. Toggle **"Enable email address"** to **ON** ✅
3. Make sure it's enabled

### 2.3 Enable Email Code Strategy

1. Under **"Email address"**, find **"Verification"** or **"Email verification"**
2. Look for **"Email code"** option
3. **Enable "Email code"** (this is the OTP method)
4. If you see "Magic link" instead, you can enable both

### 2.4 Save Changes

- Click **"Save"** or **"Apply"** to save your changes

---

## Step 3: Check Network Connectivity

### 3.1 Test Clerk API Connection

Open your browser's Developer Console (F12) and run:

```javascript
fetch('https://api.clerk.com/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If this fails, you have a network/firewall issue.

### 3.2 Check Firewall/VPN

- Disable VPN if enabled
- Check if your firewall is blocking Clerk API
- Try from a different network

---

## Step 4: Verify Clerk Application Status

1. Go to [Clerk Status Page](https://status.clerk.com)
2. Check if there are any ongoing incidents
3. If Clerk is down, wait for it to be resolved

---

## Step 5: Alternative Solutions

### Option A: Use Google Sign-Up (Recommended)

If email OTP continues to fail:

1. Click **"Sign up with Google"** button on the sign-up page
2. This bypasses email OTP entirely
3. Works immediately if Google OAuth is configured

### Option B: Use Magic Link Instead

If email code is not working, try magic link:

1. In Clerk Dashboard → **"User & Authentication"** → **"Email, Phone, Username"**
2. Enable **"Magic link"** instead of (or in addition to) email code
3. This sends a clickable link instead of a code

---

## Step 6: Check Browser Console

After clicking "Send Verification Code", check the browser console for:

1. **"Clerk publishable key configured: true"** - Should be `true`
2. **"Sign-up created successfully"** - Should appear if successful
3. **Any network errors** - Check the Network tab for failed requests

---

## Step 7: Common Issues & Solutions

### Issue: "Clerk publishable key configured: false"

**Solution**: Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local` and restart the server.

### Issue: Network request fails to `api.clerk.com`

**Solution**: 
- Check internet connection
- Disable VPN/firewall
- Check if your ISP is blocking Clerk

### Issue: "Email code strategy not available"

**Solution**: Enable "Email code" in Clerk Dashboard (Step 2.3 above).

### Issue: Timeout after 15 seconds

**Solution**: 
- Verify Clerk keys are correct
- Check Clerk Dashboard settings
- Try Google sign-up as alternative
- Check Clerk status page

---

## Quick Test

1. **Restart your dev server** (important!)
2. Go to `/signup`
3. Enter an email
4. Click "Send Verification Code"
5. Check browser console for errors
6. If timeout persists, use "Sign up with Google"

---

## Still Not Working?

If none of the above works:

1. **Verify Clerk account is active** - Check if you've exceeded free tier limits
2. **Check Clerk Dashboard logs** - Look for any error messages
3. **Try a different email** - Some email providers block Clerk emails
4. **Use Google OAuth** - This is the most reliable method

---

## Need Help?

- Check [Clerk Documentation](https://clerk.com/docs)
- Visit [Clerk Community](https://clerk.com/community)
- Contact Clerk Support

