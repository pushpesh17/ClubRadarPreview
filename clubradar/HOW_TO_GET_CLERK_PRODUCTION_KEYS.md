# How to Get Clerk Production Keys (pk*live* and sk*live*)

## Overview

For your production domain (clubradar.in), you need **production keys** from Clerk:

- `pk_live_...` - Publishable key
- `sk_live_...` - Secret key

---

## Step-by-Step Guide

### Step 1: Go to Clerk Dashboard

1. Visit: https://dashboard.clerk.com
2. Log in with your Clerk account
3. Select your **ClubRadar** application

### Step 2: Navigate to API Keys

1. In the **left sidebar**, look for **"<> Developers"** section
2. Click on **"API Keys"**
3. You should see a page with your API keys

### Step 3: Check What Keys You Have

You'll see one of two scenarios:

#### Scenario A: You See Both Test and Production Keys

If you see both sections:

- **Test mode keys** (for development)
  - Publishable key: `pk_test_...`
  - Secret key: `sk_test_...`
- **Production mode keys** (for production) ✅
  - Publishable key: `pk_live_...` ← **Copy this**
  - Secret key: `sk_live_...` ← **Copy this**

**Action:** Copy the production keys (`pk_live_` and `sk_live_`)

#### Scenario B: You Only See Test Keys

If you only see test keys:

- This means **production mode is not enabled** yet
- You need to enable it first

**To enable production mode:**

1. Look for a toggle, button, or banner that says:

   - **"Enable Production"**
   - **"Switch to Production"**
   - **"Upgrade to Production"**
   - Or similar

2. Click it to enable production mode

3. After enabling, you'll see the production keys appear:

   - `pk_live_...`
   - `sk_live_...`

4. Copy these keys

---

## Step 4: Copy the Keys

Once you see the production keys:

1. **Publishable Key** (`pk_live_...`):

   - Click the **copy icon** next to it
   - Or select and copy the entire key
   - This goes into: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

2. **Secret Key** (`sk_live_...`):
   - Click the **copy icon** next to it
   - Or select and copy the entire key
   - This goes into: `CLERK_SECRET_KEY`
   - ⚠️ **Keep this secret!** Don't share it publicly

---

## Step 5: Add to Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Go to **Settings** → **Environment Variables**
4. Add or update:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here
```

5. Make sure to select **"Production"** environment
6. Click **"Save"**
7. **Redeploy** your application

---

## Key Differences

| Key Type       | Prefix                  | Use For     | When to Use        |
| -------------- | ----------------------- | ----------- | ------------------ |
| **Test**       | `pk_test_` / `sk_test_` | Development | localhost, testing |
| **Production** | `pk_live_` / `sk_live_` | Live site   | clubradar.in       |

---

## Troubleshooting

### Issue: I Don't See Production Keys

**Possible reasons:**

1. Production mode is not enabled
2. You're on a free plan (some plans require upgrade)
3. You're looking in the wrong section

**Solutions:**

1. Look for "Enable Production" button/toggle
2. Check if you need to upgrade your Clerk plan
3. Make sure you're in **"API Keys"** section, not "Webhooks" or other sections

### Issue: Production Keys Not Working

**Check:**

1. Did you copy the **entire key**? (They're long)
2. Did you add them to Vercel **environment variables**?
3. Did you **redeploy** after adding them?
4. Are you using them in the **Production** environment in Vercel?

### Issue: Still Using Test Keys

**If you're using test keys in production:**

- Authentication might work, but you'll have limitations
- Some features might not work correctly
- You should switch to production keys for your live domain

---

## Quick Checklist

- [ ] Logged into Clerk Dashboard
- [ ] Navigated to Developers → API Keys
- [ ] Found production keys (`pk_live_` and `sk_live_`)
- [ ] Copied both keys
- [ ] Added to Vercel environment variables
- [ ] Selected "Production" environment in Vercel
- [ ] Redeployed application

---

## Example: What the Keys Look Like

**Publishable Key:**

```
pk_live_

**Secret Key:**

```
sk_live_
```

**Note:** These are example formats. Your actual keys will be different and longer.

---

## Security Notes

⚠️ **Important:**

- **Publishable key** (`pk_live_`) - Safe to expose in frontend code
- **Secret key** (`sk_live_`) - **NEVER** expose this! Only use in server-side code
- Don't commit secret keys to Git
- Vercel encrypts environment variables, so they're safe there

---

## Need Help?

If you can't find the production keys:

1. Check Clerk's documentation: https://clerk.com/docs
2. Contact Clerk support through their dashboard
3. Check if your Clerk plan supports production mode

---

## Summary

1. ✅ Go to Clerk Dashboard → Developers → API Keys
2. ✅ Enable production mode (if not already enabled)
3. ✅ Copy `pk_live_...` and `sk_live_...` keys
4. ✅ Add to Vercel environment variables
5. ✅ Redeploy

That's it! Your production keys are now set up. 🎉
