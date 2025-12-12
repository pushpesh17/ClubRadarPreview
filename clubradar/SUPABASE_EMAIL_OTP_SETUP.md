# 📧 Supabase Email OTP Setup

## Problem
Supabase is sending **magic links** instead of **OTP codes** for email authentication.

## Solution
We need to configure Supabase to send OTP codes instead of magic links.

---

## Step 1: Configure Email Templates in Supabase

1. **Go to Supabase Dashboard**
   - Login to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to Authentication Settings**
   - Click **"Authentication"** in left sidebar
   - Click **"Email Templates"** tab

3. **Find "OTP" Template**
   - Look for **"OTP"** or **"One-Time Password"** template
   - If it doesn't exist, Supabase might be using magic links by default

4. **Enable OTP for Email** (Alternative Method)
   - Go to **"Authentication"** → **"Providers"**
   - Click on **"Email"** provider
   - Make sure **"Enable email provider"** is ON
   - Look for **"Confirm email"** option
   - We'll use API configuration instead (see below)

---

## Step 2: Update API Route (Already Done)

The API route has been updated to properly handle email OTP requests. However, Supabase's default behavior for email is to send magic links.

---

## Step 3: Use Magic Link Flow (Recommended for Email)

Since Supabase's email OTP requires additional configuration, we have two options:

### Option A: Use Magic Link for Email (Easier)
- User clicks link in email
- Automatically logs in
- No OTP code needed

### Option B: Configure Custom Email Template (Advanced)
- Requires custom email service (SendGrid, AWS SES, etc.)
- More complex setup

---

## Step 4: Update Login Flow for Email Magic Link

If we use magic links for email:

1. User enters email
2. Clicks "Send OTP" (actually sends magic link)
3. User clicks link in email
4. Automatically redirected back to app
5. User is logged in

---

## Current Implementation

The current code sends OTP requests, but Supabase may respond with magic links for email. 

**For Phone**: OTP should work if SMS is configured.

**For Email**: We may need to:
1. Use magic link flow, OR
2. Configure custom email service for OTP

---

## Quick Fix: Test with Phone First

Since phone OTP might work better:
1. Use phone authentication for now
2. We can add email magic link flow later

---

## Alternative: Use Email Magic Link

We can modify the login flow to:
1. Send magic link for email
2. User clicks link
3. Automatically logged in
4. Redirected back to app

Would you like me to implement the magic link flow for email?

---

## SMS Configuration (For Phone OTP)

To enable phone OTP:
1. Go to **Authentication** → **Providers** → **Phone**
2. Enable phone provider
3. Configure SMS provider (Twilio, etc.)
4. Add credentials

**Note**: SMS requires paid service (Twilio, etc.) or Supabase SMS credits.

---

## Recommendation

For now, let's:
1. ✅ Fix the API error (already done)
2. ✅ Use email magic link flow (easier)
3. ⏭️ Add phone OTP later (requires SMS setup)

Let me know if you want me to implement the magic link flow!

