import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/venues/[id]
 * Get full venue details including all documents and information
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

    // Get full venue details
    const { data: venue, error } = await supabase
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

    if (error) {
      console.error("Error fetching venue:", error);
      return NextResponse.json(
        { error: "Failed to fetch venue", details: error.message },
        { status: 500 }
      );
    }

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    // Generate signed URLs for documents
    const documentUrls: string[] = [];
    if (venue.documents && Array.isArray(venue.documents) && venue.documents.length > 0) {
      for (const docPath of venue.documents) {
        // Check if it's already a full URL (old format) or a file path (new format)
        if (docPath.startsWith('http')) {
          // Old format - already a URL, keep as is
          documentUrls.push(docPath);
        } else {
          // New format - file path, try signed URL first (for private bucket)
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from("venue-documents")
            .createSignedUrl(docPath, 3600); // Valid for 1 hour

          if (signedUrlError) {
            console.error("Error generating signed URL for:", docPath, signedUrlError);
            
            // Check if error is "Bucket not found"
            if (signedUrlError.message?.includes("Bucket not found") || signedUrlError.message?.includes("not found")) {
              documentUrls.push(`ERROR: Bucket 'venue-documents' does not exist. Go to Supabase Dashboard → Storage → Create bucket named 'venue-documents' (make it PUBLIC).`);
              continue; // Skip to next document
            }
            
            // Fallback: try public URL (in case bucket is public)
            const { data: publicUrlData } = supabase.storage
              .from("venue-documents")
              .getPublicUrl(docPath);
            
            if (publicUrlData?.publicUrl) {
              documentUrls.push(publicUrlData.publicUrl);
            } else {
              // If both fail, include error message
              console.error("Failed to generate URL for:", docPath, signedUrlError);
              documentUrls.push(`ERROR: ${docPath} - ${signedUrlError.message || "Failed to generate URL"}`);
            }
          } else {
            documentUrls.push(signedUrlData.signedUrl);
          }
        }
      }
    }

    // Format response with all venue details
    const formattedVenue = {
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
      documents: documentUrls, // Use signed URLs
      // KYC Details
      ownerName: venue.owner_name,
      alternatePhone: venue.alternate_phone,
      capacity: venue.capacity,
      gstNumber: venue.gst_number,
      licenseNumber: venue.license_number,
      panNumber: venue.pan_number,
      bankAccount: venue.bank_account,
      ifscCode: venue.ifsc_code,
      // Owner details
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
    };

    return NextResponse.json(
      {
        success: true,
        venue: formattedVenue,
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

    console.error("Admin venue detail API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

