# 🚀 Complete Supabase Setup Guide for Beginners

This guide will walk you through setting up Supabase from scratch, step by step.

---

## Step 1: Create Supabase Account

1. **Go to Supabase Website**

   - Open your browser and visit: [https://supabase.com](https://supabase.com)
   - Click the **"Start your project"** button (usually in the top right)

2. **Sign Up**

   - You can sign up with:
     - **GitHub** (recommended - easiest)
     - **Google**
     - **Email** (create account with email/password)
   - Choose whichever you prefer

3. **Verify Your Email** (if using email signup)
   - Check your email inbox
   - Click the verification link
   - You'll be redirected back to Supabase

---

## Step 2: Create a New Project

1. **After logging in**, you'll see the Supabase dashboard

   - Click the **"New Project"** button (usually green, top right)

2. **Fill in Project Details**:

   **Organization** (if this is your first project):

   - If prompted, create a new organization
   - Name it: `ClubRadar` or `My Projects`
   - Click "Create organization"

   **Project Details**:

   - **Name**: `clubradar` (or `club-radar`)
   - **Database Password**:
     - ⚠️ **IMPORTANT**: Create a strong password
     - Save it somewhere safe (password manager, notes app)
     - You'll need this later!
     - Example: `MyClubRadar2024!Secure`

   **Region**:

   - Choose the region closest to India
   - Recommended: **`ap-south-1` (Mumbai, India)** or **`ap-southeast-1` (Singapore)**
   - This affects database speed

   **Pricing Plan**:

   - Select **"Free"** tier (it's selected by default)
   - This gives you:
     - 500MB database
     - 1GB file storage
     - 50,000 monthly active users
     - Unlimited API requests

3. **Create Project**
   - Click **"Create new project"** button
   - ⏳ **Wait 2-3 minutes** for the project to initialize
   - You'll see a loading screen with progress

---

## Step 3: Get Your API Keys

Once your project is ready:

1. **Go to Project Settings**

   - In the left sidebar, click the **⚙️ Settings** icon (bottom)
   - Click **"API"** in the settings menu

2. **Copy Your Keys**

   You'll see several sections. You need these:

   **a) Project URL**

   - Look for **"Project URL"** or **"Reference ID"**
   - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - Click the copy icon next to it
   - Save it somewhere (we'll use it soon)

   **b) anon public key**

   - Scroll down to **"Project API keys"** section
   - Find **"anon"** or **"public"** key
   - It's a long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click the copy icon
   - ⚠️ This is safe to use in frontend code

   **c) service_role key** (Secret!)

   - In the same section, find **"service_role"** key
   - Click the **"Reveal"** button to see it
   - Copy it
   - ⚠️ **KEEP THIS SECRET!** Never share it or commit to GitHub
   - Only use it in server-side code

3. **Save Your Keys**
   - Create a temporary text file or note
   - Save all three values:
     ```
     Project URL: https://xxxxx.supabase.co
     anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

---

## Step 4: Set Up Database Schema

1. **Open SQL Editor**

   - In the left sidebar, click **"SQL Editor"** (icon looks like `</>` or database)
   - You'll see a code editor

2. **Open Our Schema File**

   - In your project folder, open: `supabase/schema.sql`
   - Copy **ALL** the contents (Ctrl+A, then Ctrl+C / Cmd+A, then Cmd+C)

3. **Paste and Run**

   - Go back to Supabase SQL Editor
   - Click in the editor (it might have example code, you can delete it)
   - Paste the schema (Ctrl+V / Cmd+V)
   - Click the **"Run"** button (green button, bottom right)
   - Or press `Ctrl+Enter` / `Cmd+Enter`

4. **Check for Success**

   - You should see: **"Success. No rows returned"** or similar
   - If you see errors, scroll down to see what went wrong
   - Common issues:
     - If it says "already exists" - that's okay, tables are already created
     - If it says "permission denied" - make sure you're in the right project

5. **Verify Tables Were Created**
   - In the left sidebar, click **"Table Editor"**
   - You should see these tables:
     - ✅ `users`
     - ✅ `venues`
     - ✅ `events`
     - ✅ `bookings`
     - ✅ `reviews`

---

## Step 5: Set Up Storage Buckets

1. **Go to Storage**

   - In the left sidebar, click **"Storage"**

2. **Create Buckets**

   We need to create 3 buckets for images:

   **Bucket 1: event-images**

   - Click **"New bucket"** button
   - Name: `event-images`
   - **Public bucket**: ✅ Check this box (important!)
   - Click **"Create bucket"**

   **Bucket 2: venue-images**

   - Click **"New bucket"** again
   - Name: `venue-images`
   - **Public bucket**: ✅ Check this box
   - Click **"Create bucket"**

   **Bucket 3: user-photos**

   - Click **"New bucket"** again
   - Name: `user-photos`
   - **Public bucket**: ✅ Check this box
   - Click **"Create bucket"**

3. **Set Storage Policies** (Make files publicly accessible)

   For each bucket (`event-images`, `venue-images`, `user-photos`):

   - Click on the bucket name
   - Go to **"Policies"** tab
   - Click **"New Policy"**
   - Select **"For full customization"**
   - Name: `Public Read Access`
   - Policy definition: (paste this exactly as shown)
     ```
     bucket_id = 'event-images'::text
     ```
     ⚠️ **Important**: Don't add extra parentheses around it!
   - Allowed operation: **SELECT** (for reading)
   - Click **"Review"** then **"Save policy"**

   Repeat for all 3 buckets:

   - `event-images` → use: `bucket_id = 'event-images'::text`
   - `venue-images` → use: `bucket_id = 'venue-images'::text`
   - `user-photos` → use: `bucket_id = 'user-photos'::text`

   💡 **Tip**: See `STORAGE_POLICIES.md` for detailed step-by-step guide

---

## Step 6: Configure Environment Variables

1. **Open Your Project**

   - Go to your project folder: `clubradar`
   - Look for `.env.local.example` file

2. **Create `.env.local` File**

   - Copy `.env.local.example` and rename it to `.env.local`
   - Or create a new file named `.env.local`

3. **Fill in Your Keys**

   Open `.env.local` and replace the placeholder values:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Razorpay Configuration (Test Mode)
   # We'll set this up later, leave as is for now
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   Replace:

   - `https://your-project-id.supabase.co` → Your actual Project URL
   - `your_anon_key_here` → Your anon/public key
   - `your_service_role_key_here` → Your service_role key

4. **Save the File**
   - Make sure to save `.env.local`
   - ⚠️ **Never commit this file to GitHub!** (It's already in `.gitignore`)

---

## Step 7: Test Your Setup

1. **Start Your Dev Server**

   ```bash
   cd "/Users/plodiwal/Desktop/Medical app/clubradar"
   npm run dev
   ```

2. **Check for Errors**

   - Open browser: `http://localhost:3000`
   - Check the terminal for any errors
   - If you see "Invalid API key" errors, check your `.env.local` file

3. **Test Authentication** (Optional)
   - Try visiting `/login` page
   - The page should load without errors

---

## ✅ Verification Checklist

Make sure you've completed:

- [ ] Created Supabase account
- [ ] Created new project `clubradar`
- [ ] Saved database password securely
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key (kept secret)
- [ ] Ran database schema in SQL Editor
- [ ] Verified 5 tables exist (users, venues, events, bookings, reviews)
- [ ] Created 3 storage buckets (event-images, venue-images, user-photos)
- [ ] Set storage policies for public access
- [ ] Created `.env.local` file
- [ ] Filled in all Supabase keys in `.env.local`
- [ ] Started dev server without errors

---

## 🆘 Troubleshooting

### "Invalid API key" error

- ✅ Check `.env.local` file exists
- ✅ Verify keys are correct (no extra spaces, no quotes)
- ✅ Make sure you copied the full key (they're very long)
- ✅ Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Table doesn't exist" error

- ✅ Go back to SQL Editor
- ✅ Run the schema again
- ✅ Check Table Editor to see if tables exist

### "Permission denied" error

- ✅ Make sure you're in the correct Supabase project
- ✅ Check you're logged in
- ✅ Try refreshing the page

### Storage bucket not accessible

- ✅ Make sure bucket is set to "Public"
- ✅ Check storage policies are set correctly
- ✅ Try creating the bucket again

---

## 📞 Need Help?

If you get stuck:

1. **Check Supabase Dashboard**

   - Make sure your project is active (not paused)
   - Check the status in the top right

2. **Check Your Keys**

   - Go to Settings → API
   - Verify keys match what's in `.env.local`

3. **Check Database**

   - Go to Table Editor
   - Verify tables exist

4. **Check Storage**
   - Go to Storage
   - Verify buckets exist and are public

---

## 🎉 Next Steps

Once Supabase is set up:

1. ✅ Test the connection
2. ⏭️ Set up Razorpay (for payments)
3. ⏭️ Replace localStorage with Supabase API calls
4. ⏭️ Test the full flow

---

**You're all set! Your Supabase backend is ready to use!** 🚀

If you need help with any step, let me know!
