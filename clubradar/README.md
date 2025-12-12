# ClubRadar - Nightlife Discovery & Entry Pass Platform

A modern Next.js application for discovering nightlife venues and managing entry passes. Built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

### For Users
- **Discover Nightlife**: Browse curated clubs, events, DJs, and genres
- **Instant Entry Passes**: Book entry with QR codes, skip the queue
- **Real Information**: View pricing, music genre, ratings, dress code, and location
- **Safe & Verified**: Verified venues with ratings and map navigation

### For Venues
- **Free Dashboard**: Create events, set prices, manage bookings
- **QR Check-in System**: No hardware needed, scan QR passes instantly
- **Increased Visibility**: Appear in discovery feeds, gain more customers
- **Easy Revenue**: Commission-based model, automated payouts

### For Admins
- **Venue Approvals**: Review and approve venue registrations
- **Event Moderation**: Moderate events and bookings
- **Payment Reports**: Track platform revenue and venue payouts
- **Issue Management**: Handle refunds and customer issues

## 📁 Project Structure

```
clubradar/
├── app/
│   ├── page.tsx              # Marketing homepage
│   ├── layout.tsx            # Root layout
│   ├── blog/                 # Blog pages
│   ├── contact/              # Contact page
│   ├── venue/
│   │   ├── layout.tsx        # Venue section layout
│   │   ├── signup/           # Venue registration
│   │   └── dashboard/        # Venue dashboard
│   └── admin/
│       ├── layout.tsx        # Admin section layout
│       └── dashboard/        # Admin dashboard
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx            # Navigation bar
│   └── footer.tsx            # Footer component
└── lib/
    └── utils.ts              # Utility functions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Pages & Routes

### Marketing Website
- `/` - Homepage with city selector, features, reviews
- `/blog` - Blog listing page
- `/contact` - Contact form and information

### Venue Dashboard
- `/venue/signup` - Venue registration with KYC
- `/venue/dashboard` - Main venue dashboard with:
  - Overview & stats
  - Event management
  - Booking management
  - QR check-in tool
  - Earnings & payouts

### Admin Dashboard
- `/admin/dashboard` - Admin panel with:
  - Platform overview
  - Venue approvals
  - Event moderation
  - Payment & payout reports
  - Issue & refund management

## 🎯 Key Features Implemented

✅ Responsive navigation with mobile menu
✅ City selector on homepage
✅ Feature sections for users and venues
✅ Reviews/testimonials section
✅ Download app CTA
✅ Venue registration with multi-step form
✅ Venue dashboard with tabs for different functions
✅ Event creation and management
✅ Booking list and management
✅ QR code check-in interface
✅ Earnings and payout tracking
✅ Admin dashboard with approval workflows
✅ Payment and report management
✅ Issue and refund handling

## 🔧 Customization

### Colors & Theme
The project uses shadcn/ui's theming system. Customize colors in `app/globals.css` by modifying CSS variables.

### Adding Components
Use shadcn CLI to add new components:
```bash
npx shadcn@latest add [component-name]
```

## 📱 Next Steps

To make this a production-ready application, consider:

1. **Authentication**: Add NextAuth.js or similar for user/venue/admin login
2. **Database**: Set up Prisma with PostgreSQL/MongoDB
3. **API Routes**: Create Next.js API routes for backend logic
4. **Payment Integration**: Integrate Razorpay/Stripe for payments
5. **QR Code Generation**: Add QR code library for pass generation
6. **Image Upload**: Set up cloud storage (Cloudinary/AWS S3)
7. **Email Service**: Add email notifications (Resend/SendGrid)
8. **Real-time Updates**: Consider WebSockets for live booking updates

## 🚀 Deployment

Deploy easily on Vercel:

```bash
npm run build
vercel deploy
```

## 📄 License

This project is private and proprietary.

## 👥 Support

For support, email support@clubradar.com or visit the contact page.

---

Built with ❤️ for India's nightlife scene
