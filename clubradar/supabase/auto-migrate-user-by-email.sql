-- Auto-Migrate User Data by Email
-- This function migrates data from old user_id to new user_id based on email
-- It can be called automatically when a user logs in

-- Create a function that migrates user data by email
CREATE OR REPLACE FUNCTION migrate_user_data_by_email(
  new_user_id TEXT,
  user_email TEXT
)
RETURNS TABLE(
  migrated_venues INTEGER,
  migrated_bookings INTEGER,
  migrated_reviews INTEGER,
  old_user_id TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  old_user_id_found TEXT;
  venues_migrated INTEGER := 0;
  bookings_migrated INTEGER := 0;
  reviews_migrated INTEGER := 0;
BEGIN
  -- Find the old user_id with the same email (but different ID and created earlier)
  SELECT id INTO old_user_id_found
  FROM public.users
  WHERE email = user_email
    AND id != new_user_id
    AND created_at < (
      SELECT created_at 
      FROM public.users 
      WHERE id = new_user_id
    )
  ORDER BY created_at ASC
  LIMIT 1;

  -- If old user found, migrate the data
  IF old_user_id_found IS NOT NULL THEN
    -- Migrate venues
    UPDATE public.venues
    SET user_id = new_user_id,
        updated_at = NOW()
    WHERE user_id = old_user_id_found;
    
    GET DIAGNOSTICS venues_migrated = ROW_COUNT;
    
    -- Migrate bookings
    UPDATE public.bookings
    SET user_id = new_user_id,
        updated_at = NOW()
    WHERE user_id = old_user_id_found;
    
    GET DIAGNOSTICS bookings_migrated = ROW_COUNT;
    
    -- Migrate reviews
    UPDATE public.venue_reviews
    SET user_id = new_user_id
    WHERE user_id = old_user_id_found;
    
    GET DIAGNOSTICS reviews_migrated = ROW_COUNT;
    
    -- Return results
    RETURN QUERY SELECT 
      venues_migrated,
      bookings_migrated,
      reviews_migrated,
      old_user_id_found;
  ELSE
    -- No old user found, return zeros
    RETURN QUERY SELECT 0, 0, 0, NULL::TEXT;
  END IF;
END;
$$;

-- Test the function (example)
-- SELECT * FROM migrate_user_data_by_email('new_user_id_here', 'user@example.com');

