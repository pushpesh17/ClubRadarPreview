import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { secureAPIRequest, logSecurityEvent } from "@/lib/security/api-security";
import { sanitizeString, isValidLength, isValidDate, isValidTime, isValidPrice } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  try {
    // Apply security checks
    const security = await secureAPIRequest(request, {
      methods: ["POST"],
      rateLimit: "standard",
      maxSize: 5 * 1024 * 1024, // 5MB for event creation (includes images)
      requireAuth: true,
    });

    if (security.error) {
      logSecurityEvent("invalid_request", {
        ip: security.clientIP,
        path: request.nextUrl.pathname,
        method: request.method,
        reason: "Security check failed",
      });
      return security.error;
    }

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
    const { createClient: createServiceClient } = await import(
      "@supabase/supabase-js"
    );
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user has an approved venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id, name, city, address, pincode, phone, email")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (venueError) {
      console.error("Error fetching venue:", venueError);
      return NextResponse.json(
        {
          error: "Failed to fetch venue",
          message: venueError.message,
          details: "Please try again or contact support.",
        },
        { status: 500 }
      );
    }

    if (!venue) {
      return NextResponse.json(
        {
          error: "No approved venue found",
          message:
            "Please register your venue and wait for approval before creating events.",
        },
        { status: 403 }
      );
    }

    // Use sanitized body from security check
    const body = security.sanitizedBody;
    const {
      name,
      description,
      date,
      time,
      genre,
      price,
      capacity,
      dressCode,
      images,
      rules,
      amenities,
    } = body;

    // Security: Input validation and sanitization using utilities
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName || !isValidLength(sanitizedName, 2, 200)) {
      return NextResponse.json(
        { error: "Event name must be between 2 and 200 characters" },
        { status: 400 }
      );
    }

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { error: "Valid date is required (YYYY-MM-DD format)" },
        { status: 400 }
      );
    }

    if (!time || !isValidTime(time)) {
      return NextResponse.json(
        { error: "Valid time is required (HH:MM format)" },
        { status: 400 }
      );
    }

    const sanitizedGenre = sanitizeString(genre);
    if (!sanitizedGenre || !isValidLength(sanitizedGenre, 2, 50)) {
      return NextResponse.json(
        { error: "Genre must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // Validate price
    const priceNum = typeof price === "string" ? parseFloat(price) : price;
    if (!isValidPrice(priceNum)) {
      return NextResponse.json(
        { error: "Valid price (non-negative number) is required" },
        { status: 400 }
      );
    }

    // Validate price decimal places
    const decimalPlaces = (priceNum.toString().split(".")[1] || "").length;
    if (decimalPlaces > 2) {
      return NextResponse.json(
        { error: "Price cannot have more than 2 decimal places" },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const eventDate = new Date(`${date}T${time}`);
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "Event date and time cannot be in the past" },
        { status: 400 }
      );
    }

    // Sanitize optional fields
    const sanitizedDescription = description && typeof description === "string" 
      ? description.substring(0, 2000).replace(/[<>]/g, "") 
      : null;
    
    const sanitizedDressCode = dressCode && typeof dressCode === "string"
      ? dressCode.substring(0, 100).replace(/[<>]/g, "")
      : null;

    // Validate images array
    let sanitizedImages: string[] = [];
    if (images && Array.isArray(images)) {
      sanitizedImages = images
        .filter((img: any) => typeof img === "string")
        .map((img: string) => img.substring(0, 500))
        .slice(0, 10); // Limit to 10 images
    }

    // Validate rules and amenities arrays
    const sanitizedRules = rules && Array.isArray(rules)
      ? rules
          .filter((rule: any) => typeof rule === "string")
          .map((rule: string) => rule.substring(0, 200).replace(/[<>]/g, ""))
          .slice(0, 20)
      : [];

    const sanitizedAmenities = amenities && Array.isArray(amenities)
      ? amenities
          .filter((amenity: any) => typeof amenity === "string")
          .map((amenity: string) => amenity.substring(0, 100).replace(/[<>]/g, ""))
          .slice(0, 20)
      : [];

    // Create event (using sanitized values)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        venue_id: venue.id,
        name: sanitizedName,
        description: sanitizedDescription,
        date,
        time,
        genre: sanitizedGenre,
        price: priceNum,
        // Capacity removed: treat as "unlimited". Keep a very high cap for compatibility with existing schema/UI.
        capacity: capacity ? parseInt(capacity.toString()) : 1000000,
        booked: 0,
        dress_code: sanitizedDressCode,
        images: sanitizedImages,
        location: {
          address: venue.address,
          city: venue.city,
          pincode: venue.pincode,
        },
        rules: sanitizedRules,
        amenities: sanitizedAmenities,
        contact: {
          phone: venue.phone || null,
          email: venue.email || null,
        },
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      return NextResponse.json(
        { error: "Failed to create event", details: eventError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          time: event.time,
          status: "created",
        },
        message: "Event created successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
