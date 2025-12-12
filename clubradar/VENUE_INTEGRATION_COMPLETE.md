# Venue Registration & Dashboard Integration - Complete

## Overview
This document describes the complete backend integration for venue registration, approval system, and event management using Supabase and Clerk authentication.

## Features Implemented

### 1. Venue Registration (`/venue/signup`)
- **Multi-step form** with 3 steps:
  1. Basic Info (venue name, type, address, city, pincode, capacity)
  2. Contact Details (owner name, phone, email, alternate phone)
  3. KYC Documents (GST, license, PAN, bank account, IFSC)
- **Real-time validation** and form state management
- **API Integration**: Saves to Supabase `venues` table
- **User Sync**: Automatically syncs Clerk user to Supabase `users` table
- **Status**: Venues are created with `status: 'pending'` (requires admin approval)

### 2. Venue Dashboard (`/venue/dashboard`)
- **Access Control**: 
  - Requires user to be logged in (redirects to login if not)
  - Checks if user has a registered venue
  - Shows approval status banner
  - Blocks event creation if venue is not approved
- **Venue Status Display**:
  - ✅ **Approved**: Green banner - can create events
  - ⏳ **Pending**: Yellow banner - registration under review
  - ❌ **Rejected**: Red banner - registration rejected
- **Event Management**:
  - Fetches events from Supabase API
  - Creates events only if venue is approved
  - Real-time stats calculated from actual events

### 3. API Routes Created

#### `/api/venues/register` (POST)
- Registers a new venue for the authenticated user
- Validates required fields
- Prevents duplicate venue registration
- Returns venue with `status: 'pending'`

#### `/api/venues/status` (GET)
- Checks if user has a registered venue
- Returns venue details and approval status
- Used by dashboard to check access

#### `/api/events/create` (POST)
- Creates a new event for an approved venue
- Validates venue approval status
- Validates event data (date, time, capacity, price)
- Links event to venue automatically

#### `/api/events/venue` (GET)
- Fetches all events for the authenticated user's approved venue
- Returns empty array if no venue or not approved

#### `/api/users/sync` (POST)
- Syncs Clerk user data to Supabase `users` table
- Creates or updates user record
- Called automatically during venue registration

## Database Schema

### Venues Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, References users.id)
- name (TEXT, Required)
- description (TEXT)
- address (TEXT, Required)
- city (TEXT, Required)
- pincode (TEXT)
- phone (TEXT)
- email (TEXT)
- status (TEXT, Default: 'pending') -- 'pending', 'approved', 'rejected'
- created_at, updated_at (Timestamps)
```

### Events Table
```sql
- id (UUID, Primary Key)
- venue_id (UUID, References venues.id)
- name, description, date, time, genre, price, capacity
- booked (INTEGER, Default: 0)
- dress_code, images, location, rules, amenities, contact
- created_at, updated_at (Timestamps)
```

## Workflow

### For New Venue Owners:
1. **Sign Up/Login** with Clerk (email OTP or Google)
2. **Register Venue** at `/venue/signup`
   - Fill out 3-step form
   - Submit registration
   - Status set to `pending`
3. **Wait for Approval** (admin reviews in Supabase)
4. **Access Dashboard** at `/venue/dashboard`
   - See approval status banner
   - View stats and existing events
   - Create events once approved

### For Approved Venues:
1. **Access Dashboard** - see green approval banner
2. **Create Events** - button enabled, can create events
3. **Manage Events** - view, edit, track bookings
4. **View Stats** - calculated from real event data

## Security & Access Control

### Row Level Security (RLS)
- Venues: Users can only view their own venue or approved venues
- Events: Anyone can view events, but only venue owners can create/update
- Bookings: Users can only view their own bookings

### API Route Protection
- All routes use Clerk `auth()` to verify user authentication
- Event creation checks venue approval status
- Venue status endpoint returns appropriate messages

## Environment Variables Required

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Testing Checklist

- [ ] User can register a venue (all 3 steps)
- [ ] Venue registration saves to Supabase
- [ ] Dashboard shows pending status for new venues
- [ ] Dashboard blocks event creation for pending venues
- [ ] Admin can approve venue in Supabase
- [ ] Dashboard shows approved status after approval
- [ ] Approved venues can create events
- [ ] Events appear in discover page
- [ ] Stats calculate correctly from events
- [ ] User sync works on login/signup

## Next Steps

1. **Admin Dashboard**: Create admin interface to approve/reject venues
2. **KYC Document Upload**: Add file upload for documents to Supabase Storage
3. **Email Notifications**: Send emails when venue is approved/rejected
4. **Venue Profile**: Allow venues to edit their information
5. **Event Images**: Add image upload for events
6. **Analytics**: Enhanced stats and reporting

## Notes

- Venue approval is currently manual (admin updates status in Supabase)
- KYC documents are stored in form but not yet uploaded to storage
- Event images array is empty by default (can be added later)
- User sync happens automatically during venue registration
- All API routes use server-side Supabase client with Clerk authentication

