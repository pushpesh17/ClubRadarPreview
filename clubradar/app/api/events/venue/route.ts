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
          events: []
        },
        { status: 200 } // Return empty array instead of error
      );
    }

    // Get all events for this venue
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("venue_id", venue.id)
      // Most recent events first (newly created events appear at top)
      // Prefer created_at if available; fallback ordering is still fine if column exists.
      .order("created_at", { ascending: false })
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // Get actual booking counts and revenue from bookings table for accuracy
    const eventIds = (events || []).map((e: any) => e.id);
    
    if (eventIds.length > 0) {
      // Get booking counts per event (only completed bookings)
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("event_id, number_of_people, total_amount, payment_status")
        .in("event_id", eventIds)
        .eq("payment_status", "completed");

      if (bookingsError) {
        console.error("Error fetching bookings for events:", bookingsError);
        // Continue with events even if booking fetch fails
      }

      // Calculate actual booking counts and revenue per event
      const bookingStats: Record<string, { booked: number; revenue: number }> = {};
      
      (bookings || []).forEach((booking: any) => {
        const eventId = booking.event_id;
        if (!bookingStats[eventId]) {
          bookingStats[eventId] = { booked: 0, revenue: 0 };
        }
        bookingStats[eventId].booked += booking.number_of_people || 0;
        bookingStats[eventId].revenue += parseFloat(booking.total_amount || 0);
      });

      // Add actual booking counts and revenue to events
      const eventsWithStats = (events || []).map((event: any) => ({
        ...event,
        booked: bookingStats[event.id]?.booked || 0,
        actualRevenue: bookingStats[event.id]?.revenue || 0,
      }));

      return NextResponse.json(
        {
          success: true,
          events: eventsWithStats || [],
          count: eventsWithStats?.length || 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        events: events || [],
        count: events?.length || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

