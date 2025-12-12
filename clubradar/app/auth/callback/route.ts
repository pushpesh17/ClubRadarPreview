import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // If this is a browser request, redirect to client-side callback page
  // This handles Gmail-wrapped URLs better
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari")) {
    // Redirect to client-side callback page with all query params
    const params = new URLSearchParams();
    requestUrl.searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    return NextResponse.redirect(new URL(`/auth/callback?${params.toString()}`, requestUrl.origin));
  }
  
  const supabase = await createClient();

  // Get all query parameters
  const token_hash = requestUrl.searchParams.get("token_hash");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");

  console.log("=== AUTH CALLBACK ===");
  console.log("Full URL:", requestUrl.toString());
  console.log("Params:", { token_hash, token, type, code });

  // Try different verification methods
  let verificationSuccess = false;
  let verificationError = null;
  let verificationData = null;

  // Method 1: token + type=magiclink (most common for Supabase magic links)
  if (token && type) {
    console.log(`Trying token verification with type: ${type}...`);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token: token,
      });
      
      if (!error && data) {
        verificationSuccess = true;
        verificationData = data;
        console.log("Token verification successful:", {
          user: data.user?.email,
          session: !!data.session,
        });
      } else {
        verificationError = error;
        console.error("Token verification error:", error);
      }
    } catch (err: any) {
      verificationError = err;
      console.error("Token verification exception:", err);
    }
  }
  // Method 2: code parameter (PKCE flow)
  else if (code) {
    console.log("Trying code exchange (PKCE)...");
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data.session) {
        verificationSuccess = true;
        verificationData = data;
        console.log("Code exchange successful:", {
          user: data.user?.email,
          session: !!data.session,
        });
      } else {
        verificationError = error;
        console.error("Code exchange error:", error);
      }
    } catch (err: any) {
      verificationError = err;
      console.error("Code exchange exception:", err);
    }
  }
  // Method 3: token_hash + type (legacy format)
  else if (token_hash && type) {
    console.log("Trying token_hash verification...");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });
      
      if (!error && data) {
        verificationSuccess = true;
        verificationData = data;
        console.log("Token_hash verification successful");
      } else {
        verificationError = error;
        console.error("Token_hash verification error:", error);
      }
    } catch (err: any) {
      verificationError = err;
      console.error("Token_hash verification exception:", err);
    }
  }
  // Method 4: Check if session already exists
  else {
    console.log("No verification params, checking existing session...");
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (session && !sessionError) {
        verificationSuccess = true;
        console.log("Session already exists");
      } else {
        console.error("No session found:", sessionError);
        return NextResponse.redirect(
          new URL("/login?error=no_verification_params", requestUrl.origin)
        );
      }
    } catch (err: any) {
      console.error("Session check exception:", err);
      return NextResponse.redirect(
        new URL("/login?error=session_check_failed", requestUrl.origin)
      );
    }
  }

  // If verification was successful
  if (verificationSuccess) {
    // Get the user (either from verification data or current session)
    let user = verificationData?.user;
    
    if (!user) {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (currentUser && !userError) {
        user = currentUser;
      }
    }

    if (user) {
      console.log("User authenticated:", user.email);

      // Create or update user profile
      try {
        const { error: profileError } = await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
          phone: user.phone,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Continue anyway - profile can be created later
        } else {
          console.log("User profile created/updated");
        }
      } catch (profileErr) {
        console.error("Profile upsert exception:", profileErr);
        // Continue anyway
      }

      // Redirect to discover page
      console.log("Redirecting to /discover");
      return NextResponse.redirect(new URL("/discover", requestUrl.origin));
    } else {
      console.error("No user found after verification");
      return NextResponse.redirect(
        new URL("/login?error=user_not_found", requestUrl.origin)
      );
    }
  } else {
    // Verification failed
    console.error("Verification failed:", verificationError);
    const errorMessage = verificationError?.message || "authentication_failed";
    console.log("Redirecting to login with error:", errorMessage);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
}

