# Email Setup Guide - Booking Confirmation Emails

This guide will help you set up email notifications for booking confirmations using Resend.

## Quick Start (No Domain Required) 🚀

**You can start sending emails immediately without a custom domain!** Just follow these steps:

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "ClubRadar Production")
5. Copy the API key (you'll only see it once!)

### Step 3: Configure Environment Variables

Add these to your `.env.local` file (for local development) and **Vercel Environment Variables** (for production):

#### For Local Development:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="ClubRadar <onboarding@resend.dev>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### For Production (Vercel):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="ClubRadar <onboarding@resend.dev>"
NEXT_PUBLIC_APP_URL=https://club-radarpublic-v8hg.vercel.app
```

**That's it!** Your emails will work immediately. No DNS setup needed! ✅

---

## Adding Your Own Domain Later (Optional) 🔐

When you're ready to use your own domain (e.g., `clubradar.in`), follow these steps:

### Step 1: Add Domain in Resend

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `clubradar.in` - just the domain, not the full URL)
4. Resend will show you DNS records to add

### Step 2: Get DNS Records from Resend

After adding your domain, Resend will display a list of DNS records. You'll typically see:

- **2-4 TXT records** (for SPF and DKIM authentication)
- Sometimes a **CNAME** record

Each record will show:

- **Name/Host** (e.g., `@`, `resend._domainkey`, etc.)
- **Type** (TXT, CNAME)
- **Value** (a long string that Resend provides)

**Example of what you'll see:**

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

### Step 3: Add DNS Records to Your Domain Provider

Go to your domain provider's DNS settings (where you bought the domain):

**Popular Providers:**

- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record
- **Hostinger**: DNS Zone Editor → Add Record
- **Cloudflare**: DNS → Add Record

For each record Resend shows:

1. Click "Add Record" or "Add DNS Record"
2. Select the **Type** (TXT, CNAME, etc.)
3. Enter the **Name/Host** exactly as shown
4. Paste the **Value** exactly as shown
5. Save/Apply changes

### Step 4: Verify Domain in Resend

1. Go back to Resend → **Domains**
2. Click **Verify** next to your domain
3. Wait for verification (usually 5-30 minutes, can take up to 24 hours)
4. Status will change to "Verified" ✅

### Step 5: Update Environment Variables

Once verified, update your environment variables:

```env
RESEND_FROM_EMAIL="ClubRadar <noreply@clubradar.in>"
```

**Important:** Use quotes around the email because of the space and `< >` characters!

## Step 4: Test the Email Functionality

1. Make a test booking on your app
2. Check the user's email inbox (and spam folder)
3. You should receive a beautifully formatted booking confirmation email with:
   - Booking details
   - QR code for entry
   - Event information
   - Venue details

**Note:** If using `onboarding@resend.dev`, emails might go to spam initially. This is normal and will improve once you verify your own domain.

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is correct in `.env.local`
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` is valid
3. **Check Console Logs**: Look for email-related errors in server logs
4. **Resend Dashboard**: Check the Resend dashboard for delivery status and errors

### Email Going to Spam

**If using `onboarding@resend.dev` (no custom domain):**

- This is normal - Resend's default domain may have lower deliverability
- Emails might land in spam initially
- Users can mark as "Not Spam" to improve future delivery
- **Solution:** Verify your own domain (see "Adding Your Own Domain Later" section above)

**If using your own domain:**

1. **Verify Domain**: Ensure domain is verified in Resend dashboard
2. **SPF/DKIM Records**: Ensure all DNS records are correctly configured
3. **Email Content**: Avoid spam trigger words in email content
4. **Check Resend Dashboard**: Look for delivery issues or bounces

### Development vs Production

- **Development/Testing**: Use `onboarding@resend.dev` (works immediately, no setup needed)
- **Production (Current)**: Can use `onboarding@resend.dev` (works fine, may have spam issues)
- **Production (Recommended)**: Use your verified domain (best deliverability, professional)

## Email Template

The booking confirmation email includes:

- ✅ Booking ID
- ✅ Event name and details
- ✅ Date and time
- ✅ Venue information
- ✅ Number of people
- ✅ Total amount
- ✅ QR code for entry
- ✅ Important instructions

## Resend Free Tier Limits

- **3,000 emails/month**
- **100 emails/day**
- Perfect for development and small-scale production
- Works with `onboarding@resend.dev` (no domain verification needed)
- Upgrade to paid plan for higher limits and better deliverability

## Upgrade to Paid Plan

If you need more emails:

1. Go to Resend dashboard
2. Navigate to **Billing**
3. Choose a plan that fits your needs

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
