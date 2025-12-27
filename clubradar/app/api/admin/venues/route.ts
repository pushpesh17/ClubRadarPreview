import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/venues
 * Get all venues with filtering, search, and pagination
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdmin();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const city = searchParams.get("city") || "";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("venues")
      .select(
        `
        *,
        users (
          id,
          name,
          email,
          phone
        )
      `,
        { count: "exact" }
      );

    // Apply filters
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Order results
    if (status === "rejected") {
      // For rejected venues, order by rejected_at (most recent first)
      query = query.order("rejected_at", { ascending: false, nullsFirst: false });
    } else {
      // For other statuses, order by created_at (most recent first)
      query = query.order("created_at", { ascending: false });
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: venues, error, count } = await query;

    if (error) {
      console.error("Error fetching venues:", error);
      return NextResponse.json(
        { error: "Failed to fetch venues", details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedVenues = (venues || []).map((venue: any) => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      city: venue.city,
      pincode: venue.pincode,
      phone: venue.phone,
      email: venue.email,
      status: venue.status,
      bookingPaused: venue.booking_paused || false,
      images: venue.images || [],
      documents: venue.documents || [],
      rejectedAt: venue.rejected_at || null,
      rejectionCount: venue.rejection_count || 0,
      rejectionReason: venue.rejection_reason || null,
      owner: venue.users
        ? {
            id: venue.users.id,
            name: venue.users.name,
            email: venue.users.email,
            phone: venue.users.phone,
          }
        : null,
      createdAt: venue.created_at,
      updatedAt: venue.updated_at,
    }));

    return NextResponse.json(
      {
        success: true,
        venues: formattedVenues,
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
    if (error.message?.includes("Access denied") || error.message?.includes("Authentication required")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Admin venues API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

