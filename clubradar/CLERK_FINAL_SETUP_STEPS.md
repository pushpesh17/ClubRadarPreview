# Final Clerk Setup Steps - Based on Your Sidebar

## What You've Already Done ✅

- ✅ Configured SignIn path: `/login` (development host)
- ✅ Configured SignUp path: `/signup` (development host)
- ✅ Found the left sidebar with all options

---

## Step 1: Click on "Domains" (Most Important!)

### 1.1 Navigate to Domains
1. In the **left sidebar**, under **"<> Developers"**, click on **"Domains"**
2. This is where redirect URLs are configured

### 1.2 What You Should See
When you click "Domains", you should see:
- Your domain listed (might be `clubradar.in` or the old Vercel domain)
- Or a list of domains
- Or domain configuration options

### 1.3 Find Redirect URLs
1. **If you see a domain listed**, click on it
2. Look for a section called:
   - **"Allowed redirect URLs"**
   - **"Redirect URLs"**
   - **"Frontend API redirect URLs"**
   - **"Allowed origins"**
   - **"Redirect after sign-in"**
   - **"Redirect after sign-up"**

3. **If you see a form or settings**, scroll through it to find redirect URL fields

### 1.4 Add These URLs
When you find the redirect URLs section, add these (one per line or in separate fields):

```
https://clubradar.in/**
https://www.clubradar.in/**
https://clubradar.in/sso-callback
https://www.clubradar.in/sso-callback
https://clubradar.in/discover
https://www.clubradar.in/discover
```

**Important:** The `**` wildcard allows all paths under that domain.

### 1.5 Set After Sign-In/Sign-Up URLs
If you see fields for:
- **"After sign-in URL"** → Set to: `/discover` or `https://clubradar.in/discover`
- **"After sign-up URL"** → Set to: `/discover` or `https://clubradar.in/discover`

### 1.6 Save
- Click **"Save"** after adding all URLs

---

## Step 2: Check "Sessions" (Alternative Location)

If you don't find redirect URLs in "Domains", try:

1. In the **left sidebar**, under **"User & authentication"**, click on **"Sessions"**
2. Look for redirect URL settings there
3. Some Clerk versions have redirect URLs in the Sessions section

---

## Step 3: Update Vercel Environment Variables (CRITICAL!)

This is **the most important step** - even if you can't find redirect URLs, this will make it work!

### 3.1 Go to Vercel
1. Open a new tab: https://vercel.com/dashboard
2. Select your **ClubRadar** project
3. Click **"Settings"** in the top navigation
4. Click **"Environment Variables"** in the left sidebar

### 3.2 Get Your Clerk Keys
1. Go back to Clerk Dashboard
2. In the **left sidebar**, under **"<> Developers"**, click on **"API keys"**
3. You'll see:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)
4. **Copy both keys**

### 3.3 Add/Update Environment Variables in Vercel
In Vercel, add or update these variables:

**For Production (clubradar.in):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here
```

**OR For Development (if still testing):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

**Additional Recommended Variables:**
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
```

### 3.4 Important: Set for All Environments
When adding variables in Vercel:
- Make sure to select **"Production"**, **"Preview"**, and **"Development"** (or "All")
- This ensures the variables work in all environments

### 3.5 Save and Redeploy
1. Click **"Save"** after adding all variables
2. Go to **"Deployments"** tab
3. Click the **"..."** menu (three dots) on the latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

---

## Step 4: Test Everything

### 4.1 Test Login
1. Go to: https://clubradar.in/login
2. Try logging in with an existing user
3. After successful login, you should be redirected to `/discover`
4. If you get an error, check the browser console (F12) for details

### 4.2 Test Sign Up
1. Go to: https://clubradar.in/signup
2. Try creating a new account
3. After successful signup, you should be redirected to `/discover`

### 4.3 Check for Errors
- **Browser console** (F12 → Console tab): Look for any red errors
- **Vercel logs**: Go to Vercel → Deployments → Click on latest deployment → "Logs" tab
- **Clerk logs**: Go to Clerk Dashboard → Look for any warnings or errors

---

## Troubleshooting

### Issue: "Redirect URL not allowed" Error

**Solution:**
1. Make sure you added `https://clubradar.in/**` in the redirect URLs
2. The `**` wildcard is important - it allows all paths
3. Try adding the specific path that's failing (e.g., `https://clubradar.in/discover`)

### Issue: Can't Find Redirect URLs in Domains

**Solution:**
1. The redirect URLs might be automatically allowed if your domain is configured
2. **Focus on updating Vercel environment variables** - this is more critical
3. Test login - if it works, redirect URLs are already configured
4. If it doesn't work, you might need to contact Clerk support

### Issue: Users Can't Log In

**Checklist:**
- [ ] Vercel environment variables are set correctly
- [ ] You're using the correct Clerk keys (live vs test)
- [ ] Application has been redeployed after updating variables
- [ ] SignIn path is set to `/login` in Paths
- [ ] SignUp path is set to `/signup` in Paths
- [ ] Domain is showing "Active" in DNS Configuration

### Issue: Still Redirecting to Old Domain

**Solution:**
1. Clear browser cookies
2. Try in an incognito/private window
3. Make sure Vercel environment variables are updated
4. Redeploy the application

---

## Quick Checklist

- [ ] Clicked "Domains" in left sidebar
- [ ] Found and added redirect URLs (if available)
- [ ] Updated Vercel environment variables with Clerk keys
- [ ] Added additional Clerk environment variables
- [ ] Redeployed application on Vercel
- [ ] Tested login on https://clubradar.in/login
- [ ] Tested signup on https://clubradar.in/signup
- [ ] Verified redirect to `/discover` after login/signup

---

## Summary

**What to do right now:**

1. **Click "Domains"** in the left sidebar (under Developers)
2. **Look for redirect URLs** section and add the URLs listed above
3. **Update Vercel environment variables** (most important!)
4. **Redeploy** your application
5. **Test** login on your new domain

The Vercel environment variables are **critical** - even if you can't find redirect URLs in Clerk, updating Vercel variables and redeploying might make everything work!

---

## Need More Help?

If you're still stuck after trying these steps:
1. Take a screenshot of what you see when you click "Domains"
2. Check Vercel deployment logs for errors
3. Check browser console (F12) for client-side errors
4. Verify all environment variables are set correctly in Vercel

The most important thing is to **update Vercel environment variables and redeploy** - this often fixes authentication issues even without explicitly setting redirect URLs!

