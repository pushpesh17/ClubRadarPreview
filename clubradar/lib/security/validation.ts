// Input Validation and Sanitization
// Prevents XSS, SQL injection, and other attacks

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers (onclick=, etc.)
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Allow international format: +1234567890 or 1234567890
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate time string (HH:MM)
 */
export function isValidTime(timeString: string): boolean {
  if (!timeString) return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Validate price (positive number with max 2 decimals)
 */
export function isValidPrice(price: number | string): boolean {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num) || num < 0) return false;
  // Check decimal places
  const str = num.toString();
  const parts = str.split(".");
  if (parts.length > 1 && parts[1].length > 2) return false;
  return true;
}

/**
 * Validate string length
 */
export function isValidLength(
  input: string,
  min: number,
  max: number
): boolean {
  if (!input) return min === 0;
  return input.length >= min && input.length <= max;
}

/**
 * Sanitize and validate text input
 */
export function sanitizeText(
  input: string | null | undefined,
  maxLength: number = 10000
): string {
  if (!input) return "";
  const sanitized = sanitizeString(input);
  return sanitized.substring(0, maxLength);
}

/**
 * Validate and sanitize array of strings
 */
export function sanitizeStringArray(
  input: any,
  maxItems: number = 100
): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, maxItems)
    .filter((item) => typeof item === "string")
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0);
}

/**
 * Validate request body structure
 */
export function validateRequestBody<T>(
  body: any,
  schema: {
    [K in keyof T]: (value: any) => boolean;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    const value = body[key];
    const validateFn = validator as (value: any) => boolean;
    if (!validateFn(value)) {
      errors.push(`Invalid value for field: ${key}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for SQL injection patterns (basic check)
 */
export function containsSQLInjection(input: string): boolean {
  if (!input) return false;
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\bUNION\s+SELECT\b)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function containsXSS(input: string): boolean {
  if (!input) return false;
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Check for dangerous patterns
    if (containsSQLInjection(input) || containsXSS(input)) {
      return ""; // Return empty string if dangerous
    }
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeString(key)] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}
