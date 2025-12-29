# Payment Management System for Venues

## Overview
A comprehensive payment management system similar to Zomato/Swiggy that allows admins to track revenue, generate payouts to venues, and manage payment processing.

## Database Setup

### Step 1: Create Payouts Table
Run the SQL script in Supabase SQL Editor:

```sql
-- File: supabase/create-venue-payouts-table.sql
```

This creates the `venue_payouts` table with:
- Payout amount, commission rate, and net amount
- Period tracking (start and end dates)
- Payment status (pending, processing, processed, failed, cancelled)
- Bank details and transaction information
- Booking count and total revenue

## Features

### 1. **Revenue Tracking**
- Total platform revenue from all bookings
- Commission tracking (default 10%, configurable)
- Net amount calculation (revenue - commission)
- Per-venue revenue breakdown

### 2. **Payout Generation**
- Generate payouts for any venue based on booking period
- Automatically calculates:
  - Total revenue from completed bookings
  - Commission amount (configurable percentage)
  - Net amount to be paid
  - Number of bookings in the period
- Prevents duplicate payouts for the same period

### 3. **Payment Processing**
- Mark payouts as processed after payment is sent
- Record transaction ID (NEFT/RTGS reference)
- Track which admin processed the payment
- Store processing timestamp

### 4. **Admin Dashboard**
- **Summary Cards**:
  - Total Platform Revenue
  - Pending Payouts (amount and count)
  - Processed Payouts (amount and count)
  - Total Commission Earned

- **Payout Management**:
  - Filter by status (pending, processing, processed, failed)
  - Filter by venue
  - Pagination support
  - View detailed payout information

- **Payout Details Display**:
  - Venue name and location
  - Period (start and end dates)
  - Total revenue and booking count
  - Commission breakdown
  - Net payout amount
  - Bank account details
  - Transaction details (if processed)

## API Endpoints

### `GET /api/admin/payouts`
Get all payouts with filtering and pagination
- Query params: `page`, `limit`, `status`, `venueId`
- Returns: List of payouts with venue details

### `POST /api/admin/payouts/generate`
Generate a new payout for a venue
- Body: `venueId`, `periodStartDate`, `periodEndDate`, `commissionRate`
- Calculates revenue from completed bookings in the period
- Creates payout record with status "pending"

### `POST /api/admin/payouts/[id]/process`
Mark a payout as processed
- Body: `transactionId`, `status`, `notes` (optional)
- Updates payout status to "processed"
- Records transaction ID and processing details

## Usage Flow

### 1. **Generate Payout**
1. Admin goes to Payments tab
2. Clicks "Generate Payout" button
3. Selects venue, period dates, and commission rate
4. System calculates revenue from completed bookings
5. Creates payout record with status "pending"

### 2. **Process Payment**
1. Admin reviews pending payouts
2. Processes payment via bank transfer/NEFT/RTGS
3. Clicks "Mark as Processed" on the payout
4. Enters transaction ID
5. System updates payout status and records transaction

### 3. **Track Revenue**
- View total platform revenue
- See pending vs processed payouts
- Track commission earnings
- Filter by venue or status

## Database Schema

```sql
venue_payouts
├── id (UUID)
├── venue_id (UUID) → venues.id
├── payout_amount (DECIMAL) - Total revenue
├── commission_rate (DECIMAL) - Platform commission %
├── commission_amount (DECIMAL) - Amount deducted
├── net_amount (DECIMAL) - Amount to pay venue
├── period_start_date (DATE)
├── period_end_date (DATE)
├── status (TEXT) - pending/processing/processed/failed/cancelled
├── payment_method (TEXT) - bank_transfer/upi/neft/rtgs
├── bank_account (TEXT)
├── ifsc_code (TEXT)
├── account_holder_name (TEXT)
├── transaction_id (TEXT) - NEFT/RTGS reference
├── transaction_date (TIMESTAMP)
├── processed_by (TEXT) - Admin email
├── processed_at (TIMESTAMP)
├── notes (TEXT)
├── booking_count (INTEGER)
├── total_revenue (DECIMAL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Commission Calculation

Default commission rate: **10%**

Formula:
- `commission_amount = total_revenue × (commission_rate / 100)`
- `net_amount = total_revenue - commission_amount`

Example:
- Total Revenue: ₹100,000
- Commission (10%): ₹10,000
- Net Amount to Venue: ₹90,000

## Payment Status Flow

1. **pending** - Payout generated, awaiting processing
2. **processing** - Payment is being processed
3. **processed** - Payment sent successfully
4. **failed** - Payment failed
5. **cancelled** - Payout cancelled

## Next Steps

1. Run the SQL migration script in Supabase
2. Test generating a payout for a venue with bookings
3. Process the payout and verify transaction tracking
4. Review payout history and filters

## Benefits

- **Transparency**: Clear tracking of all payments to venues
- **Automation**: Automatic calculation of revenue and commission
- **Audit Trail**: Complete history of all payouts and transactions
- **Flexibility**: Configurable commission rates per payout
- **Accountability**: Track who processed each payment and when

