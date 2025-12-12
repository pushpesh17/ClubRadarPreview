import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
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
          bookings: [],
          count: 0
        },
        { status: 200 } // Return empty array instead of error
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    // First, get all event IDs for this venue
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
      return NextResponse.json(
        {
          success: true,
          bookings: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        { status: 200 }
      );
    }

    // Build query for bookings
    let query = supabase
      .from("bookings")
      .select(`
        *,
        events (
          id,
          name,
          date,
          time,
          genre,
          price
        ),
        users (
          id,
          name,
          phone,
          email
        )
      `, { count: "exact" })
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`users.name.ilike.%${search}%,users.phone.ilike.%${search}%,users.email.ilike.%${search}%`);
    }

    // Apply status filter
    // Note: bookings table uses payment_status, not status
    // Map frontend status to payment_status
    if (status && status !== "all") {
      if (status === "confirmed") {
        query = query.eq("payment_status", "completed");
      } else if (status === "pending") {
        query = query.eq("payment_status", "pending");
      } else if (status === "cancelled") {
        query = query.eq("payment_status", "failed");
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error: bookingsError, count } = await query;

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings", details: bookingsError.message },
        { status: 500 }
      );
    }

    // Format bookings for frontend
    const formattedBookings = (bookings || []).map((booking: any) => ({
      id: booking.id,
      name: booking.users?.name || "Unknown",
      phone: booking.users?.phone || "N/A",
      email: booking.users?.email || "N/A",
      event: booking.events?.name || "Unknown Event",
      eventId: booking.events?.id,
      date: booking.events?.date || booking.created_at?.split('T')[0] || "",
      time: booking.events?.time || "",
      genre: booking.events?.genre || "",
      status: booking.payment_status === "completed" ? "confirmed" : booking.payment_status || "pending",
      paymentStatus: booking.payment_status || "pending",
      qrCode: booking.qr_code || "",
      numberOfPeople: booking.number_of_people || 1,
      totalPrice: booking.total_amount || 0,
      pricePerPerson: booking.total_amount && booking.number_of_people ? (booking.total_amount / booking.number_of_people) : 0,
      bookingDate: booking.created_at,
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
    console.error("Venue bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

