"use client";

import { useEffect } from "react";
import { initClientProtection } from "@/lib/security/client-protection";

/**
 * Security Provider Component
 * Initializes client-side security protections
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize client-side protection
    initClientProtection();
  }, []);

  return <>{children}</>;
}

