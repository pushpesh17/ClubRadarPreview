"use client";

import { useUser } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded } = useUser();

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || null,
          name: user.fullName || user.firstName || null,
          image: user.imageUrl || null,
          phone: user.primaryPhoneNumber?.phoneNumber || null,
        }
      : null,
    loading: !isLoaded,
  };
}
