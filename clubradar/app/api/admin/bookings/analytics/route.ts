import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/bookings/analytics
 * Get booking analytics grouped by venue
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
    let venueQuery = supabase
      .from("venues")
      .select("id, name, city, status")
      .eq("status", "approved");

    if (venueId) {
      venueQuery = venueQuery.eq("id", venueId);
    }

    const { data: venues, error: venuesError } = await venueQuery;

    if (venuesError) {
      return NextResponse.json(
        { error: "Failed to fetch venues", details: venuesError.message },
        { status: 500 }
      );
    }

    const venueList = venues || [];

    // Get booking analytics for each venue
    const venueBookingData = await Promise.all(
      venueList.map(async (venue: any) => {
        // Get all events for this venue
        const { data: events } = await supabase
          .from("events")
          .select("id")
          .eq("venue_id", venue.id);

        const eventIds = (events || []).map((e: any) => e.id);

        let totalBookings = 0;
        let completedBookings = 0;
        let pendingBookings = 0;
        let cancelledBookings = 0;
        let totalRevenue = 0;
        let completedRevenue = 0;

        if (eventIds.length > 0) {
          // Build booking query
          let bookingQuery = supabase
            .from("bookings")
            .select("total_amount, payment_status, created_at")
            .in("event_id", eventIds);

          // Apply date filter if provided
          if (startDate && endDate) {
            bookingQuery = bookingQuery
              .gte("created_at", `${startDate}T00:00:00Z`)
              .lte("created_at", `${endDate}T23:59:59Z`);
          }

          const { data: bookings } = await bookingQuery;

          totalBookings = bookings?.length || 0;
          completedBookings = bookings?.filter((b: any) => b.payment_status === "completed").length || 0;
          pendingBookings = bookings?.filter((b: any) => b.payment_status === "pending").length || 0;
          cancelledBookings = bookings?.filter((b: any) => b.payment_status === "failed" || b.payment_status === "cancelled").length || 0;

          totalRevenue = (bookings || []).reduce(
            (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
            0
          );

          completedRevenue = (bookings || [])
            .filter((b: any) => b.payment_status === "completed")
            .reduce(
              (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
              0
            );
        }

        return {
          venueId: venue.id,
          venueName: venue.name,
          city: venue.city,
          totalBookings,
          completedBookings,
          pendingBookings,
          cancelledBookings,
          totalRevenue,
          completedRevenue,
          conversionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : "0.0",
        };
      })
    );

    // Calculate totals
    const totals = venueBookingData.reduce(
      (acc, venue) => ({
        totalBookings: acc.totalBookings + venue.totalBookings,
        totalCompleted: acc.totalCompleted + venue.completedBookings,
        totalPending: acc.totalPending + venue.pendingBookings,
        totalCancelled: acc.totalCancelled + venue.cancelledBookings,
        totalRevenue: acc.totalRevenue + venue.totalRevenue,
        completedRevenue: acc.completedRevenue + venue.completedRevenue,
        totalVenues: acc.totalVenues + 1,
        venuesWithBookings: acc.venuesWithBookings + (venue.totalBookings > 0 ? 1 : 0),
      }),
      {
        totalBookings: 0,
        totalCompleted: 0,
        totalPending: 0,
        totalCancelled: 0,
        totalRevenue: 0,
        completedRevenue: 0,
        totalVenues: 0,
        venuesWithBookings: 0,
      }
    );

    return NextResponse.json(
      {
        success: true,
        analytics: venueBookingData,
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

    console.error("Booking analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

