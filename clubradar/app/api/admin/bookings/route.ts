import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/bookings
 * Get all bookings across all venues
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const venueId = searchParams.get("venueId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        events (
          id,
          name,
          date,
          time,
          genre,
          price,
          venues (
            id,
            name,
            city
          )
        ),
        users (
          id,
          name,
          email,
          phone
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status !== "all") {
      if (status === "confirmed") {
        query = query.eq("payment_status", "completed");
      } else if (status === "pending") {
        query = query.eq("payment_status", "pending");
      } else if (status === "cancelled") {
        query = query.eq("payment_status", "failed");
      }
    }

    if (venueId) {
      // Filter by venue through events - need to join properly
      // First get event IDs for this venue
      const { data: venueEvents } = await supabase
        .from("events")
        .select("id")
        .eq("venue_id", venueId);
      
      const eventIds = (venueEvents || []).map((e: any) => e.id);
      
      if (eventIds.length > 0) {
        query = query.in("event_id", eventIds);
      } else {
        // No events for this venue, return empty
        return NextResponse.json(
          {
            success: true,
            bookings: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          },
          { status: 200 }
        );
      }
    }

    // Apply date range filter
    if (startDate && endDate) {
      query = query
        .gte("created_at", `${startDate}T00:00:00Z`)
        .lte("created_at", `${endDate}T23:59:59Z`);
    }

    if (search) {
      query = query.or(
        `users.name.ilike.%${search}%,users.email.ilike.%${search}%,users.phone.ilike.%${search}%,events.name.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedBookings = (bookings || []).map((booking: any) => ({
      id: booking.id,
      user: booking.users
        ? {
            id: booking.users.id,
            name: booking.users.name,
            email: booking.users.email,
            phone: booking.users.phone,
          }
        : null,
      event: booking.events
        ? {
            id: booking.events.id,
            name: booking.events.name,
            date: booking.events.date,
            time: booking.events.time,
            genre: booking.events.genre,
            price: booking.events.price,
            venue: booking.events.venues
              ? {
                  id: booking.events.venues.id,
                  name: booking.events.venues.name,
                  city: booking.events.venues.city,
                }
              : null,
          }
        : null,
      numberOfPeople: booking.number_of_people || 1,
      totalAmount: parseFloat(booking.total_amount || 0),
      paymentStatus: booking.payment_status || "pending",
      status:
        booking.payment_status === "completed"
          ? "confirmed"
          : booking.payment_status || "pending",
      qrCode: booking.qr_code || "",
      createdAt: booking.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        bookings: formattedBookings,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message?.includes("Access denied") || error.message?.includes("Authentication required")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Admin bookings API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

