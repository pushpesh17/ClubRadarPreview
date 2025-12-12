# ⚡ Quick Authentication Setup (5 Minutes)

## Essential Steps Only

### 1. Enable Email Provider (2 minutes)
1. Supabase Dashboard → **Authentication** → **Providers**
2. Click **"Email"**
3. Make sure **"Enable email provider"** is **ON**
4. Click **"Save"**

### 2. Set Site URL (2 minutes)
1. **Authentication** → **URL Configuration** (or **Settings**)
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: Add `http://localhost:3000/**`
4. Click **"Save"**

### 3. Test (1 minute)
1. Go to your app: `http://localhost:3000/login`
2. Enter email → Click "Send OTP"
3. Check email → Click magic link
4. ✅ You're logged in!

---

## That's It! 🎉

Email authentication now works with magic links.

**For phone OTP**: Requires Twilio setup (see full guide).

---

**See `SUPABASE_AUTH_SETUP.md` for detailed instructions.**

