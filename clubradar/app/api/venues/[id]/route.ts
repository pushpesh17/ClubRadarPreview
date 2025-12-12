import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// GET /api/venues/[id] - Get venue details with active events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params;

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get venue details
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .eq("status", "approved")
      .single();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "Venue not found or not approved" },
        { status: 404 }
      );
    }

    // Get active/upcoming events for this venue
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0].substring(0, 5); // HH:MM format

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("venue_id", venueId)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    // Filter events to only include truly upcoming ones (including today's future events)
    const activeEvents = (events || []).filter((event: any) => {
      const eventDate = event.date;
      const eventTime = event.time?.substring(0, 5) || "00:00";
      
      // Event is active if:
      // 1. Date is in the future, OR
      // 2. Date is today AND time is in the future
      return eventDate > today || (eventDate === today && eventTime >= now);
    });

    return NextResponse.json({
      venue,
      events: activeEvents,
    });
  } catch (error: any) {
    console.error("Unexpected error in GET /api/venues/[id]:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch venue",
        details: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

