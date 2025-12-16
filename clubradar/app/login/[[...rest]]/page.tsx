"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { AlertCircle, WifiOff, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/discover";
  const emailFromQuery = searchParams.get("email");
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      toast.success("Connection restored!", { duration: 3000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("No internet connection. Please check your network and try again.");
      toast.error("You're offline. Please check your internet connection.", {
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show message if email is pre-filled
  useEffect(() => {
    if (emailFromQuery) {
      toast("Please sign in to continue", {
        icon: "ℹ️",
        duration: 4000,
      });
    }
  }, [emailFromQuery]);

  // Handle Clerk errors
  const handleError = (error: any) => {
    console.error("Sign-in error:", error);
    
    let userMessage = "Something went wrong. Please try again.";
    
    if (error?.status === 422) {
      if (error?.errors?.[0]?.message?.includes("Couldn't find your account") ||
          error?.errors?.[0]?.message?.includes("not found")) {
        userMessage = "Account not found. Please create an account to continue.";
        toast.error(userMessage, { duration: 5000 });
        setTimeout(() => {
          window.location.href = `/signup?email=${encodeURIComponent(emailFromQuery || "")}&message=account_not_found`;
        }, 2000);
        return;
      }
      userMessage = "Invalid email or password. Please check your credentials and try again.";
    } else if (error?.status === 401) {
      userMessage = "Invalid credentials. Please check your email and password.";
    } else if (error?.status === 403) {
      userMessage = "Access denied. Your account may be restricted. Please contact support.";
    } else if (error?.status === 429) {
      userMessage = "Too many login attempts. Please wait a few minutes before trying again.";
    } else if (error?.status === 500 || error?.status === 503) {
      userMessage = "Service temporarily unavailable. Please try again in a moment.";
    } else if (!navigator.onLine) {
      userMessage = "No internet connection. Please check your network and try again.";
    }
    
    setError(userMessage);
    toast.error(userMessage, { duration: 6000 });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black px-4 py-12">
        <div className="w-full max-w-md space-y-4">
          {/* Network Status Alert */}
          {!isOnline && (
            <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>No Internet Connection</AlertTitle>
              <AlertDescription>
                Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && isOnline && (
            <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Clerk Sign-In Component */}
          <div className={!isOnline ? "opacity-50 pointer-events-none" : ""}>
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              fallbackRedirectUrl={redirectTo}
              forceRedirectUrl={redirectTo}
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
                  formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                  formFieldErrorText: "text-red-600 dark:text-red-400",
                  alertText: "text-red-600 dark:text-red-400",
                  identityPreviewText: "text-gray-700 dark:text-gray-300",
                  formFieldLabel: "text-gray-700 dark:text-gray-300",
                },
                variables: {
                  colorPrimary: "#9333ea",
                  colorDanger: "#dc2626",
                  colorSuccess: "#16a34a",
                  colorWarning: "#ea580c",
                },
              }}
            />
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Sign up
              </a>
            </p>
            <p className="text-xs">
              Forgot your password? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

