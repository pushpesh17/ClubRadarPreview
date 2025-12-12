# 🔐 Clerk Complete Setup Guide for ClubRadar

## 📋 Table of Contents

1. [Create Clerk Account](#1-create-clerk-account)
2. [Create Application](#2-create-application)
3. [Get API Keys](#3-get-api-keys)
4. [Configure Email Authentication](#4-configure-email-authentication)
5. [Configure Google OAuth](#5-configure-google-oauth)
6. [Set Up Redirect URLs](#6-set-up-redirect-urls)
7. [Configure Email Templates (Optional)](#7-configure-email-templates-optional)
8. [Add Environment Variables](#8-add-environment-variables)
9. [Test Your Setup](#9-test-your-setup)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Create Clerk Account

### Step 1.1: Sign Up

1. Go to **https://clerk.com**
2. Click **"Sign Up"** or **"Get Started"**
3. Choose one of:
   - **Sign up with Google** (recommended - fastest)
   - **Sign up with Email** (create account with email)

### Step 1.2: Verify Your Account

- If you used email, check your inbox for verification
- Complete any email verification steps

---

## 2. Create Application

### Step 2.1: Create New Application

1. After logging in, you'll see the **Dashboard**
2. Click **"Create Application"** or **"New Application"** button
3. Fill in the details:
   - **Application Name**: `ClubRadar`
   - **Choose a framework**: Select **"Next.js"**
   - Click **"Create Application"**

### Step 2.2: Select Plan

- Choose **"Free"** plan (10,000 MAU - more than enough for MVP)
- Click **"Continue"**

---

## 3. Get API Keys

### Step 3.1: Navigate to API Keys

1. In your Clerk Dashboard, go to **"API Keys"** in the left sidebar
2. You'll see two keys:

### Step 3.2: Copy Your Keys

1. **Publishable Key** (starts with `pk_test_` or `pk_live_`)

   - This is safe to expose in frontend code
   - Copy this key

2. **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ **KEEP THIS SECRET!** Never expose in frontend
   - Copy this key

### Step 3.3: Save Keys Securely

- Save both keys in a secure place (password manager, notes app)
- You'll need them in the next step

---

## 4. Configure Email Authentication

### Step 4.1: Enable Email Provider

1. In Clerk Dashboard, go to **"User & Authentication"** → **"Email, Phone, Username"**
2. Find **"Email"** section
3. Toggle **"Enable email"** to **ON**

### Step 4.2: Choose Email Strategy

1. Under **"Email"**, you'll see **"Verification"** options
2. Select **"Email code"** (OTP - One-Time Password)
   - This is what we're using in the app
   - Users will receive a 6-digit code

### Step 4.3: Configure Email Settings

1. **Email verification**: Set to **"Required"** (recommended)
2. **Email address format**: Leave as default
3. **Save changes**

### Step 4.4: Test Email (Optional)

- Clerk uses their own email service by default
- For production, you can configure custom SMTP (not needed for MVP)

---

## 5. Configure Google OAuth

### Step 5.1: Enable Google Provider

1. In Clerk Dashboard, go to **"User & Authentication"** → **"Social Connections"**
2. Find **"Google"** in the list
3. Toggle **"Enable Google"** to **ON**

### Step 5.2: Configure Google OAuth

1. Click on **"Google"** to expand settings
2. You'll see two options:

#### Option A: Use Clerk's Google OAuth (Easiest - Recommended for MVP)

- Clerk provides a default Google OAuth setup
- No additional configuration needed
- Just enable it and it works!

#### Option B: Use Your Own Google OAuth (For Production)

If you want to use your own Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
6. Copy **Client ID** and **Client Secret**
7. Paste into Clerk's Google settings

**For MVP, use Option A (Clerk's default) - it works immediately!**

### Step 5.3: Save Google Settings

- Click **"Save"** after enabling Google

---

## 6. Set Up Redirect URLs

### Step 6.1: Navigate to Paths

1. In Clerk Dashboard, go to **"Paths"** in the left sidebar
2. This is where you configure redirect URLs

### Step 6.2: Configure After Sign-In URL

1. Find **"After sign-in"** field
2. Enter: `/discover`
   - This is where users go after successful login
3. Click **"Save"**

### Step 6.3: Configure After Sign-Up URL

1. Find **"After sign-up"** field
2. Enter: `/discover`
   - This is where new users go after sign-up
3. Click **"Save"**

### Step 6.4: Configure SSO Callback URL

1. Find **"Redirect URLs"** or **"Allowed redirect URLs"**
2. Add these URLs (one per line):
   ```
   http://localhost:3001/sso-callback
   http://localhost:3000/sso-callback
   ```
   - Add your production URL when ready:
   ```
   https://yourdomain.com/sso-callback
   ```

### Step 6.5: Save All Paths

- Click **"Save"** after adding all URLs

---

## 7. Configure Email Templates (Optional)

### Step 7.1: Customize Email Templates

1. Go to **"Email Templates"** in the left sidebar
2. You can customize:
   - **Email verification code** email
   - **Welcome email** (optional)
   - **Password reset** email (if using passwords)

### Step 7.2: Brand Your Emails

- Add your logo
- Customize colors to match ClubRadar brand
- Add custom text

**Note**: For MVP, default templates work fine. You can customize later.

---

## 8. Add Environment Variables

### Step 8.1: Open `.env.local` File

1. In your project root (`clubradar/`), open `.env.local`
2. If it doesn't exist, create it

### Step 8.2: Add Clerk Keys

Add these two lines to `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

**Replace** `pk_test_your_publishable_key_here` with your actual Publishable Key  
**Replace** `sk_test_your_secret_key_here` with your actual Secret Key

### Step 8.3: Example `.env.local`

Your complete `.env.local` should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_51AbC123...
CLERK_SECRET_KEY=sk_test_xyz789...

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 8.4: Restart Dev Server

After adding keys:

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

---

## 9. Test Your Setup

### Step 9.1: Test Email OTP Sign-Up

1. Go to `http://localhost:3001/signup`
2. Enter your email address
3. Click **"Send Verification Code"**
4. Check your email inbox
5. You should receive a 6-digit code
6. Enter the code
7. Click **"Verify & Create Account"**
8. You should be redirected to `/discover`

### Step 9.2: Test Email OTP Sign-In

1. Go to `http://localhost:3001/login`
2. Enter the same email
3. Click **"Send OTP"**
4. Check email for code
5. Enter code and verify
6. Should redirect to `/discover`

### Step 9.3: Test Google Sign-In

1. Go to `http://localhost:3001/login` or `/signup`
2. Click **"Continue with Google"** or **"Sign up with Google"**
3. You should be redirected to Google
4. Sign in with your Google account
5. Should redirect back to `/discover`

### Step 9.4: Check Clerk Dashboard

1. Go to Clerk Dashboard → **"Users"**
2. You should see your test user
3. Click on the user to see details

---

## 10. Troubleshooting

### ❌ "Missing publishableKey" Error

**Problem**: Clerk keys not found  
**Solution**:

1. Check `.env.local` has both keys
2. Make sure keys start with `pk_test_` and `sk_test_`
3. Restart dev server after adding keys
4. Check for typos in variable names

### ❌ "Invalid redirect URL" Error

**Problem**: Redirect URL not allowed  
**Solution**:

1. Go to Clerk Dashboard → **"Paths"**
2. Add your redirect URL to allowed list
3. Make sure URL matches exactly (including `http://` vs `https://`)

### ❌ OTP Not Received

**Problem**: Email not arriving  
**Solution**:

1. Check spam folder
2. Wait a few minutes (sometimes delayed)
3. Check Clerk Dashboard → **"Email Logs"** to see if email was sent
4. Try resending OTP

### ❌ Google Sign-In Not Working

**Problem**: Google OAuth fails  
**Solution**:

1. Make sure Google is enabled in Clerk Dashboard
2. Check redirect URLs are configured
3. Make sure you're using `oauth_google` strategy (already in code)
4. Check browser console for errors

### ❌ "User already exists" Error

**Problem**: Trying to sign up with existing email  
**Solution**:

- This is normal - use **"Sign In"** instead of **"Sign Up"**
- Or use a different email for testing

### ❌ Session Not Persisting

**Problem**: User logged out after refresh  
**Solution**:

1. Check `ClerkProvider` is wrapping your app (already done)
2. Check middleware is configured (already done)
3. Make sure cookies are enabled in browser

---

## ✅ Checklist

Use this checklist to ensure everything is set up:

- [ ] Clerk account created
- [ ] Application "ClubRadar" created
- [ ] API keys copied (Publishable + Secret)
- [ ] Keys added to `.env.local`
- [ ] Email authentication enabled
- [ ] Email strategy set to "Email code" (OTP)
- [ ] Google OAuth enabled
- [ ] Redirect URLs configured:
  - [ ] `http://localhost:3001/sso-callback`
  - [ ] After sign-in: `/discover`
  - [ ] After sign-up: `/discover`
- [ ] Dev server restarted
- [ ] Email OTP sign-up tested ✅
- [ ] Email OTP sign-in tested ✅
- [ ] Google sign-in tested ✅

---

## 🎯 Quick Reference

### Clerk Dashboard URLs

- **Dashboard**: https://dashboard.clerk.com
- **API Keys**: Dashboard → API Keys
- **Email Settings**: Dashboard → User & Authentication → Email, Phone, Username
- **Google Settings**: Dashboard → User & Authentication → Social Connections
- **Redirect URLs**: Dashboard → Paths

### Your App URLs

- **Sign Up**: `http://localhost:3001/signup`
- **Sign In**: `http://localhost:3001/login`
- **After Auth**: `http://localhost:3001/discover`
- **SSO Callback**: `http://localhost:3001/sso-callback`

### Environment Variables Needed

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 🚀 Next Steps After Setup

1. **Test all authentication flows**
2. **Customize email templates** (optional)
3. **Add more social providers** (optional - Facebook, GitHub, etc.)
4. **Set up production URLs** when deploying
5. **Configure custom domain** (for production)

---

## 📚 Additional Resources

- **Clerk Docs**: https://clerk.com/docs
- **Next.js Integration**: https://clerk.com/docs/quickstarts/nextjs
- **Email OTP Guide**: https://clerk.com/docs/authentication/email-otp
- **Google OAuth Guide**: https://clerk.com/docs/authentication/social-connections/google

---

## 💡 Pro Tips

1. **Use Test Mode**: Your keys start with `pk_test_` and `sk_test_` - this is test mode (free)
2. **Production Keys**: When ready for production, generate new keys with `pk_live_` and `sk_live_`
3. **User Management**: Use Clerk Dashboard to manage users, see analytics, etc.
4. **Email Limits**: Free tier includes email sending - check limits in dashboard
5. **Customization**: You can customize email templates, branding, etc. later

---

## ✅ You're All Set!

Once you complete these steps, your ClubRadar authentication will be fully working! 🎉

If you encounter any issues, check the Troubleshooting section or refer to Clerk's documentation.
