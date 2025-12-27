"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

// Admin email whitelist (must match server-side list)
const ADMIN_EMAILS = [
  "bodadesneha2020@gmail.com",
  "pushpeshlodiwal1711@gmail.com",
];

/**
 * Hook to check if current user is an admin
 * @returns {isAdmin: boolean, loading: boolean}
 */
export function useAdmin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsAdmin(false);
      return;
    }

    const email = user.emailAddresses[0]?.emailAddress || null;
    if (!email) {
      setIsAdmin(false);
      return;
    }

    const adminStatus = ADMIN_EMAILS.includes(email.toLowerCase());
    setIsAdmin(adminStatus);
  }, [user, isLoaded]);

  return { isAdmin, loading: !isLoaded };
}

