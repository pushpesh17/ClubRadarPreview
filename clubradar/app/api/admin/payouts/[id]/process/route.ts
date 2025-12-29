import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/payouts/[id]/process
 * Mark a payout as processed (payment sent to venue)
 * Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { email: adminEmail } = await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { transactionId, transactionDate, notes, status = "processed" } = body;

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

    // Update payout status
    const { data: payout, error } = await supabase
      .from("venue_payouts")
      .update({
        status: status,
        transaction_id: transactionId || null,
        transaction_date: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString(),
        processed_by: adminEmail,
        processed_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error processing payout:", error);
      return NextResponse.json(
        { error: "Failed to process payout", details: error.message },
        { status: 500 }
      );
    }

    if (!payout) {
      return NextResponse.json(
        { error: "Payout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payout processed successfully",
        payout: {
          id: payout.id,
          status: payout.status,
          transactionId: payout.transaction_id,
          processedAt: payout.processed_at,
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

    console.error("Process payout API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

