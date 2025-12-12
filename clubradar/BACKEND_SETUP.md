# ClubRadar Backend Setup Guide

## 🎯 Recommended Stack (All Free Tier)

### ✅ **Supabase** (Primary Backend)
- **Database**: PostgreSQL (free tier: 500MB, unlimited requests)
- **Authentication**: Email/OTP (free)
- **Storage**: 1GB free (for images)
- **Why**: All-in-one solution, perfect for Next.js

### ✅ **Razorpay** (Payments - Test Mode)
- **Test Mode**: Completely free
- **Why**: Best for Indian market, easy integration

### ✅ **QR Code Library** (`qrcode`)
- **Cost**: Free (open source)
- **Why**: No external service needed

### ✅ **Leaflet.js + OpenStreetMap** (Maps)
- **Cost**: Completely free
- **Why**: No API keys, no limits

---

## 📋 Setup Steps

### 1. **Supabase Setup**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for free account
3. Create a new project:
   - Name: `clubradar`
   - Database Password: (save this securely)
   - Region: Choose closest to India (e.g., `ap-south-1`)
4. Wait for project to initialize (~2 minutes)

5. **Get API Keys**:
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

6. **Run Database Schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Paste and run it
   - This creates all tables, RLS policies, and indexes

7. **Set up Storage Buckets**:
   - Go to Storage → Create Bucket
   - Create buckets:
     - `event-images` (public)
     - `venue-images` (public)
     - `user-photos` (public)
   - Set policies:
     ```sql
     -- Allow public read access
     CREATE POLICY "Public Access" ON storage.objects
     FOR SELECT USING (bucket_id = 'event-images');
     
     -- Allow authenticated users to upload
     CREATE POLICY "Authenticated Upload" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'event-images' AND auth.role() = 'authenticated'
     );
     ```

### 2. **Razorpay Setup (Test Mode)**

1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for free account
3. Go to Dashboard → Settings → API Keys
4. Generate **Test Keys** (not live keys!)
5. Copy:
   - `Key ID` → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`

### 3. **Environment Variables**

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. **Install Dependencies**

Already installed:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `razorpay` - Payment gateway
- `qrcode` - QR code generation

### 5. **Verify Setup**

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Check console for errors
3. Test authentication flow
4. Test creating an event
5. Test booking flow

---

## 🔐 Authentication Flow

### Email/OTP Login (Supabase)

1. User enters email/phone
2. Supabase sends OTP
3. User enters OTP
4. Supabase verifies and creates session
5. Session stored in cookies (handled by `@supabase/ssr`)

### Implementation:
- `app/login/page.tsx` - Login UI
- `app/api/auth/otp/route.ts` - OTP request handler
- `app/api/auth/verify/route.ts` - OTP verification handler

---

## 💾 Database Schema Overview

### Tables:
1. **users** - User profiles (extends Supabase auth.users)
2. **venues** - Venue information
3. **events** - Event listings
4. **bookings** - User bookings
5. **reviews** - Event reviews

### Row Level Security (RLS):
- Users can only see/edit their own data
- Public can view approved venues and events
- Venue owners can manage their venues/events

---

## 📁 File Structure

```
clubradar/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   ├── middleware.ts       # Auth middleware
│   │   └── database.types.ts   # TypeScript types
│   ├── razorpay.ts            # Razorpay client
│   └── qrcode.ts              # QR code utilities
├── app/
│   ├── api/
│   │   ├── auth/              # Auth endpoints
│   │   ├── events/            # Event endpoints
│   │   ├── bookings/          # Booking endpoints
│   │   └── payments/          # Payment endpoints
│   └── ...
├── supabase/
│   └── schema.sql             # Database schema
└── middleware.ts              # Next.js middleware
```

---

## 🚀 Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database schema
3. ✅ Configure environment variables
4. ⏳ Create API routes
5. ⏳ Replace localStorage with Supabase
6. ⏳ Implement payment flow
7. ⏳ Add image upload to Supabase Storage

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use Test Keys** for Razorpay during development
3. **Service Role Key** should only be used server-side
4. **RLS Policies** protect your data - don't disable them
5. **Storage Buckets** need proper policies for public access

---

## 🆘 Troubleshooting

### "Invalid API key" error
- Check `.env.local` file exists
- Verify keys are correct (no extra spaces)
- Restart dev server after changing env vars

### "Row Level Security" error
- Check RLS policies in Supabase dashboard
- Verify user is authenticated
- Check policy conditions

### Payment not working
- Verify using **test keys** (not live)
- Check Razorpay test mode is enabled
- Verify webhook URL (if using webhooks)

---

**Ready to start? Follow the setup steps above!** 🎉

