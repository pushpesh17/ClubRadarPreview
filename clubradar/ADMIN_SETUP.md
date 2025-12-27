# Admin Dashboard Setup

## Overview
The admin dashboard provides full access to manage all venues, bookings, and platform operations. Access is restricted to specific admin emails only.

## Admin Access

### Authorized Admin Emails
Only the following emails have admin access:
- `bodadesneha2020@gmail.com`
- `pushpeshlodiwal1711@gmail.com`

### How to Add/Remove Admins
Edit `/lib/admin-auth.ts` and update the `ADMIN_EMAILS` array:

```typescript
const ADMIN_EMAILS = [
  "bodadesneha2020@gmail.com",
  "pushpeshlodiwal1711@gmail.com",
  // Add more admin emails here
];
```

## Admin Features

### 1. Overview Dashboard
- Platform statistics (venues, bookings, revenue, events, users)
- Pending venue approvals (quick view)
- Recent bookings

### 2. Venue Management
- View all venues with filtering and search
- Approve/reject venue registrations
- View venue details
- Filter by status (pending, approved, rejected)
- Search by name, address, or city
- Pagination support

### 3. Bookings Management
- View all bookings across all venues
- See booking details (user, event, venue, amount)
- Filter by payment status
- View booking history

### 4. Payments & Revenue
- Total platform revenue
- Booking statistics
- Revenue breakdown

## API Endpoints

All admin API endpoints are protected and require admin authentication:

### `/api/admin/stats`
- **Method**: GET
- **Description**: Get platform-wide statistics
- **Returns**: Venues, bookings, events, users, revenue stats

### `/api/admin/venues`
- **Method**: GET
- **Description**: Get all venues with filtering
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `search`: Search query (name, address, city)
  - `status`: Filter by status (all, pending, approved, rejected)
  - `city`: Filter by city

### `/api/admin/venues/[id]/approve`
- **Method**: POST
- **Description**: Approve a venue registration
- **Returns**: Updated venue data

### `/api/admin/venues/[id]/reject`
- **Method**: POST
- **Description**: Reject a venue registration
- **Body**: `{ reason: string }` (optional)
- **Returns**: Updated venue data

### `/api/admin/bookings`
- **Method**: GET
- **Description**: Get all bookings across all venues
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `search`: Search query (user name, email, phone, event name)
  - `status`: Filter by status (all, confirmed, pending, cancelled)
  - `venueId`: Filter by venue ID

## Security

### Access Control
- Admin layout (`/app/admin/layout.tsx`) checks admin access on server side
- All admin API routes use `requireAdmin()` function
- Non-admin users are redirected to home page
- API routes return 403 Forbidden if user is not admin

### Authentication Flow
1. User logs in with Clerk
2. Admin layout checks if user email is in `ADMIN_EMAILS` list
3. If not admin, redirect to home page
4. If admin, allow access to admin dashboard

## Usage

### Accessing Admin Dashboard
1. Login with an admin email
2. Navigate to `/admin/dashboard`
3. If not admin, you'll be redirected to home page

### Approving a Venue
1. Go to "Venues" tab
2. Find the pending venue
3. Click "Approve" button
4. Venue status changes to "approved"

### Rejecting a Venue
1. Go to "Venues" tab
2. Find the pending venue
3. Click "Reject" button
4. Confirm rejection
5. Venue status changes to "rejected"

## Notes

- Admin access is email-based, not role-based
- Admin emails are case-insensitive
- All admin actions are logged in the console
- Admin dashboard uses real-time data from the database
- Statistics are calculated from actual bookings and venues

