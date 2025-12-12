# 🔐 NextAuth.js Setup Guide for ClubRadar

## ✅ What's Already Done

1. ✅ NextAuth.js installed
2. ✅ Supabase adapter installed
3. ✅ API route created (`/api/auth/[...nextauth]`)
4. ✅ Login page updated
5. ✅ Auth hook updated
6. ✅ Navbar updated
7. ✅ SessionProvider added

---

## 📋 External Steps Required

### Step 1: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

**Save this secret** - you'll need it for `.env.local`

---

### Step 2: Get Supabase Service Role Key

1. Go to **Supabase Dashboard**
2. **Settings** → **API**
3. Find **"service_role"** key (NOT the anon key!)
4. **Copy it** - you'll need it for `.env.local`

⚠️ **Important**: This key has admin access. Never expose it in client-side code!

---

### Step 3: Set Up Email Service (Choose One)

#### Option A: Gmail SMTP (Easiest for Testing) ⭐

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "ClubRadar"
   - Copy the 16-character password

3. **Add to `.env.local`**:
   ```env
   EMAIL_SERVER=smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587
   EMAIL_FROM=your-email@gmail.com
   ```

#### Option B: SendGrid (Recommended for Production)

1. **Sign up**: https://sendgrid.com (Free tier: 100 emails/day)
2. **Create API Key**:
   - Settings → API Keys → Create API Key
   - Copy the key

3. **Add to `.env.local`**:
   ```env
   EMAIL_SERVER=smtp://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:587
   EMAIL_FROM=noreply@yourdomain.com
   ```

#### Option C: Resend (Modern & Easy)

1. **Sign up**: https://resend.com (Free tier: 3,000 emails/month)
2. **Get API Key**:
   - API Keys → Create API Key
   - Copy the key

3. **Add to `.env.local`**:
   ```env
   EMAIL_SERVER=smtp://resend:YOUR_RESEND_API_KEY@smtp.resend.com:587
   EMAIL_FROM=onboarding@resend.dev
   ```

#### Option D: AWS SES (For Scale)

1. **Set up AWS SES**
2. **Get SMTP credentials**
3. **Add to `.env.local`**:
   ```env
   EMAIL_SERVER_HOST=email-smtp.region.amazonaws.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-smtp-username
   EMAIL_SERVER_PASSWORD=your-smtp-password
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

### Step 4: Create `.env.local` File

Create or update `.env.local` in your project root:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Supabase (already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (choose one option above)
# Option A: Gmail
EMAIL_SERVER=smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587
EMAIL_FROM=your-email@gmail.com

# OR Option B: SendGrid
# EMAIL_SERVER=smtp://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:587
# EMAIL_FROM=noreply@yourdomain.com

# OR Option C: Resend
# EMAIL_SERVER=smtp://resend:YOUR_RESEND_API_KEY@smtp.resend.com:587
# EMAIL_FROM=onboarding@resend.dev

# OR Option D: AWS SES (use individual variables)
# EMAIL_SERVER_HOST=email-smtp.region.amazonaws.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your-smtp-username
# EMAIL_SERVER_PASSWORD=your-smtp-password
# EMAIL_FROM=noreply@yourdomain.com
```

---

### Step 5: Update Supabase Database Schema

NextAuth needs these tables in Supabase. Run this SQL in Supabase SQL Editor:

```sql
-- NextAuth.js required tables
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON public.sessions(session_token);
```

---

## 🧪 Testing

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to** `/login`

3. **Enter your email** and click "Send Magic Link"

4. **Check your email** (and spam folder)

5. **Click the magic link** in the email

6. **You should be logged in** and redirected to `/discover`

---

## 🐛 Troubleshooting

### Issue: "NEXTAUTH_SECRET is missing"

**Solution**: Add `NEXTAUTH_SECRET` to `.env.local` (generate one using the command above)

### Issue: "Email not sending"

**Solution**: 
- Check email service credentials
- Verify SMTP settings
- Check spam folder
- Try a different email service

### Issue: "Adapter error"

**Solution**: 
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Make sure NextAuth tables exist in Supabase
- Check Supabase URL is correct

### Issue: "Session not persisting"

**Solution**:
- Check `NEXTAUTH_URL` matches your app URL
- Verify database session strategy is working
- Check browser cookies are enabled

---

## 📚 Next Steps

Once authentication is working:

1. ✅ Test login/logout flow
2. ✅ Update protected routes
3. ✅ Test user profile creation
4. ✅ Integrate with existing features

---

## 🎉 You're Done!

NextAuth.js is now set up and ready to use. The magic link flow should work reliably without the Gmail wrapping issues!

