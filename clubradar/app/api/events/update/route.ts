import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function PUT(request: NextRequest) {
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

    // Check if user has an approved venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "No approved venue found" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { eventId, ...updateData } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Verify the event belongs to the user's venue
    const { data: event, error: eventCheckError } = await supabase
      .from("events")
      .select("venue_id")
      .eq("id", eventId)
      .single();

    if (eventCheckError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.venue_id !== venue.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this event" },
        { status: 403 }
      );
    }

    // Prepare update data
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
    } = updateData;

    // Validate required fields
    if (!name || !date || !time || !genre || !price || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: name, date, time, genre, price, and capacity are required" },
        { status: 400 }
      );
    }

    // Validate capacity
    if (capacity <= 0) {
      return NextResponse.json(
        { error: "Capacity must be greater than 0" },
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

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        name,
        description: description || null,
        date,
        time,
        genre,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        dress_code: dressCode || null,
        images: images || [],
      })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating event:", updateError);
      return NextResponse.json(
        { error: "Failed to update event", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully!",
    }, { status: 200 });
  } catch (error: any) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

