import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/payouts/revenue
 * Get revenue summary for all venues in a date range
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const venueId = searchParams.get("venueId");

    // Get all approved venues
    const { data: venues, error: venuesError } = await supabase
      .from("venues")
      .select("id, name, city, status")
      .eq("status", "approved");

    if (venuesError) {
      return NextResponse.json(
        { error: "Failed to fetch venues", details: venuesError.message },
        { status: 500 }
      );
    }

    const venueList = venueId 
      ? venues?.filter((v: any) => v.id === venueId) || []
      : venues || [];

    // Get revenue for each venue
    const venueRevenueData = await Promise.all(
      venueList.map(async (venue: any) => {
        // Get all events for this venue
        const { data: events } = await supabase
          .from("events")
          .select("id")
          .eq("venue_id", venue.id);

        const eventIds = (events || []).map((e: any) => e.id);

        let totalRevenue = 0;
        let bookingCount = 0;
        let completedBookings = 0;

        if (eventIds.length > 0) {
          // Build booking query
          let bookingQuery = supabase
            .from("bookings")
            .select("total_amount, payment_status, created_at")
            .in("event_id", eventIds)
            .eq("payment_status", "completed");

          // Apply date filter if provided
          if (startDate && endDate) {
            bookingQuery = bookingQuery
              .gte("created_at", `${startDate}T00:00:00Z`)
              .lte("created_at", `${endDate}T23:59:59Z`);
          }

          const { data: bookings } = await bookingQuery;

          totalRevenue = (bookings || []).reduce(
            (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
            0
          );
          bookingCount = bookings?.length || 0;
          completedBookings = bookings?.filter((b: any) => b.payment_status === "completed").length || 0;
        }

        // Get existing payouts for this venue in the period (if date range provided)
        let existingPayouts = [];
        if (startDate && endDate) {
          const { data: payouts } = await supabase
            .from("venue_payouts")
            .select("id, total_revenue, net_amount, status, period_start_date, period_end_date")
            .eq("venue_id", venue.id)
            .gte("period_start_date", startDate)
            .lte("period_end_date", endDate);

          existingPayouts = payouts || [];
        }

        return {
          venueId: venue.id,
          venueName: venue.name,
          city: venue.city,
          totalRevenue,
          bookingCount,
          completedBookings,
          existingPayouts: existingPayouts.length,
          hasExistingPayout: existingPayouts.length > 0,
        };
      })
    );

    // Calculate totals
    const totals = venueRevenueData.reduce(
      (acc, venue) => ({
        totalRevenue: acc.totalRevenue + venue.totalRevenue,
        totalBookings: acc.totalBookings + venue.bookingCount,
        totalVenues: acc.totalVenues + 1,
        venuesWithRevenue: acc.venuesWithRevenue + (venue.totalRevenue > 0 ? 1 : 0),
      }),
      { totalRevenue: 0, totalBookings: 0, totalVenues: 0, venuesWithRevenue: 0 }
    );

    return NextResponse.json(
      {
        success: true,
        revenue: venueRevenueData,
        totals,
        period: startDate && endDate ? { startDate, endDate } : null,
      },
      { status: 200 }
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

    console.error("Revenue API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

