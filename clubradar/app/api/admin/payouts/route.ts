import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/payouts
 * Get all venue payouts with filtering and pagination
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const venueId = searchParams.get("venueId") || "";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("venue_payouts")
      .select(
        `
        *,
        venues (
          id,
          name,
          city,
          owner_name,
          bank_account,
          ifsc_code
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (venueId) {
      query = query.eq("venue_id", venueId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: payouts, error, count } = await query;

    if (error) {
      console.error("Error fetching payouts:", error);
      
      // Check if table doesn't exist
      if (error.message?.includes("does not exist") || error.message?.includes("relation") || error.code === "42P01") {
        return NextResponse.json(
          {
            success: true,
            payouts: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
            },
            message: "Payouts table not found. Please run the SQL migration: supabase/create-venue-payouts-table.sql",
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch payouts", details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedPayouts = (payouts || []).map((payout: any) => ({
      id: payout.id,
      venueId: payout.venue_id,
      venue: payout.venues
        ? {
            id: payout.venues.id,
            name: payout.venues.name,
            city: payout.venues.city,
            ownerName: payout.venues.owner_name,
            bankAccount: payout.venues.bank_account,
            ifscCode: payout.venues.ifsc_code,
          }
        : null,
      payoutAmount: parseFloat(payout.payout_amount || 0),
      commissionRate: parseFloat(payout.commission_rate || 10),
      commissionAmount: parseFloat(payout.commission_amount || 0),
      netAmount: parseFloat(payout.net_amount || 0),
      periodStartDate: payout.period_start_date,
      periodEndDate: payout.period_end_date,
      status: payout.status,
      paymentMethod: payout.payment_method,
      bankAccount: payout.bank_account,
      ifscCode: payout.ifsc_code,
      accountHolderName: payout.account_holder_name,
      transactionId: payout.transaction_id,
      transactionDate: payout.transaction_date,
      processedBy: payout.processed_by,
      processedAt: payout.processed_at,
      notes: payout.notes,
      bookingCount: payout.booking_count || 0,
      totalRevenue: parseFloat(payout.total_revenue || 0),
      createdAt: payout.created_at,
      updatedAt: payout.updated_at,
    }));

    return NextResponse.json(
      {
        success: true,
        payouts: formattedPayouts,
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
    if (
      error.message?.includes("Access denied") ||
      error.message?.includes("Authentication required")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Admin payouts API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

