# Where to Find Redirect URLs in Clerk

## Good News! ✅

You've already configured the important parts:
- ✅ SignIn is set to development host: `/login`
- ✅ SignUp is set to development host: `/signup`

Now you just need to find where to add the **allowed redirect URLs**.

---

## Where Redirect URLs Are Located

In newer versions of Clerk, redirect URLs are **NOT** in the "Paths" section. They're usually in one of these places:

### Option 1: In the "Domains" Section (Most Likely)

1. In the **left sidebar**, under **"<> Developers"**, click on **"Domains"**
2. You should see your domain listed (or the DNS Configuration you saw earlier)
3. Click on your domain name
4. Look for a section called:
   - **"Allowed redirect URLs"**
   - **"Redirect URLs"**
   - **"Frontend API redirect URLs"**
   - **"Allowed origins"**
5. Add these URLs there:
   ```
   https://clubradar.in/**
   https://www.clubradar.in/**
   https://clubradar.in/sso-callback
   https://www.clubradar.in/sso-callback
   https://clubradar.in/discover
   ```

### Option 2: In "Frontend API" Settings

1. In the **left sidebar**, under **"<> Developers"**, look for **"Frontend API"**
2. Click on it
3. Look for **"Allowed redirect URLs"** or **"Redirect URLs"** section
4. Add the URLs listed above

### Option 3: In "Settings" → "Sessions"

1. In the **left sidebar**, look for **"Settings"**
2. Click on it
3. Look for **"Sessions"** or **"Redirect URLs"** section
4. Add the URLs there

### Option 4: Automatic (If Domain is Configured)

If your domain `clubradar.in` is already configured and showing "Active" in DNS Configuration:
- Clerk **might automatically allow** redirects to that domain
- But it's safer to explicitly add them

---

## Step-by-Step: Finding Redirect URLs

### Step 1: Check Domains Section
1. Click **"Domains"** in the left sidebar (under Developers)
2. If you see your domain listed, **click on it**
3. Look for redirect URL settings
4. If you find them, add the URLs above

### Step 2: If Not in Domains, Check Frontend API
1. Click **"Frontend API"** in the left sidebar
2. Look for redirect URL settings
3. Add the URLs

### Step 3: Check Settings
1. Click **"Settings"** in the left sidebar
2. Look for **"Sessions"**, **"Security"**, or **"Redirect URLs"**
3. Add the URLs if you find the section

---

## What URLs to Add

Add these exact URLs (one per line or separated by commas, depending on the interface):

```
https://clubradar.in/**
https://www.clubradar.in/**
https://clubradar.in/sso-callback
https://www.clubradar.in/sso-callback
https://clubradar.in/discover
https://www.clubradar.in/discover
```

**Important:** The `**` wildcard allows all paths under that domain.

---

## Alternative: Check Your Current Configuration

Since your DNS Configuration shows "Active", redirect URLs might already be configured. Let's verify:

### Test Without Adding URLs First

1. **Update Vercel environment variables** (see below)
2. **Redeploy your application**
3. **Test login** at `https://clubradar.in/login`
4. If it works, redirect URLs are already configured!
5. If you get a "Redirect URL not allowed" error, then you need to add them

---

## Most Important: Update Vercel Environment Variables

Even if you can't find redirect URLs, make sure Vercel has the correct settings:

### Step 1: Go to Vercel
1. Open: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Go to **"Settings"** → **"Environment Variables"**

### Step 2: Add/Update These Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
CLERK_SECRET_KEY=sk_live_... (or sk_test_...)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

### Step 3: Get Your Clerk Keys
1. In Clerk Dashboard, go to **"<> Developers"** → **"API Keys"**
2. Copy your **Publishable Key** and **Secret Key**
3. Paste them into Vercel

### Step 4: Redeploy
1. After updating environment variables, **redeploy** your application
2. Go to **"Deployments"** → Click **"..."** → **"Redeploy"**

---

## Quick Action Plan

1. ✅ **You've already done this**: Set SignIn to `/login` and SignUp to `/signup` in Paths
2. **Next**: Try to find "Domains" in the left sidebar and check for redirect URLs there
3. **Also**: Update Vercel environment variables (very important!)
4. **Then**: Redeploy and test

---

## If You Still Can't Find Redirect URLs

**Option 1: Test First**
- Update Vercel environment variables
- Redeploy
- Test login
- If it works, you don't need to add redirect URLs manually

**Option 2: Contact Clerk Support**
- If you get "Redirect URL not allowed" errors
- Take a screenshot of what you see in "Domains"
- Contact Clerk support through their dashboard

**Option 3: Check Clerk Documentation**
- Go to: https://clerk.com/docs
- Search for "redirect URLs" or "allowed redirect URLs"
- The documentation will show the exact location in your Clerk version

---

## Summary

You've configured the Paths correctly! Now:
1. Look for **"Domains"** in the left sidebar → Click on your domain → Find redirect URLs
2. Or look for **"Frontend API"** → Find redirect URLs
3. **Most importantly**: Update Vercel environment variables
4. Redeploy and test

The redirect URLs might already be working if your domain is configured correctly!

