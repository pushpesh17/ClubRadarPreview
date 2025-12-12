# 🔧 Clerk Email OTP Troubleshooting Guide

## Problem: Can't Receive Email OTP

If you're unable to receive email OTP on `bodadesneha2020@gmail.com` or any other email, follow these steps:

---

## Step 1: Check Clerk Dashboard Settings

### 1.1 Verify Email Provider is Enabled

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"User & Authentication"** → **"Email, Phone, Username"**
4. Ensure **"Email address"** is enabled
5. Check that **"Email code"** (OTP) is enabled under authentication methods

### 1.2 Check Email Domain Restrictions

1. Go to **"User & Authentication"** → **"Restrictions"**
2. Check if there are any **blocked email domains** or **allowed email domains**
3. If `gmail.com` is blocked, remove it from the blocklist
4. If there's an allowlist, make sure `gmail.com` is included

### 1.3 Verify Rate Limiting

1. Go to **"User & Authentication"** → **"Rate Limits"**
2. Check if email OTP requests are being rate-limited
3. If you've sent too many requests, wait 15-30 minutes before trying again
4. Consider increasing rate limits for development

---

## Step 2: Check Email Delivery

### 2.1 Check Spam/Junk Folder

- **Gmail**: Check "Spam" folder
- **Other providers**: Check "Junk" or "Spam" folder
- Sometimes emails are delayed by a few minutes

### 2.2 Check Email Provider Status

- Gmail might be blocking Clerk emails
- Check if Gmail has any security alerts
- Try a different email provider to test

### 2.3 Verify Email Address

- Make sure the email is typed correctly: `bodadesneha2020@gmail.com`
- Check for typos or extra spaces
- Try copying and pasting the email directly

---

## Step 3: Check Clerk Configuration

### 3.1 Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3.2 Check Clerk Instance Status

1. Go to Clerk Dashboard → **"Settings"** → **"Instance"**
2. Verify your instance is active
3. Check if there are any service alerts

---

## Step 4: Test with Different Email

### 4.1 Try Another Email Address

1. Try a different Gmail account
2. Try a non-Gmail email (e.g., Outlook, Yahoo)
3. This helps identify if it's email-specific or a general issue

### 4.2 Check Console Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try sending OTP
4. Look for any error messages
5. Check **Network** tab for failed API requests

---

## Step 5: Clerk Free Tier Limitations

### 5.1 Check Your Plan

- **Free Tier**: Limited to 10,000 MAU (Monthly Active Users)
- **Free Tier**: May have rate limits on email sending
- Check your usage in Clerk Dashboard

### 5.2 Email Sending Limits

- Free tier may have daily email sending limits
- If you've exceeded the limit, emails won't be sent
- Wait 24 hours or upgrade your plan

---

## Step 6: Common Solutions

### Solution 1: Wait and Retry

1. Wait 15-30 minutes
2. Clear browser cache
3. Try again with the same email

### Solution 2: Use Google Sign-In Instead

If email OTP isn't working, use Google OAuth:
1. Click "Continue with Google" button
2. Sign in with your Google account
3. This bypasses email OTP

### Solution 3: Check Clerk Email Templates

1. Go to Clerk Dashboard → **"User & Authentication"** → **"Email Templates"**
2. Find **"Email code"** template
3. Verify it's enabled and properly configured
4. Check the email content

### Solution 4: Contact Clerk Support

If nothing works:
1. Go to [Clerk Support](https://clerk.com/support)
2. Provide:
   - Your Clerk instance ID
   - Email address that's not working
   - Error messages from console
   - Screenshots if possible

---

## Step 7: Debug Steps

### 7.1 Enable Debug Logging

Add this to your login page temporarily:

```typescript
console.log("Sending OTP to:", email);
console.log("Clerk loaded:", isLoaded);
console.log("SignIn object:", signIn);
```

### 7.2 Check Network Requests

1. Open DevTools → **Network** tab
2. Filter by "clerk" or "api"
3. Try sending OTP
4. Look for:
   - Failed requests (red)
   - Error responses
   - Status codes (400, 500, etc.)

### 7.3 Check Clerk Dashboard Logs

1. Go to Clerk Dashboard → **"Logs"**
2. Filter by "email" or "otp"
3. Look for error messages
4. Check timestamps

---

## Quick Checklist

- [ ] Email provider enabled in Clerk
- [ ] Email code (OTP) enabled in Clerk
- [ ] No email domain restrictions
- [ ] Not rate-limited
- [ ] Checked spam folder
- [ ] Email address is correct
- [ ] Environment variables are set
- [ ] Clerk instance is active
- [ ] Tried different email
- [ ] Checked console for errors
- [ ] Checked Network tab for failed requests

---

## Alternative: Use Google Sign-In

If email OTP continues to fail, use Google OAuth:

1. Click **"Continue with Google"** on login page
2. Sign in with your Google account
3. Automatically creates account and logs you in
4. No email OTP needed

---

## Still Not Working?

1. **Check Clerk Status**: [status.clerk.com](https://status.clerk.com)
2. **Contact Support**: [clerk.com/support](https://clerk.com/support)
3. **Check Documentation**: [clerk.com/docs](https://clerk.com/docs)

---

## For Development: Use Test Mode

If you're in development:

1. Clerk Test Mode has relaxed rate limits
2. Make sure you're using test keys (`pk_test_...`, `sk_test_...`)
3. Check that your localhost URL is whitelisted in Clerk

---

## Email-Specific Issues

### Gmail Issues

- Gmail may delay or block Clerk emails
- Check "All Mail" folder, not just Inbox
- Check Gmail security settings
- Try adding Clerk to contacts

### Other Providers

- Some email providers block automated emails
- Check provider's spam filters
- Whitelist Clerk's email domain

---

## Next Steps

1. Try the solutions above in order
2. If still not working, use Google Sign-In as alternative
3. Contact Clerk support with specific error details

