"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  MapPin,
  Music,
  Calendar,
  Search,
  Loader2,
  Building2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Venue {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  address: string;
  city: string;
  pincode?: string;
  phone?: string;
  email?: string;
  status: string;
  activeEventsCount: number;
  booking_paused?: boolean;
}

const popularCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

export default function DiscoverPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingVenues, setTrendingVenues] = useState<Venue[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    loadVenues();
  }, [selectedCity]);

  useEffect(() => {
    filterVenues();
  }, [searchQuery, venues]);

  // Auto-play carousel
  useEffect(() => {
    if (trendingVenues.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingVenues.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [trendingVenues.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingVenues.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trendingVenues.length) % trendingVenues.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const loadVenues = async () => {
    try {
      setLoading(true);
      const cityParam = selectedCity === "all" ? "" : selectedCity;
      const url = `/api/venues${
        cityParam ? `?city=${encodeURIComponent(cityParam)}` : ""
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load venues");
      }

      // Sort venues: venues with active events first, then venues with no events at the bottom
      const sortedVenues = (data.venues || []).sort((a: Venue, b: Venue) => {
        // First, sort by activeEventsCount (descending) - venues with more events come first
        if (b.activeEventsCount !== a.activeEventsCount) {
          return b.activeEventsCount - a.activeEventsCount;
        }
        // If same number of events, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
      
      setVenues(sortedVenues);
      setFilteredVenues(sortedVenues);
      
      // Get trending/promoted venues (top 5 venues with active events)
      const trending = sortedVenues
        .filter((v: Venue) => v.activeEventsCount > 0)
        .slice(0, 5);
      setTrendingVenues(trending);
      setCurrentSlide(0); // Reset to first slide when venues change
    } catch (error: any) {
      console.error("Error loading venues:", error);
      setVenues([]);
      setFilteredVenues([]);
      setTrendingVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered: Venue[];
    
    if (!searchQuery.trim()) {
      filtered = venues;
    } else {
      const query = searchQuery.toLowerCase().trim();
      filtered = venues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(query) ||
          venue.address.toLowerCase().includes(query) ||
          venue.city.toLowerCase().includes(query)
      );
    }
    
    // Sort filtered venues: venues with active events first, then venues with no events at the bottom
    const sortedFiltered = filtered.sort((a, b) => {
      // First, sort by activeEventsCount (descending) - venues with more events come first
      if (b.activeEventsCount !== a.activeEventsCount) {
        return b.activeEventsCount - a.activeEventsCount;
      }
      // If same number of events, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
    
    setFilteredVenues(sortedFiltered);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 sm:px-4 py-8 sm:py-12 text-white">
          <div className="container mx-auto">
            <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Discover Nightlife
            </h1>
            <p className="mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg text-purple-100">
              Find the best clubs, bars, and nightlife venues in your city
            </p>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 sm:h-11 md:h-12 pl-8 sm:pl-10 bg-white text-foreground text-sm sm:text-base"
                  />
                </div>
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-10 sm:h-11 md:h-12 w-full bg-white text-foreground text-sm sm:text-base md:w-64">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {popularCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Trending/Promoted Venues Carousel - BookMyShow Style */}
        {trendingVenues.length > 0 && (
          <div className="relative bg-gradient-to-b from-white via-purple-50/30 to-transparent dark:from-black dark:via-purple-950/30 py-6 sm:py-12 border-b border-purple-100 dark:border-purple-900 overflow-hidden">
            {/* Animated Background Emojis/Stars */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`emoji-${i}`}
                  className="absolute text-lg sm:text-2xl md:text-3xl animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  {['⭐', '✨', '❄️', '🌟', '💫', '⭐', '❄️', '✨', '🌟', '💫'][Math.floor(Math.random() * 10)]}
                </div>
              ))}
            </div>

            <div className="container mx-auto px-4 sm:px-4 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  <span className="font-bold text-xs sm:text-sm md:text-base">Trending Now</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                  <span className="hidden xs:inline">Hot Events This Week</span>
                  <span className="xs:hidden">Hot Events</span>
                </div>
              </div>
              
              {/* Carousel Wrapper */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl sm:rounded-lg">
                  {/* Carousel Container */}
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {trendingVenues.map((venue, index) => (
                      <div
                        key={venue.id}
                        className="min-w-full flex-shrink-0 px-0 sm:px-2"
                      >
                        <Link href={`/venue/${venue.id}`}>
                          <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-gray-900 w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto shadow-lg sm:shadow-xl">
                            <div className="relative aspect-[3/2] sm:aspect-[16/7] md:aspect-[16/6] w-full overflow-hidden rounded-xl sm:rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                              {venue.images && venue.images.length > 0 ? (
                                <img
                                  src={venue.images[0]}
                                  alt={`${venue.name} photo`}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Building2 className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-white opacity-80" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-1.5 sm:px-3 py-0.5 sm:py-1">
                                  <TrendingUp className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  <span className="hidden xs:inline">Trending</span>
                                </Badge>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-6 md:left-6 md:right-6">
                                <h3 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg line-clamp-2">
                                  {venue.name}
                                </h3>
                                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1.5 sm:gap-2 md:gap-4 text-white">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm md:text-lg font-semibold">{venue.city}</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm md:text-lg font-semibold">
                                      {venue.activeEventsCount} Event{venue.activeEventsCount !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {trendingVenues.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 sm:left-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white p-2 sm:p-2 md:p-3 rounded-full sm:rounded-r-lg sm:rounded-l-none transition-all duration-200 backdrop-blur-sm touch-manipulation shadow-lg"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 sm:right-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white p-2 sm:p-2 md:p-3 rounded-full sm:rounded-l-lg sm:rounded-r-none transition-all duration-200 backdrop-blur-sm touch-manipulation shadow-lg"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </button>
                  </>
                )}

                {/* Pagination Dots */}
                {trendingVenues.length > 1 && (
                  <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-3 sm:mt-6">
                    {trendingVenues.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full touch-manipulation ${
                          index === currentSlide
                            ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-gradient-to-r from-purple-600 to-pink-600"
                            : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 dark:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Venues Grid */}
        <div className="container px-4 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : filteredVenues.length === 0 ? (
            <Card className="py-20">
              <CardContent className="text-center">
                <Building2 className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-xl font-semibold">No Venues Found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "No venues available in this city yet"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {filteredVenues.length} Venue
                  {filteredVenues.length !== 1 ? "s" : ""} Found
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVenues.map((venue) => (
                  <Link key={venue.id} href={`/venue/${venue.id}`}>
                    <Card className="group h-full cursor-pointer transition-all hover:shadow-xl">
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        {venue.images && venue.images.length > 0 ? (
                          <img
                            src={venue.images[0]}
                            alt={`${venue.name} photo`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback to gradient if image fails to load
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-16 w-16 text-white opacity-80" />
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors">
                            {venue.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={
                              venue.booking_paused
                                ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {venue.booking_paused ? "Paused" : "Open"}
                          </Badge>
                        </div>

                        {venue.description && (
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {venue.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">
                              {venue.address}, {venue.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {venue.activeEventsCount} Active Event
                              {venue.activeEventsCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <Button className="mt-4 w-full" variant="outline">
                          View Details & Book
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
