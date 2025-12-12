import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, token, type } = body;

    if ((!email && !phone) || !token) {
      return NextResponse.json(
        { error: "Email/phone and token are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OTP - use separate calls for email vs phone
    let data, error;
    
    if (email) {
      const result = await supabase.auth.verifyOtp({
        email: email,
        token,
        type: type || "email",
      });
      data = result.data;
      error = result.error;
    } else if (phone) {
      const result = await supabase.auth.verifyOtp({
        phone: phone,
        token,
        type: type || "sms",
      });
      data = result.data;
      error = result.error;
    } else {
      return NextResponse.json(
        { error: "Email or phone must be provided" },
        { status: 400 }
      );
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create or update user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

