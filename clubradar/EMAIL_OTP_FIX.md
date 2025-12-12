# 🔧 Email OTP Fix Guide

## Problem
Supabase is sending **magic links** instead of **OTP codes** for email authentication.

## Why This Happens
Supabase's default email template sends magic links. To get OTP codes, we need to configure the email template.

---

## Solution: Configure Supabase Email Template

### Step 1: Go to Supabase Dashboard
1. Login to [https://app.supabase.com](https://app.supabase.com)
2. Select your project

### Step 2: Configure Email Template
1. Go to **Authentication** → **Email Templates**
2. Find **"OTP"** template (or create one)
3. Update the template to send OTP code

### Step 3: Alternative - Use Magic Link Flow
Since email OTP requires template configuration, we can use magic links which are easier:

**Magic Link Flow:**
1. User enters email
2. Clicks "Send OTP" (sends magic link)
3. User clicks link in email
4. Automatically logged in
5. Redirected back to app

---

## Quick Fix: Test with Email Magic Link

For now, the email will send a magic link. When user clicks it:
1. They'll be redirected to your app
2. Automatically logged in
3. Session created

**To test:**
1. Enter email and click "Send OTP"
2. Check email for magic link
3. Click the link
4. You'll be redirected and logged in

---

## For Phone OTP

Phone OTP requires SMS provider setup:
1. Go to **Authentication** → **Providers** → **Phone**
2. Enable phone provider
3. Configure SMS provider (Twilio, etc.)
4. Add credentials

**Note**: SMS requires paid service or Supabase SMS credits.

---

## Current Status

✅ **API Error Fixed** - Request body now properly formatted
✅ **Email Magic Link** - Will work (user clicks link)
⏳ **Email OTP** - Requires template configuration
⏳ **Phone OTP** - Requires SMS provider setup

---

## Recommendation

For development:
1. **Use Email Magic Link** - Works immediately, no setup needed
2. **Add Phone OTP Later** - When you have SMS provider

For production:
1. Configure email template for OTP codes
2. Set up SMS provider for phone OTP

---

**The API error is fixed. Try logging in with email - you'll get a magic link that you can click to login!** ✨

