# Clerk Domain Migration - Step-by-Step Guide

## Overview

This guide will walk you through updating Clerk to work with your new domain `clubradar.in`.

---

## Step 1: Add Your New Domain to Clerk

### 1.1 Navigate to Domains

1. In the Clerk Dashboard (where you are now), look at the **left sidebar**
2. Under **"<> Developers"** section, click on **"Domains"**
3. You should see a list of currently configured domains

### 1.2 Add New Domain

1. Click the **"Add domain"** or **"+"** button
2. Enter your new domain: `clubradar.in`
3. Click **"Add"** or **"Save"**
4. If you're using `www.clubradar.in`, add that as well:
   - Click **"Add domain"** again
   - Enter: `www.clubradar.in`
   - Click **"Add"** or **"Save"**

### 1.3 Verify Domain (if required)

- Clerk may ask you to verify the domain by adding DNS records
- If prompted, follow the instructions to add the DNS records in GoDaddy
- This is usually a TXT or CNAME record

---

## Step 2: Update Application Paths

### 2.1 Navigate to Paths (You're Already Here!)

1. In the left sidebar, under **"<> Developers"**, click on **"Paths"**
2. You should see two sections:
   - **Application paths**
   - **Component paths**

### 2.2 Update Home URL

1. In the **"Application paths"** section, find **"Home URL"**
2. The input field should show `$DEVHOST` as a prefix
3. For production, you need to set this to your actual domain
4. However, if your app is at the root (`https://clubradar.in`), you can leave it blank
5. If your app is in a subdirectory, enter the path (e.g., `/app`)

**For your case (root domain):**

- Leave **"Home URL"** blank or set to `/`

### 2.3 Update Unauthorized Sign In URL (Optional)

1. In the **"Application paths"** section, find **"Unauthorized sign in URL"**
2. This is where users go if they sign in from an unrecognized device
3. You can set this to: `/login?unauthorized=true`
4. Or leave it blank to use the default

---

## Step 3: Update Component Paths

### 3.1 Update Sign-In Path

1. In the **"Component paths"** section, find **"<SignIn />"**
2. You'll see two radio button options:
   - **"Sign-in page on Account Portal"** (currently selected)
   - **"Sign-in page on development host"**
3. **Select the second option**: **"Sign-in page on development host"**
4. In the input field that appears, enter: `/login`
5. This tells Clerk to use your custom login page at `https://clubradar.in/login`

### 3.2 Update Sign-Up Path

1. In the **"Component paths"** section, find **"<SignUp />"**
2. You'll see two radio button options:
   - **"Sign-up page on Account Portal"** (currently selected)
   - **"Sign-up page on development host"**
3. **Select the second option**: **"Sign-up page on development host"**
4. In the input field that appears, enter: `/signup`
5. This tells Clerk to use your custom signup page at `https://clubradar.in/signup`

### 3.3 Update Sign-Out Path (if visible)

1. Scroll down to find **"<SignOut />"** section
2. If it's there, select **"Sign-out page on development host"**
3. Enter: `/` (root, redirects to homepage after sign out)

---

## Step 4: Update Redirect URLs

### 4.1 Navigate to Domains Again

1. Go back to **"Domains"** in the left sidebar
2. Click on your newly added domain (`clubradar.in`)

### 4.2 Add Allowed Redirect URLs

1. Look for a section called **"Allowed redirect URLs"** or **"Redirect URLs"**
2. Click **"Add URL"** or **"+"** button
3. Add these URLs one by one:
   ```
   https://clubradar.in/**
   https://www.clubradar.in/**
   https://clubradar.in/sso-callback
   https://www.clubradar.in/sso-callback
   https://clubradar.in/discover
   https://www.clubradar.in/discover
   ```
4. Click **"Save"** after adding each URL

### 4.3 Set After Sign-In URL

1. Look for **"After sign-in URL"** or **"Redirect after sign-in"**
2. Set it to: `https://clubradar.in/discover`
3. Or if you want to use a relative path: `/discover`

### 4.4 Set After Sign-Up URL

1. Look for **"After sign-up URL"** or **"Redirect after sign-up"**
2. Set it to: `https://clubradar.in/discover`
3. Or if you want to use a relative path: `/discover`

---

## Step 5: Update Environment Variables in Vercel

### 5.1 Go to Vercel Dashboard

1. Open a new tab and go to: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Click on **"Settings"** in the top navigation
4. Click on **"Environment Variables"** in the left sidebar

### 5.2 Update Clerk Environment Variables

1. Look for these variables (or add them if they don't exist):

**For Production:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (your production key)
CLERK_SECRET_KEY=sk_live_... (your production secret key)
```

**For Development (if you still use localhost):**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (your test key)
CLERK_SECRET_KEY=sk_test_... (your test secret key)
```

2. **Important**: Make sure you're using the correct keys:
   - `pk_live_` and `sk_live_` for production (clubradar.in)
   - `pk_test_` and `sk_test_` for development (localhost)

### 5.3 Get Your Clerk Keys

1. Go back to Clerk Dashboard
2. Click on **"API Keys"** in the left sidebar (under **"<> Developers"**)
3. You'll see:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)
4. Copy these keys and paste them into Vercel environment variables

### 5.4 Set Additional Clerk Variables (Optional but Recommended)

Add these to Vercel environment variables:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

### 5.5 Save and Redeploy

1. After updating all environment variables, click **"Save"**
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Redeploy"**
5. Or push a new commit to trigger a new deployment

---

## Step 6: Verify Everything Works

### 6.1 Test Login

1. Go to: https://clubradar.in/login
2. Try logging in with an existing user
3. You should be redirected to `/discover` after successful login
4. If it doesn't work, check the browser console for errors

### 6.2 Test Sign Up

1. Go to: https://clubradar.in/signup
2. Try creating a new account
3. You should be redirected to `/discover` after successful signup

### 6.3 Check Venues on Discover Page

1. Go to: https://clubradar.in/discover
2. You should see venues (after approving them in Supabase - see other guide)
3. If venues don't show, run the SQL script to approve them

---

## Troubleshooting

### Issue: "Redirect URL not allowed"

**Solution:**

1. Go to Clerk Dashboard → Domains
2. Make sure `https://clubradar.in/**` is in the allowed redirect URLs
3. The `**` wildcard allows all paths under that domain

### Issue: Users can't log in

**Solution:**

1. Check that you're using the correct Clerk keys (live vs test)
2. Verify the domain is added in Clerk
3. Check Vercel environment variables are set correctly
4. Make sure you redeployed after updating environment variables

### Issue: Still redirecting to old domain

**Solution:**

1. Clear your browser cookies
2. Try in an incognito/private window
3. Check that Vercel environment variables are updated
4. Redeploy the application

### Issue: "Invalid domain" error

**Solution:**

1. Make sure you added the domain in Clerk Dashboard → Domains
2. If Clerk requires DNS verification, complete that first
3. Wait a few minutes for DNS propagation

---

## Quick Checklist

- [ ] Added `clubradar.in` domain in Clerk Dashboard → Domains
- [ ] Added `www.clubradar.in` domain (if using www)
- [ ] Updated Sign-In path to use development host: `/login`
- [ ] Updated Sign-Up path to use development host: `/signup`
- [ ] Added redirect URLs: `https://clubradar.in/**`
- [ ] Set after sign-in URL to `/discover`
- [ ] Set after sign-up URL to `/discover`
- [ ] Updated Vercel environment variables with correct Clerk keys
- [ ] Redeployed application on Vercel
- [ ] Tested login on new domain
- [ ] Tested signup on new domain
- [ ] Verified venues show on discover page

---

## Need More Help?

If you're stuck:

1. Check Clerk Dashboard → **"Logs"** for authentication errors
2. Check Vercel Dashboard → **"Deployments"** → **"Logs"** for build/runtime errors
3. Check browser console (F12) for client-side errors
4. Make sure all environment variables are set correctly
