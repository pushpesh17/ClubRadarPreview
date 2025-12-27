/**
 * Admin Authentication Utility
 * 
 * Only specific emails are allowed admin access.
 * Add or remove admin emails from the ADMIN_EMAILS array.
 */

import { auth } from "@clerk/nextjs/server";

// Admin email whitelist
const ADMIN_EMAILS = [
  "bodadesneha2020@gmail.com",
  "pushpeshlodiwal1711@gmail.com",
];

/**
 * Fetch user email from Clerk API
 */
async function fetchClerkUserEmail(userId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY not found");
    return null;
  }

  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch user from Clerk:", res.status);
      return null;
    }

    const user: any = await res.json();

    // Get primary email or first email
    const email =
      user?.email_addresses?.find(
        (e: any) => e?.id === user?.primary_email_address_id
      )?.email_address ??
      user?.email_addresses?.[0]?.email_address ??
      null;

    return email;
  } catch (error) {
    console.error("Error fetching user email from Clerk:", error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 * @returns {Promise<{isAdmin: boolean, email: string | null}>}
 */
export async function checkAdminAccess() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isAdmin: false, email: null };
    }

    // Get user email from Clerk API
    const email = await fetchClerkUserEmail(userId);

    if (!email) {
      return { isAdmin: false, email: null };
    }

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    return { isAdmin, email };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAdmin: false, email: null };
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in API routes to protect admin endpoints
 */
export async function requireAdmin() {
  const { isAdmin, email } = await checkAdminAccess();
  
  if (!isAdmin) {
    throw new Error(
      email
        ? `Access denied. Admin access required.`
        : "Authentication required. Please login first."
    );
  }

  return { email: email! };
}

