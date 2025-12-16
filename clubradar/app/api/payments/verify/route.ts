import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";

// POST /api/payments/verify - Verify Razorpay payment
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment details are required" },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update booking with payment details
    if (booking_id) {
      const { error: updateError } = await (supabase as any)
        .from("bookings")
        .update({
          payment_id: razorpay_payment_id,
          payment_status: "completed",
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", booking_id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating booking:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

