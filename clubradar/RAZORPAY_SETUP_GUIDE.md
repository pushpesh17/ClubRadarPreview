# 💳 Razorpay Setup Guide (Test Mode - Free)

This guide will help you set up Razorpay for test payments. **Test mode is completely free!**

---

## Step 1: Create Razorpay Account

1. **Go to Razorpay Website**

   - Visit: [https://razorpay.com](https://razorpay.com)
   - Click **"Sign Up"** or **"Get Started"** button (top right)

2. **Sign Up Options**

   - You can sign up with:
     - **Email** (recommended)
     - **Google**
     - **GitHub**
   - Fill in your details:
     - Business name: `ClubRadar` (or your business name)
     - Email address
     - Password
     - Phone number

3. **Verify Your Email**
   - Check your email inbox
   - Click the verification link
   - Complete your profile if prompted

---

## Step 2: Access Dashboard

1. **Login to Razorpay**

   - Go to: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Login with your credentials

2. **Complete Onboarding** (if prompted)
   - Fill in business details (you can use test data)
   - For test mode, you don't need real business documents
   - Skip any verification steps for now

---

## Step 3: Get Test API Keys

1. **Go to API Keys Section**

   - In the left sidebar, click **"Settings"** (⚙️ icon)
   - Click **"API Keys"** in the settings menu

2. **Switch to Test Mode**

   - At the top, you'll see a toggle: **"Test Mode"** / **"Live Mode"**
   - Make sure **"Test Mode"** is selected (toggle should be ON)
   - ⚠️ **Important**: We're using TEST mode, not LIVE mode!

3. **Generate Test Keys** (if not already generated)

   - If you see "Generate Test Keys" button, click it
   - If keys already exist, you can use them or regenerate

4. **Copy Your Keys**

   You'll see two keys:

   **a) Key ID**

   - Looks like: `rzp_test_xxxxxxxxxxxxx`
   - Starts with `rzp_test_`
   - Click the copy icon next to it
   - This goes in: `NEXT_PUBLIC_RAZORPAY_KEY_ID`

   **b) Key Secret**

   - Click **"Reveal"** button to see it
   - It's a long string
   - Click the copy icon
   - ⚠️ **KEEP THIS SECRET!** Never share it
   - This goes in: `RAZORPAY_KEY_SECRET`

---

## Step 4: Update Your .env.local File

1. **Open `.env.local` File**

   - In your project folder: `clubradar`
   - Open `.env.local` file

2. **Find Razorpay Section** (lines 9-13)

   ```env
   # Razorpay Configuration (Test Mode)
   # Get these from: https://dashboard.razorpay.com/app/keys

   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   ```

3. **Replace the Placeholder Values**

   Replace:

   - `your_razorpay_test_key_id` → Your actual Key ID (starts with `rzp_test_`)
   - `your_razorpay_test_key_secret` → Your actual Key Secret

   **Example:**

   ```env
   # Razorpay Configuration (Test Mode)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5F5Fa
   RAZORPAY_KEY_SECRET=1DP5mmOlF5F5Fa1DP5mmOlF5F5Fa
   ```

4. **Save the File**
   - Make sure to save `.env.local`
   - ⚠️ **Never commit this file to GitHub!**

---

## Step 5: Verify Setup

1. **Restart Your Dev Server**

   ```bash
   # Stop the server (Ctrl+C)
   # Then start again:
   npm run dev
   ```

2. **Check for Errors**
   - Open browser: `http://localhost:3000`
   - Check terminal for any errors
   - If you see "Invalid Razorpay key" errors, check your keys again

---

## ✅ Verification Checklist

Make sure you have:

- [ ] Created Razorpay account
- [ ] Logged into dashboard
- [ ] Switched to **Test Mode** (not Live Mode!)
- [ ] Copied Key ID (starts with `rzp_test_`)
- [ ] Copied Key Secret
- [ ] Updated `.env.local` file with both keys
- [ ] Saved `.env.local` file
- [ ] Restarted dev server
- [ ] No errors in terminal

---

## 🎯 What Your .env.local Should Look Like

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wffkufcihgvtepzjxgzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay Configuration (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🆘 Troubleshooting

### "Invalid API key" error

- ✅ Check you're using **Test Mode** keys (start with `rzp_test_`)
- ✅ Verify keys are correct (no extra spaces)
- ✅ Make sure you copied the full key
- ✅ Restart dev server after changing `.env.local`

### "Key not found" error

- ✅ Check you're logged into the correct Razorpay account
- ✅ Verify keys are from **Test Mode** (not Live Mode)
- ✅ Try regenerating keys in Razorpay dashboard

### Can't find API Keys section

- ✅ Make sure you're logged in
- ✅ Check you're in the dashboard (not signup page)
- ✅ Look for "Settings" → "API Keys" in left sidebar

---

## 📝 Important Notes

1. **Test Mode is Free**

   - No charges for test transactions
   - Use test card numbers (provided by Razorpay)
   - Perfect for development

2. **Test Card Numbers**

   - Razorpay provides test card numbers for testing
   - Check Razorpay docs for test cards
   - Example: `4111 1111 1111 1111` (Visa test card)

3. **Never Use Live Keys in Development**

   - Live keys charge real money
   - Always use Test Mode during development
   - Switch to Live Mode only when going to production

4. **Keep Keys Secret**
   - Never commit `.env.local` to GitHub
   - Never share your Key Secret
   - Only share Key ID if needed (it's public)

---

## 🎉 Next Steps

Once Razorpay is set up:

1. ✅ Test payment flow in your app
2. ✅ Use test card numbers to simulate payments
3. ✅ Verify payment callbacks work
4. ⏭️ Later: Switch to Live Mode when ready for production

---

## 📚 Resources

- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)
- [Razorpay API Docs](https://razorpay.com/docs/api/)

---

**You're all set! Your payment integration is ready for testing!** 💳✨
