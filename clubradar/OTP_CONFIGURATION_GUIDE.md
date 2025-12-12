# 🔧 OTP Configuration Guide

## Current Issues

### 1. Email: Getting Magic Link Instead of OTP
**Status**: Supabase sends magic links by default for email authentication.

### 2. Phone: "Unsupported phone provider" Error
**Status**: SMS provider not configured in Supabase.

---

## Solution 1: Configure Email OTP Template

To get OTP codes for email instead of magic links:

### Step 1: Go to Supabase Dashboard
1. Login to [https://app.supabase.com](https://app.supabase.com)
2. Select your project

### Step 2: Configure Email Template
1. Go to **Authentication** → **Email Templates**
2. Find **"OTP"** template
3. If it doesn't exist, you may need to:
   - Use magic links (current behavior), OR
   - Set up custom email service

### Step 3: Alternative - Use Magic Link Flow
Since email OTP requires template configuration, we can:
1. Use magic links (easier, works now)
2. User clicks link → automatically logged in
3. No OTP code needed

---

## Solution 2: Configure Phone SMS Provider

To enable phone OTP:

### Step 1: Go to Supabase Dashboard
1. Login to [https://app.supabase.com](https://app.supabase.com)
2. Select your project

### Step 2: Enable Phone Provider
1. Go to **Authentication** → **Providers**
2. Click on **"Phone"** provider
3. Enable **"Enable phone provider"**

### Step 3: Configure SMS Provider
You need to set up one of these:

**Option A: Twilio (Recommended)**
1. Sign up for [Twilio](https://www.twilio.com)
2. Get Account SID and Auth Token
3. Add to Supabase Phone provider settings

**Option B: Supabase SMS (If Available)**
1. Check if your plan includes SMS
2. Configure in Supabase settings

**Option C: Other SMS Providers**
- MessageBird
- Vonage
- AWS SNS

### Step 4: Add Credentials
1. In Supabase Phone provider settings:
   - Add Twilio Account SID
   - Add Twilio Auth Token
   - Add Twilio Phone Number
2. Save settings

---

## Quick Fix: Use Email Magic Link for Now

Since phone SMS requires setup, use email magic link:

1. **Enter email** → Click "Send OTP"
2. **Check email** → Click "Confirm your mail" link
3. **Automatically logged in** → No OTP code needed

This works immediately, no configuration needed!

---

## Recommended Approach

### For Development (Now):
✅ **Use Email Magic Link** - Works immediately
⏳ **Skip Phone OTP** - Requires SMS setup

### For Production (Later):
1. Configure email OTP template (optional)
2. Set up SMS provider for phone OTP
3. Or use email magic link (simpler)

---

## Testing

### Test Email Magic Link:
1. Go to `/login`
2. Select "Email" tab
3. Enter your email
4. Click "Send OTP"
5. Check email for magic link
6. Click the link
7. You should be automatically logged in

### Test Phone OTP (After Setup):
1. Configure SMS provider first
2. Go to `/login`
3. Select "Phone" tab
4. Enter phone number
5. Click "Send OTP"
6. Check SMS for OTP code
7. Enter code and verify

---

## Cost Considerations

- **Email Magic Link**: Free (included in Supabase)
- **Email OTP**: Free (but requires template config)
- **Phone OTP/SMS**: Requires paid SMS service (Twilio ~$0.0075 per SMS)

---

## Summary

**Current Status:**
- ✅ Email Magic Link: **Working** (click link to login)
- ❌ Email OTP: **Needs template config**
- ❌ Phone OTP: **Needs SMS provider setup**

**Recommendation:**
- Use **Email Magic Link** for now (works immediately)
- Add **Phone OTP** later when you have SMS provider

---

**The magic link flow works great! Just click the link in your email to login.** ✨

