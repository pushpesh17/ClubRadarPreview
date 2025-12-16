import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // Use service role key to bypass RLS (needed for Clerk auth)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user has an approved venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (venueError || !venue) {
      return NextResponse.json(
        { error: "No approved venue found. Please register and get approval first." },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];
    const venueId = formData.get("venue_id") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Verify venue belongs to user
    if (venueId && venueId !== venue.id) {
      return NextResponse.json(
        { error: "Unauthorized. This venue does not belong to you." },
        { status: 403 }
      );
    }

    // Limit to 10 images for venue gallery
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed" },
        { status: 400 }
      );
    }

    const uploadedFiles: { name: string; url: string }[] = [];

    // Upload each file to Supabase Storage
    for (const file of files) {
      // Validate file type (images only)
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP) are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const fileName = `${venue.id}/venue/${timestamp}-${randomStr}.${fileExt}`;
      const filePath = fileName;

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage (use venue-images bucket or event-images)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-images") // Using existing bucket, can create venue-images later
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      uploadedFiles.push({
        name: file.name,
        url: urlData.publicUrl,
      });
    }

    // Update venue with image URLs
    const imageUrls = uploadedFiles.map((f) => f.url);
    
    // Get existing images
    const { data: currentVenue } = await supabase
      .from("venues")
      .select("images")
      .eq("id", venue.id)
      .single();

    const existingImages = (currentVenue?.images as string[]) || [];
    const allImages = [...existingImages, ...imageUrls];

    // Update venue with new images
    const { error: updateError } = await supabase
      .from("venues")
      .update({ images: allImages })
      .eq("id", venue.id);

    if (updateError) {
      console.error("Error updating venue images:", updateError);
      // Still return success for uploads, but log the error
    }

    return NextResponse.json(
      {
        success: true,
        images: uploadedFiles,
        message: `Successfully uploaded ${uploadedFiles.length} image(s)`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Venue image upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to upload images",
        details: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

