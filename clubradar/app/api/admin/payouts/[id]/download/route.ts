import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/payouts/[id]/download
 * Generate and download payout slip as PDF
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
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

    // Get payout details
    const { data: payout, error } = await supabase
      .from("venue_payouts")
      .select(
        `
        *,
        venues (
          id,
          name,
          city,
          address,
          owner_name,
          phone,
          email,
          bank_account,
          ifsc_code
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !payout) {
      return NextResponse.json(
        { error: "Payout not found", details: error?.message },
        { status: 404 }
      );
    }

    // Generate PDF content (we'll return JSON with payout data, client will generate PDF)
    const payoutData = {
      id: payout.id,
      venue: payout.venues
        ? {
            id: payout.venues.id,
            name: payout.venues.name,
            city: payout.venues.city,
            address: payout.venues.address,
            ownerName: payout.venues.owner_name,
            phone: payout.venues.phone,
            email: payout.venues.email,
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
      transactionId: payout.transaction_id,
      transactionDate: payout.transaction_date,
      processedBy: payout.processed_by,
      processedAt: payout.processed_at,
      bookingCount: payout.booking_count || 0,
      totalRevenue: parseFloat(payout.total_revenue || 0),
      createdAt: payout.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        payout: payoutData,
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

    console.error("Download payout API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

