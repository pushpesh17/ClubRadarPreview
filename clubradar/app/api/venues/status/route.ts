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
    const { createClient: createServiceClient } = await import(
      "@supabase/supabase-js"
    );
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user's venue directly
    // Use maybeSingle() to avoid errors when no venue is found
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(); // Returns null instead of error when no row found

    if (venueError) {
      console.error("Error fetching venue:", venueError);
      console.error(
        "Venue error details:",
        JSON.stringify(venueError, null, 2)
      );

      // If it's a foreign key constraint error, user doesn't exist in users table
      // This is normal for new users - treat as no venue
      if (
        venueError.code === "23503" ||
        venueError.message?.includes("foreign key")
      ) {
        return NextResponse.json(
          {
            hasVenue: false,
            message: "No venue registered. Please register your venue first.",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch venue status",
          details: venueError.message,
          code: venueError.code,
        },
        { status: 500 }
      );
    }

    // If no venue found (maybeSingle returns null)
    if (!venue) {
      return NextResponse.json(
        {
          hasVenue: false,
          message: "No venue registered. Please register your venue first.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        hasVenue: true,
        venue: {
          id: venue.id,
          name: venue.name,
          status: venue.status,
          city: venue.city,
          address: venue.address,
          createdAt: venue.created_at,
          images: venue.images || [],
          amenities: venue.amenities || [],
          rating: venue.rating || 0,
          description: venue.description || null,
          bookingPaused: venue.booking_paused ?? false,
        },
        isApproved: venue.status === "approved",
        message:
          venue.status === "pending"
            ? "Your venue registration is pending approval. You'll be able to create events once approved."
            : venue.status === "approved"
            ? "Your venue is approved! You can now create events."
            : "Your venue registration was rejected. Please contact support.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Venue status error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
