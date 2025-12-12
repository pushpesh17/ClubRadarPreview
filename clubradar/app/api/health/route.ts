import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// GET /api/health - Diagnostic endpoint to check Supabase connection
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    supabase: {
      url: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` 
          : "MISSING",
        isValid: false,
      },
      serviceKey: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY 
          ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` 
          : "MISSING",
        isValid: false,
      },
      connection: {
        status: "unknown",
        error: null,
      },
    },
  };

  // Validate URL format
  if (diagnostics.supabase.url.exists) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      diagnostics.supabase.url.isValid = url.protocol === "https:" && url.hostname.includes("supabase.co");
    } catch {
      diagnostics.supabase.url.isValid = false;
    }
  }

  // Validate service key format (should start with eyJ for JWT)
  if (diagnostics.supabase.serviceKey.exists) {
    diagnostics.supabase.serviceKey.isValid = 
      process.env.SUPABASE_SERVICE_ROLE_KEY!.startsWith("eyJ");
  }

  // Try to connect to Supabase
  if (diagnostics.supabase.url.exists && diagnostics.supabase.serviceKey.exists) {
    try {
      const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Try a simple query
      const { error } = await supabase
        .from("events")
        .select("id")
        .limit(1);

      if (error) {
        diagnostics.supabase.connection.status = "error";
        diagnostics.supabase.connection.error = error.message;
      } else {
        diagnostics.supabase.connection.status = "connected";
      }
    } catch (error: any) {
      diagnostics.supabase.connection.status = "failed";
      diagnostics.supabase.connection.error = error.message || "Connection failed";
    }
  }

  const allGood = 
    diagnostics.supabase.url.exists &&
    diagnostics.supabase.url.isValid &&
    diagnostics.supabase.serviceKey.exists &&
    diagnostics.supabase.serviceKey.isValid &&
    diagnostics.supabase.connection.status === "connected";

  return NextResponse.json(diagnostics, {
    status: allGood ? 200 : 503,
  });
}

