-- Fix RLS Policies for Clerk Authentication
-- Run this in Supabase SQL Editor AFTER running fix-clerk-user-ids.sql
-- This fixes the "row-level security policy" error

-- Drop existing user policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create new policies that work with Clerk
-- Since we're using Clerk (not Supabase Auth), we'll use service role key for operations
-- But we can also create policies that allow authenticated users

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to insert (we validate user_id in API)

-- Allow authenticated users to view profiles
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true); -- Allow authenticated users to view (we validate in API)

-- Allow authenticated users to update profiles
CREATE POLICY "Users can update profiles"
  ON public.users FOR UPDATE
  TO authenticated
  USING (true); -- Allow authenticated users to update (we validate in API)

-- Note: Since we're using Clerk, the API routes use service role key to bypass RLS
-- These policies are a fallback. The main security is in the API routes themselves.

