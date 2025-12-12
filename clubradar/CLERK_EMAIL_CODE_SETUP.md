# 🔧 Clerk Email Code (OTP) Setup Guide

## Problem: Email OTP Not Working for Sign-Up

If you're unable to sign up using email OTP, follow these steps to configure Clerk properly.

---

## Step 1: Enable Email Code in Clerk Dashboard

### 1.1 Go to Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"User & Authentication"** → **"Email, Phone, Username"**

### 1.2 Enable Email Address

1. Find the **"Email address"** section
2. Toggle **"Enable email address"** to **ON**
3. Make sure it's enabled

### 1.3 Enable Email Code Strategy

1. Under **"Email address"**, find **"Verification"** options
2. Look for **"Email code"** or **"Email verification code"**
3. Make sure **"Email code"** is selected/enabled
4. This is the OTP (One-Time Password) method

### 1.4 Save Changes

- Click **"Save"** or **"Apply"** to save your changes

---

## Step 2: Verify Email Templates

### 2.1 Check Email Templates

1. Go to **"User & Authentication"** → **"Email Templates"**
2. Find **"Email code"** or **"Email verification code"** template
3. Make sure it's enabled
4. Check the template content to ensure it includes the code

### 2.2 Template Should Include

The email template should include:
- The verification code (OTP)
- Clear instructions
- Your app name/branding

---

## Step 3: Check Restrictions

### 3.1 Email Domain Restrictions

1. Go to **"User & Authentication"** → **"Restrictions"**
2. Check **"Email address restrictions"**
3. Make sure your email domain (e.g., `gmail.com`) is not blocked
4. If there's an allowlist, add your domain

---

## Step 4: Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## Step 5: Test the Flow

1. Go to your sign-up page
2. Enter an email address
3. Click "Send Verification Code"
4. Check your email inbox
5. **Also check spam/junk folder**
6. Look for a 6-digit code

---

## Common Issues

### Issue 1: "Email code strategy not available"

**Solution:**
- Go to Clerk Dashboard → User & Authentication → Email, Phone, Username
- Enable "Email code" under Email verification options
- Save changes
- Refresh your app

### Issue 2: OTP Not Received

**Solutions:**
1. Check spam/junk folder
2. Wait 2-3 minutes (emails can be delayed)
3. Try a different email address
4. Check Clerk Dashboard → Logs for email sending status
5. Verify email domain is not blocked

### Issue 3: "Already exists" Error

**Solution:**
- The email is already registered
- Use the login page instead
- Or use a different email address

---

## Quick Checklist

- [ ] Email address is enabled in Clerk
- [ ] Email code strategy is enabled in Clerk
- [ ] Email code template is enabled
- [ ] No email domain restrictions blocking your email
- [ ] Environment variables are set correctly
- [ ] Checked spam folder
- [ ] Waited 2-3 minutes for email
- [ ] Tried different email address
- [ ] Checked Clerk Dashboard logs

---

## Alternative: Use Google Sign-Up

If email OTP continues to fail, use Google OAuth:

1. Click **"Sign up with Google"** button
2. Sign in with your Google account
3. Automatically creates account
4. No email OTP needed

---

## Still Not Working?

1. **Check Clerk Logs**: Dashboard → Logs → Filter by "email" or "verification"
2. **Check Console**: Open browser DevTools → Console tab → Look for errors
3. **Check Network**: DevTools → Network tab → Look for failed requests
4. **Contact Clerk Support**: [clerk.com/support](https://clerk.com/support)

---

## Debug Information

When testing, check the browser console for:
- `"Starting sign-up for: [email]"`
- `"Sign-up created successfully"`
- `"Email verification prepared successfully"`
- Any error messages

These logs will help identify where the issue is occurring.

