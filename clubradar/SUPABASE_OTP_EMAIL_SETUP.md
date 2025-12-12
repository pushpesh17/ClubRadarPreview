# 📧 Supabase Email OTP Setup Guide

## Problem
Supabase sends **magic links** by default, but we want **OTP codes** that users can enter.

## Solution
Configure Supabase email template to send OTP codes instead of magic links.

---

## Step 1: Configure Email Template in Supabase

### Option A: Use Default OTP Template (If Available)

1. **Go to Supabase Dashboard**
   - Login to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to Email Templates**
   - **Authentication** → **Email Templates** tab

3. **Find OTP Template**
   - Look for **"OTP"** or **"One-Time Password"** template
   - If it exists, make sure it's enabled

### Option B: Create Custom OTP Template

If OTP template doesn't exist, you need to configure it:

1. **Go to Email Templates**
   - **Authentication** → **Email Templates**

2. **Create/Edit Template**
   - Supabase uses magic links by default
   - To get OTP codes, you may need to:
     - Use a custom email service, OR
     - Configure the template manually

---

## Step 2: Alternative - Use Supabase's Built-in OTP

Actually, Supabase **does support OTP codes**! The issue is that by default it sends magic links.

### How to Get OTP Codes:

1. **Don't set `emailRedirectTo`** in the API call (already done ✅)
2. **Configure Email Template** in Supabase to send OTP

### But Wait - There's a Simpler Way!

Supabase's free tier **does send OTP codes** when you:
- Don't set `emailRedirectTo` 
- Use the correct email template

However, the email template needs to be configured to show the OTP code.

---

## Step 3: Check Your Email

When you request OTP, check your email. You should see:

**If OTP is working:**
```
Your OTP code is: 123456
```

**If magic link (current):**
```
Confirm your signup - Follow this link...
```

---

## Step 4: Configure Supabase Email Template

### Method 1: Use Supabase Dashboard

1. **Authentication** → **Email Templates**
2. Find **"OTP"** template
3. Edit it to show the OTP code clearly
4. Save

### Method 2: Use API (Advanced)

You can customize the email template via Supabase API, but this is more complex.

---

## Current Implementation

The code is now set up for OTP:
- ✅ Sends OTP request (no `emailRedirectTo`)
- ✅ User enters 6-digit code
- ✅ Verifies OTP code
- ✅ Logs in user

**But**: Supabase needs to be configured to send OTP codes in the email template.

---

## Quick Test

1. Request OTP from your app
2. Check your email
3. **If you see a 6-digit code** → OTP is working! ✅
4. **If you see a magic link** → Need to configure email template

---

## If OTP Codes Don't Appear in Email

This means Supabase is still sending magic links. Options:

### Option 1: Configure Email Template (Recommended)
- Edit the email template in Supabase dashboard
- Make it show OTP code instead of magic link

### Option 2: Use Magic Link (Easier for Now)
- Keep using magic links
- User clicks link → automatically logged in
- No code entry needed

### Option 3: Custom Email Service (Advanced)
- Use SendGrid, AWS SES, etc.
- Send OTP codes via custom service
- More complex setup

---

## Recommendation

For now:
1. **Test if OTP codes appear** in your email
2. **If yes** → Great! Everything works
3. **If no** → Configure email template OR use magic links

---

## Next Steps

1. Request OTP from app
2. Check email for OTP code
3. If code appears → Enter it and login
4. If link appears → We need to configure template

**The code is ready for OTP - we just need Supabase to send the codes!** ✨

