"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  MapPin,
  Music,
  Clock,
  Users,
  Star,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  pincode?: string;
  phone?: string;
  email?: string;
  status: string;
}

interface Event {
  id: string;
  name: string;
  genre?: string;
  price: number;
  time: string;
  date: string;
  capacity: number;
  booked: number;
  description?: string;
  images?: string[];
}

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (venueId) {
      loadVenueData();
    }
  }, [venueId]);

  const loadVenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/venues/${venueId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load venue");
      }

      setVenue(data.venue);
      
      // Transform events
      const transformedEvents = (data.events || []).map((event: any) => ({
        id: event.id,
        name: event.name,
        genre: event.genre || "Other",
        price: parseFloat(event.price) || 0,
        time: event.time || "TBD",
        date: event.date || "",
        capacity: event.capacity || 0,
        booked: event.booked || 0,
        description: event.description || "",
        images: event.images || [],
      }));

      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error loading venue:", error);
      toast.error(error.message || "Failed to load venue");
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = (event: Event) => {
    if (!user) {
      toast.error("Please login to book events");
      router.push(`/login?redirect=/venue/${venueId}`);
      return;
    }

    setSelectedEvent(event);
    setIsBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedEvent || !user) return;

    setIsBookingLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          event_id: selectedEvent.id,
          number_of_people: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setBookingSuccess(true);
      setQrCodeUrl(data.booking?.qr_code || "");
      toast.success("Booking confirmed!");
      
      // Refresh events to update booked count
      loadVenueData();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const isEventActive = (event: Event) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0].substring(0, 5);
    const eventDate = event.date;
    const eventTime = event.time?.substring(0, 5) || "00:00";
    
    return eventDate > today || (eventDate === today && eventTime >= now);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold">Venue Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              This venue doesn't exist or is not approved.
            </p>
            <Button onClick={() => router.push("/discover")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black">
        <div className="container px-4 py-8">
          {/* Back Button */}
          <Link
            href="/discover"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discover
          </Link>

          {/* Venue Header */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{venue.name}</h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Open
                    </Badge>
                  </div>
                  {venue.description && (
                    <p className="mb-4 text-muted-foreground">{venue.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{venue.address}, {venue.city}</span>
                      {venue.pincode && <span> - {venue.pincode}</span>}
                    </div>
                    {venue.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${venue.phone}`} className="hover:text-primary">
                          {venue.phone}
                        </a>
                      </div>
                    )}
                    {venue.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${venue.email}`} className="hover:text-primary">
                          {venue.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {events.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Section */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold">Upcoming Events</h2>
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">No Upcoming Events</h3>
                  <p className="mt-2 text-muted-foreground">
                    This venue doesn't have any upcoming events at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const isActive = isEventActive(event);
                  const available = event.capacity - event.booked;
                  const isSoldOut = available <= 0;

                  return (
                    <Card
                      key={event.id}
                      className={`overflow-hidden transition-all hover:shadow-lg ${
                        !isActive || isSoldOut ? "opacity-60" : ""
                      }`}
                    >
                      {event.images && event.images.length > 0 ? (
                        <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                          <img
                            src={event.images[0]}
                            alt={event.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      )}
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-bold">{event.name}</h3>
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="secondary">{event.genre}</Badge>
                              {!isActive && (
                                <Badge variant="outline" className="text-orange-600">
                                  Past Event
                                </Badge>
                              )}
                              {isSoldOut && (
                                <Badge variant="destructive">Sold Out</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {available} / {event.capacity} available
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            <span className="font-semibold text-foreground">
                              ₹{event.price} per person
                            </span>
                          </div>
                        </div>

                        {event.description && (
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}

                        <Button
                          className="w-full"
                          onClick={() => handleBookEvent(event)}
                          disabled={!isActive || isSoldOut || !user}
                        >
                          {!user
                            ? "Login to Book"
                            : isSoldOut
                            ? "Sold Out"
                            : !isActive
                            ? "Event Ended"
                            : "Book Now"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          {!bookingSuccess ? (
            <>
              <DialogTitle>Book Event</DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? `Book tickets for ${selectedEvent.name} on ${formatDate(selectedEvent.date)} at ${selectedEvent.time}`
                  : "Select the number of tickets you want to book"}
              </DialogDescription>
              {selectedEvent && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedEvent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedEvent.date)} at {selectedEvent.time}
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Number of People
                    </label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() =>
                          setNumberOfPeople(Math.max(1, numberOfPeople - 1))
                        }
                        disabled={numberOfPeople <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={selectedEvent.capacity - selectedEvent.booked}
                        value={numberOfPeople}
                        onChange={(e) =>
                          setNumberOfPeople(
                            Math.max(
                              1,
                              Math.min(
                                selectedEvent.capacity - selectedEvent.booked,
                                parseInt(e.target.value) || 1
                              )
                            )
                          )
                        }
                        className="w-20 flex-1 text-center sm:w-24"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() =>
                          setNumberOfPeople(
                            Math.min(
                              selectedEvent.capacity - selectedEvent.booked,
                              numberOfPeople + 1
                            )
                          )
                        }
                        disabled={numberOfPeople >= selectedEvent.capacity - selectedEvent.booked}
                      >
                        +
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Available: {selectedEvent.capacity - selectedEvent.booked} tickets
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between text-sm">
                      <span>Price per person:</span>
                      <span>₹{selectedEvent.price}</span>
                    </div>
                    <div className="mt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{selectedEvent.price * numberOfPeople}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleConfirmBooking}
                    disabled={isBookingLoading}
                  >
                    {isBookingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <DialogTitle>Booking Confirmed!</DialogTitle>
              <DialogDescription>
                Your booking has been confirmed. Check your email for details.
              </DialogDescription>
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                {qrCodeUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Your Entry Pass QR Code</p>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for entry pass" 
                      className="mx-auto h-48 w-48 max-w-full object-contain"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Show this QR code at the venue for entry
                    </p>
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsBookingDialogOpen(false);
                      setBookingSuccess(false);
                      router.push("/bookings");
                    }}
                  >
                    View Bookings
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setIsBookingDialogOpen(false);
                      setBookingSuccess(false);
                    }}
                  >
                    Book Another
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

