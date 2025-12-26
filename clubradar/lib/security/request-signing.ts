/**
 * Request Signing and Integrity Verification
 * Prevents tampering with API requests via browser console
 */

import { createHmac } from "crypto";

const SIGNATURE_SECRET = process.env.REQUEST_SIGNATURE_SECRET || "default-secret-change-in-production";

/**
 * Generate a request signature to prevent tampering
 */
export function generateRequestSignature(data: any, timestamp: number, nonce: string): string {
  const payload = JSON.stringify({
    data,
    timestamp,
    nonce,
  });
  
  return createHmac("sha256", SIGNATURE_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * Verify request signature
 */
export function verifyRequestSignature(
  data: any,
  timestamp: number,
  nonce: string,
  signature: string
): boolean {
  // Check timestamp (prevent replay attacks - 5 minute window)
  const now = Date.now();
  const timeDiff = Math.abs(now - timestamp);
  if (timeDiff > 5 * 60 * 1000) {
    // More than 5 minutes old
    return false;
  }

  // Verify signature
  const expectedSignature = generateRequestSignature(data, timestamp, nonce);
  return signature === expectedSignature;
}

/**
 * Generate a nonce (number used once)
 */
export function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create signed request payload
 */
export function createSignedRequest(data: any): {
  data: any;
  timestamp: number;
  nonce: string;
  signature: string;
} {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const signature = generateRequestSignature(data, timestamp, nonce);

  return {
    data,
    timestamp,
    nonce,
    signature,
  };
}

