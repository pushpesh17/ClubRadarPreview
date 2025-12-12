import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";
import { NextResponse } from "next/server";

// POST /api/payments/create-order - Create Razorpay order
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

    const { amount, currency = "INR", booking_id } = await request.json();

    if (!amount || !booking_id) {
      return NextResponse.json(
        { error: "Amount and booking_id are required" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise (Razorpay expects amount in smallest currency unit)
      currency: currency,
      receipt: booking_id,
      notes: {
        booking_id: booking_id,
        user_id: user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}

