import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
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
        { 
          error: "No approved venue found",
          earnings: {
            totalEarnings: 0,
            pendingPayout: 0,
            lastPayout: null,
            payoutHistory: []
          }
        },
        { status: 200 } // Return empty data instead of error
      );
    }

    // Get all event IDs for this venue
    const { data: venueEvents, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venue.id);

    if (eventsError) {
      console.error("Error fetching venue events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch venue events", details: eventsError.message },
        { status: 500 }
      );
    }

    const eventIds = (venueEvents || []).map((e: any) => e.id);

    if (eventIds.length === 0) {
      return NextResponse.json({
        earnings: {
          totalEarnings: 0,
          pendingPayout: 0,
          lastPayout: null,
          payoutHistory: []
        }
      });
    }

    // Get all completed bookings for this venue's events
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("total_amount, payment_status, created_at")
      .in("event_id", eventIds)
      .eq("payment_status", "completed");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: bookingsError.message },
        { status: 500 }
      );
    }

    // Calculate total earnings (sum of all completed bookings)
    const totalEarnings = (bookings || []).reduce(
      (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
      0
    );

    // Get all completed payouts
    const { data: payouts, error: payoutsError } = await supabase
      .from("payouts")
      .select("id, amount, status, requested_at, processed_at")
      .eq("venue_id", venue.id)
      .eq("status", "completed")
      .order("processed_at", { ascending: false });

    if (payoutsError) {
      console.error("Error fetching payouts:", payoutsError);
      // Continue even if payouts table doesn't exist yet
    }

    // Calculate total paid out
    const totalPaidOut = (payouts || []).reduce(
      (sum: number, payout: any) => sum + parseFloat(payout.amount || 0),
      0
    );

    // Pending payout = total earnings - total paid out
    const pendingPayout = totalEarnings - totalPaidOut;

    // Get last payout
    const lastPayout = payouts && payouts.length > 0 ? {
      amount: parseFloat(payouts[0].amount),
      date: payouts[0].processed_at || payouts[0].requested_at
    } : null;

    // Get payout history (all payouts, not just completed)
    const { data: allPayouts, error: allPayoutsError } = await supabase
      .from("payouts")
      .select("id, amount, status, requested_at, processed_at")
      .eq("venue_id", venue.id)
      .order("requested_at", { ascending: false })
      .limit(10);

    const payoutHistory = (allPayouts || []).map((payout: any) => ({
      id: payout.id,
      amount: parseFloat(payout.amount),
      date: payout.processed_at || payout.requested_at,
      status: payout.status
    }));

    return NextResponse.json({
      earnings: {
        totalEarnings,
        pendingPayout: pendingPayout > 0 ? pendingPayout : 0,
        lastPayout,
        payoutHistory
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Earnings API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

