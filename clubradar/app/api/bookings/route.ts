import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { generateQRCodeDataURL } from "@/lib/qrcode";

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
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

    // Log for debugging
    console.log("Fetching bookings for userId:", userId);
    console.log("UserId type:", typeof userId, "Length:", userId?.length);

    // First, check what user_ids exist in bookings table (for debugging)
    const { data: allBookings, error: allError } = await supabase
      .from("bookings")
      .select("id, user_id")
      .limit(10);
    
    console.log("Sample bookings in database:", {
      count: allBookings?.length || 0,
      sample: allBookings?.slice(0, 3),
      error: allError,
    });

    // First, try to get bookings without joins to see if they exist
    const { data: bookingsCheck, error: checkError } = await supabase
      .from("bookings")
      .select("id, user_id, event_id, created_at")
      .eq("user_id", userId);

    console.log("Bookings check (without joins):", {
      count: bookingsCheck?.length || 0,
      bookings: bookingsCheck,
      error: checkError,
    });

    // Now get bookings with joins
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          id,
          name,
          date,
          time,
          genre,
          price,
          location,
          venues (
            name,
            address,
            city,
            pincode
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    console.log("Bookings query result:", {
      count: data?.length || 0,
      hasError: !!error,
      error: error,
    });

    if (error) {
      console.error("Supabase query error:", error);
      
      // Check if it's a network/connection error
      if (error.message?.includes("fetch failed") || error.message?.includes("TypeError")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
            hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
          },
          { status: 503 }
        );
      }
      
      // Check if table doesn't exist
      if (error.code === 'PGRST205' || error.message?.includes("Could not find the table") || error.message?.includes("schema cache")) {
        return NextResponse.json(
          { 
            error: "Bookings table not found",
            details: "The bookings table doesn't exist in your Supabase database. Please run the SQL script to create it.",
            hint: "Go to Supabase Dashboard → SQL Editor → Run 'supabase/create-bookings-table.sql' script",
            code: error.code,
            fix: "Run the create-bookings-table.sql script in Supabase SQL Editor"
          },
          { status: 400 }
        );
      }
      
      // If join failed but we have bookings, try without joins
      if (bookingsCheck && bookingsCheck.length > 0) {
        console.log("Join failed but bookings exist, fetching without joins");
        // Fetch bookings without joins and manually fetch event data
        const { data: bookingsOnly, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!bookingsError && bookingsOnly) {
          // Manually fetch event data for each booking
          const bookingsWithEvents = await Promise.all(
            bookingsOnly.map(async (booking) => {
              const { data: event } = await supabase
                .from("events")
                .select(`
                  id,
                  name,
                  date,
                  time,
                  genre,
                  price,
                  location,
                  venue_id
                `)
                .eq("id", booking.event_id)
                .maybeSingle();

              let venue = null;
              if (event?.venue_id) {
                const { data: venueData } = await supabase
                  .from("venues")
                  .select("name, address, city, pincode")
                  .eq("id", event.venue_id)
                  .maybeSingle();
                venue = venueData;
              }

              return {
                ...booking,
                events: event ? { ...event, venues: venue } : null,
              };
            })
          );

          return NextResponse.json({ bookings: bookingsWithEvents });
        }
      }
      
      return NextResponse.json(
        { 
          error: error.message || "Failed to fetch bookings",
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 400 }
      );
    }

    // If no error but no data, check if bookings exist without joins
    if ((!data || data.length === 0) && bookingsCheck && bookingsCheck.length > 0) {
      console.log("No data from joined query but bookings exist, using fallback");
      // Use the bookings we found earlier and fetch event data manually
      const { data: bookingsOnly } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (bookingsOnly) {
        const bookingsWithEvents = await Promise.all(
          bookingsOnly.map(async (booking) => {
            const { data: event } = await supabase
              .from("events")
              .select(`
                id,
                name,
                date,
                time,
                genre,
                price,
                location,
                venue_id
              `)
              .eq("id", booking.event_id)
              .maybeSingle();

            let venue = null;
            if (event?.venue_id) {
              const { data: venueData } = await supabase
                .from("venues")
                .select("name, address, city, pincode")
                .eq("id", event.venue_id)
                .maybeSingle();
              venue = venueData;
            }

            return {
              ...booking,
              events: event ? { ...event, venues: venue } : null,
            };
          })
        );

        return NextResponse.json({ bookings: bookingsWithEvents });
      }
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error: any) {
    console.error("Unexpected error in GET /api/bookings:", error);
    
    // Check if it's a network/connection error
    if (error.message?.includes("fetch failed") || error.message?.includes("TypeError") || error.name === "TypeError") {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch bookings",
        details: "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
      });
      return NextResponse.json(
        { 
          error: "Server configuration error. Missing Supabase credentials.",
          details: "Please check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        },
        { status: 500 }
      );
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      console.error("Invalid Supabase URL format:", supabaseUrl);
      return NextResponse.json(
        { 
          error: "Invalid Supabase URL format",
          details: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL (e.g., https://xxxxx.supabase.co)"
        },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    let supabase;
    try {
      supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (clientError: any) {
      console.error("Failed to create Supabase client:", clientError);
      return NextResponse.json(
        { 
          error: "Failed to initialize database connection",
          details: clientError.message || "Please check your Supabase credentials"
        },
        { status: 500 }
      );
    }

    const bookingData = await request.json();
    const { event_id, number_of_people } = bookingData;

    if (!event_id || !number_of_people || number_of_people < 1) {
      return NextResponse.json(
        { error: "Event ID and number of people are required" },
        { status: 400 }
      );
    }

    // Validate event exists and has capacity
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, capacity, booked, price")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check capacity
    if ((event.booked || 0) + number_of_people > event.capacity) {
      return NextResponse.json(
        { error: "Not enough capacity available" },
        { status: 400 }
      );
    }

    // Ensure user exists in Supabase users table (required for foreign key constraint)
    // Use UPSERT to handle race conditions (multiple requests trying to create the same user)
    console.log("Ensuring user exists in database:", userId);
    
    const { data: userData, error: userUpsertError } = await (supabase as any)
      .from("users")
      .upsert(
        {
          id: userId,
          name: null,
          email: null,
          phone: null,
          photo: null,
        },
        {
          onConflict: "id", // Use id as the conflict column
          ignoreDuplicates: false, // Update if exists, insert if not
        }
      )
      .select()
      .single();

    if (userUpsertError) {
      console.error("Error upserting user:", userUpsertError);
      console.error("User ID:", userId);
      console.error("Error code:", userUpsertError.code);
      console.error("Error message:", userUpsertError.message);
      
      // If it's a duplicate key error, try to fetch the existing user
      if (userUpsertError.code === "23505") {
        console.log("Duplicate key error, fetching existing user...");
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        
        if (existingUser) {
          console.log("User exists, continuing with booking...");
        } else {
          return NextResponse.json(
            { 
              error: "Failed to sync user account",
              details: "User account could not be created or found in the database",
              code: userUpsertError.code,
              hint: "Please try logging out and logging back in, then try booking again."
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            error: "Failed to sync user account",
            details: userUpsertError.message,
            code: userUpsertError.code,
            hint: "Please ensure your user account is properly synced. Try logging out and logging back in."
          },
          { status: 500 }
        );
      }
    } else {
      console.log("User synced successfully:", userData?.id || userId);
    }

    // Double-check user exists before creating booking (safety check)
    const { data: verifyUser, error: verifyError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (verifyError && verifyError.code !== "PGRST116") {
      console.error("Error verifying user after upsert:", verifyError);
      return NextResponse.json(
        { 
          error: "Failed to verify user account",
          details: "User account was not properly created. Please try again.",
          hint: "Try logging out and logging back in, then attempt the booking again."
        },
        { status: 500 }
      );
    }

    if (!verifyUser) {
      console.error("User does not exist after upsert attempt. User ID:", userId);
      return NextResponse.json(
        { 
          error: "User account not found",
          details: "Your user account could not be found in the database. Please try logging out and logging back in.",
          hint: "After logging back in, wait a moment and try booking again."
        },
        { status: 500 }
      );
    }

    console.log("User verified, proceeding with booking creation...");

    // Generate booking ID
    const bookingId = `CR${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Generate QR code with booking ID
    const qrCodeDataURL = await generateQRCodeDataURL(bookingId);

    // Calculate total price
    const pricePerPerson = parseFloat(event.price);
    const totalPrice = pricePerPerson * number_of_people;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        id: bookingId,
        user_id: userId,
        event_id,
        number_of_people: parseInt(number_of_people),
        total_amount: totalPrice,
        payment_status: "completed", // Skip payment for now, mark as completed
        qr_code: qrCodeDataURL,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      
      // Check if it's a foreign key constraint error
      if (
        bookingError.code === "23503" || 
        bookingError.message?.includes("foreign key constraint") ||
        bookingError.message?.includes("bookings_user_id_fkey")
      ) {
        return NextResponse.json(
          { 
            error: "User account not found",
            details: "Your user account needs to be synced to the database. Please try logging out and logging back in, then try booking again.",
            hint: "The user account must exist in the users table before creating a booking. This should happen automatically when you log in.",
            code: bookingError.code,
            fix: "Try logging out and logging back in, or contact support if the issue persists."
          },
          { status: 400 }
        );
      }
      
      // Check if it's a network/connection error
      if (bookingError.message?.includes("fetch failed") || bookingError.message?.includes("TypeError")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
            hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: bookingError.message || "Failed to create booking",
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code
        },
        { status: 400 }
      );
    }

    // Update event booked count
    const { error: updateError } = await supabase
      .from("events")
      .update({
        booked: (event.booked || 0) + parseInt(number_of_people),
      })
      .eq("id", event_id);

    if (updateError) {
      console.error("Error updating event booked count:", updateError);
      // Don't fail the booking, just log the error
    }

    return NextResponse.json({ 
      success: true,
      booking: {
        ...booking,
        qr_code: qrCodeDataURL,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    
    // Check if it's a network/connection error
    if (error.message?.includes("fetch failed") || error.message?.includes("TypeError") || error.name === "TypeError") {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to Supabase. Please check: 1) Your internet connection, 2) Supabase URL and service role key in .env.local, 3) Supabase project status",
          hint: "Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create booking",
        details: "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}

