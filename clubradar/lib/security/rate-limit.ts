// Rate Limiting Utility
// Prevents abuse and DDoS attacks

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for serverless, consider Redis for production)
const store: RateLimitStore = {};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Clean every minute

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Rate limit by IP address or user ID
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { windowMs, maxRequests, message } = options;
  const now = Date.now();
  const key = identifier;

  // Get or create rate limit entry
  let entry = store[key];

  // If entry doesn't exist or window has expired, reset
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: message || "Rate limit exceeded. Please try again later.",
    };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback (shouldn't happen in production)
  return "unknown";
}

/**
 * Rate limit middleware for API routes
 */
export function createRateLimitHandler(options: RateLimitOptions) {
  return async (request: Request): Promise<RateLimitResult | null> => {
    const identifier = getClientIP(request);
    return rateLimit(identifier, options);
  };
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict: 10 requests per minute
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "Too many requests. Please slow down.",
  },
  // Standard: 100 requests per 15 minutes
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Rate limit exceeded. Please try again in a few minutes.",
  },
  // Lenient: 1000 requests per hour
  lenient: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: "Too many requests. Please try again later.",
  },
  // Auth endpoints: 5 requests per minute
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: "Too many login attempts. Please try again in a minute.",
  },
  // Booking endpoints: 20 requests per minute
  booking: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: "Too many booking requests. Please slow down.",
  },
};
