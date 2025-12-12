"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get all query parameters
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");

        console.log("=== CLIENT AUTH CALLBACK ===");
        console.log("Params:", { token, type, code, token_hash });

        // Method 1: token + type (most common)
        if (token && type) {
          console.log(`Verifying token with type: ${type}...`);
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            type: type as any,
            token: token,
          });

          if (verifyError) {
            throw verifyError;
          }

          if (data?.user) {
            console.log("Token verified, user:", data.user.email);
            
            // Create or update user profile
            try {
              await supabase.from("users").upsert({
                id: data.user.id,
                email: data.user.email,
                phone: data.user.phone,
                updated_at: new Date().toISOString(),
              });
            } catch (profileErr) {
              console.error("Profile error (non-fatal):", profileErr);
            }

            setStatus("success");
            router.push("/discover");
            return;
          }
        }

        // Method 2: code parameter (PKCE)
        if (code) {
          console.log("Exchanging code for session...");
          const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(code);

          if (codeError) {
            throw codeError;
          }

          if (data?.user) {
            console.log("Code exchanged, user:", data.user.email);
            
            // Create or update user profile
            try {
              await supabase.from("users").upsert({
                id: data.user.id,
                email: data.user.email,
                phone: data.user.phone,
                updated_at: new Date().toISOString(),
              });
            } catch (profileErr) {
              console.error("Profile error (non-fatal):", profileErr);
            }

            setStatus("success");
            router.push("/discover");
            return;
          }
        }

        // Method 3: Check if already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Already authenticated");
          setStatus("success");
          router.push("/discover");
          return;
        }

        // No valid parameters
        throw new Error("No valid authentication parameters found");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        setStatus("error");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(err.message || "auth_failed")}`);
        }, 3000);
      }
    };

    handleAuth();
  }, [searchParams, router, supabase]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Verifying your login...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Authentication Failed</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-4 text-xs text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return null;
}

