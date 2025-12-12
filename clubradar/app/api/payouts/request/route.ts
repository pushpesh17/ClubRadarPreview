import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // Use service role key to bypass RLS (needed for Clerk auth)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user's approved venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "No approved venue found" },
        { status: 403 }
      );
    }

    // Get pending payout amount
    const { data: venueEvents } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venue.id);

    const eventIds = (venueEvents || []).map((e: any) => e.id);

    if (eventIds.length === 0) {
      return NextResponse.json(
        { error: "No events found for this venue" },
        { status: 400 }
      );
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select("total_amount")
      .in("event_id", eventIds)
      .eq("payment_status", "completed");

    const totalEarnings = (bookings || []).reduce(
      (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
      0
    );

    const { data: completedPayouts } = await supabase
      .from("payouts")
      .select("amount")
      .eq("venue_id", venue.id)
      .eq("status", "completed");

    const totalPaidOut = (completedPayouts || []).reduce(
      (sum: number, payout: any) => sum + parseFloat(payout.amount || 0),
      0
    );

    const pendingPayout = totalEarnings - totalPaidOut;

    if (pendingPayout <= 0) {
      return NextResponse.json(
        { error: "No pending payout available" },
        { status: 400 }
      );
    }

    // Check if there's already a pending payout request
    const { data: existingPayout } = await supabase
      .from("payouts")
      .select("id")
      .eq("venue_id", venue.id)
      .in("status", ["pending", "processing"])
      .maybeSingle();

    if (existingPayout) {
      return NextResponse.json(
        { error: "You already have a pending payout request" },
        { status: 400 }
      );
    }

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .insert({
        venue_id: venue.id,
        amount: pendingPayout,
        status: "pending",
        payment_method: "bank_transfer", // Default, can be updated later
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Error creating payout:", payoutError);
      return NextResponse.json(
        { error: "Failed to create payout request", details: payoutError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: parseFloat(payout.amount),
        status: payout.status,
        requestedAt: payout.requested_at
      },
      message: "Payout request submitted successfully"
    }, { status: 201 });
  } catch (error: any) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

