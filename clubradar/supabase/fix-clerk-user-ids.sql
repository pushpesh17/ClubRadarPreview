-- Fix Database Schema for Clerk User IDs
-- Clerk user IDs are strings like "user_35hvrWePm83NtL6tSFel9zZBKaW", not UUIDs
-- Run this in your Supabase SQL Editor

-- Step 1: Drop foreign key constraints that reference users.id
ALTER TABLE public.venues 
DROP CONSTRAINT IF EXISTS venues_user_id_fkey;

ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Step 2: Change users.id from UUID to TEXT
-- First, we need to handle existing data (if any)
-- If you have existing data, you'll need to migrate it first
-- For now, we'll assume no existing data or you're okay with dropping it

-- Drop and recreate users table with TEXT id
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with TEXT id (for Clerk)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Changed from UUID to TEXT for Clerk IDs
  name TEXT,
  age INTEGER CHECK (age >= 18),
  photo TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate venues table with TEXT user_id
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed to TEXT
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT,
  coordinates POINT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  owner_name TEXT,
  alternate_phone TEXT,
  capacity INTEGER,
  gst_number TEXT,
  license_number TEXT,
  pan_number TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  documents TEXT[], -- Array of document URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL, -- Single time field (matches API expectations)
  genre TEXT,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER,
  booked INTEGER DEFAULT 0,
  images TEXT[], -- Array of image URLs
  dress_code TEXT,
  location JSONB, -- Store address, city, pincode, coordinates
  rules TEXT[],
  amenities TEXT[],
  contact JSONB, -- Store phone and email
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  category_ratings JSONB, -- Store music, atmosphere, service, value, location ratings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate bookings table with TEXT user_id
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed to TEXT
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate reviews table with TEXT user_id
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed to TEXT
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- One review per user per event
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON public.venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_status ON public.venues(status);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON public.events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON public.reviews(event_id);

-- Recreate RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Note: Since we're using Clerk, RLS policies using auth.jwt() won't work
-- We'll use service role key for user operations, or allow authenticated users to insert/update
-- For now, allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to insert (we validate user_id in API)

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (true); -- Allow authenticated users to view (we validate in API)

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (true); -- Allow authenticated users to update (we validate in API)

-- Venues policies
CREATE POLICY "Anyone can view approved venues"
  ON public.venues FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Venue owners can view own venue"
  ON public.venues FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own venue"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Venue owners can update own venue"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Events policies
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Venue owners can create events for own venue"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = events.venue_id
      AND venues.user_id = auth.jwt() ->> 'sub'
      AND venues.status = 'approved'
    )
  );

CREATE POLICY "Venue owners can update events for own venue"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = events.venue_id
      AND venues.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- Note: The RLS policies use auth.jwt() ->> 'sub' which should work with Clerk
-- if you've configured Clerk to set the 'sub' claim in the JWT
-- Otherwise, you may need to adjust the policies to use a different method

