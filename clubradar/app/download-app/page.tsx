"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, Download, CheckCircle2 } from "lucide-react";

export default function DownloadApp() {
  const features = [
    "Browse events on the go",
    "Get instant booking confirmations",
    "Access your entry passes offline",
    "Receive event reminders and updates",
    "Exclusive mobile-only deals",
    "Quick check-in with QR codes",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 px-4 py-20 text-white">
          <div className="container mx-auto">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">
                  <Download className="h-4 w-4" />
                  <span>Coming Soon</span>
                </div>
                <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
                  Download ClubRadar App
                </h1>
                <p className="mb-8 text-lg text-purple-100">
                  Take the nightlife experience with you. Book events, manage bookings, and discover new venues—all from your pocket.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50" disabled>
                    <Smartphone className="mr-2 h-5 w-5" />
                    App Store (Coming Soon)
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" disabled>
                    <Smartphone className="mr-2 h-5 w-5" />
                    Google Play (Coming Soon)
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-white/20 blur-3xl" />
                  <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm">
                    <Smartphone className="h-64 w-64 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">App Features</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need for the perfect night out, right in your pocket
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="font-medium">{feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* QR Code Section */}
          <div className="mt-20">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-12">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      <QrCode className="h-4 w-4" />
                      <span>Scan to Get Notified</span>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold">Get Early Access</h2>
                    <p className="mb-6 text-muted-foreground">
                      Scan the QR code or enter your email to be notified when the app launches. Be among the first to experience ClubRadar on mobile!
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:flex-1"
                      />
                      <Button>Notify Me</Button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-8 shadow-lg">
                      <QrCode className="h-full w-full text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

