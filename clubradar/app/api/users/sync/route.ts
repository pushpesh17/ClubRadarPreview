import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Sync Clerk user to Supabase users table
 * This should be called after user signs up/logs in with Clerk
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, photo } = body;

    // Use service role key to bypass RLS for user creation
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
    const { createClient: createServiceClient } = await import(
      "@supabase/supabase-js"
    );
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists (use maybeSingle to avoid errors when not found)
    const { data: existingUser, error: checkError } = await (supabase as any)
      .from("users")
      .select("id, name, email, phone, photo")
      .eq("id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine, but other errors are not
      console.error("Error checking existing user:", checkError);
      return NextResponse.json(
        { error: "Failed to check user", details: checkError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          name: name || existingUser.name,
          email: email || existingUser.email,
          phone: phone || existingUser.phone,
          photo: photo || existingUser.photo,
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user:", updateError);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, user: updatedUser, action: "updated" },
        { status: 200 }
      );
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: userId,
          name: name || null,
          email: email || null,
          phone: phone || null,
          photo: photo || null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        console.error("User ID:", userId);
        console.error("User data:", { name, email, phone, photo });

        // If it's a duplicate key error, user might have been created between check and insert
        if (createError.code === "23505") {
          // Duplicate key - user was created by another request, return success
          const { data: existingUserAfter } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (existingUserAfter) {
            return NextResponse.json(
              { success: true, user: existingUserAfter, action: "created" },
              { status: 201 }
            );
          }
        }

        return NextResponse.json(
          {
            error: "Failed to create user",
            details: createError.message,
            code: createError.code,
            hint: createError.hint,
          },
          { status: 500 }
        );
      }

      // After creating new user, check if there's old data to migrate
      if (email) {
        try {
          // Call the migration function to migrate data from old user_id to new user_id
          const { data: migrationResult, error: migrationError } =
            await supabase.rpc("migrate_user_data_by_email", {
              new_user_id: userId,
              user_email: email,
            });

          if (
            !migrationError &&
            migrationResult &&
            migrationResult.length > 0
          ) {
            const migration = migrationResult[0];
            if (
              migration.migrated_venues > 0 ||
              migration.migrated_bookings > 0 ||
              migration.migrated_reviews > 0
            ) {
              console.log(`Auto-migrated data for user ${email}:`, {
                venues: migration.migrated_venues,
                bookings: migration.migrated_bookings,
                reviews: migration.migrated_reviews,
                old_user_id: migration.old_user_id,
              });
            }
          } else if (migrationError) {
            // Log error but don't fail the user creation
            console.error("Migration error (non-fatal):", migrationError);
          }
        } catch (migrationErr) {
          // Log error but don't fail the user creation
          console.error("Migration exception (non-fatal):", migrationErr);
        }
      }

      return NextResponse.json(
        { success: true, user: newUser, action: "created" },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
