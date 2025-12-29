import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/payouts/generate
 * Generate payout for a venue based on completed bookings in a period
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const { email: adminEmail } = await requireAdmin();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    const {
      venueId,
      periodStartDate,
      periodEndDate,
      commissionRate = 10.0, // Default 10% commission
    } = body;

    if (!venueId || !periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { error: "Missing required fields: venueId, periodStartDate, periodEndDate" },
        { status: 400 }
      );
    }

    // Get venue details
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id, name, bank_account, ifsc_code, owner_name")
      .eq("id", venueId)
      .single();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "Venue not found", details: venueError?.message },
        { status: 404 }
      );
    }

    // Get all completed bookings for this venue in the period
    // First, get all events for this venue
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .eq("venue_id", venueId);

    if (eventsError) {
      return NextResponse.json(
        { error: "Failed to fetch events", details: eventsError.message },
        { status: 500 }
      );
    }

    const eventIds = (events || []).map((e: any) => e.id);

    // Initialize totals (will be 0 if no events or bookings)
    let totalRevenue = 0;
    let bookingCount = 0;

    // Only fetch bookings if there are events
    if (eventIds.length > 0) {
      // Get completed bookings in the period
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_amount, payment_status, created_at")
        .in("event_id", eventIds)
        .eq("payment_status", "completed")
        .gte("created_at", `${periodStartDate}T00:00:00Z`)
        .lte("created_at", `${periodEndDate}T23:59:59Z`);

      if (bookingsError) {
        return NextResponse.json(
          { error: "Failed to fetch bookings", details: bookingsError.message },
          { status: 500 }
        );
      }

      // Calculate totals
      totalRevenue = (bookings || []).reduce(
        (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
        0
      );

      bookingCount = bookings?.length || 0;
    }

    // Allow payout generation even with 0 revenue (for record keeping)
    // This handles cases where:
    // - Venue has no events yet
    // - Venue has events but no bookings in the period
    // - Venue has bookings but none are completed

    // Calculate commission and net amount
    const commissionAmount = (totalRevenue * commissionRate) / 100;
    const netAmount = totalRevenue - commissionAmount;

    // Check if payout already exists for this period
    const { data: existingPayout } = await supabase
      .from("venue_payouts")
      .select("id")
      .eq("venue_id", venueId)
      .eq("period_start_date", periodStartDate)
      .eq("period_end_date", periodEndDate)
      .maybeSingle();

    if (existingPayout) {
      return NextResponse.json(
        { error: "Payout already exists for this period" },
        { status: 400 }
      );
    }

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from("venue_payouts")
      .insert({
        venue_id: venueId,
        payout_amount: totalRevenue,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        period_start_date: periodStartDate,
        period_end_date: periodEndDate,
        status: "pending",
        payment_method: "bank_transfer",
        bank_account: venue.bank_account,
        ifsc_code: venue.ifsc_code,
        account_holder_name: venue.owner_name,
        booking_count: bookingCount,
        total_revenue: totalRevenue,
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Error creating payout:", payoutError);
      return NextResponse.json(
        { error: "Failed to create payout", details: payoutError.message },
        { status: 500 }
      );
    }

    // Return success response with payout details
    // Include a message if there's no revenue
    const responseMessage = totalRevenue === 0
      ? eventIds.length === 0
        ? "Payout created with zero revenue (no events for this venue)"
        : bookingCount === 0
        ? "Payout created with zero revenue (no bookings in this period)"
        : "Payout created with zero revenue (no completed bookings)"
      : `Payout generated successfully for ${bookingCount} booking${bookingCount !== 1 ? 's' : ''}`;

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        payout: {
          id: payout.id,
          venueId: payout.venue_id,
          payoutAmount: parseFloat(payout.payout_amount),
          commissionAmount: parseFloat(payout.commission_amount),
          netAmount: parseFloat(payout.net_amount),
          bookingCount: payout.booking_count,
          totalRevenue: parseFloat(payout.total_revenue),
          periodStartDate: payout.period_start_date,
          periodEndDate: payout.period_end_date,
          status: payout.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error.message?.includes("Access denied") ||
      error.message?.includes("Authentication required")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Generate payout API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

