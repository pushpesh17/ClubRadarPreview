# ClubRadar - Website Summary

## Overview

**ClubRadar** is India's premier nightlife discovery and entry pass platform, connecting party-goers with the best clubs, events, and nightlife experiences across major metro cities. The platform serves as a comprehensive marketplace for nightlife, offering instant booking, QR-based entry passes, and seamless payment processing.

---

## Core Purpose

ClubRadar bridges the gap between nightlife venues and party-goers by providing:
- **For Users**: Easy discovery of clubs and events, instant booking with QR entry passes, and skip-the-queue access
- **For Venues**: Free dashboard to manage events, bookings, and revenue with automated payouts
- **For Admins**: Complete platform management with venue approvals, payment tracking, and issue resolution

---

## Key Features

### 🎉 For Party-Goers (Users)

1. **Event Discovery**
   - Browse clubs and events by city (8 major metro cities)
   - Filter by music genre, price range, date, and location
   - View trending venues with real-time updates
   - See event details: pricing, music genre, ratings, dress code, location

2. **Instant Booking System**
   - Book entry passes in seconds
   - QR code generation for instant entry
   - Skip long queues at venues
   - Secure payment processing via Razorpay

3. **User Dashboard**
   - View all bookings with QR codes
   - Track booking status (pending, completed, checked-in)
   - Access booking history
   - Download/print entry passes

4. **Reviews & Ratings**
   - Read authentic reviews from other party-goers
   - Rate venues on music, atmosphere, service, and value
   - Verified review system

### 🏢 For Venue Owners

1. **Venue Registration**
   - Multi-step registration process
   - KYC document upload
   - Admin approval workflow
   - Venue profile management

2. **Event Management Dashboard**
   - Create and manage events with ease
   - Set pricing, capacity, dress codes, and event details
   - Upload event images
   - Real-time capacity tracking
   - Pause/resume bookings

3. **QR Check-in System**
   - Built-in QR code scanner
   - Instant verification of entry passes
   - Mobile-friendly scanner interface
   - Booking management and tracking

4. **Earnings & Payouts**
   - Real-time earnings tracking
   - View total earnings from completed bookings
   - Track pending payouts
   - Request payouts with automated processing
   - Complete payout history

5. **Booking Management**
   - View all bookings for venue events
   - Track booking status
   - Manage capacity in real-time
   - Customer information access

### 👨‍💼 For Administrators

1. **Venue Approval System**
   - Review venue registration applications
   - Approve or reject venues with reasons
   - Track rejection history
   - Document verification

2. **Platform Management**
   - View platform-wide statistics
   - Monitor active venues and events
   - Track total bookings and revenue
   - User management

3. **Payment & Payout Management**
   - Process venue payout requests
   - Track platform revenue
   - Monitor payment transactions
   - Handle refunds and issues

4. **Issue Resolution**
   - Handle customer complaints
   - Process refunds
   - Manage booking disputes
   - Support ticket system

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.7 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (with Supabase integration)
- **Payment Gateway**: Razorpay
- **File Storage**: Supabase Storage (for venue documents, event images)
- **Email**: Resend (for OTP and confirmations)

### Development Tools
- **Testing**: Jest, React Testing Library, Playwright (E2E)
- **Linting**: ESLint
- **Type Safety**: TypeScript with strict mode

---

## City Coverage

ClubRadar currently serves **8 major metro cities** in India:
1. Mumbai (450+ events)
2. Delhi (380+ events)
3. Bangalore (320+ events)
4. Hyderabad (280+ events)
5. Chennai (250+ events)
6. Kolkata (220+ events)
7. Pune (180+ events)
8. Ahmedabad (150+ events)

---

## User Flow

### For Users
1. **Browse** → Visit homepage or discover page
2. **Search** → Filter by city, genre, price, date
3. **Select** → Choose an event/venue
4. **Book** → Select number of people and book entry pass
5. **Pay** → Complete payment via Razorpay
6. **Receive** → Get instant QR code entry pass
7. **Enter** → Show QR code at venue to skip queue

### For Venues
1. **Register** → Complete venue signup with KYC documents
2. **Wait for Approval** → Admin reviews and approves
3. **Create Events** → Set up events with pricing and details
4. **Manage Bookings** → View and track bookings
5. **Check-in Guests** → Scan QR codes at venue
6. **Earn & Request Payouts** → Track earnings and request payouts

---

## Key Pages & Routes

### Public Pages
- `/` - Marketing homepage with features and city selector
- `/discover` - Browse clubs and events (public browsing)
- `/blog` - Blog posts and articles
- `/contact` - Contact form
- `/pricing` - Pricing information
- `/how-it-works` - How the platform works
- `/faq` - Frequently asked questions
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/support` - Support page

### Authentication
- `/login` - User login (Email/Phone OTP via Clerk)
- `/signup` - User registration
- `/venue/signup` - Venue registration
- `/verify-email` - Email verification

### Protected User Pages
- `/profile` - User profile management
- `/bookings` - View user's bookings with QR codes

### Venue Pages
- `/venue/dashboard` - Venue management dashboard
  - Overview & Statistics
  - Event Management
  - Booking Management
  - QR Check-in Tool
  - Earnings & Payouts

### Admin Pages
- `/admin/dashboard` - Admin management panel
  - Platform Overview
  - Venue Approvals
  - Event Moderation
  - Payment Reports
  - Issue Management

---

## Security & Authentication

- **Authentication**: Clerk for user authentication (Email/Phone OTP, Google OAuth)
- **Authorization**: Role-based access control (User, Venue, Admin)
- **Data Security**: Row Level Security (RLS) policies in Supabase
- **Payment Security**: Razorpay secure payment gateway
- **File Security**: Supabase Storage with access policies

---

## Payment Processing

- **Payment Gateway**: Razorpay integration
- **Payment Flow**:
  1. User selects event and number of people
  2. System creates Razorpay order
  3. User completes payment
  4. Payment verification
  5. Booking confirmation with QR code
- **Payout System**: Automated payout requests for venues
- **Commission Model**: Platform takes commission, venues receive payouts

---

## Database Schema

### Core Tables
- **users** - User profiles and authentication
- **venues** - Venue information and status
- **events** - Event details, pricing, capacity
- **bookings** - User bookings with payment status
- **reviews** - Venue and event reviews
- **payouts** - Venue payout tracking
- **venue_rejection_history** - Admin rejection tracking

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamp triggers
- Indexed for performance
- Foreign key relationships
- Status tracking fields

---

## Current Statistics (Marketing Claims)

- **500+** Active Venues
- **2,500+** Events This Month
- **50K+** Happy Users
- **8** Cities Covered

---

## Mobile Responsiveness

The platform is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices
- Progressive Web App (PWA) ready

---

## Future Enhancements

- Mobile apps (iOS and Android) - Coming soon
- Real-time notifications
- Social features (friend invites, group bookings)
- Loyalty programs
- Advanced analytics for venues
- Multi-language support

---

## Development Status

✅ **Completed Features**:
- User authentication and authorization
- Venue registration and approval workflow
- Event creation and management
- Booking system with QR codes
- Payment integration (Razorpay)
- Venue dashboard with all features
- Admin dashboard
- Earnings and payout system
- Review system
- Responsive design

🔄 **In Progress**:
- Mobile app development
- Advanced analytics
- Real-time notifications

---

## Contact & Support

- Support page: `/support`
- Contact page: `/contact`
- Email support available
- FAQ section for common questions

---

*Last Updated: Based on current codebase analysis*

