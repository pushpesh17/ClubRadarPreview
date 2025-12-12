"use client";

import { useState, useEffect } from "react";
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
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  MapPin,
  Music,
  Clock,
  Users,
  Star,
  Filter,
  X,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
  ChevronDown,
  QrCode,
  Plus,
  Minus,
  Search,
  ArrowUpDown,
  Loader2,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
}

interface Event {
  id: number;
  name: string;
  venue: string;
  genre: string;
  price: number;
  distance: number;
  time: string;
  date: string;
  rating: number;
  images: string[];
  capacity: number;
  booked: number;
  description?: string;
  location?: {
    address: string;
    city: string;
    pincode: string;
    coordinates?: string;
  };
  reviews?: Review[];
  rules?: string[];
  amenities?: string[];
  dressCode?: string;
  contact?: {
    phone: string;
    email: string;
  };
  categoryRatings?: {
    music: number;
    atmosphere: number;
    service: number;
    value: number;
    location: number;
  };
}

// Helper function to get rating text
const getRatingText = (rating: number): string => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  if (rating >= 3.0) return "Average";
  return "Below Average";
};

export default function DiscoverPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [tonightOnly, setTonightOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const eventsPerPage = 12;
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<
    Record<number, number>
  >({});
  const [reviewFilter, setReviewFilter] = useState<string>("all");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Load events from localStorage or use default mock data
  // Load events from API
  const loadEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message if available
        const errorMessage = data.error || "Failed to load events";
        const errorDetails = data.details || "";
        const errorHint = data.hint || "";
        
        // Combine error message with details for better user feedback
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}. ${errorDetails}${errorHint ? ` ${errorHint}` : ""}`
          : errorMessage;
        
        throw new Error(fullErrorMessage);
      }

      // Transform Supabase events to match our Event interface
      const transformedEvents: Event[] = (data.events || []).map(
        (event: {
          id: string | number;
          name: string;
          genre?: string;
          price: number | string;
          time?: string;
          date?: string;
          rating?: number | string;
          images?: string[];
          capacity?: number;
          booked?: number;
          description?: string;
          location?: { address?: string; city?: string; pincode?: string };
          rules?: string[];
          amenities?: string[];
          dress_code?: string;
          contact?: { phone?: string; email?: string };
          category_ratings?: {
            music?: number;
            atmosphere?: number;
            service?: number;
            value?: number;
            location?: number;
          };
          venues?: {
            name?: string;
            address?: string;
            city?: string;
            pincode?: string;
            phone?: string;
            email?: string;
          };
        }) => ({
          id: event.id,
          name: event.name,
          venue: event.venues?.name || "Unknown Venue",
          genre: event.genre || "Other",
          price:
            typeof event.price === "string"
              ? parseFloat(event.price)
              : event.price || 0,
          distance: 0, // Calculate distance if needed
          time: event.time || "TBD",
          date: event.date || new Date().toISOString().split("T")[0],
          rating:
            typeof event.rating === "string"
              ? parseFloat(event.rating)
              : event.rating || 4.0,
          images:
            event.images && event.images.length > 0
              ? event.images
              : [
                  `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&sig=${String(
                    event.id
                  )}`,
                ],
          capacity: event.capacity || 100,
          booked: event.booked || 0,
          description: event.description || "",
          location: event.location || {
            address: event.venues?.address || "",
            city: event.venues?.city || "",
            pincode: event.venues?.pincode || "",
          },
          reviews: [],
          rules: event.rules || [],
          amenities: event.amenities || [],
          dressCode: event.dress_code || "",
          contact: event.contact || {
            phone: event.venues?.phone || "",
            email: event.venues?.email || "",
          },
          categoryRatings: event.category_ratings || {
            music: 4.0,
            atmosphere: 4.0,
            service: 4.0,
            value: 4.0,
            location: 4.0,
          },
        })
      );

      setEvents(transformedEvents);
      setFilteredEvents(transformedEvents);

      // Save to localStorage as backup
      localStorage.setItem("discoverEvents", JSON.stringify(transformedEvents));
    } catch (error: unknown) {
      console.error("Error loading events:", error);

      // Fallback to localStorage if API fails
      const savedEvents = localStorage.getItem("discoverEvents");
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents) as Event[];
        setEvents(parsed);
        setFilteredEvents(parsed);
      } else {
        // Use empty array if no backup
        setEvents([]);
        setFilteredEvents([]);
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Legacy code for localStorage fallback (kept for backward compatibility)
  useEffect(() => {
    const savedEvents = localStorage.getItem("discoverEvents");
    let allEvents: Event[] = [];

    if (savedEvents && events.length === 0) {
      const parsed = JSON.parse(savedEvents) as Event[];
      // Ensure all events have required fields with defaults
      allEvents = parsed.map((event) => ({
        ...event,
        images: event.images || [
          `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&sig=${event.id}`,
          `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&sig=${event.id}`,
          `https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&sig=${event.id}`,
          `https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&sig=${event.id}`,
        ],
        description:
          event.description ||
          `${event.name} at ${event.venue}. Experience the best nightlife in the city.`,
        location: event.location || {
          address: `${event.venue} Address`,
          city: "Mumbai",
          pincode: "400001",
        },
        reviews: event.reviews || [],
        rules: event.rules || ["Valid ID required", "Age limit: 18+"],
        amenities: event.amenities || ["Bar", "Dance Floor", "Music"],
        dressCode: event.dressCode || "Smart Casual",
        contact: event.contact || {
          phone: "+91 9876543210",
          email: "info@venue.com",
        },
      }));
    } else {
      // Default mock events with images and details
      const mockEvents: Event[] = [
        {
          id: 1,
          name: "Friday Night Party",
          venue: "Club XYZ",
          genre: "Electronic",
          price: 500,
          distance: 2.5,
          time: "10:00 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.5,
          capacity: 200,
          booked: 145,
          images: [
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
          ],
          description:
            "Experience the ultimate electronic music night with top DJs and state-of-the-art sound systems. Dance the night away in our premium venue.",
          location: {
            address: "123 Nightlife Street",
            city: "Mumbai",
            pincode: "400001",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Rahul S.",
              rating: 5,
              comment:
                "Amazing vibe and great music! Best night out. The DJ was incredible and the crowd was energetic. Definitely coming back next week!",
              date: "2024-01-10",
              helpful: 24,
            },
            {
              id: 2,
              userName: "Priya M.",
              rating: 4,
              comment:
                "Good crowd and excellent DJ. Will come again! The venue is spacious and the sound system is top-notch.",
              date: "2024-01-08",
              helpful: 18,
            },
            {
              id: 3,
              userName: "Amit K.",
              rating: 5,
              comment:
                "Perfect place for party lovers. Highly recommended! The atmosphere is electric and the staff is friendly.",
              date: "2024-01-05",
              helpful: 32,
            },
            {
              id: 4,
              userName: "Sara P.",
              rating: 5,
              comment:
                "Best electronic music night in the city! The lighting and visuals were stunning.",
              date: "2024-01-03",
              helpful: 15,
            },
            {
              id: 5,
              userName: "Vikram R.",
              rating: 4,
              comment:
                "Great experience overall. The drinks were reasonably priced and the music selection was perfect.",
              date: "2023-12-28",
              helpful: 12,
            },
          ],
          rules: [
            "Valid ID proof required for entry",
            "No outside food or drinks allowed",
            "Age limit: 18+",
            "Dress code: Smart casual",
            "No smoking inside the venue",
          ],
          amenities: [
            "Free WiFi",
            "Valet Parking",
            "Food & Drinks",
            "VIP Section",
            "Security",
          ],
          dressCode: "Smart Casual",
          contact: {
            phone: "+91 9876543210",
            email: "info@clubxyz.com",
          },
          categoryRatings: {
            music: 4.6,
            atmosphere: 4.5,
            service: 4.4,
            value: 4.3,
            location: 4.5,
          },
        },
        {
          id: 2,
          name: "Bollywood Night",
          venue: "The Lounge",
          genre: "Bollywood",
          price: 800,
          distance: 5.2,
          time: "9:00 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.8,
          capacity: 150,
          booked: 120,
          images: [
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
          ],
          description:
            "Dance to the beats of Bollywood hits with live performances and celebrity appearances. A night filled with energy and entertainment.",
          location: {
            address: "456 Entertainment Avenue",
            city: "Mumbai",
            pincode: "400052",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Sneha P.",
              rating: 5,
              comment:
                "Best Bollywood night ever! Great atmosphere. The live performances were amazing.",
              date: "2024-01-12",
              helpful: 28,
            },
            {
              id: 2,
              userName: "Vikram R.",
              rating: 4,
              comment:
                "Amazing music and crowd. Had a blast! The venue is beautiful and well-maintained.",
              date: "2024-01-09",
              helpful: 19,
            },
            {
              id: 3,
              userName: "Anjali K.",
              rating: 5,
              comment:
                "Perfect for Bollywood music lovers! The DJ played all the hits and the energy was incredible.",
              date: "2024-01-07",
              helpful: 22,
            },
          ],
          rules: [
            "Valid ID proof required",
            "Age limit: 21+",
            "Dress code: Formal/Semi-formal",
            "No photography without permission",
          ],
          amenities: [
            "Live Music",
            "Dance Floor",
            "Bar",
            "VIP Lounge",
            "Food Court",
          ],
          dressCode: "Formal/Semi-formal",
          contact: {
            phone: "+91 9876543211",
            email: "contact@thelounge.com",
          },
          categoryRatings: {
            music: 4.8,
            atmosphere: 4.7,
            service: 4.6,
            value: 4.5,
            location: 4.6,
          },
        },
        {
          id: 3,
          name: "Hip Hop Sessions",
          venue: "Underground Bar",
          genre: "Hip Hop",
          price: 600,
          distance: 3.8,
          time: "11:00 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.3,
          capacity: 100,
          booked: 78,
          images: [
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
          ],
          description:
            "Raw hip hop beats and underground vibes. Experience authentic rap culture with local and international artists.",
          location: {
            address: "789 Music Lane",
            city: "Mumbai",
            pincode: "400013",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Arjun D.",
              rating: 4,
              comment:
                "Cool underground vibe. Great for hip hop fans! The artists were talented and the crowd was respectful.",
              date: "2024-01-11",
              helpful: 16,
            },
            {
              id: 2,
              userName: "Meera L.",
              rating: 5,
              comment:
                "Authentic hip hop experience. Loved it! Best underground venue in the city.",
              date: "2024-01-07",
              helpful: 21,
            },
          ],
          rules: [
            "Age limit: 18+",
            "Casual dress code",
            "No weapons or illegal items",
          ],
          amenities: ["Live Performances", "DJ Booth", "Bar", "Dance Area"],
          dressCode: "Casual",
          contact: {
            phone: "+91 9876543212",
            email: "info@undergroundbar.com",
          },
          categoryRatings: {
            music: 4.3,
            atmosphere: 4.2,
            service: 4.1,
            value: 4.0,
            location: 4.2,
          },
        },
        {
          id: 4,
          name: "House Music Night",
          venue: "Sky Terrace",
          genre: "House",
          price: 700,
          distance: 4.5,
          time: "10:30 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.6,
          capacity: 180,
          booked: 156,
          images: [
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
          ],
          description:
            "Elevate your night with house music on our stunning rooftop terrace. Breathtaking views and premium sound.",
          location: {
            address: "321 Skyline Road",
            city: "Mumbai",
            pincode: "400020",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Rohan T.",
              rating: 5,
              comment:
                "Amazing rooftop venue with great music! The view is breathtaking and the house music was perfect.",
              date: "2024-01-13",
              helpful: 26,
            },
            {
              id: 2,
              userName: "Kavya N.",
              rating: 4,
              comment:
                "Beautiful location and good vibes. Perfect for a romantic night out with great music.",
              date: "2024-01-10",
              helpful: 14,
            },
          ],
          rules: [
            "Age limit: 21+",
            "Smart casual dress code",
            "Weather dependent event",
          ],
          amenities: [
            "Rooftop View",
            "Premium Bar",
            "VIP Section",
            "Outdoor Seating",
          ],
          dressCode: "Smart Casual",
          contact: {
            phone: "+91 9876543213",
            email: "events@skyterrace.com",
          },
          categoryRatings: {
            music: 4.7,
            atmosphere: 4.6,
            service: 4.5,
            value: 4.4,
            location: 4.8,
          },
        },
        {
          id: 5,
          name: "Techno Underground",
          venue: "Warehouse Club",
          genre: "Techno",
          price: 400,
          distance: 6.1,
          time: "11:30 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.7,
          capacity: 250,
          booked: 198,
          images: [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
          ],
          description:
            "Industrial vibes meet cutting-edge techno. A massive warehouse transformed into a dance music paradise.",
          location: {
            address: "555 Industrial Zone",
            city: "Mumbai",
            pincode: "400070",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Neha S.",
              rating: 5,
              comment:
                "Best techno night in the city! Epic venue. The warehouse setting is perfect for techno music.",
              date: "2024-01-14",
              helpful: 35,
            },
            {
              id: 2,
              userName: "Raj K.",
              rating: 5,
              comment:
                "Incredible sound system and atmosphere! The bass was mind-blowing and the crowd was amazing.",
              date: "2024-01-11",
              helpful: 29,
            },
          ],
          rules: [
            "Age limit: 18+",
            "No dress code restrictions",
            "Industrial venue - wear comfortable shoes",
          ],
          amenities: [
            "Massive Dance Floor",
            "Premium Sound System",
            "Multiple Bars",
            "Chill Out Zone",
          ],
          dressCode: "Comfortable",
          contact: {
            phone: "+91 9876543214",
            email: "info@warehouseclub.com",
          },
        },
        {
          id: 6,
          name: "Retro Night",
          venue: "Vintage Bar",
          genre: "Retro",
          price: 550,
          distance: 2.1,
          time: "9:30 PM",
          date: new Date().toISOString().split("T")[0],
          rating: 4.4,
          capacity: 120,
          booked: 95,
          images: [
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
          ],
          description:
            "Step back in time with classic hits from the 70s, 80s, and 90s. Vintage decor and retro vibes guaranteed.",
          location: {
            address: "888 Retro Street",
            city: "Mumbai",
            pincode: "400001",
            coordinates: "19.0760° N, 72.8777° E",
          },
          reviews: [
            {
              id: 1,
              userName: "Anita R.",
              rating: 4,
              comment:
                "Nostalgic vibes! Great for retro music lovers. The vintage decor adds to the experience.",
              date: "2024-01-09",
              helpful: 17,
            },
            {
              id: 2,
              userName: "Suresh M.",
              rating: 5,
              comment:
                "Perfect throwback night. Loved every moment! The DJ played all the classics from the 80s and 90s.",
              date: "2024-01-06",
              helpful: 23,
            },
          ],
          rules: [
            "Age limit: 21+",
            "Vintage theme encouraged",
            "Respectful behavior required",
          ],
          amenities: [
            "Vintage Decor",
            "Classic Bar",
            "Dance Floor",
            "Photo Booth",
          ],
          dressCode: "Vintage Theme",
          contact: {
            phone: "+91 9876543215",
            email: "hello@vintagebar.com",
          },
          categoryRatings: {
            music: 4.4,
            atmosphere: 4.5,
            service: 4.3,
            value: 4.2,
            location: 4.4,
          },
        },
      ];
      allEvents = mockEvents;
      localStorage.setItem("discoverEvents", JSON.stringify(mockEvents));
    }

    setEvents(allEvents);
    setFilteredEvents(allEvents);
  }, []);

  // Note: Authentication is now handled by Clerk
  // The discover page is public, but users can still access it when logged in
  // No need to check localStorage or redirect - Clerk handles authentication

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.genre.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
      );
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((event) => event.genre === selectedGenre);
    }

    // Filter by price range
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      if (max) {
        filtered = filtered.filter(
          (event) => event.price >= min && event.price <= max
        );
      } else {
        filtered = filtered.filter((event) => event.price >= min);
      }
    }

    // Filter by tonight only
    if (tonightOnly) {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter((event) => event.date === today);
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "distance":
          return a.distance - b.distance;
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "capacity":
          return b.capacity - b.booked - (a.capacity - a.booked);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedGenre, priceRange, tonightOnly, events, searchQuery, sortBy]);

  // Pagination: Display only current page events
  useEffect(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    setDisplayedEvents(filteredEvents.slice(0, endIndex));
  }, [filteredEvents, currentPage]);

  const hasMoreEvents = displayedEvents.length < filteredEvents.length;
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  const genres = [
    "all",
    "Electronic",
    "Bollywood",
    "Hip Hop",
    "House",
    "Techno",
    "Retro",
  ];

  const clearFilters = () => {
    setSelectedGenre("all");
    setPriceRange("all");
    setTonightOnly(false);
  };

  const hasActiveFilters =
    selectedGenre !== "all" || priceRange !== "all" || tonightOnly;

  // Download booking pass as image
  const downloadBookingPass = () => {
    if (!qrCodeUrl || !selectedEvent || !bookingId) {
      toast.error("Booking pass not ready yet");
      return;
    }

    // Create a canvas to generate the booking pass image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Failed to create booking pass");
      return;
    }

    canvas.width = 800;
    canvas.height = 1200;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 200);
    gradient.addColorStop(0, "#9333ea");
    gradient.addColorStop(1, "#ec4899");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 200);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ClubRadar", canvas.width / 2, 50);
    ctx.font = "24px Arial";
    ctx.fillText("Entry Pass", canvas.width / 2, 90);

    // Event details
    ctx.fillStyle = "#000000";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(selectedEvent.name, canvas.width / 2, 280);

    ctx.font = "18px Arial";
    ctx.fillText(selectedEvent.venue, canvas.width / 2, 310);

    ctx.font = "16px Arial";
    ctx.fillText(
      `${new Date(selectedEvent.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })} at ${selectedEvent.time}`,
      canvas.width / 2,
      340
    );

    // QR Code
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      const qrSize = 300;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 400;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Booking ID
      ctx.fillStyle = "#000000";
      ctx.font = "16px monospace";
      ctx.fillText(
        `Booking ID: ${bookingId}`,
        canvas.width / 2,
        qrY + qrSize + 30
      );

      // Number of people
      ctx.font = "18px Arial";
      ctx.fillText(
        `Entry for ${numberOfPeople} ${
          numberOfPeople === 1 ? "Person" : "People"
        }`,
        canvas.width / 2,
        qrY + qrSize + 60
      );

      // Amount
      ctx.font = "bold 20px Arial";
      ctx.fillText(
        `Amount Paid: ₹${selectedEvent.price * numberOfPeople}`,
        canvas.width / 2,
        qrY + qrSize + 90
      );

      // Footer
      ctx.fillStyle = "#666666";
      ctx.font = "14px Arial";
      ctx.fillText(
        "Show this QR code at the venue for entry",
        canvas.width / 2,
        qrY + qrSize + 130
      );
      ctx.fillText(
        "ClubRadar - Your Nightlife Discovery Platform",
        canvas.width / 2,
        qrY + qrSize + 150
      );

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `booking-pass-${bookingId}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Booking pass downloaded!");
        }
      });
    };
    qrImg.onerror = () => {
      toast.error("Failed to load QR code for download");
    };
    qrImg.src = qrCodeUrl;
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedEvent) return;

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to book an event");
      setIsBookingDialogOpen(false);
      router.push("/login?redirect=/discover");
      return;
    }

    try {
      setIsBookingLoading(true);

      // Call the booking API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          number_of_people: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Set booking success state with booking details
      setBookingId(data.booking.id);
      setQrCodeUrl(data.booking.qr_code || "");
      setBookingSuccess(true);
      setIsBookingLoading(false);

      // Update the event's booked count in local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                booked: Math.min(
                  (event.booked || 0) + numberOfPeople,
                  event.capacity
                ),
              }
            : event
        )
      );

      // Update filtered events too
      setFilteredEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                booked: Math.min(
                  (event.booked || 0) + numberOfPeople,
                  event.capacity
                ),
              }
            : event
        )
      );

      toast.success("Booking confirmed! Your entry pass is ready.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create booking. Please try again.";
      setIsBookingLoading(false);
      console.error("Booking error:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Discover Nightlife</h1>
            <p className="text-purple-100">
              Find the best clubs and events near you
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur shadow-sm">
          <div className="container px-4 py-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search clubs, venues, or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Dropdown - Desktop */}
              <div className="hidden lg:flex">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[160px] text-sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="distance">Nearest First</SelectItem>
                    <SelectItem value="date">Date: Soonest</SelectItem>
                    <SelectItem value="capacity">Most Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[85vh] rounded-t-[2rem]"
                >
                  <div className="flex flex-col h-full">
                    {/* Handle bar */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="h-1.5 w-12 rounded-full bg-muted" />
                    </div>

                    <SheetHeader className="px-6 pb-4 border-b">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold">
                          Filters
                        </SheetTitle>
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-primary"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Clear All
                          </Button>
                        )}
                      </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                      {/* Music Genre */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold">
                          Music Genre
                        </label>
                        <Select
                          value={selectedGenre}
                          onValueChange={setSelectedGenre}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem
                                key={genre}
                                value={genre}
                                className="text-base"
                              >
                                {genre === "all" ? "All Genres" : genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold">
                          Price Range
                        </label>
                        <Select
                          value={priceRange}
                          onValueChange={setPriceRange}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-base">
                              All Prices
                            </SelectItem>
                            <SelectItem value="0-500" className="text-base">
                              ₹0 - ₹500
                            </SelectItem>
                            <SelectItem value="500-1000" className="text-base">
                              ₹500 - ₹1000
                            </SelectItem>
                            <SelectItem value="1000" className="text-base">
                              ₹1000+
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tonight Only */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold">
                          Date Filter
                        </label>
                        <div
                          onClick={() => setTonightOnly(!tonightOnly)}
                          className="flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors hover:bg-accent"
                          style={{
                            borderColor: tonightOnly
                              ? "hsl(var(--primary))"
                              : "hsl(var(--border))",
                            backgroundColor: tonightOnly
                              ? "hsl(var(--primary) / 0.1)"
                              : "transparent",
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-base font-medium">
                              Tonight Only
                            </span>
                          </div>
                          <div
                            className={`h-6 w-11 rounded-full transition-colors ${
                              tonightOnly ? "bg-primary" : "bg-muted"
                            }`}
                          >
                            <div
                              className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                                tonightOnly
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="border-t p-6 bg-background">
                      <Button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                      >
                        Apply Filters
                        {hasActiveFilters && (
                          <Badge className="ml-2 bg-white text-primary">
                            {
                              [
                                selectedGenre !== "all",
                                priceRange !== "all",
                                tonightOnly,
                              ].filter(Boolean).length
                            }
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3 flex-1">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre === "all" ? "All Genres" : genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                    <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                    <SelectItem value="1000">₹1000+</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={tonightOnly ? "default" : "outline"}
                  onClick={() => setTonightOnly(!tonightOnly)}
                  size="sm"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Tonight
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="container px-4 sm:px-6 lg:px-8 py-8 w-full">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No events found matching your filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {displayedEvents.length} of {filteredEvents.length}{" "}
                  events
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                {displayedEvents.map((event) => {
                  const imageIndex = currentImageIndex[event.id] || 0;
                  const images = event.images || [];
                  const currentImage =
                    images[imageIndex] ||
                    `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800`;

                  return (
                    <Card
                      key={event.id}
                      className="group cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] border-2 overflow-hidden w-full"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDetailOpen(true);
                      }}
                    >
                      {/* Image Carousel */}
                      <div className="relative h-56 sm:h-64 overflow-hidden">
                        <img
                          src={currentImage}
                          alt={event.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Image Indicators */}
                        {images.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex({
                                    ...currentImageIndex,
                                    [event.id]: idx,
                                  });
                                }}
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === imageIndex
                                    ? "w-6 bg-white"
                                    : "w-1.5 bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevIndex =
                                  imageIndex === 0
                                    ? images.length - 1
                                    : imageIndex - 1;
                                setCurrentImageIndex({
                                  ...currentImageIndex,
                                  [event.id]: prevIndex,
                                });
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIndex =
                                  (imageIndex + 1) % images.length;
                                setCurrentImageIndex({
                                  ...currentImageIndex,
                                  [event.id]: nextIndex,
                                });
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {event.rating}
                          </Badge>
                        </div>

                        {/* Event Title Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-lg mb-1">
                            {event.name}
                          </h3>
                          <p className="text-white/90 text-sm drop-shadow">
                            {event.venue}
                          </p>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Music className="h-4 w-4" />
                            <span>{event.genre}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.distance} km</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {event.booked}/{event.capacity}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-lg">
                            <IndianRupee className="h-5 w-5" />
                            {event.price}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setIsDetailOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMoreEvents && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More (
                        {filteredEvents.length - displayedEvents.length}{" "}
                        remaining)
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {totalPages > 1 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} • {filteredEvents.length}{" "}
                    total events
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          {selectedEvent && (
            <>
              <DialogTitle className="sr-only">
                {selectedEvent.name} - Event Details
              </DialogTitle>
              {/* Image Carousel Section */}
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                  <>
                    <img
                      src={
                        selectedEvent.images[
                          currentImageIndex[selectedEvent.id] || 0
                        ]
                      }
                      alt={selectedEvent.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedEvent.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const current =
                              currentImageIndex[selectedEvent.id] || 0;
                            const prev =
                              current === 0
                                ? selectedEvent.images.length - 1
                                : current - 1;
                            setCurrentImageIndex({
                              ...currentImageIndex,
                              [selectedEvent.id]: prev,
                            });
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const current =
                              currentImageIndex[selectedEvent.id] || 0;
                            const next =
                              (current + 1) % selectedEvent.images.length;
                            setCurrentImageIndex({
                              ...currentImageIndex,
                              [selectedEvent.id]: next,
                            });
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedEvent.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setCurrentImageIndex({
                                  ...currentImageIndex,
                                  [selectedEvent.id]: idx,
                                })
                              }
                              className={`h-2 rounded-full transition-all ${
                                idx ===
                                (currentImageIndex[selectedEvent.id] || 0)
                                  ? "w-8 bg-white"
                                  : "w-2 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-white/90 text-foreground">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedEvent.rating}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90">
                      {selectedEvent.booked}/{selectedEvent.capacity} Booked
                    </Badge>
                  </div>
                  <h2 className="text-white font-bold text-2xl sm:text-3xl drop-shadow-lg mb-1">
                    {selectedEvent.name}
                  </h2>
                  <p className="text-white/90 text-base sm:text-lg drop-shadow">
                    {selectedEvent.venue}
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Time</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {selectedEvent.time}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Date</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Genre</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      {selectedEvent.genre}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Price</span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">
                      ₹{selectedEvent.price}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">About</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedEvent.location && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="font-medium text-sm sm:text-base">
                        {selectedEvent.location.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.location.city},{" "}
                        {selectedEvent.location.pincode}
                      </p>
                      {selectedEvent.location.coordinates && (
                        <p className="text-xs text-muted-foreground">
                          {selectedEvent.location.coordinates}
                        </p>
                      )}
                      <Button variant="outline" size="sm" className="mt-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {selectedEvent.amenities &&
                  selectedEvent.amenities.length > 0 && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-3">
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedEvent.amenities.map((amenity, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-muted/50 rounded-lg p-3"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm sm:text-base">
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Rules */}
                {selectedEvent.rules && selectedEvent.rules.length > 0 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Rules & Guidelines
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      {selectedEvent.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-muted-foreground">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dress Code */}
                {selectedEvent.dressCode && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      Dress Code
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-sm sm:text-base p-2"
                    >
                      {selectedEvent.dressCode}
                    </Badge>
                  </div>
                )}

                {/* Reviews Section */}
                <div>
                  {/* Reviews Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold">Reviews</h3>
                    {selectedEvent.reviews &&
                      selectedEvent.reviews.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
                        >
                          See all
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform ${
                              showAllReviews ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      )}
                  </div>

                  {/* Rating Summary Box - Mobile Design */}
                  {selectedEvent.reviews &&
                    selectedEvent.reviews.length > 0 && (
                      <div className="mb-4">
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 sm:p-5 mb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedEvent.rating.toFixed(1)}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                                {getRatingText(selectedEvent.rating)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {selectedEvent.reviews.length}{" "}
                                {selectedEvent.reviews.length === 1
                                  ? "review"
                                  : "reviews"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Verified Reviews Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Based on verified reviews
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary"
                          >
                            Learn more
                          </Button>
                        </div>

                        {/* Category Ratings Breakdown */}
                        {selectedEvent.categoryRatings && (
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Music</span>
                              <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                    style={{
                                      width: `${
                                        (selectedEvent.categoryRatings.music /
                                          5) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-10 text-right">
                                  {selectedEvent.categoryRatings.music.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Atmosphere
                              </span>
                              <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                    style={{
                                      width: `${
                                        (selectedEvent.categoryRatings
                                          .atmosphere /
                                          5) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-10 text-right">
                                  {selectedEvent.categoryRatings.atmosphere.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Service
                              </span>
                              <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                    style={{
                                      width: `${
                                        (selectedEvent.categoryRatings.service /
                                          5) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-10 text-right">
                                  {selectedEvent.categoryRatings.service.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Value</span>
                              <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                    style={{
                                      width: `${
                                        (selectedEvent.categoryRatings.value /
                                          5) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-10 text-right">
                                  {selectedEvent.categoryRatings.value.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Location
                              </span>
                              <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                    style={{
                                      width: `${
                                        (selectedEvent.categoryRatings
                                          .location /
                                          5) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-10 text-right">
                                  {selectedEvent.categoryRatings.location.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Review Filters - Only show when "See all" is clicked */}
                  {showAllReviews &&
                    selectedEvent.reviews &&
                    selectedEvent.reviews.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b">
                        <Button
                          variant={
                            reviewFilter === "all" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setReviewFilter("all")}
                          className="text-xs sm:text-sm"
                        >
                          All ({selectedEvent.reviews.length})
                        </Button>
                        <Button
                          variant={
                            reviewFilter === "mostHelpful"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setReviewFilter("mostHelpful")}
                          className="text-xs sm:text-sm"
                        >
                          Most helpful
                        </Button>
                        <Button
                          variant={
                            reviewFilter === "mostRecent"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setReviewFilter("mostRecent")}
                          className="text-xs sm:text-sm"
                        >
                          Most Recent
                        </Button>
                        <Button
                          variant={
                            reviewFilter === "highest" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setReviewFilter("highest")}
                          className="text-xs sm:text-sm"
                        >
                          Highest Rated
                        </Button>
                        <Button
                          variant={
                            reviewFilter === "lowest" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setReviewFilter("lowest")}
                          className="text-xs sm:text-sm"
                        >
                          Lowest Rated
                        </Button>
                      </div>
                    )}

                  {/* Reviews List */}
                  {selectedEvent.reviews && selectedEvent.reviews.length > 0 ? (
                    <>
                      {(() => {
                        const filteredReviews = [...selectedEvent.reviews];

                        switch (reviewFilter) {
                          case "mostHelpful":
                            filteredReviews.sort(
                              (a, b) => (b.helpful || 0) - (a.helpful || 0)
                            );
                            break;
                          case "mostRecent":
                            filteredReviews.sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            );
                            break;
                          case "highest":
                            filteredReviews.sort((a, b) => b.rating - a.rating);
                            break;
                          case "lowest":
                            filteredReviews.sort((a, b) => a.rating - b.rating);
                            break;
                          default:
                            // All - show most recent first
                            filteredReviews.sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            );
                        }

                        const reviewsToShow = showAllReviews
                          ? filteredReviews
                          : filteredReviews.slice(0, 1);

                        return (
                          <>
                            <div className="space-y-4">
                              {reviewsToShow.map((review) => (
                                <div
                                  key={review.id}
                                  className="border-2 rounded-lg p-4 sm:p-5 space-y-3 bg-card hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                        <span className="text-white font-semibold text-sm sm:text-base">
                                          {review.userName
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm sm:text-base">
                                          {review.userName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(
                                            review.date
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-300 text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      {review.helpful !== undefined &&
                                        review.helpful > 0 && (
                                          <span className="text-xs text-muted-foreground">
                                            {review.helpful} helpful
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                                    {review.comment}
                                  </p>
                                  <div className="flex items-center gap-2 pt-2 border-t">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs"
                                    >
                                      Helpful ({review.helpful || 0})
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs"
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm sm:text-base text-muted-foreground font-medium">
                        No reviews yet
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Be the first to review this event!
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact */}
                {selectedEvent.contact && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3">
                      Contact
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        {selectedEvent.contact.phone}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      // Check if user is logged in before opening booking dialog
                      if (!user) {
                        toast.error("Please login to book an event");
                        router.push("/login?redirect=/discover");
                        return;
                      }
                      setIsBookingDialogOpen(true);
                      setBookingSuccess(false);
                    }}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <IndianRupee className="mr-2 h-5 w-5" />
                    Book Entry - ₹{selectedEvent.price}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog
        open={isBookingDialogOpen}
        onOpenChange={(open) => {
          setIsBookingDialogOpen(open);
          if (!open) {
            // Reset states when dialog closes
            setBookingSuccess(false);
            setNumberOfPeople(1);
            setBookingId("");
            setQrCodeUrl("");
            setIsBookingLoading(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto">
          <DialogTitle className="sr-only">
            {bookingSuccess ? "Booking Confirmed" : "Book Entry"}
          </DialogTitle>
          {!bookingSuccess ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Confirm Booking</h2>
                <p className="text-muted-foreground">
                  Review your booking details before confirming
                </p>
              </div>

              {selectedEvent && (
                <div className="space-y-4">
                  {/* Event Details */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                          {selectedEvent.name}
                        </h3>
                        <Badge variant="secondary">{selectedEvent.genre}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedEvent.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(selectedEvent.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{selectedEvent.time}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Number of People Selector */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold block mb-1">
                          Number of People
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Select how many entry passes you need
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (numberOfPeople > 1) {
                            setNumberOfPeople(numberOfPeople - 1);
                          }
                        }}
                        disabled={numberOfPeople <= 1}
                        className="h-10 w-10 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">
                          {numberOfPeople}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {numberOfPeople === 1 ? "Person" : "People"}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const available =
                            selectedEvent.capacity - selectedEvent.booked;
                          if (numberOfPeople < available) {
                            setNumberOfPeople(numberOfPeople + 1);
                          }
                        }}
                        disabled={
                          numberOfPeople >=
                          selectedEvent.capacity - selectedEvent.booked
                        }
                        className="h-10 w-10 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedEvent.capacity - selectedEvent.booked <= 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        {selectedEvent.capacity - selectedEvent.booked} spots
                        remaining
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Entry Fee (per person)
                      </span>
                      <span className="font-semibold">
                        ₹{selectedEvent.price}
                      </span>
                    </div>
                    {numberOfPeople > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          × {numberOfPeople}{" "}
                          {numberOfPeople === 1 ? "person" : "people"}
                        </span>
                        <span className="text-muted-foreground">
                          ₹{selectedEvent.price * numberOfPeople}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg text-primary">
                        ₹{selectedEvent.price * numberOfPeople}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsBookingDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isBookingLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
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
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your entry pass has been booked successfully
                </p>
              </div>

              {selectedEvent && (
                <div className="space-y-4">
                  {/* Booking ID */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Booking ID
                    </p>
                    <p className="font-mono font-bold text-lg">{bookingId}</p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border-2 border-dashed text-center">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Booking QR Code"
                        className="h-48 w-48 mx-auto"
                      />
                    ) : (
                      <QrCode className="h-32 w-32 mx-auto text-foreground" />
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Show this QR code at the venue for entry
                    </p>
                    {bookingId && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        ID: {bookingId}
                      </p>
                    )}
                  </div>

                  {/* Event Summary */}
                  <Card>
                    <CardContent className="p-4 space-y-2 text-sm text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Event</span>
                        <span className="font-semibold">
                          {selectedEvent.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Venue</span>
                        <span className="font-semibold">
                          {selectedEvent.venue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-semibold">
                          {new Date(selectedEvent.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-semibold">
                          {selectedEvent.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Number of People
                        </span>
                        <span className="font-semibold">
                          {numberOfPeople}{" "}
                          {numberOfPeople === 1 ? "Person" : "People"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">
                          Amount Paid
                        </span>
                        <span className="font-bold text-primary">
                          ₹{selectedEvent.price * numberOfPeople}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => {
                        // Download booking pass
                        if (qrCodeUrl && selectedEvent && bookingId) {
                          downloadBookingPass();
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Booking Pass
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/bookings")}
                        className="flex-1"
                      >
                        View My Bookings
                      </Button>
                      <Button
                        onClick={() => {
                          setIsBookingDialogOpen(false);
                          setIsDetailOpen(false);
                          setBookingSuccess(false);
                          setBookingId("");
                          setQrCodeUrl("");
                          setNumberOfPeople(1);
                          // Redirect to discover for next booking
                          router.push("/discover");
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Book Another Event
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
