import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const genre = searchParams.get("genre");
    const date = searchParams.get("date");

    // Use service role key to bypass RLS (needed for public access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
      });
      return NextResponse.json(
        { 
          error: "Server configuration error. Missing Supabase credentials.",
          details: "Please check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        },
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
          details: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL (e.g., https://xxxxx.supabase.co)"
        },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    let supabase;
    try {
      supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (clientError: any) {
      console.error("Failed to create Supabase client:", clientError);
      return NextResponse.json(
        { 
          error: "Failed to initialize database connection",
          details: clientError.message || "Please check your Supabase credentials"
        },
        { status: 500 }
      );
    }

    // Build the query with proper error handling
    // Try with venues join first, fallback to events only if join fails
    let query = supabase
      .from("events")
      .select(`
        *,
        venues (
          id,
          name,
          address,
          city,
          pincode,
          phone,
          email
        )
      `);

    // Apply filters
    if (genre && genre !== "all") {
      query = query.eq("genre", genre);
    }

    if (date) {
      query = query.eq("date", date);
    }

    // Add ordering
    query = query.order("date", { ascending: true });
    query = query.order("time", { ascending: true });

    let { data, error } = await query;

    // If join fails, try without venues join as fallback
    if (error && error.message?.includes("venues")) {
      console.warn("Venues join failed, trying without join:", error.message);
      
      // Retry without venues join
      let fallbackQuery = supabase
        .from("events")
        .select("*");

      if (genre && genre !== "all") {
        fallbackQuery = fallbackQuery.eq("genre", genre);
      }

      if (date) {
        fallbackQuery = fallbackQuery.eq("date", date);
      }

      fallbackQuery = fallbackQuery.order("date", { ascending: true });
      fallbackQuery = fallbackQuery.order("time", { ascending: true });

      const fallbackResult = await fallbackQuery;
      
      if (fallbackResult.error) {
        // Both queries failed, return error
        console.error("Supabase query error (both attempts failed):", fallbackResult.error);
        return NextResponse.json(
          { 
            error: fallbackResult.error.message || "Failed to fetch events",
            details: fallbackResult.error.details,
            hint: fallbackResult.error.hint,
            code: fallbackResult.error.code
          },
          { status: 400 }
        );
      }
      
      // Use fallback data
      data = fallbackResult.data;
      error = null;
    }

    if (error) {
      console.error("Supabase query error:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // Check if it's a network/connection error
      if (error.message?.includes("fetch failed") || error.message?.includes("TypeError")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
            hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
          },
          { status: 503 }
        );
      }
      
      // Return more detailed error information
      return NextResponse.json(
        { 
          error: error.message || "Failed to fetch events",
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 400 }
      );
    }

    // Filter by city in post-processing if needed (more reliable than JSONB filter)
    let filteredData = data;
    if (city && filteredData) {
      filteredData = filteredData.filter((event: any) => {
        // Check venue city first (more reliable)
        if (event.venues?.city?.toLowerCase() === city.toLowerCase()) {
          return true;
        }
        // Fallback to location JSONB field
        if (event.location?.city?.toLowerCase() === city.toLowerCase()) {
          return true;
        }
        return false;
      });
    }

    return NextResponse.json({ events: filteredData || [] });
  } catch (error: any) {
    console.error("Unexpected error in GET /api/events:", error);
    
    // Check if it's a network/connection error
    if (error.message?.includes("fetch failed") || error.message?.includes("TypeError") || error.name === "TypeError") {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch events",
        details: "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventData = await request.json();

    // Get user's venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "No approved venue found for this user" },
        { status: 400 }
      );
    }

    // Create event
    const { data, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        venue_id: venue.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

