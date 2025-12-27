import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/venues/[id]/reject
 * Reject a venue registration
 * Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const reason = body.reason || "Registration rejected by admin";

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

    // First, get current venue to check rejection_count
    const { data: currentVenue } = await supabase
      .from("venues")
      .select("rejection_count")
      .eq("id", id)
      .single();

    const currentRejectionCount = currentVenue?.rejection_count || 0;
    const rejectionMessage = reason || "Registration rejected by admin. Please re-register with valid documents.";
    
    // Update venue status to rejected
    // Store rejection reason in rejection_reason field and track rejection history
    const { data, error } = await supabase
      .from("venues")
      .update({
        status: "rejected",
        rejection_reason: rejectionMessage, // Store rejection reason separately
        rejected_at: new Date().toISOString(), // Track when it was rejected
        rejection_count: currentRejectionCount + 1, // Increment rejection count
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting venue:", error);
      return NextResponse.json(
        { error: "Failed to reject venue", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Venue rejected successfully",
        venue: data,
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

    console.error("Reject venue API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

