# Clerk Domain Setup - Fixed Guide for Your Dashboard

## What You're Seeing

You're in the Clerk Dashboard and seeing:
- **Configure** tab (active)
- **Satellites** tab
- **Add-on** tab
- **DNS Configuration** showing "Active" and "The domain is functioning correctly"

This means a domain is already configured, but you need to set it up for `clubradar.in`.

---

## Step 1: Check the Satellites Tab

### 1.1 Click on "Satellites" Tab
1. In the top navigation bar, click on **"Satellites"** (next to "Configure")
2. This is where Clerk manages custom domains
3. You should see your current domain configuration here

### 1.2 What to Look For
- You might see your old Vercel domain (`club-radarpublic-v8hg.vercel.app`)
- Or you might see `clubradar.in` already listed
- Or you might see no domains listed

### 1.3 Add Your New Domain

**If you see a list of domains:**
1. Look for a **"Create Satellite"**, **"Add Satellite"**, or **"+"** button
2. Click it
3. Enter: `clubradar.in`
4. Follow the DNS setup instructions

**If you see your old domain:**
1. Click on it to edit
2. Change it to `clubradar.in`
3. Or create a new satellite for `clubradar.in`

**If you see nothing or just configuration options:**
1. Look for a button like **"Create Satellite"**, **"Add Custom Domain"**, or **"New Satellite"**
2. Click it
3. Enter your domain: `clubradar.in`

---

## Step 2: Set Up DNS Records (If Required)

### 2.1 Clerk Will Show You DNS Instructions
After adding the domain, Clerk will display:
- What DNS records to add
- Where to add them (in your domain registrar - GoDaddy)
- Usually a CNAME record pointing to Clerk's servers

### 2.2 Add DNS Records in GoDaddy
1. Go to **GoDaddy Dashboard**: https://dcc.godaddy.com
2. Select your domain: `clubradar.in`
3. Go to **"DNS"** or **"DNS Management"**
4. Add the CNAME record that Clerk provided:
   - **Type**: CNAME
   - **Name**: (usually `@` or `www` or what Clerk specifies)
   - **Value**: (the value Clerk provides)
   - **TTL**: 3600 (or default)
5. Click **"Save"**

### 2.3 Wait for DNS Propagation
- DNS changes can take 5-60 minutes to propagate
- Clerk will automatically detect when DNS is configured
- The status will change from "Pending" to "Active"

---

## Step 3: Update Redirect URLs (Most Important!)

Even if the domain is already active, you need to configure redirect URLs.

### 3.1 Go to Paths
1. In the **left sidebar**, under **"<> Developers"**, click on **"Paths"**
2. This is where you configure where users go after login/signup

### 3.2 Update Component Paths
1. In the **"Component paths"** section:

**For <SignIn />:**
- Select **"Sign-in page on development host"** (not Account Portal)
- Enter: `/login`

**For <SignUp />:**
- Select **"Sign-up page on development host"** (not Account Portal)
- Enter: `/signup`

### 3.3 Find Redirect URLs Section
1. Scroll down or look for **"Redirect URLs"** or **"Allowed redirect URLs"**
2. Add these URLs:
   ```
   https://clubradar.in/**
   https://www.clubradar.in/**
   https://clubradar.in/sso-callback
   https://www.clubradar.in/sso-callback
   https://clubradar.in/discover
   ```
3. The `**` wildcard allows all paths under that domain

### 3.4 Save All Changes
- Click **"Save"** after making changes

---

## Step 4: Alternative - If You Can't Find Domain Management

If you can't find where to add domains in the Satellites tab:

### 4.1 Check Left Sidebar
1. Look in the **left sidebar** under **"<> Developers"**
2. Look for:
   - **"Domains"**
   - **"Custom Domains"**
   - **"Frontend API"**
3. Click on any of these to see domain options

### 4.2 Check Settings
1. Look for **"Settings"** in the left sidebar
2. Click on it
3. Look for **"Domains"** or **"Custom Domains"** section

### 4.3 Contact Clerk Support (If Still Stuck)
If you absolutely cannot find where to add domains:
1. The domain might already be configured correctly
2. You might just need to update the redirect URLs (Step 3)
3. Or contact Clerk support for help

---

## Step 5: Update Vercel Environment Variables

### 5.1 Go to Vercel
1. Open **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Go to **"Settings"** → **"Environment Variables"**

### 5.2 Update Clerk Keys
Make sure these are set:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
CLERK_SECRET_KEY=sk_live_... (or sk_test_...)
```

### 5.3 Get Your Keys from Clerk
1. In Clerk Dashboard, go to **"<> Developers"** → **"API Keys"**
2. Copy your **Publishable Key** and **Secret Key**
3. Paste them into Vercel environment variables

### 5.4 Add Additional Variables (Recommended)
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

### 5.5 Redeploy
1. After updating environment variables, **redeploy** your application
2. Go to **"Deployments"** → Click **"..."** → **"Redeploy"**

---

## Step 6: Test Everything

### 6.1 Test Login
1. Go to: https://clubradar.in/login
2. Try logging in
3. You should be redirected to `/discover` after login

### 6.2 Test Sign Up
1. Go to: https://clubradar.in/signup
2. Try creating a new account
3. You should be redirected to `/discover` after signup

### 6.3 Check for Errors
- If login doesn't work, check browser console (F12) for errors
- Check Vercel logs for server errors
- Verify redirect URLs are set correctly in Clerk

---

## Quick Summary

Since you're seeing "DNS Configuration - Active", here's what to do:

1. **Click "Satellites" tab** → Check/add your domain `clubradar.in`
2. **Go to "Paths"** → Update SignIn/SignUp to use development host (`/login`, `/signup`)
3. **Add redirect URLs** → `https://clubradar.in/**` and `https://clubradar.in/sso-callback`
4. **Update Vercel environment variables** → Add Clerk keys
5. **Redeploy** → Trigger a new deployment
6. **Test** → Try logging in on your new domain

---

## If You Still Can't Find "Add Domain"

**Option 1: The domain might already be set up**
- If DNS shows "Active", your domain might already be configured
- Just focus on updating redirect URLs in the "Paths" section
- This is the most important step anyway!

**Option 2: Check if domain is in a different section**
- Look for "Frontend API" in the left sidebar
- Some Clerk versions manage domains there

**Option 3: You might need a paid plan**
- Some Clerk features require a paid plan
- Check your Clerk plan/billing section
- Free plans might have limited domain options

---

## Need Help?

If you're still stuck:
1. Take a screenshot of the "Satellites" tab
2. Take a screenshot of what you see when you click "Satellites"
3. Check Clerk's documentation: https://clerk.com/docs
4. Contact Clerk support through their dashboard

The most important thing is to update the **redirect URLs** in the "Paths" section - this will make authentication work on your new domain!

