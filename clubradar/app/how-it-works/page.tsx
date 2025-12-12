"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Ticket, Star, Users, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Discover Events",
      description: "Browse through hundreds of events happening near you. Filter by date, genre, price, and location to find your perfect night out.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      title: "Book Your Spot",
      description: "Select your event, choose the number of tickets, and confirm your booking in seconds. No waiting in lines!",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Ticket,
      title: "Get Your Pass",
      description: "Receive a digital entry pass with QR code instantly. Show it at the venue for quick entry.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Star,
      title: "Enjoy & Review",
      description: "Have an amazing time! Share your experience with reviews and ratings to help others discover great venues.",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Real-Time Availability",
      description: "See live capacity and availability for all events. Never show up to a sold-out venue.",
    },
    {
      icon: TrendingUp,
      title: "Best Deals",
      description: "Get exclusive discounts and early-bird offers on popular events. Save money while having fun!",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 px-4 py-20 text-white">
          <div className="container mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              How ClubRadar Works
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Your complete guide to discovering, booking, and enjoying the best nightlife experiences. Simple, fast, and reliable.
            </p>
          </div>
        </div>

        {/* Main Steps */}
        <div className="container px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Get Started in 4 Easy Steps</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From discovery to entry, we've made the process seamless
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-2 transition-all hover:shadow-xl">
                  <div className={`absolute top-0 h-1 w-full bg-gradient-to-r ${step.color}`} />
                  <CardHeader>
                    <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-white`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      Step {index + 1}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Features */}
          <div className="mt-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Why Choose ClubRadar?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We make nightlife booking simple, secure, and enjoyable
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-purple-100">
              Join thousands of users discovering amazing nightlife experiences every day
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/discover"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 transition-all hover:bg-purple-50"
              >
                Discover Events
              </a>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

