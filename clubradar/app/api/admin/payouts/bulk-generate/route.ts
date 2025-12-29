import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/payouts/bulk-generate
 * Generate payouts for all approved venues in a period
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const { email: adminEmail } = await requireAdmin();

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

    const body = await request.json();
    const {
      periodStartDate,
      periodEndDate,
      commissionRate = 10.0,
      venueIds = [], // Optional: specific venue IDs, or empty for all venues
    } = body;

    if (!periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { error: "Missing required fields: periodStartDate, periodEndDate" },
        { status: 400 }
      );
    }

    // Get all approved venues (or specific ones if provided)
    let venueQuery = supabase
      .from("venues")
      .select("id, name, bank_account, ifsc_code, owner_name")
      .eq("status", "approved");

    if (venueIds.length > 0) {
      venueQuery = venueQuery.in("id", venueIds);
    }

    const { data: venues, error: venuesError } = await venueQuery;

    if (venuesError) {
      return NextResponse.json(
        { error: "Failed to fetch venues", details: venuesError.message },
        { status: 500 }
      );
    }

    if (!venues || venues.length === 0) {
      return NextResponse.json(
        { error: "No approved venues found" },
        { status: 400 }
      );
    }

    const results = {
      success: [] as any[],
      failed: [] as any[],
      skipped: [] as any[],
    };

    // Generate payout for each venue
    for (const venue of venues) {
      try {
        // Check if payout already exists
        const { data: existingPayout } = await supabase
          .from("venue_payouts")
          .select("id")
          .eq("venue_id", venue.id)
          .eq("period_start_date", periodStartDate)
          .eq("period_end_date", periodEndDate)
          .maybeSingle();

        if (existingPayout) {
          results.skipped.push({
            venueId: venue.id,
            venueName: venue.name,
            reason: "Payout already exists for this period",
          });
          continue;
        }

        // Get events for this venue
        const { data: events } = await supabase
          .from("events")
          .select("id")
          .eq("venue_id", venue.id);

        const eventIds = (events || []).map((e: any) => e.id);

        // Calculate revenue
        let totalRevenue = 0;
        let bookingCount = 0;

        if (eventIds.length > 0) {
          const { data: bookings } = await supabase
            .from("bookings")
            .select("total_amount, payment_status, created_at")
            .in("event_id", eventIds)
            .eq("payment_status", "completed")
            .gte("created_at", `${periodStartDate}T00:00:00Z`)
            .lte("created_at", `${periodEndDate}T23:59:59Z`);

          totalRevenue = (bookings || []).reduce(
            (sum: number, booking: any) => sum + parseFloat(booking.total_amount || 0),
            0
          );
          bookingCount = bookings?.length || 0;
        }

        // Calculate commission and net amount
        const commissionAmount = (totalRevenue * commissionRate) / 100;
        const netAmount = totalRevenue - commissionAmount;

        // Create payout
        const { data: payout, error: payoutError } = await supabase
          .from("venue_payouts")
          .insert({
            venue_id: venue.id,
            payout_amount: totalRevenue,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            net_amount: netAmount,
            period_start_date: periodStartDate,
            period_end_date: periodEndDate,
            status: "pending",
            payment_method: "bank_transfer",
            bank_account: venue.bank_account,
            ifsc_code: venue.ifsc_code,
            account_holder_name: venue.owner_name,
            booking_count: bookingCount,
            total_revenue: totalRevenue,
          })
          .select()
          .single();

        if (payoutError) {
          results.failed.push({
            venueId: venue.id,
            venueName: venue.name,
            error: payoutError.message,
          });
        } else {
          results.success.push({
            venueId: venue.id,
            venueName: venue.name,
            payoutId: payout.id,
            netAmount: parseFloat(payout.net_amount),
            bookingCount: payout.booking_count,
            totalRevenue: parseFloat(payout.total_revenue),
          });
        }
      } catch (error: any) {
        results.failed.push({
          venueId: venue.id,
          venueName: venue.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Generated ${results.success.length} payouts, ${results.skipped.length} skipped, ${results.failed.length} failed`,
        results,
        summary: {
          total: venues.length,
          successful: results.success.length,
          skipped: results.skipped.length,
          failed: results.failed.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (
      error.message?.includes("Access denied") ||
      error.message?.includes("Authentication required")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Bulk generate payout API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

