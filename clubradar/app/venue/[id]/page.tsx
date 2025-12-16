"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  Car,
  UtensilsCrossed,
  Music2,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  images?: string[];
  amenities?: string[];
  rating?: number;
  opening_hours?: any;
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

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count?: number;
}

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (venueId) {
      loadVenueData();
      loadReviews();
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

  const loadReviews = async () => {
    try {
      // For now, we'll use mock reviews. Later, integrate with reviews API
      const mockReviews: Review[] = [
        {
          id: "1",
          user_name: "Rahul S.",
          rating: 5,
          comment:
            "Amazing venue! Great music and atmosphere. Will definitely come back!",
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          helpful_count: 12,
        },
        {
          id: "2",
          user_name: "Priya M.",
          rating: 4,
          comment:
            "Good place with nice vibes. The DJ was great and the crowd was fun.",
          created_at: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          helpful_count: 8,
        },
        {
          id: "3",
          user_name: "Amit K.",
          rating: 5,
          comment:
            "Best nightclub in the city! Excellent service and great music selection.",
          created_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          helpful_count: 15,
        },
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
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

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      router.push(`/login?redirect=/venue/${venueId}`);
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      // TODO: Integrate with reviews API when available
      toast.success("Review submitted successfully!");
      setIsReviewDialogOpen(false);
      setReviewComment("");
      setReviewRating(5);
      // Reload reviews
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
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

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : venue?.rating || 0;

  const venueImages = venue?.images || [];
  const hasImages = venueImages.length > 0;

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

          {/* Image Gallery */}
          {hasImages ? (
            <div className="mb-8">
              <div className="relative h-64 md:h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                <img
                  src={venueImages[0]}
                  alt={venue.name}
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => setSelectedImageIndex(0)}
                />
                {venueImages.length > 1 && (
                  <button
                    onClick={() => setSelectedImageIndex(0)}
                    className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
                  >
                    <ImageIcon className="mr-2 h-4 w-4 inline" />
                    View All {venueImages.length} Photos
                  </button>
                )}
              </div>
              {venueImages.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {venueImages.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx + 1}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                      onClick={() => setSelectedImageIndex(idx + 1)}
                    >
                      <img
                        src={img}
                        alt={`${venue.name} ${idx + 2}`}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                      {idx === 3 && venueImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                          +{venueImages.length - 5} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 h-64 md:h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-center text-white/80">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No photos available</p>
              </div>
            </div>
          )}

          {/* Venue Header */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {venue.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Open
                    </Badge>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({reviews.length}{" "}
                          {reviews.length === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    )}
                  </div>
                  {venue.description && (
                    <p className="mb-4 text-base text-muted-foreground leading-relaxed">
                      {venue.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {venue.address}, {venue.city}
                      </span>
                      {venue.pincode && <span> - {venue.pincode}</span>}
                    </div>
                    {venue.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${venue.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {venue.phone}
                        </a>
                      </div>
                    )}
                    {venue.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`mailto:${venue.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {venue.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {events.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities Section */}
          {venue.amenities && venue.amenities.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {venue.amenities.map((amenity, idx) => {
                    const iconMap: Record<string, any> = {
                      wifi: Wifi,
                      parking: Car,
                      food: UtensilsCrossed,
                      music: Music2,
                    };
                    const Icon = iconMap[amenity.toLowerCase()] || Sparkles;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Icon className="h-4 w-4 text-purple-600" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews
                {averageRating > 0 && (
                  <span className="text-base font-normal text-muted-foreground">
                    ({averageRating.toFixed(1)})
                  </span>
                )}
              </CardTitle>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewDialogOpen(true)}
                >
                  Write Review
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </p>
                  {user && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsReviewDialogOpen(true)}
                    >
                      Write First Review
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {review.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {review.user_name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{formatReviewDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        {review.comment}
                      </p>
                      {review.helpful_count !== undefined &&
                        review.helpful_count > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{review.helpful_count} helpful</span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events Section */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold">Upcoming Events</h2>
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No Upcoming Events
                  </h3>
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
                            <h3 className="mb-1 text-lg font-bold">
                              {event.name}
                            </h3>
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="secondary">{event.genre}</Badge>
                              {!isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600"
                                >
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

      {/* Image Lightbox Modal */}
      {selectedImageIndex !== null && hasImages && (
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 bg-black/95">
            <div className="relative h-full flex items-center justify-center">
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              {venueImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex > 0
                          ? selectedImageIndex - 1
                          : venueImages.length - 1
                      )
                    }
                    className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 p-2 rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex < venueImages.length - 1
                          ? selectedImageIndex + 1
                          : 0
                      )
                    }
                    className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 p-2 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <img
                src={venueImages[selectedImageIndex]}
                alt={`${venue.name} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedImageIndex + 1} / {venueImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience at {venue.name}
          </DialogDescription>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        rating <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Your Review
              </label>
              <textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {reviewComment.length} / 500 characters
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || !reviewComment.trim()}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          {!bookingSuccess ? (
            <>
              <DialogTitle>Book Event</DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? `Book tickets for ${selectedEvent.name} on ${formatDate(
                      selectedEvent.date
                    )} at ${selectedEvent.time}`
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
                        disabled={
                          numberOfPeople >=
                          selectedEvent.capacity - selectedEvent.booked
                        }
                      >
                        +
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Available: {selectedEvent.capacity - selectedEvent.booked}{" "}
                      tickets
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
                    <p className="mb-2 text-sm font-medium">
                      Your Entry Pass QR Code
                    </p>
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
