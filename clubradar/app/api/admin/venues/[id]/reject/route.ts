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
    const { email: adminEmail } = await requireAdmin();

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

    // First, get full venue data to create a snapshot before rejecting
    const { data: currentVenue, error: fetchError } = await supabase
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
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !currentVenue) {
      return NextResponse.json(
        { error: "Venue not found", details: fetchError?.message },
        { status: 404 }
      );
    }

    const currentRejectionCount = currentVenue.rejection_count || 0;
    const rejectionMessage = reason || "Registration rejected by admin. Please re-register with valid documents.";
    
    // Create snapshot of venue data at time of rejection
    const venueSnapshot = {
      // Basic Info
      name: currentVenue.name,
      description: currentVenue.description,
      address: currentVenue.address,
      city: currentVenue.city,
      pincode: currentVenue.pincode,
      phone: currentVenue.phone,
      email: currentVenue.email,
      
      // Owner Info
      owner_name: currentVenue.owner_name,
      alternate_phone: currentVenue.alternate_phone,
      
      // KYC Details
      gst_number: currentVenue.gst_number,
      license_number: currentVenue.license_number,
      pan_number: currentVenue.pan_number,
      bank_account: currentVenue.bank_account,
      ifsc_code: currentVenue.ifsc_code,
      
      // Documents
      documents: currentVenue.documents || [],
      images: currentVenue.images || [],
      
      // Owner details from users table
      owner: currentVenue.users ? {
        id: currentVenue.users.id,
        name: currentVenue.users.name,
        email: currentVenue.users.email,
        phone: currentVenue.users.phone,
      } : null,
      
      // Metadata
      status: currentVenue.status,
      created_at: currentVenue.created_at,
      updated_at: currentVenue.updated_at,
    };

    // Save rejection history snapshot
    const { error: historyError } = await supabase
      .from("venue_rejection_history")
      .insert({
        venue_id: id,
        rejection_reason: rejectionMessage,
        rejected_by: adminEmail || "admin",
        rejection_number: currentRejectionCount + 1,
        venue_snapshot: venueSnapshot,
      });

    if (historyError) {
      console.error("Error saving rejection history:", historyError);
      // Continue with rejection even if history save fails
    }
    
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

