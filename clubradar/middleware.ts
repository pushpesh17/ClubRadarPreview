import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/discover(.*)",
  "/blog(.*)",
  "/venue/signup(.*)",
  "/sso-callback(.*)",
  "/api/webhooks(.*)",
  "/api/venues(.*)", // Public API for discovering venues
  "/api/events(.*)", // Public API for discovering events
  "/api/venues/[id](.*)", // Public API for venue details
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Protect routes that require authentication
  // Note: /discover is public, but users can still access it when logged in
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Get the response
  const response = NextResponse.next();

  // Security Headers
  const securityHeaders = {
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // XSS Protection (legacy but still useful)
    "X-XSS-Protection": "1; mode=block",
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions Policy (formerly Feature Policy)
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.razorpay.com https://api.resend.com",
      "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://checkout.razorpay.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
    // Strict Transport Security (HSTS) - Only in production
    ...(process.env.NODE_ENV === "production" && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    }),
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "https://www.clubradar.in",
      "https://clubradar.in",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
