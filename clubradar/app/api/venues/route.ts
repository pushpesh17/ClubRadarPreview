import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { secureAPIRequest, logSecurityEvent } from "@/lib/security/api-security";
import { sanitizeString, isValidLength } from "@/lib/security/validation";

// GET /api/venues - Get approved venues (optionally filtered by city)
export async function GET(request: NextRequest) {
  try {
    // Apply security checks
    const security = await secureAPIRequest(request, {
      methods: ["GET"],
      rateLimit: "standard",
    });

    if (security.error) {
      return security.error;
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

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      console.error("Invalid Supabase URL format:", supabaseUrl);
      return NextResponse.json(
        {
          error: "Invalid Supabase URL format",
          details: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
        },
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

    // Get query parameters and sanitize
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") ? sanitizeString(searchParams.get("city")!) : null;
    const search = searchParams.get("search") ? sanitizeString(searchParams.get("search")!) : null;

    // Validate input length
    if (city && !isValidLength(city, 0, 100)) {
      return NextResponse.json(
        { error: "Invalid city parameter" },
        { status: 400 }
      );
    }

    if (search && !isValidLength(search, 0, 200)) {
      return NextResponse.json(
        { error: "Invalid search parameter" },
        { status: 400 }
      );
    }

    // Build query - only get approved venues
    let query = supabase
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("name", { ascending: true });

    // Filter by city if provided
    if (city && city.trim() !== "" && city.toLowerCase() !== "all") {
      query = query.ilike("city", `%${city.trim()}%`);
    }

    // Search filter (name, address, city)
    if (search && search.trim() !== "") {
      query = query.or(
        `name.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%`
      );
    }

    const { data: venues, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to fetch venues",
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 400 }
      );
    }

    // Get event counts for each venue (only upcoming events)
    const venueIds = (venues || []).map((v: any) => v.id);
    
    if (venueIds.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().split(" ")[0].substring(0, 5); // HH:MM format

      const { data: events } = await supabase
        .from("events")
        .select("venue_id, date, time")
        .in("venue_id", venueIds);

      // Count active events per venue (upcoming events only)
      const eventCounts: Record<string, number> = {};
      (events || []).forEach((event: any) => {
        const eventDate = event.date;
        const eventTime = event.time?.substring(0, 5) || "00:00";
        
        // Check if event is upcoming
        const isUpcoming = 
          eventDate > today || 
          (eventDate === today && eventTime >= now);

        if (isUpcoming) {
          eventCounts[event.venue_id] = (eventCounts[event.venue_id] || 0) + 1;
        }
      });

      // Add event counts to venues
      const venuesWithCounts = (venues || []).map((venue: any) => ({
        ...venue,
        activeEventsCount: eventCounts[venue.id] || 0,
      }));

      return NextResponse.json({ venues: venuesWithCounts });
    }

    return NextResponse.json({ venues: venues || [] });
  } catch (error: any) {
    console.error("Unexpected error in GET /api/venues:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch venues",
        details: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

