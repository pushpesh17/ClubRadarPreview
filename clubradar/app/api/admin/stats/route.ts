import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/stats
 * Get platform-wide statistics
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get all stats in parallel
    const [
      venuesResult,
      bookingsResult,
      eventsResult,
      usersResult,
      revenueResult,
    ] = await Promise.all([
      // Total venues by status
      supabase
        .from("venues")
        .select("status", { count: "exact", head: true }),
      
      // Total bookings
      supabase
        .from("bookings")
        .select("payment_status, total_amount, created_at", { count: "exact" }),
      
      // Total events
      supabase
        .from("events")
        .select("id, date", { count: "exact" }),
      
      // Total users
      supabase
        .from("users")
        .select("id", { count: "exact", head: true }),
      
      // Revenue from completed bookings
      supabase
        .from("bookings")
        .select("total_amount")
        .eq("payment_status", "completed"),
    ]);

    // Count venues by status
    const { data: allVenues } = await supabase
      .from("venues")
      .select("status");

    const venueCounts = {
      total: venuesResult.count || 0,
      approved: allVenues?.filter((v) => v.status === "approved").length || 0,
      pending: allVenues?.filter((v) => v.status === "pending").length || 0,
      rejected: allVenues?.filter((v) => v.status === "rejected").length || 0,
    };

    // Calculate booking stats
    const bookings = bookingsResult.data || [];
    const totalBookings = bookingsResult.count || 0;
    const completedBookings = bookings.filter(
      (b) => b.payment_status === "completed"
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.payment_status === "pending"
    ).length;

    // Calculate revenue
    const revenue = (revenueResult.data || []).reduce(
      (sum, booking) => sum + parseFloat(booking.total_amount || 0),
      0
    );

    // Count active events (upcoming)
    const today = new Date().toISOString().split("T")[0];
    const events = eventsResult.data || [];
    const activeEvents = events.filter(
      (event) => event.date >= today
    ).length;

    // Get today's bookings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayBookings = bookings.filter(
      (b) => new Date(b.created_at) >= todayStart
    ).length;

    return NextResponse.json(
      {
        success: true,
        stats: {
          venues: venueCounts,
          bookings: {
            total: totalBookings,
            completed: completedBookings,
            pending: pendingBookings,
            today: todayBookings,
          },
          events: {
            total: eventsResult.count || 0,
            active: activeEvents,
          },
          users: {
            total: usersResult.count || 0,
          },
          revenue: {
            total: revenue,
            formatted: `₹${(revenue / 100000).toFixed(1)}L`,
          },
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

    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

