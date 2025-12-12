import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

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

    const body = await request.json();
    const {
      name,
      description,
      address,
      city,
      pincode,
      phone,
      email,
      ownerName,
      alternatePhone,
      capacity,
      gstNumber,
      licenseNumber,
      panNumber,
      bankAccount,
      ifscCode,
      documents, // Array of document URLs
    } = body;

    // Validate required fields
    if (!name || !address || !city || !phone || !email || !ownerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS for user/venue creation
    // This is needed because RLS policies don't work with Clerk auth
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
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already has a venue
    // Use maybeSingle() to avoid errors when no venue found
    const { data: existingVenue, error: checkError } = await supabase
      .from("venues")
      .select("id, status")
      .eq("user_id", userId)
      .maybeSingle(); // Returns null instead of error when no row found

    if (checkError) {
      console.error("Error checking existing venue:", checkError);
      // If it's a foreign key constraint error, user doesn't exist in users table
      // We should sync user first or handle this gracefully
      if (checkError.code === "23503" || checkError.message?.includes("foreign key")) {
        return NextResponse.json(
          { 
            error: "User not found in database. Please try logging in again.",
            details: "User needs to be synced to database first"
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to check existing venue", details: checkError.message },
        { status: 500 }
      );
    }

    if (existingVenue) {
      return NextResponse.json(
        { 
          error: "You already have a venue registered",
          venueId: existingVenue.id,
          status: existingVenue.status
        },
        { status: 400 }
      );
    }

    // Ensure user exists in users table first (required for foreign key)
    // If user doesn't exist, create them automatically
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine, but other errors are not
      console.error("Error checking user:", userCheckError);
      return NextResponse.json(
        { 
          error: "Failed to check user",
          details: userCheckError.message
        },
        { status: 500 }
      );
    }

    if (!existingUser) {
      // User doesn't exist - create them automatically
      // Get user info from Clerk if available, or use form data
      try {
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            id: userId, // Clerk user ID (TEXT type)
            name: ownerName || null,
            email: email || null,
            phone: phone || null,
            photo: null,
          })
          .select()
          .single();

        if (createUserError) {
          console.error("=== USER CREATION ERROR ===");
          console.error("Error creating user:", createUserError);
          console.error("User ID:", userId);
          console.error("User ID type:", typeof userId);
          console.error("User ID length:", userId?.length);
          console.error("User data:", { name: ownerName, email, phone });
          console.error("Error code:", createUserError.code);
          console.error("Error message:", createUserError.message);
          console.error("Error hint:", createUserError.hint);
          console.error("Error details:", JSON.stringify(createUserError, null, 2));
          
          // If it's a duplicate key error (phone or email already exists)
          if (createUserError.code === "23505") {
            // Check if phone or email conflict
            if (createUserError.message?.includes("phone") || createUserError.details?.includes("phone")) {
              // Phone already exists - try to create user without phone, or find existing user
              console.log("Phone already exists, trying to create user without phone...");
              
              // Try creating user without phone
              const { data: userWithoutPhone, error: retryError } = await supabase
                .from("users")
                .insert({
                  id: userId,
                  name: ownerName || null,
                  email: email || null,
                  phone: null, // Don't set phone if it conflicts
                  photo: null,
                })
                .select()
                .single();
              
              if (retryError) {
                // If still fails, check if user was created by another request
                const { data: existingUserAfter } = await supabase
                  .from("users")
                  .select("*")
                  .eq("id", userId)
                  .maybeSingle();
                
                if (existingUserAfter) {
                  // User exists now, continue
                  console.log("User created by another request, continuing...");
                } else {
                  return NextResponse.json(
                    { 
                      error: "Failed to create user profile. Phone number already registered.",
                      details: "This phone number is already associated with another account. Please use a different phone number or contact support.",
                      code: createUserError.code
                    },
                    { status: 400 }
                  );
                }
              } else {
                // Successfully created without phone
                console.log("User created without phone number");
              }
            } else if (createUserError.message?.includes("email") || createUserError.details?.includes("email")) {
              // Email already exists - try to create user without email
              console.log("Email already exists, trying to create user without email...");
              
              const { data: userWithoutEmail, error: retryError } = await supabase
                .from("users")
                .insert({
                  id: userId,
                  name: ownerName || null,
                  email: null, // Don't set email if it conflicts
                  phone: phone || null,
                  photo: null,
                })
                .select()
                .single();
              
              if (retryError) {
                // Check if user was created by another request
                const { data: existingUserAfter } = await supabase
                  .from("users")
                  .select("*")
                  .eq("id", userId)
                  .maybeSingle();
                
                if (existingUserAfter) {
                  console.log("User created by another request, continuing...");
                } else {
                  return NextResponse.json(
                    { 
                      error: "Failed to create user profile. Email already registered.",
                      details: "This email is already associated with another account.",
                      code: createUserError.code
                    },
                    { status: 400 }
                  );
                }
              }
            } else {
              // Other duplicate key error - check if user was created by another request
              const { data: existingUserAfter } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .maybeSingle();
              
              if (!existingUserAfter) {
                return NextResponse.json(
                  { 
                    error: "Failed to create user profile",
                    details: createUserError.message,
                    code: createUserError.code
                  },
                  { status: 500 }
                );
              }
            }
          } else if (createUserError.code === "22P02" || createUserError.message?.includes("invalid input syntax") || createUserError.message?.includes("uuid")) {
            // Invalid input syntax - likely UUID vs TEXT mismatch
            return NextResponse.json(
              { 
                error: "Database schema mismatch detected",
                details: "The users table id column is UUID but should be TEXT for Clerk IDs. Please run the migration script: supabase/fix-clerk-user-ids.sql in Supabase SQL Editor.",
                code: createUserError.code,
                hint: "This happens when the database schema hasn't been updated for Clerk user IDs. Check your server console for detailed error information."
              },
              { status: 500 }
            );
          } else {
            return NextResponse.json(
              { 
                error: "Failed to create user profile",
                details: createUserError.message,
                code: createUserError.code,
                hint: createUserError.hint || "Check server console logs for detailed error information"
              },
              { status: 500 }
            );
          }
        } else {
          console.log("✅ Auto-created user profile:", newUser?.id);
        }
      } catch (error: any) {
        console.error("=== EXCEPTION IN USER CREATION ===");
        console.error("Exception:", error);
        
        // Final verification - check if user exists despite exception
        const { data: verifyUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        
        if (!verifyUser) {
          return NextResponse.json(
            { 
              error: "Exception while creating user",
              details: error.message || "Unknown error",
              hint: "Check server console for full error details"
            },
            { status: 500 }
          );
        }
        // If user exists, continue with venue creation
      }
    }
    
    // Final verification before creating venue - ensure user exists
    const { data: finalUserCheck } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    
    if (!finalUserCheck) {
      return NextResponse.json(
        { 
          error: "User profile not found",
          details: "User profile could not be created or found. Please try again or contact support.",
        },
        { status: 500 }
      );
    }

    // Create venue record with all KYC fields
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .insert({
        user_id: userId,
        name,
        description: description || null,
        address,
        city,
        pincode: pincode || null,
        phone,
        email,
        status: "pending", // Default status - needs admin approval
        owner_name: ownerName,
        alternate_phone: alternatePhone || null,
        capacity: capacity ? parseInt(capacity.toString()) : null,
        gst_number: gstNumber || null,
        license_number: licenseNumber || null,
        pan_number: panNumber || null,
        bank_account: bankAccount || null,
        ifsc_code: ifscCode || null,
        documents: documents || [], // Array of document URLs
      })
      .select()
      .single();

    if (venueError) {
      console.error("Error creating venue:", venueError);
      return NextResponse.json(
        { error: "Failed to register venue", details: venueError.message },
        { status: 500 }
      );
    }

    // TODO: Store KYC documents (GST, License, PAN, Bank details) in a separate table
    // For now, we'll just store the venue basic info

    return NextResponse.json(
      {
        success: true,
        venue: {
          id: venue.id,
          name: venue.name,
          status: venue.status,
          message: "Venue registration submitted successfully. Your application will be reviewed within 24-48 hours.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Venue registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

