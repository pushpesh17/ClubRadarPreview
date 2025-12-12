"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  QrCode,
  Ticket,
  XCircle,
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import toast from "react-hot-toast";

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push("/login?redirect=/bookings");
      return;
    }

    // Load bookings from API when user is available (only once)
    if (user && !authLoading && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]); // Only depend on user.id to prevent loops

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings from /api/bookings...");
      
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response from API:", text.substring(0, 500));
        throw new Error(`Server error (${response.status}). Please try again later.`);
      }

      const data = await response.json();
      console.log("Bookings data received:", data);

      if (!response.ok) {
        // Show detailed error message if available
        const errorMessage = data.error || "Failed to load bookings";
        const errorDetails = data.details || "";
        const errorHint = data.hint || "";
        
        // Combine error message with details for better user feedback
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}. ${errorDetails}${errorHint ? ` ${errorHint}` : ""}`
          : errorMessage;
        
        throw new Error(fullErrorMessage);
      }

      // Transform API data to match UI expectations
      const transformedBookings = (data.bookings || []).map((booking: any) => ({
        id: booking.id,
        eventName: booking.events?.name || "Unknown Event",
        venue: booking.events?.venues?.name || "Unknown Venue",
        date: booking.events?.date || "",
        time: booking.events?.time || "",
        price: parseFloat(booking.total_amount || 0),
        numberOfPeople: booking.number_of_people || 1,
        genre: booking.events?.genre || "",
        location: booking.events?.location || {
          address: booking.events?.venues?.address || "",
          city: booking.events?.venues?.city || "",
        },
        status: booking.payment_status === "completed" ? "confirmed" : booking.payment_status || "pending",
        qrCode: booking.qr_code || "",
        bookingDate: booking.created_at || new Date().toISOString(),
      }));

      console.log("Transformed bookings:", transformedBookings);
      setBookings(transformedBookings);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load bookings";
      console.error("Error loading bookings:", error);
      
      // Check if it's a connection error or table missing error
      if (errorMessage.includes("Database connection failed") || 
          errorMessage.includes("Unable to connect") ||
          errorMessage.includes("table not found") ||
          errorMessage.includes("schema cache")) {
        setConnectionError(errorMessage);
      } else {
        setConnectionError(null);
        toast.error(errorMessage);
      }
      
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
    hasLoadedRef.current = false;
    loadBookings();
  };

  const handleCheckHealth = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      console.log("Health check result:", data);
      
      if (data.supabase?.connection?.status === "connected") {
        toast.success("Connection is working! Try loading bookings again.");
        handleRetry();
      } else {
        toast.error("Connection issue detected. Check console for details.");
        console.error("Health check details:", data);
      }
    } catch (error) {
      toast.error("Could not check connection status.");
      console.error("Health check error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black px-4 py-6 sm:py-8 lg:py-12">
        <div className="container max-w-4xl mx-auto">
          <Link
            href="/discover"
            className="mb-4 sm:mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discover
          </Link>

          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View all your event bookings and entry passes
            </p>
          </div>

          {loading ? (
            <Card className="shadow-xl">
              <CardContent className="p-8 sm:p-12 text-center">
                <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-purple-600 animate-spin" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  Loading your bookings...
                </p>
              </CardContent>
            </Card>
          ) : connectionError ? (
            <Card className="shadow-xl border-orange-500">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      {connectionError?.includes("table not found") || connectionError?.includes("schema cache") || connectionError?.includes("Could not find the table")
                        ? "Bookings Table Not Found"
                        : "Database Connection Failed"}
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 max-w-md mx-auto">
                      {connectionError}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button
                      onClick={handleCheckHealth}
                      variant="outline"
                      className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Check Connection
                    </Button>
                  </div>
                  <div className="pt-4 text-xs text-muted-foreground space-y-1">
                    <p><strong>Quick Fix:</strong></p>
                    {connectionError?.includes("table not found") || connectionError?.includes("schema cache") || connectionError?.includes("Could not find the table") ? (
                      <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                        <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">Supabase Dashboard</a></li>
                        <li>Select your project → <strong>SQL Editor</strong></li>
                        <li>Open and run: <code className="bg-muted px-1 rounded">supabase/create-bookings-table.sql</code></li>
                        <li>Wait a few seconds for schema cache to refresh</li>
                        <li>Click <strong>"Retry"</strong> button above</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                        <li>Check your <code className="bg-muted px-1 rounded">.env.local</code> file has <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-muted px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                        <li>Verify your Supabase project is active (not paused) in Supabase Dashboard</li>
                        <li>Restart your dev server after updating environment variables</li>
                      </ol>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : bookings.length === 0 ? (
            <Card className="shadow-xl">
              <CardContent className="p-8 sm:p-12 text-center">
                <Ticket className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  No bookings yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  Start exploring events and book your first entry pass!
                </p>
                <Button
                  onClick={() => router.push("/discover")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  Discover Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {bookings.map((booking) => {
                const eventDate = new Date(booking.date);
                const isPastEvent = eventDate < new Date();
                const statusColor =
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";

                return (
                  <Card
                    key={booking.id}
                    className="hover:shadow-lg transition-shadow border-2"
                  >
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      {/* Header with Event Name and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl break-words">
                              {booking.eventName}
                            </h3>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {booking.genre}
                            </Badge>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            {booking.venue}
                          </p>
                        </div>
                        <Badge className={`${statusColor} shrink-0 text-xs sm:text-sm`}>
                          {booking.status === "confirmed"
                            ? "Confirmed"
                            : booking.status}
                        </Badge>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2.5 sm:space-y-3 mb-4 pb-4 border-b">
                        <div className="flex items-start gap-2.5 text-sm sm:text-base">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-muted-foreground block sm:inline sm:mr-2">Date: </span>
                            <span className="font-medium">
                              {eventDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm sm:text-base">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-muted-foreground block sm:inline sm:mr-2">Time: </span>
                            <span className="font-medium">{booking.time}</span>
                          </div>
                        </div>
                        {booking.numberOfPeople && (
                          <div className="flex items-start gap-2.5 text-sm sm:text-base">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-muted-foreground block sm:inline sm:mr-2">People: </span>
                              <span className="font-medium">
                                {booking.numberOfPeople} {booking.numberOfPeople === 1 ? "Person" : "People"}
                              </span>
                            </div>
                          </div>
                        )}
                        {booking.location && (
                          <div className="flex items-start gap-2.5 text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-muted-foreground block sm:inline sm:mr-2">Location: </span>
                              <span className="font-medium break-words">
                                {booking.location.address}, {booking.location.city}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      {booking.qrCode && (
                        <div className="mb-4 pb-4 border-b">
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-dashed text-center">
                            <img
                              src={booking.qrCode}
                              alt="Booking QR Code"
                              className="h-32 w-32 mx-auto mb-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              Show this QR code at the venue
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Booking ID and Price */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="bg-muted/50 rounded-lg p-2 sm:p-2.5 shrink-0">
                            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Booking ID
                            </p>
                            <p className="font-mono text-xs sm:text-sm font-semibold break-all">
                              {booking.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-1 sm:gap-0.5 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <p className="text-xs text-muted-foreground">
                            Amount Paid
                          </p>
                          <p className="font-bold text-lg sm:text-xl text-primary flex items-center gap-1">
                            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                            {booking.price}
                          </p>
                        </div>
                      </div>

                      {isPastEvent && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>This event has passed</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

