# 🔐 Security Implementation Guide

This document outlines all security measures implemented in the ClubRadar application.

## 🛡️ Security Features

### 1. **Rate Limiting**
- **Purpose**: Prevents DDoS attacks, brute force attempts, and API abuse
- **Implementation**: In-memory rate limiting (consider Redis for production scale)
- **Configurations**:
  - **Strict**: 10 requests/minute (for sensitive endpoints)
  - **Standard**: 100 requests/15 minutes (default for most APIs)
  - **Lenient**: 1000 requests/hour (for public endpoints)
  - **Auth**: 5 requests/minute (for login/signup)
  - **Booking**: 20 requests/minute (for booking endpoints)

**Location**: `lib/security/rate-limit.ts`

### 2. **Input Validation & Sanitization**
- **Purpose**: Prevents XSS, SQL injection, and invalid data
- **Features**:
  - String sanitization (removes dangerous characters)
  - Email validation
  - Phone number validation
  - UUID validation
  - Date/time validation
  - Price validation
  - Length validation
  - SQL injection pattern detection
  - XSS pattern detection

**Location**: `lib/security/validation.ts`

### 3. **Security Headers**
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation
- **Strict-Transport-Security**: HSTS (production only)
- **Content-Security-Policy**: Comprehensive CSP rules

**Locations**: 
- `middleware.ts` (dynamic headers)
- `next.config.ts` (static headers)

### 4. **API Route Security**
All API routes are protected with:
- Method validation
- Content-Type validation
- Request size limits
- Rate limiting
- Input sanitization
- Malicious input detection
- Authentication checks (where required)

**Location**: `lib/security/api-security.ts`

### 5. **Authentication & Authorization**
- **Clerk Integration**: Secure authentication
- **Route Protection**: Middleware-based route protection
- **RLS Policies**: Row-level security in Supabase
- **Service Role Key**: Used only server-side, never exposed

### 6. **Request Size Limits**
- **Booking API**: 50KB
- **Event Creation**: 5MB (includes images)
- **Venue Registration**: 10MB (includes documents)
- **Default**: 100KB

### 7. **Security Logging**
Security events are logged for:
- Rate limit violations
- Malicious input attempts
- Unauthorized access attempts
- Invalid requests

**Location**: `lib/security/api-security.ts` → `logSecurityEvent()`

## 📋 Protected Routes

### Public Routes (No Auth Required)
- `/` - Homepage
- `/discover` - Discover venues
- `/login` - Login page
- `/signup` - Signup page
- `/venue/signup` - Venue registration
- `/blog` - Blog posts

### Protected Routes (Auth Required)
- `/venue/dashboard` - Venue dashboard
- `/profile` - User profile
- `/bookings` - User bookings
- `/admin/*` - Admin pages

### API Routes with Rate Limiting
- `/api/bookings` - Booking endpoints (20 req/min)
- `/api/events/create` - Event creation (standard)
- `/api/venues/register` - Venue registration (standard)
- `/api/venues` - Venue listing (standard)
- All other APIs: Standard rate limiting

## 🔧 Configuration

### Environment Variables
Ensure these are set in production:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Resend (for emails)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_from_email

# App URL
NEXT_PUBLIC_APP_URL=https://www.clubradar.in
```

### Rate Limiting Configuration
To adjust rate limits, edit `lib/security/rate-limit.ts`:
```typescript
export const rateLimitConfigs = {
  strict: {
    windowMs: 60 * 1000,      // Time window
    maxRequests: 10,           // Max requests
    message: "Custom message",  // Error message
  },
  // ... other configs
};
```

## 🚀 Best Practices

### For Developers

1. **Always use security utilities**:
   ```typescript
   import { secureAPIRequest } from "@/lib/security/api-security";
   import { sanitizeString, isValidEmail } from "@/lib/security/validation";
   ```

2. **Sanitize all user input**:
   ```typescript
   const sanitized = sanitizeString(userInput);
   ```

3. **Validate before processing**:
   ```typescript
   if (!isValidEmail(email)) {
     return NextResponse.json({ error: "Invalid email" }, { status: 400 });
   }
   ```

4. **Use rate limiting**:
   ```typescript
   const security = await secureAPIRequest(request, {
     methods: ["POST"],
     rateLimit: "standard",
   });
   ```

5. **Log security events**:
   ```typescript
   logSecurityEvent("rate_limit", {
     ip: clientIP,
     path: request.nextUrl.pathname,
     method: request.method,
   });
   ```

### For Production

1. **Enable HSTS**: Already configured in `next.config.ts` (production only)

2. **Monitor Security Logs**: Set up logging service to track security events

3. **Consider Redis**: For distributed rate limiting in production

4. **Regular Security Audits**: Review security logs regularly

5. **Update Dependencies**: Keep all packages updated

6. **CSP Headers**: Review and adjust CSP rules as needed

## 🐛 Troubleshooting

### Rate Limit Errors
- **Error**: "Rate limit exceeded"
- **Solution**: Wait for the rate limit window to reset, or adjust limits in config

### Input Validation Errors
- **Error**: "Invalid input" or "Potential XSS attack detected"
- **Solution**: Check input data, ensure it's properly sanitized

### CORS Errors
- **Error**: CORS policy errors
- **Solution**: Check allowed origins in `middleware.ts`

### Security Headers Not Applied
- **Issue**: Headers not showing in browser
- **Solution**: Check `middleware.ts` and `next.config.ts` configuration

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Clerk Security](https://clerk.com/docs/security)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Updates

This security implementation is continuously improved. Check this document for updates.

**Last Updated**: January 2025

