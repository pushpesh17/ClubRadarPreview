import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { id: venueId } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(5, parseInt(searchParams.get("limit") || "10"))
    );
    const sort = (searchParams.get("sort") || "recent").toLowerCase(); // recent|helpful|rating
    const offset = (page - 1) * limit;

    // List reviews (public)
    let query = supabase
      .from("venue_reviews")
      .select(
        `
        id,
        venue_id,
        user_id,
        rating,
        comment,
        helpful_count,
        created_at,
        users (
          id,
          name,
          photo
        )
      `,
        { count: "exact" }
      )
      .eq("venue_id", venueId);

    if (sort === "helpful")
      query = query
        .order("helpful_count", { ascending: false })
        .order("created_at", { ascending: false });
    else if (sort === "rating")
      query = query
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code, hint: error.hint },
        { status: 400 }
      );
    }

    // Summary (avg + total) – fast enough; if needed can be materialized later
    const { data: summaryRows, error: summaryError } = await supabase
      .from("venue_reviews")
      .select("rating")
      .eq("venue_id", venueId);

    let avgRating = 0;
    let totalReviews = 0;
    if (!summaryError && summaryRows) {
      totalReviews = summaryRows.length;
      avgRating = totalReviews
        ? summaryRows.reduce((s: number, r: any) => s + (r.rating || 0), 0) /
          totalReviews
        : 0;
    }

    // Viewer eligibility (optional)
    const { userId } = await auth();
    let canReview = false;
    let hasReviewed = false;

    if (userId) {
      const { data: existing } = await supabase
        .from("venue_reviews")
        .select("id")
        .eq("venue_id", venueId)
        .eq("user_id", userId)
        .maybeSingle();
      hasReviewed = !!existing;

      if (!hasReviewed) {
        // eligible if user has at least one completed booking for any event in this venue
        const { data: bookings } = await supabase
          .from("bookings")
          .select(
            `
            id,
            payment_status,
            events!inner (
              id,
              venue_id
            )
          `
          )
          .eq("user_id", userId)
          .eq("payment_status", "completed")
          .eq("events.venue_id", venueId)
          .limit(1);
        canReview = (bookings?.length || 0) > 0;
      }
    }

    return NextResponse.json({
      success: true,
      reviews: (reviews || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.users?.name || "Guest",
        userPhoto: r.users?.photo || null,
        rating: r.rating,
        comment: r.comment || "",
        helpfulCount: r.helpful_count || 0,
        createdAt: r.created_at,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary: { avgRating, totalReviews },
      viewer: { canReview, hasReviewed },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const { id: venueId } = await params;
    const body = await request.json();
    const rating = parseInt(body?.rating);
    const comment = String(body?.comment || "").trim();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    if (!comment || comment.length < 10) {
      return NextResponse.json(
        { error: "Please write at least 10 characters" },
        { status: 400 }
      );
    }
    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "Review is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Only allow if user has a completed booking for this venue
    const { data: eligibleBookings, error: eligibleError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        payment_status,
        events!inner (
          id,
          venue_id
        )
      `
      )
      .eq("user_id", userId)
      .eq("payment_status", "completed")
      .eq("events.venue_id", venueId)
      .limit(1);

    if (eligibleError) {
      return NextResponse.json(
        { error: eligibleError.message },
        { status: 400 }
      );
    }
    if (!eligibleBookings || eligibleBookings.length === 0) {
      return NextResponse.json(
        {
          error: "Not allowed",
          details:
            "Only users with a completed booking can write a review for this venue.",
        },
        { status: 403 }
      );
    }

    // One review per user per venue
    const { data: existing } = await supabase
      .from("venue_reviews")
      .select("id")
      .eq("venue_id", venueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already reviewed this venue." },
        { status: 409 }
      );
    }

    const { data: created, error: createError } = await supabase
      .from("venue_reviews")
      .insert({
        venue_id: venueId,
        user_id: userId,
        rating,
        comment,
      })
      .select("id, rating, comment, helpful_count, created_at")
      .single();

    if (createError) {
      return NextResponse.json(
        { error: createError.message, code: createError.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, review: created },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
