# 🔐 Complete Supabase Authentication Setup Guide

This guide will walk you through setting up authentication in Supabase from scratch.

---

## Step 1: Access Authentication Settings

1. **Go to Supabase Dashboard**

   - Login to [https://app.supabase.com](https://app.supabase.com)
   - Select your project (`clubradar`)

2. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"** (🔐 icon)
   - You'll see several tabs: Users, Policies, Providers, Email Templates, etc.

---

## Step 2: Configure Email Provider (Required for Email Login)

1. **Go to Providers Tab**

   - Click **"Providers"** in the Authentication section
   - You'll see a list of authentication providers

2. **Enable Email Provider**

   - Find **"Email"** in the list
   - Click on it to expand settings
   - Make sure **"Enable email provider"** toggle is **ON** (should be ON by default)
   - **"Confirm email"** - You can leave this ON or OFF:
     - **ON**: User must click email link to confirm (recommended)
     - **OFF**: User can login immediately

3. **Email Settings** (Optional)

   - **"Secure email change"**: Leave ON (recommended)
   - **"Double confirm email changes"**: Leave ON (recommended)

4. **Save Settings**
   - Click **"Save"** button at the bottom

✅ **Email authentication is now enabled!**

---

## Step 3: Configure Phone Provider (Optional - For Phone OTP)

Phone OTP requires an SMS provider. Here's how to set it up:

### Option A: Use Twilio (Recommended)

1. **Sign Up for Twilio** (if you don't have account)

   - Go to [https://www.twilio.com](https://www.twilio.com)
   - Click **"Sign up"** (free trial available)
   - Complete signup and verify your account

2. **Get Twilio Credentials**

   - Login to Twilio Console: [https://console.twilio.com](https://console.twilio.com)
   - Go to **Dashboard**
   - Copy these values:
     - **Account SID** (starts with `AC...`)
     - **Auth Token** (click to reveal)
   - Go to **Phone Numbers** → **Manage** → **Active numbers**
   - Copy your **Phone Number** (format: +1XXXXXXXXXX)

3. **Configure in Supabase**
   - Go back to Supabase Dashboard
   - **Authentication** → **Providers** → **Phone**
   - Enable **"Enable phone provider"** toggle
   - Fill in Twilio credentials:
     - **Twilio Account SID**: Paste your Account SID
     - **Twilio Auth Token**: Paste your Auth Token
     - **Twilio Phone Number**: Paste your phone number (with country code)
   - Click **"Save"**

✅ **Phone authentication is now enabled!**

### Option B: Use Supabase SMS (If Available)

Some Supabase plans include SMS credits:

1. Go to **Authentication** → **Providers** → **Phone**
2. Enable **"Enable phone provider"**
3. Check if **"Use Supabase SMS"** option is available
4. If available, enable it (no external service needed)

---

## Step 4: Configure Email Templates (Optional - For OTP Codes)

By default, Supabase sends **magic links** for email. To get **OTP codes**:

1. **Go to Email Templates**

   - **Authentication** → **Email Templates** tab
   - You'll see templates: "Confirm signup", "Magic Link", "Change Email Address", etc.

2. **Find or Create OTP Template**

   - Look for **"OTP"** or **"One-Time Password"** template
   - If it doesn't exist, Supabase uses magic links by default

3. **Note**:
   - Magic links work great and are simpler
   - OTP codes require custom email template configuration
   - For now, **magic links are recommended** (easier, works immediately)

---

## Step 5: Configure Site URL (Important!)

This is crucial for magic links to work:

1. **Go to Authentication Settings**

   - **Authentication** → **URL Configuration** (or **Settings** tab)

2. **Set Site URL**

   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add these:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`
     - (For production, add your production URL)

3. **Save Settings**

✅ **Magic links will now redirect back to your app!**

---

## Step 6: Test Authentication

### Test Email Login:

1. Go to your app: `http://localhost:3000/login`
2. Select **"Email"** tab
3. Enter your email
4. Click **"Send OTP"**
5. Check email for magic link
6. Click the link
7. You should be redirected and logged in!

### Test Phone Login (After SMS Setup):

1. Go to your app: `http://localhost:3000/login`
2. Select **"Phone"** tab
3. Enter phone number
4. Click **"Send OTP"**
5. Check SMS for OTP code
6. Enter code and verify

---

## Step 7: Verify Setup

### Checklist:

- [ ] Email provider enabled
- [ ] Site URL configured (`http://localhost:3000`)
- [ ] Redirect URLs added
- [ ] Phone provider enabled (optional)
- [ ] SMS provider configured (if using phone)
- [ ] Tested email login
- [ ] Tested phone login (if enabled)

---

## Common Issues & Solutions

### Issue 1: "Invalid redirect URL"

**Solution**: Add your URL to **Redirect URLs** in Authentication settings

### Issue 2: "Email not sending"

**Solution**:

- Check email provider is enabled
- Check spam folder
- Verify Site URL is correct

### Issue 3: "Phone OTP not working"

**Solution**:

- Verify SMS provider is configured
- Check Twilio credentials are correct
- Ensure phone number format is correct (+91XXXXXXXXXX)

### Issue 4: "Magic link not redirecting"

**Solution**:

- Check Site URL is set correctly
- Verify Redirect URLs include your app URL
- Check browser console for errors

---

## Quick Setup Summary

### Minimum Setup (Email Only):

1. ✅ Enable Email provider (usually already enabled)
2. ✅ Set Site URL: `http://localhost:3000`
3. ✅ Add Redirect URLs
4. ✅ Done! Email magic link works

### Full Setup (Email + Phone):

1. ✅ Enable Email provider
2. ✅ Set Site URL and Redirect URLs
3. ✅ Sign up for Twilio
4. ✅ Get Twilio credentials
5. ✅ Enable Phone provider in Supabase
6. ✅ Add Twilio credentials
7. ✅ Done! Both email and phone work

---

## Cost Information

- **Email Authentication**: ✅ **Free** (included in Supabase)
- **Phone/SMS Authentication**: 💰 **Paid** (Twilio ~$0.0075 per SMS)

**Recommendation**: Use email for development, add phone later for production.

---

## Next Steps

After setting up authentication:

1. ✅ Test email login (magic link)
2. ✅ Test phone login (if configured)
3. ⏭️ Continue with other integrations (events, bookings, etc.)

---

## Need Help?

If you get stuck:

1. Check Supabase dashboard for error messages
2. Verify all settings are saved
3. Check browser console for errors
4. Review Supabase documentation: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

---

**Follow these steps and your authentication will be fully configured!** 🚀
