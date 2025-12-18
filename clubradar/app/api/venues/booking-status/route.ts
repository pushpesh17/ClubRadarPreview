import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// POST /api/venues/booking-status { paused: boolean }
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const paused = !!body?.paused;

    // Update user's venue (any status) – only owner can toggle
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "No venue found for this account" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("venues")
      .update({ booking_paused: paused })
      .eq("id", venue.id);

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update booking status",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, bookingPaused: paused },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
