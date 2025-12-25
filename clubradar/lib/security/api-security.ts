// API Security Utilities
// Common security checks for API routes

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP, rateLimitConfigs } from "./rate-limit";
import { sanitizeInput, containsSQLInjection, containsXSS } from "./validation";

/**
 * Validate request method
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }
  return null;
}

/**
 * Validate request content type
 */
export function validateContentType(
  request: NextRequest,
  expectedType: string = "application/json"
): NextResponse | null {
  const contentType = request.headers.get("content-type");
  
  if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
    if (!contentType || !contentType.includes(expectedType)) {
      return NextResponse.json(
        { error: "Invalid content type", expected: expectedType },
        { status: 415 }
      );
    }
  }
  
  return null;
}

/**
 * Validate request size
 */
export function validateRequestSize(
  request: NextRequest,
  maxSize: number = 100 * 1024 // 100KB default
): NextResponse | null {
  const contentLength = request.headers.get("content-length");
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      { error: "Request too large", maxSize: `${maxSize / 1024}KB` },
      { status: 413 }
    );
  }
  
  return null;
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(
  request: NextRequest,
  config: keyof typeof rateLimitConfigs = "standard"
): NextResponse | null {
  const clientIP = getClientIP(request);
  const limitConfig = rateLimitConfigs[config];
  const result = rateLimit(clientIP, limitConfig);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": limitConfig.maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
        },
      }
    );
  }

  return null;
}

/**
 * Sanitize request body
 */
export async function sanitizeRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    const sanitized = sanitizeInput(body);
    return sanitized as T;
  } catch (error) {
    return null;
  }
}

/**
 * Check for malicious input in request
 */
export function checkMaliciousInput(input: any): { safe: boolean; reason?: string } {
  if (typeof input === "string") {
    if (containsSQLInjection(input)) {
      return { safe: false, reason: "Potential SQL injection detected" };
    }
    if (containsXSS(input)) {
      return { safe: false, reason: "Potential XSS attack detected" };
    }
  }

  if (typeof input === "object" && input !== null) {
    for (const value of Object.values(input)) {
      const check = checkMaliciousInput(value);
      if (!check.safe) {
        return check;
      }
    }
  }

  return { safe: true };
}

/**
 * Comprehensive API security middleware
 */
export async function secureAPIRequest(
  request: NextRequest,
  options: {
    methods?: string[];
    rateLimit?: keyof typeof rateLimitConfigs;
    maxSize?: number;
    requireAuth?: boolean;
  } = {}
): Promise<{
  error?: NextResponse;
  sanitizedBody?: any;
  clientIP: string;
}> {
  const {
    methods = ["GET", "POST"],
    rateLimit: rateLimitType = "standard",
    maxSize = 100 * 1024,
    requireAuth = false,
  } = options;

  // 1. Validate method
  const methodError = validateMethod(request, methods);
  if (methodError) {
    return { error: methodError, clientIP: getClientIP(request) };
  }

  // 2. Validate content type (for POST/PUT/PATCH)
  const contentTypeError = validateContentType(request);
  if (contentTypeError) {
    return { error: contentTypeError, clientIP: getClientIP(request) };
  }

  // 3. Validate request size
  const sizeError = validateRequestSize(request, maxSize);
  if (sizeError) {
    return { error: sizeError, clientIP: getClientIP(request) };
  }

  // 4. Apply rate limiting
  const rateLimitError = applyRateLimit(request, rateLimitType);
  if (rateLimitError) {
    return { error: rateLimitError, clientIP: getClientIP(request) };
  }

  // 5. Sanitize request body
  let sanitizedBody: any = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    sanitizedBody = await sanitizeRequestBody(request);
    if (sanitizedBody === null) {
      return {
        error: NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        ),
        clientIP: getClientIP(request),
      };
    }

    // Check for malicious input
    const maliciousCheck = checkMaliciousInput(sanitizedBody);
    if (!maliciousCheck.safe) {
      return {
        error: NextResponse.json(
          { error: "Invalid input", reason: maliciousCheck.reason },
          { status: 400 }
        ),
        clientIP: getClientIP(request),
      };
    }
  }

  return {
    sanitizedBody,
    clientIP: getClientIP(request),
  };
}

/**
 * Log security events
 */
export function logSecurityEvent(
  type: "rate_limit" | "malicious_input" | "unauthorized" | "invalid_request",
  details: {
    ip: string;
    path: string;
    method: string;
    reason?: string;
  }
) {
  // In production, you might want to send this to a logging service
  console.warn(`[SECURITY] ${type}:`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}
