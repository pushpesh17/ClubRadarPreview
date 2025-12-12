# ⚡ Quick Start Checklist

Follow these steps in order. Check each box as you complete it.

## 📝 Step-by-Step Checklist

### 1. Create Supabase Account
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "Start your project"
- [ ] Sign up with GitHub/Google/Email
- [ ] Verify email (if needed)

### 2. Create Project
- [ ] Click "New Project"
- [ ] Name: `clubradar`
- [ ] Database Password: `_________________` (save this!)
- [ ] Region: `ap-south-1` (Mumbai) or `ap-southeast-1` (Singapore)
- [ ] Plan: **Free**
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### 3. Get API Keys
- [ ] Go to Settings → API
- [ ] Copy **Project URL**: `_________________`
- [ ] Copy **anon public key**: `_________________`
- [ ] Copy **service_role key**: `_________________` (keep secret!)

### 4. Set Up Database
- [ ] Go to SQL Editor (left sidebar)
- [ ] Open `supabase/schema.sql` in your code editor
- [ ] Copy ALL the code
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button
- [ ] Should see "Success" message

### 5. Verify Tables
- [ ] Go to Table Editor (left sidebar)
- [ ] Check these tables exist:
  - [ ] `users`
  - [ ] `venues`
  - [ ] `events`
  - [ ] `bookings`
  - [ ] `reviews`

### 6. Set Up Storage
- [ ] Go to Storage (left sidebar)
- [ ] Create bucket: `event-images` (Public ✅)
- [ ] Create bucket: `venue-images` (Public ✅)
- [ ] Create bucket: `user-photos` (Public ✅)

### 7. Configure Environment
- [ ] In your project folder, create `.env.local` file
- [ ] Copy content from `.env.local.example`
- [ ] Fill in your Supabase keys:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url_here
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```
- [ ] Save the file

### 8. Test
- [ ] Open terminal
- [ ] Run: `npm run dev`
- [ ] Open: `http://localhost:3000`
- [ ] Check for errors in terminal
- [ ] If no errors, you're done! ✅

---

## 🎯 What You Need

Before starting, make sure you have:
- ✅ Internet connection
- ✅ Code editor (VS Code recommended)
- ✅ Terminal/Command line access
- ✅ 10-15 minutes of time

---

## 📚 Detailed Guide

For detailed instructions with screenshots and explanations, see:
**`SUPABASE_SETUP_GUIDE.md`**

---

## 🆘 Stuck?

Common issues and solutions:

**"Invalid API key"**
- Check `.env.local` file exists
- Verify keys are correct (no spaces)
- Restart dev server

**"Table doesn't exist"**
- Go back to SQL Editor
- Run schema again

**"Permission denied"**
- Make sure you're logged in
- Check you're in the right project

---

**Ready? Start with Step 1!** 🚀

