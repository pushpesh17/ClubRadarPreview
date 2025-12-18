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

  useEffect(() => {
    loadVenues();
  }, [selectedCity]);

  useEffect(() => {
    filterVenues();
  }, [searchQuery, venues]);

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

      setVenues(data.venues || []);
      setFilteredVenues(data.venues || []);
    } catch (error: any) {
      console.error("Error loading venues:", error);
      setVenues([]);
      setFilteredVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    if (!searchQuery.trim()) {
      setFilteredVenues(venues);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.address.toLowerCase().includes(query) ||
        venue.city.toLowerCase().includes(query)
    );
    setFilteredVenues(filtered);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-12 text-white">
          <div className="container mx-auto">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Discover Nightlife
            </h1>
            <p className="mb-8 text-lg text-purple-100">
              Find the best clubs, bars, and nightlife venues in your city
            </p>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10 bg-white text-foreground"
                  />
                </div>
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 w-full bg-white text-foreground md:w-64">
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
