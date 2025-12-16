"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  MapPin,
  Sparkles,
  Calendar,
  Users,
  Star,
  ArrowRight,
  QrCode,
  Shield,
  Zap,
  CheckCircle2,
  Music,
  Building2,
  BarChart3,
  CreditCard,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 text-white">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

          {/* Gradient orbs for depth */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-500/30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"></div>

          <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-white/30 backdrop-blur-sm">
                <Sparkles className="mr-2 h-3 w-3" />
                India&apos;s #1 Nightlife Discovery Platform
              </Badge>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Discover the Best
                <span className="block bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mt-2">
                  Nightlife in India
                </span>
          </h1>

              <p className="mt-6 text-lg leading-8 text-purple-100 sm:text-xl lg:text-2xl max-w-2xl mx-auto">
                Find the hottest clubs, book instant entry passes, and skip the
                queue. Your ultimate nightlife companion for metro cities across
                India.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/discover">
                    Explore Clubs Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 hover:border-white h-12 px-8 text-base font-semibold backdrop-blur-sm bg-white/5"
                >
                  <Link href="/venue/signup">For Venues</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Verified Venues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-background border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { label: "Active Venues", value: "500+", icon: Building2 },
                { label: "Events This Month", value: "2,500+", icon: Calendar },
                { label: "Happy Users", value: "50K+", icon: Users },
                { label: "Cities Covered", value: "8", icon: MapPin },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* City Selector */}
        <section
          id="discover"
          className="py-20 bg-gradient-to-b from-background to-muted/30"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Select Your City
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose your metro city to discover nearby clubs and events
                happening tonight
              </p>
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: "Mumbai", events: "450+" },
                  { name: "Delhi", events: "380+" },
                  { name: "Bangalore", events: "320+" },
                  { name: "Hyderabad", events: "280+" },
                  { name: "Chennai", events: "250+" },
                  { name: "Kolkata", events: "220+" },
                  { name: "Pune", events: "180+" },
                  { name: "Ahmedabad", events: "150+" },
                ].map((city) => (
                  <Button
                    key={city.name}
                    asChild
                    variant="outline"
                    className="h-auto flex-col py-6 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                  >
                    <Link href="/discover">
                      <MapPin className="mb-3 h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-base">
                        {city.name}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {city.events} events
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features for Users */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <Badge className="mb-4">For Party-Goers</Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Everything You Need for an Amazing Night Out
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover, book, and enjoy the best nightlife experiences in your
                city
              </p>
            </div>
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Sparkles,
                    title: "Discover Events",
                    description:
                      "Find the hottest clubs and events happening tonight in your city. Filter by music genre, price, and location.",
                    color: "text-purple-600",
                  },
                  {
                    icon: QrCode,
                    title: "Instant QR Entry",
                    description:
                      "Skip the queue with instant QR-based entry passes. Book in seconds, enter in style.",
                    color: "text-pink-600",
                  },
                  {
                    icon: Star,
                    title: "Real Reviews",
                    description:
                      "Read authentic reviews from party-goers. See ratings for music, atmosphere, service, and value.",
                    color: "text-yellow-600",
                  },
                  {
                    icon: MapPin,
                    title: "Nearby Clubs",
                    description:
                      "Discover clubs close to you with real-time distance tracking. Never miss a great night out.",
                    color: "text-blue-600",
                  },
                  {
                    icon: Music,
                    title: "Smart Filters",
                    description:
                      "Find events by music genre, price range, date, and location. Find exactly what you're looking for.",
                    color: "text-green-600",
                  },
                  {
                    icon: Zap,
                    title: "Real-time Updates",
                    description:
                      "Get instant notifications about new events, capacity updates, and exclusive deals.",
                    color: "text-orange-600",
                  },
                ].map((feature) => (
                  <Card
                    key={feature.title}
                    className="group border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`mb-4 inline-flex rounded-lg bg-muted p-3 ${feature.color}`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features for Venues */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <Badge className="mb-4">For Venues</Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Grow Your Business with ClubRadar
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools to manage events, bookings, and grow your
                nightlife business
              </p>
            </div>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 sm:grid-cols-2">
                {[
                  {
                    icon: Calendar,
                    title: "Event Management",
                    description:
                      "Create and manage events with ease. Set pricing, capacity, dress codes, and more. Update in real-time.",
                    features: [
                      "Easy event creation",
                      "Real-time capacity tracking",
                      "Custom pricing",
                    ],
                  },
                  {
                    icon: QrCode,
                    title: "QR Check-in System",
                    description:
                      "Streamline entry with our built-in QR code scanner. Instant verification, no queues, happy customers.",
                    features: [
                      "Instant verification",
                      "Mobile scanner",
                      "Booking management",
                    ],
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics & Insights",
                    description:
                      "Track bookings, earnings, and customer insights in real-time. Make data-driven decisions.",
                    features: [
                      "Revenue tracking",
                      "Customer analytics",
                      "Performance reports",
                    ],
                  },
                  {
                    icon: CreditCard,
                    title: "Secure Payouts",
                    description:
                      "Get paid quickly and securely with automated payout processing. Integrated with Razorpay.",
                    features: [
                      "Fast payouts",
                      "Secure transactions",
                      "Payment history",
                    ],
                  },
                ].map((feature) => (
                  <Card
                    key={feature.title}
                    className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
                  >
                    <CardContent className="p-8">
                      <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold">
                        {feature.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.features.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 px-8 text-base font-semibold"
                >
                  <Link href="/venue/signup">
                    Register Your Venue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get started in three simple steps
              </p>
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Discover Events",
                    description:
                      "Browse clubs and events in your city. Filter by music, price, and location.",
                    icon: MapPin,
                  },
                  {
                    step: "02",
                    title: "Book Entry Pass",
                    description:
                      "Select number of people and book instantly. Get your QR code immediately.",
                    icon: QrCode,
                  },
                  {
                    step: "03",
                    title: "Enjoy the Night",
                    description:
                      "Show your QR code at the venue. Skip the queue and enter directly.",
                    icon: Sparkles,
                  },
                ].map((item, index) => (
                  <div key={item.step} className="relative text-center">
                    <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <item.icon className="mx-auto mb-4 h-10 w-10 text-purple-600" />
                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    {index < 2 && (
                      <ArrowRight className="absolute top-8 -right-4 hidden h-8 w-8 text-muted-foreground sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Loved by Thousands
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what our users are saying about ClubRadar
              </p>
            </div>
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "Rahul Sharma",
                    city: "Mumbai",
                    rating: 5,
                    review:
                      "Best app for finding clubs! Booked entry passes instantly and skipped the long queue. The QR code system is amazing!",
                    verified: true,
                  },
                  {
                    name: "Priya Mehta",
                    city: "Delhi",
                    rating: 5,
                    review:
                      "Love the QR entry system. No more waiting in queues! The reviews help me choose the perfect venue every time.",
                    verified: true,
                  },
                  {
                    name: "Arjun Kapoor",
                    city: "Bangalore",
                    rating: 5,
                    review:
                      "Great selection of venues and easy booking process. The filters make it so easy to find exactly what I'm looking for.",
                    verified: true,
                  },
                  {
                    name: "Sneha Patel",
                    city: "Hyderabad",
                    rating: 5,
                    review:
                      "As a venue owner, ClubRadar has transformed how we manage bookings. The dashboard is intuitive and payouts are fast.",
                    verified: true,
                  },
                  {
                    name: "Vikram Singh",
                    city: "Pune",
                    rating: 5,
                    review:
                      "The real-time updates are a game changer. I always know about new events and capacity before heading out.",
                    verified: true,
                  },
                  {
                    name: "Ananya Reddy",
                    city: "Chennai",
                    rating: 5,
                    review:
                      "Secure payments and verified venues give me peace of mind. Best nightlife app in India!",
                    verified: true,
                  },
                ].map((review) => (
                  <Card
                    key={review.name}
                    className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        &ldquo;{review.review}&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold">{review.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {review.city}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 bg-background border-y">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Built with Modern Technology
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Secure, fast, and reliable infrastructure
          </p>
        </div>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: "Clerk Auth", desc: "Secure authentication" },
                  { name: "Supabase", desc: "PostgreSQL database" },
                  { name: "Razorpay", desc: "Payment processing" },
                  { name: "Next.js", desc: "Fast web framework" },
                ].map((tech) => (
                  <Card key={tech.name} className="text-center border-2">
                    <CardContent className="p-6">
                      <Shield className="mx-auto mb-3 h-8 w-8 text-purple-600" />
                      <h3 className="font-semibold mb-1">{tech.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tech.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section
          id="download"
          className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 text-white"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Smartphone className="mx-auto mb-6 h-16 w-16" />
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Download ClubRadar App
              </h2>
              <p className="mt-4 text-lg text-purple-100">
                Available on iOS and Android. Coming soon!
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 hover:border-white h-12 px-8 backdrop-blur-sm bg-white/5"
                >
                  <Link href="#">
                    <span className="text-base font-semibold">
                      Download for iOS
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/20 hover:border-white h-12 px-8 backdrop-blur-sm bg-white/5"
                >
                  <Link href="#">
                    <span className="text-base font-semibold">
                      Download for Android
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardContent className="p-12 text-center">
                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    Ready to Explore?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of party-goers discovering the best nightlife
                    in India. Start exploring clubs and events in your city
                    today.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 px-8 text-base font-semibold"
                    >
                      <Link href="/discover">
                        Start Exploring
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 px-8 text-base font-semibold"
                    >
                      <Link href="/venue/signup">List Your Venue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
