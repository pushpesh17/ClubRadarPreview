import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
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

    // Check if user has an approved venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id, name, city, address, pincode, phone, email")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (venueError) {
      console.error("Error fetching venue:", venueError);
      return NextResponse.json(
        {
          error: "Failed to fetch venue",
          message: venueError.message,
          details: "Please try again or contact support.",
        },
        { status: 500 }
      );
    }

    if (!venue) {
      return NextResponse.json(
        {
          error: "No approved venue found",
          message:
            "Please register your venue and wait for approval before creating events.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      date,
      time,
      genre,
      price,
      capacity,
      dressCode,
      images,
      rules,
      amenities,
    } = body;

    // Validate required fields
    if (
      !name ||
      !date ||
      !time ||
      !genre ||
      price === undefined ||
      price === null
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, date, time, genre, and price are required",
        },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const eventDate = new Date(`${date}T${time}`);
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "Event date and time cannot be in the past" },
        { status: 400 }
      );
    }

    // Validate price
    if (price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        venue_id: venue.id,
        name,
        description: description || null,
        date,
        time,
        genre,
        price: parseFloat(price),
        // Capacity removed: treat as "unlimited". Keep a very high cap for compatibility with existing schema/UI.
        capacity: capacity ? parseInt(capacity) : 1000000,
        booked: 0,
        dress_code: dressCode || null,
        images: images || [],
        location: {
          address: venue.address,
          city: venue.city,
          pincode: venue.pincode,
        },
        rules: rules || [],
        amenities: amenities || [],
        contact: {
          phone: venue.phone || null,
          email: venue.email || null,
        },
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      return NextResponse.json(
        { error: "Failed to create event", details: eventError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          time: event.time,
          status: "created",
        },
        message: "Event created successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
