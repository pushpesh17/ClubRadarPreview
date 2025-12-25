"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Clerk to load
      if (!isLoaded) {
        return;
      }

      // If user is authenticated, sync user to Supabase and migrate data
      if (userId && user) {
        try {
          // Get user data from Clerk
          const userData = {
            name: user.fullName || user.firstName || null,
            email: user.primaryEmailAddress?.emailAddress || null,
            phone: user.primaryPhoneNumber?.phoneNumber || null,
            photo: user.imageUrl || null,
          };

          // Call the user sync API to create user record and trigger migration
          const syncResponse = await fetch("/api/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log("User synced and migrated:", syncData);
          } else {
            const errorText = await syncResponse.text();
            console.error("User sync failed:", errorText);
            // Don't fail the login, just log the error
          }
        } catch (error) {
          console.error("Error syncing user:", error);
          // Don't fail the login, just log the error
        }

        setStatus("success");
        // Wait longer to ensure session is fully set and propagated
        // Use window.location for full page reload to ensure navbar updates
        setTimeout(() => {
          window.location.href = "/discover";
        }, 1500);
      } else if (userId && !user) {
        // User ID exists but user data not loaded yet, wait a bit
        setTimeout(() => {
          handleCallback();
        }, 500);
      } else {
        // If no user after a delay, there might be an issue
        setTimeout(() => {
          if (!userId) {
            setStatus("error");
            setTimeout(() => {
              router.replace("/login?error=authentication_failed");
            }, 2000);
          }
        }, 3000);
      }
    };

    handleCallback();
  }, [isLoaded, userId, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-8 w-8 mx-auto rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              Sign in successful! Redirecting...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-8 w-8 mx-auto rounded-full bg-red-500 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              Authentication failed. Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
