"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  QrCode,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Music,
  MapPin,
  LayoutDashboard,
  X,
  AlertCircle,
  Loader2,
  Building2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

interface Event {
  id: string | number;
  name: string;
  date: string;
  time: string;
  genre: string;
  capacity: number;
  price: number;
  bookings?: number;
  booked?: number;
  description?: string;
  dressCode?: string;
  dress_code?: string;
  venue?: string;
  distance?: number;
  rating?: number;
}

interface Venue {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  city: string;
  address: string;
}

export default function VenueDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBookingViewDialogOpen, setIsBookingViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueLoading, setVenueLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState("all");
  
  // Earnings state
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayout: 0,
    lastPayout: null as { amount: number; date: string } | null,
    payoutHistory: [] as Array<{ id: string; amount: number; date: string; status: string }>
  });
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [venueImages, setVenueImages] = useState<string[]>([]);
  const [venueImageFiles, setVenueImageFiles] = useState<File[]>([]);
  const [venueImagePreviews, setVenueImagePreviews] = useState<string[]>([]);
  const [isUploadingVenueImages, setIsUploadingVenueImages] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    genre: "",
    capacity: "",
    price: "",
    description: "",
    dressCode: "",
  });
  
  // Image upload state
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sidebarItems = [
    { title: "Overview", href: "/venue/dashboard", icon: LayoutDashboard, tabValue: "overview" },
    { title: "Events", href: "/venue/dashboard", icon: Calendar, tabValue: "events" },
    { title: "Bookings", href: "/venue/dashboard", icon: Users, tabValue: "bookings" },
    { title: "Check-in", href: "/venue/dashboard", icon: QrCode, tabValue: "checkin" },
    { title: "Earnings", href: "/venue/dashboard", icon: DollarSign, tabValue: "earnings" },
  ];

  // Load bookings from API
  const loadBookings = async (page: number = 1, search: string = "", status: string = "all") => {
    if (!isApproved || !venue) return;
    
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/bookings/venue?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bookings");
      }

      if (page === 1) {
        setBookings(data.bookings || []);
      } else {
        setBookings((prev) => [...prev, ...(data.bookings || [])]);
      }
      setBookingsTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast.error(error.message || "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  // Load earnings from API
  const loadEarnings = async () => {
    if (!isApproved || !venue) return;
    
    try {
      setEarningsLoading(true);
      const response = await fetch("/api/earnings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load earnings");
      }

      setEarnings(data.earnings || {
        totalEarnings: 0,
        pendingPayout: 0,
        lastPayout: null,
        payoutHistory: []
      });
    } catch (error: any) {
      console.error("Error loading earnings:", error);
      // Don't show error toast, just use default values
      setEarnings({
        totalEarnings: 0,
        pendingPayout: 0,
        lastPayout: null,
        payoutHistory: []
      });
    } finally {
      setEarningsLoading(false);
    }
  };

  // Handle payout request
  const handleRequestPayout = async () => {
    if (!isApproved) {
      toast.error("Your venue must be approved to request payouts");
      return;
    }

    if (earnings.pendingPayout <= 0) {
      toast.error("No pending payout available");
      return;
    }

    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request payout");
      }

      toast.success("Payout request submitted successfully! It will be processed soon.");
      
      // Reload earnings to update pending payout
      await loadEarnings();
    } catch (error: any) {
      console.error("Payout request error:", error);
      toast.error(error.message || "Failed to request payout. Please try again.");
    }
  };

  // Load events from API
  const loadEvents = async () => {
    try {
      const response = await fetch("/api/events/venue");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load events");
      }

      // Transform Supabase events to match our Event interface
      const transformedEvents: Event[] = (data.events || []).map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        genre: event.genre,
        capacity: event.capacity,
        price: parseFloat(event.price),
        booked: event.booked || 0,
        bookings: event.booked || 0,
        description: event.description,
        dressCode: event.dress_code,
        dress_code: event.dress_code,
      }));

      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error loading events:", error);
      // Don't show error toast, just use empty array
      setEvents([]);
    }
  };

  // Check venue status and load events
  useEffect(() => {
    // Prevent running if still loading auth
    if (authLoading) {
      return;
    }

    // Redirect if no user
    if (!user) {
      router.push("/login?redirect=/venue/dashboard");
      return;
    }

    // Use a flag to prevent state updates after unmount
    let isMounted = true;

    const checkVenueStatus = async () => {
      // Set loading state
      setVenueLoading(true);

      try {
        // Check venue status
        const statusResponse = await fetch("/api/venues/status", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        // Check if response is JSON
        const contentType = statusResponse.headers.get("content-type");
        let statusData;
        
        if (!contentType || !contentType.includes("application/json")) {
          // Response is not JSON, likely an error page
          const text = await statusResponse.text();
          console.error("Non-JSON response from API:", text.substring(0, 200));
          
          // If it's a 401, user is not authenticated
          if (statusResponse.status === 401) {
            router.push("/login?redirect=/venue/dashboard");
            return;
          }
          
          // For other errors (500, etc.), treat as no venue to show registration card
          console.warn("API returned non-JSON response, treating as no venue");
          setVenue(null);
          setIsApproved(false);
          setVenueLoading(false);
          return;
        }

        try {
          statusData = await statusResponse.json();
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
          // Treat as no venue
          if (isMounted) {
            setVenue(null);
            setIsApproved(false);
            setVenueLoading(false);
          }
          return;
        }

        // Handle 500 errors gracefully - treat as no venue
        if (statusResponse.status === 500) {
          console.error("Server error checking venue status:", statusData);
          // Treat server errors as no venue to show registration card
          if (isMounted) {
            setVenue(null);
            setIsApproved(false);
            setVenueLoading(false);
          }
          return;
        }

        if (!statusResponse.ok) {
          // If hasVenue is false, that's okay - just means no venue registered
          if (statusData?.hasVenue === false) {
            if (isMounted) {
              setVenue(null);
              setIsApproved(false);
              setVenueLoading(false);
            }
            return;
          }
          
          // For 401, redirect to login
          if (statusResponse.status === 401) {
            if (isMounted) {
              router.push("/login?redirect=/venue/dashboard");
            }
            return;
          }
          
          // For other errors, treat as no venue
          console.warn("Error checking venue status:", statusData);
          if (isMounted) {
            setVenue(null);
            setIsApproved(false);
            setVenueLoading(false);
          }
          return;
        }

        if (!statusData.hasVenue) {
          // No venue registered - set venue to null
          if (isMounted) {
            setVenue(null);
            setIsApproved(false);
            setVenueLoading(false);
          }
          return;
        }

        if (isMounted) {
          setVenue({
            id: statusData.venue.id,
            name: statusData.venue.name,
            status: statusData.venue.status,
            city: statusData.venue.city,
            address: statusData.venue.address,
          });

          setIsApproved(statusData.isApproved);
          
          // Load venue images if available
          if (statusData.venue.images && Array.isArray(statusData.venue.images)) {
            setVenueImages(statusData.venue.images);
          }
          
          // Load bookings if approved
          if (statusData.isApproved) {
            loadBookings(1, "", "all");
            loadEarnings();
          }
        }

        if (!statusData.isApproved) {
          // Venue not approved - show message but allow viewing
          if (statusData.venue.status === "pending") {
            toast("Your venue registration is pending approval. You can view but not create events yet.", {
              icon: "⏳",
            });
          } else if (statusData.venue.status === "rejected") {
            toast.error("Your venue registration was rejected. Please contact support.");
          }
          // Set loading to false
          if (isMounted) {
            setVenueLoading(false);
          }
        } else {
          // Load events if approved
          loadEvents();
          // Set loading to false after events start loading
          if (isMounted) {
            setVenueLoading(false);
          }
        }
      } catch (error: unknown) {
        console.error("Error checking venue status:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to check venue status";
        
        // Don't show toast for "no venue" scenarios - just show the registration card
        if (!errorMessage.includes("No venue") && !errorMessage.includes("hasVenue")) {
          toast.error(errorMessage);
        }
        
        // Set venue to null on error so user sees registration message
        if (isMounted) {
          setVenue(null);
          setIsApproved(false);
          setVenueLoading(false);
        }
      }
    };

    checkVenueStatus();

    // Cleanup function
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]); // Only depend on user.id and authLoading to prevent loops

  // Refresh bookings when bookings tab becomes active
  useEffect(() => {
    if (activeTab === "bookings" && isApproved && venue && !bookingsLoading) {
      loadBookings(bookingsPage, bookingsSearch, bookingsStatusFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Calculate stats from actual events
  const stats = {
    totalBookings: events.reduce((sum, event) => sum + (event.booked || 0), 0),
    todayBookings: events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).reduce((sum, event) => sum + (event.booked || 0), 0),
    revenue: events.reduce((sum, event) => sum + ((event.booked || 0) * event.price), 0),
    upcomingEvents: events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return eventDate >= today && eventDate <= nextWeek;
    }).length,
  };

  const upcomingEvents = events;
  
  // Get recent bookings (first 5) from real data
  const recentBookings = bookings.slice(0, 5);

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      time: "",
      genre: "",
      capacity: "",
      price: "",
      description: "",
      dressCode: "",
    });
    setErrors({});
    setEventImages([]);
    setImagePreviews([]);
    setSelectedEvent(null);
  };

  // Handle view event
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    // Pre-fill form with event data
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      genre: event.genre,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      description: event.description || "",
      dressCode: event.dressCode || event.dress_code || "",
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle update event
  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setIsUploadingImages(true);
      let imageUrls: string[] = [];

      // Upload new images if any
      if (eventImages.length > 0) {
        const formDataToUpload = new FormData();
        eventImages.forEach((file) => {
          formDataToUpload.append("images", file);
        });

        const uploadResponse = await fetch("/api/events/upload-images", {
          method: "POST",
          body: formDataToUpload,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload images");
        }

        imageUrls = uploadData.images || [];
      } else {
        // Keep existing images if no new ones uploaded
        // You might want to fetch current event images from the database
        imageUrls = [];
      }

      setIsUploadingImages(false);

      // Convert time to 24-hour format for API
      const time24 = formData.time.includes(":") 
        ? formData.time 
        : `${formData.time}:00`;

      const response = await fetch("/api/events/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          name: formData.name.trim(),
          date: formData.date,
          time: time24,
          genre: formData.genre,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          description: formData.description.trim() || null,
          dressCode: formData.dressCode.trim() || null,
          images: imageUrls.length > 0 ? imageUrls : [], // Use new images or keep existing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      toast.success("Event updated successfully!");
      
      // Reload events
      await loadEvents();
      
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      setIsUploadingImages(false);
      console.error("Event update error:", error);
      toast.error(error.message || "Failed to update event. Please try again.");
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 3 images
    if (eventImages.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      validFiles.push(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previews.push(e.target.result as string);
          if (previews.length === validFiles.length) {
            setImagePreviews([...imagePreviews, ...previews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setEventImages([...eventImages, ...validFiles]);
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setEventImages(eventImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Handle venue image selection
  const handleVenueImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 10 images
    if (venueImages.length + venueImageFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed for venue");
      return;
    }

    // Validate file types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      validFiles.push(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previews.push(e.target.result as string);
          if (previews.length === validFiles.length) {
            setVenueImagePreviews([...venueImagePreviews, ...previews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setVenueImageFiles([...venueImageFiles, ...validFiles]);
  };

  // Remove venue image
  const handleRemoveVenueImage = (index: number, isPreview: boolean) => {
    if (isPreview) {
      setVenueImageFiles(venueImageFiles.filter((_, i) => i !== index));
      setVenueImagePreviews(venueImagePreviews.filter((_, i) => i !== index));
    } else {
      // Remove uploaded image
      const newImages = venueImages.filter((_, i) => i !== index);
      setVenueImages(newImages);
      // TODO: Also delete from server/storage
    }
  };

  // Upload venue images
  const handleUploadVenueImages = async () => {
    if (venueImageFiles.length === 0) {
      toast.error("Please select images to upload");
      return;
    }

    if (!venue) {
      toast.error("Venue information not available");
      return;
    }

    setIsUploadingVenueImages(true);
    try {
      const formData = new FormData();
      venueImageFiles.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("venue_id", venue.id);

      const response = await fetch("/api/venues/upload-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload images");
      }

      toast.success(`Successfully uploaded ${data.images?.length || 0} image(s)`);
      
      // Update venue images
      if (data.images) {
        const newImageUrls = data.images.map((img: any) => img.url);
        setVenueImages([...venueImages, ...newImageUrls]);
      }
      
      // Clear file selections
      setVenueImageFiles([]);
      setVenueImagePreviews([]);
    } catch (error: any) {
      console.error("Venue image upload error:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsUploadingVenueImages(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.genre) {
      newErrors.genre = "Music genre is required";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else if (parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseInt(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCreateEvent = async () => {
    // Check if venue is approved
    if (!isApproved) {
      toast.error("Your venue must be approved before creating events");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setIsUploadingImages(true);
      let imageUrls: string[] = [];

      // Upload images if any
      if (eventImages.length > 0) {
        const formDataToUpload = new FormData();
        eventImages.forEach((file) => {
          formDataToUpload.append("images", file);
        });

        const uploadResponse = await fetch("/api/events/upload-images", {
          method: "POST",
          body: formDataToUpload,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload images");
        }

        imageUrls = uploadData.images || [];
      }

      setIsUploadingImages(false);

      // Convert time to 24-hour format for API
      const time24 = formData.time.includes(":") 
        ? formData.time 
        : `${formData.time}:00`;

      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          date: formData.date,
          time: time24,
          genre: formData.genre,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          description: formData.description.trim() || null,
          dressCode: formData.dressCode.trim() || null,
          images: imageUrls,
          rules: [],
          amenities: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      toast.success("Event created successfully! It will appear in the discover page.");
      
      // Reload events
      await loadEvents();
      
      // Reload bookings and earnings in case there are any
      if (isApproved) {
        loadBookings(bookingsPage, bookingsSearch, bookingsStatusFilter);
        loadEarnings();
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      setIsUploadingImages(false);
      console.error("Event creation error:", error);
      toast.error(error.message || "Failed to create event. Please try again.");
    }
  };

  // Show loading state
  if (venueLoading || authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-muted-foreground">Loading venue dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if no venue registered
  if (!venue) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Venue Registered</h2>
              <p className="text-muted-foreground mb-6">
                You need to register your venue before accessing the dashboard.
                Once registered and approved, you&apos;ll be able to create and manage events.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Go Back
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                >
                  <Link href="/venue/signup">
                    Register Your Venue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending/rejected message card if venue exists but not approved
  const showPendingMessage = venue && !isApproved;

  // If venue exists but not approved, show a clear message instead of full dashboard
  if (showPendingMessage) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Sidebar
          items={sidebarItems}
          title="Venue Dashboard"
          mobileTitle="Dashboard"
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
        <div className="lg:pl-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <Card className={`border-2 ${
              venue.status === "pending" 
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" 
                : "border-red-500 bg-red-50 dark:bg-red-950/20"
            }`}>
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                  venue.status === "pending"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"
                    : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                } border-2`}>
                  {venue.status === "pending" ? (
                    <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <CardTitle className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  venue.status === "pending"
                    ? "text-yellow-900 dark:text-yellow-100"
                    : "text-red-900 dark:text-red-100"
                }`}>
                  {venue.status === "pending" 
                    ? "Registration Under Review" 
                    : "Registration Rejected"}
                </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                {venue.status === "pending"
                  ? "Your venue registration is pending approval. You can explore your dashboard, and you'll be able to create and publish events once our team approves your venue."
                  : "Your venue registration was not approved."}
              </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {venue.status === "pending" && (
                  <>
                    <div className="rounded-lg bg-background/50 p-4 border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Venue Name
                      </p>
                      <p className="text-lg font-semibold">{venue.name}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                        <strong>What&apos;s happening?</strong> Our team is reviewing your venue details to make sure everything looks good. 
                        This usually takes <strong>24–48 hours</strong>. Once approved, you&apos;ll be able to create events, accept bookings, and see your earnings here.
                      </p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-900 dark:text-yellow-200">
                        <strong>Note:</strong> You can already explore your dashboard and get familiar with the tools, but 
                        <span className="font-semibold"> creating or publishing events is locked until your registration is approved.</span>
                      </p>
                    </div>
                  </>
                )}
                {venue.status === "rejected" && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed">
                      Unfortunately, your venue registration was rejected. Please contact support for more information 
                      or submit a new registration from the registration page.
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/venue/signup")}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {venue.status === "rejected" ? "Submit New Registration" : "View Registration Status"}
                  </Button>
                  {venue.status === "pending" && (
                    <Button
                      onClick={() => {
                        // Allow viewing dashboard even if pending, but show limited view
                        setActiveTab("overview");
                      }}
                      className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      View Dashboard Preview
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <Sidebar 
        items={sidebarItems} 
        title="Venue Dashboard" 
        mobileTitle="Dashboard"
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <main className="flex-1 w-full lg:pl-64">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-6 pt-14 lg:pt-6 pb-20 lg:pb-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Venue Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your events, bookings, and earnings
            </p>
          </div>

          {/* Venue Approved Success Banner */}
          {venue && isApproved && (
            <Card className="mb-4 sm:mb-6 border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Venue Approved
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your venue "{venue.name}" is approved! You can now create and manage events.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="mb-4 sm:mb-6 lg:mb-8 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">Total Bookings</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalBookings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">Today&apos;s Bookings</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.todayBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">Active today</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">Total Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+8%</span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/20 dark:to-pink-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold">Upcoming Events</CardTitle>
                <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
              <TabsList className="grid w-full min-w-[500px] md:min-w-0 grid-cols-5 h-auto p-1 bg-muted/50">
                <TabsTrigger 
                  value="overview" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Bookings
                </TabsTrigger>
                <TabsTrigger 
                  value="checkin" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Check-in
                </TabsTrigger>
                <TabsTrigger 
                  value="earnings" 
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Earnings
                </TabsTrigger>
              </TabsList>
            </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Upcoming Events</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your next scheduled events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">No upcoming events</p>
                    <p className="text-xs text-muted-foreground">Create an event to see it here</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 sm:pb-4 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{event.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {event.date} at {event.time}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {event.bookings}/{event.capacity}
                          </span>
                          <span className="font-medium">₹{event.price}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                        {event.bookings} bookings
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Recent Bookings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest customer bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {bookingsLoading && recentBookings.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No bookings yet</p>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b pb-3 sm:pb-4 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base">{booking.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.phone}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.event}</p>
                        {booking.date && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {booking.time ? `at ${booking.time}` : ''}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}
                        className="w-fit text-xs sm:text-sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Venue Images Section */}
          {isApproved && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Venue Photos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Upload photos of your venue to attract more customers (Max 10 images)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {venueImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Current Photos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {venueImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={img}
                            alt={`Venue photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveVenueImage(idx, false)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview New Images */}
                {venueImagePreviews.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">New Images to Upload</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {venueImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveVenueImage(idx, true)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Section */}
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleVenueImageSelect}
                      className="hidden"
                      disabled={isUploadingVenueImages || venueImages.length + venueImageFiles.length >= 10}
                    />
                    <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      venueImages.length + venueImageFiles.length >= 10
                        ? "border-muted-foreground/25 cursor-not-allowed opacity-50"
                        : "border-muted-foreground/25 hover:border-primary"
                    }`}>
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center px-4">
                        {venueImages.length + venueImageFiles.length >= 10
                          ? "Maximum 10 images reached"
                          : "Click to upload venue photos"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP (Max 5MB each)
                      </p>
                    </div>
                  </label>
                  
                  {venueImageFiles.length > 0 && (
                    <Button
                      onClick={handleUploadVenueImages}
                      disabled={isUploadingVenueImages}
                      className="w-full sm:w-auto"
                    >
                      {isUploadingVenueImages ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Upload {venueImageFiles.length} Image{venueImageFiles.length !== 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Events</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full sm:w-auto h-10 sm:h-11"
                  disabled={!isApproved}
                  title={!isApproved ? "Your venue must be approved to create events" : ""}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 p-4 sm:p-6 rounded-lg sm:rounded-lg">
                <DialogHeader className="pb-4 sm:pb-6 border-b">
                  <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Create New Event
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base mt-2 text-muted-foreground">
                    Add a new event to your venue calendar
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateEvent();
                  }}
                  className="space-y-5 sm:space-y-6 mt-4 sm:mt-6"
                >
                  <div className="space-y-2.5">
                    <Label htmlFor="eventName" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      Event Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="eventName"
                      placeholder="e.g., Friday Night Party"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className={`h-12 sm:h-12 text-base sm:text-base ${errors.name ? "border-destructive border-2" : "border-2"}`}
                    />
                    {errors.name && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="eventDate" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: "" });
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.date ? "border-destructive" : ""}`}
                      />
                      {errors.date && (
                        <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                          <X className="h-3 w-3" />
                          {errors.date}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="eventTime" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={formData.time}
                        onChange={(e) => {
                          setFormData({ ...formData, time: e.target.value });
                          if (errors.time) setErrors({ ...errors, time: "" });
                        }}
                        className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.time ? "border-destructive" : ""}`}
                      />
                      {errors.time && (
                        <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                          <X className="h-3 w-3" />
                          {errors.time}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="eventGenre" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <Music className="h-4 w-4" />
                      Music Genre <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.genre}
                      onValueChange={(value) => {
                        setFormData({ ...formData, genre: value });
                        if (errors.genre) setErrors({ ...errors, genre: "" });
                      }}
                    >
                      <SelectTrigger className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.genre ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                        <SelectItem value="Bollywood">Bollywood</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Techno">Techno</SelectItem>
                        <SelectItem value="Retro">Retro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.genre && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.genre}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="capacity" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Capacity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Max capacity"
                        value={formData.capacity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, capacity: val });
                          if (errors.capacity) setErrors({ ...errors, capacity: "" });
                        }}
                        min="1"
                        className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.capacity ? "border-destructive" : ""}`}
                      />
                      {errors.capacity && (
                        <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                          <X className="h-3 w-3" />
                          {errors.capacity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="price" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Entry Price (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="500"
                        value={formData.price}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, price: val });
                          if (errors.price) setErrors({ ...errors, price: "" });
                        }}
                        min="0"
                        className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.price ? "border-destructive" : ""}`}
                      />
                      {errors.price && (
                        <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                          <X className="h-3 w-3" />
                          {errors.price}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="description" className="text-sm sm:text-base font-semibold">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Event description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="h-12 sm:h-12 text-base sm:text-base border-2"
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="dressCode" className="text-sm sm:text-base font-semibold">
                      Dress Code
                    </Label>
                    <Input
                      id="dressCode"
                      placeholder="e.g., Smart Casual"
                      value={formData.dressCode}
                      onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                      className="h-12 sm:h-12 text-base sm:text-base border-2"
                    />
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2.5">
                    <Label htmlFor="eventImages" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Event Images (Max 3)
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          id="eventImages"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleImageSelect}
                          disabled={eventImages.length >= 3 || isUploadingImages}
                          className="h-12 sm:h-12 text-base sm:text-base border-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {eventImages.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEventImages([]);
                              setImagePreviews([]);
                            }}
                            className="h-12 sm:h-12 text-xs sm:text-sm"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      {eventImages.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-muted"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {eventImages[index]?.name || `Image ${index + 1}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Upload 2-3 images to showcase your event. Supported formats: JPEG, PNG, WebP (Max 5MB each)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                      className="flex-1 h-12 sm:h-12 text-base sm:text-base font-semibold border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploadingImages}
                      className="flex-1 h-12 sm:h-12 text-base sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">All Events</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage your upcoming and past events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base font-medium text-muted-foreground mb-2">No events yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Create your first event to get started</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border-2 p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                          <Music className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{event.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {event.date} at {event.time}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span>Capacity: {event.bookings}/{event.capacity}</span>
                            <span className="font-medium">Price: ₹{event.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          onClick={() => handleViewEvent(event)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Event Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Event Details
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base mt-2 text-muted-foreground">
                  View complete event information
                </DialogDescription>
              </DialogHeader>
              {selectedEvent && (
                <div className="space-y-4 sm:space-y-6 mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Event Name</Label>
                      <p className="text-sm sm:text-base font-semibold mt-1">{selectedEvent.name}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Date</Label>
                        <p className="text-sm sm:text-base mt-1">{selectedEvent.date}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Time</Label>
                        <p className="text-sm sm:text-base mt-1">{selectedEvent.time}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Genre</Label>
                        <p className="text-sm sm:text-base mt-1">{selectedEvent.genre}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Price</Label>
                        <p className="text-sm sm:text-base mt-1">₹{selectedEvent.price}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Capacity</Label>
                        <p className="text-sm sm:text-base mt-1">{selectedEvent.bookings || 0}/{selectedEvent.capacity}</p>
                      </div>
                      {selectedEvent.dressCode && (
                        <div>
                          <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Dress Code</Label>
                          <p className="text-sm sm:text-base mt-1">{selectedEvent.dressCode}</p>
                        </div>
                      )}
                    </div>
                    {selectedEvent.description && (
                      <div>
                        <Label className="text-xs sm:text-sm font-semibold text-muted-foreground">Description</Label>
                        <p className="text-sm sm:text-base mt-1">{selectedEvent.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewDialogOpen(false)}
                      className="h-10 sm:h-11"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Event Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 p-4 sm:p-6 rounded-lg sm:rounded-lg">
              <DialogHeader className="pb-4 sm:pb-6 border-b">
                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Edit Event
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base mt-2 text-muted-foreground">
                  Update event details
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateEvent();
                }}
                className="space-y-5 sm:space-y-6 mt-4 sm:mt-6"
              >
                <div className="space-y-2.5">
                  <Label htmlFor="editEventName" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                    Event Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editEventName"
                    placeholder="e.g., Friday Night Party"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`h-12 sm:h-12 text-base sm:text-base ${errors.name ? "border-destructive border-2" : "border-2"}`}
                  />
                  {errors.name && (
                    <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                      <X className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="editEventDate" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editEventDate"
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        if (errors.date) setErrors({ ...errors, date: "" });
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.date ? "border-destructive" : ""}`}
                    />
                    {errors.date && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.date}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="editEventTime" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editEventTime"
                      type="time"
                      value={formData.time}
                      onChange={(e) => {
                        setFormData({ ...formData, time: e.target.value });
                        if (errors.time) setErrors({ ...errors, time: "" });
                      }}
                      className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.time ? "border-destructive" : ""}`}
                    />
                    {errors.time && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="editEventGenre" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    Music Genre <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => {
                      setFormData({ ...formData, genre: value });
                      if (errors.genre) setErrors({ ...errors, genre: "" });
                    }}
                  >
                    <SelectTrigger className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.genre ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronic">Electronic</SelectItem>
                      <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                      <SelectItem value="Bollywood">Bollywood</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Techno">Techno</SelectItem>
                      <SelectItem value="Retro">Retro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.genre && (
                    <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                      <X className="h-3 w-3" />
                      {errors.genre}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="editCapacity" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Capacity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editCapacity"
                      type="number"
                      placeholder="Max capacity"
                      value={formData.capacity}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, capacity: val });
                        if (errors.capacity) setErrors({ ...errors, capacity: "" });
                      }}
                      min="1"
                      className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.capacity ? "border-destructive" : ""}`}
                    />
                    {errors.capacity && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.capacity}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="editPrice" className="text-sm sm:text-base font-semibold flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Entry Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="editPrice"
                      type="number"
                      placeholder="500"
                      value={formData.price}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, price: val });
                        if (errors.price) setErrors({ ...errors, price: "" });
                      }}
                      min="0"
                      className={`h-12 sm:h-12 text-base sm:text-base border-2 ${errors.price ? "border-destructive" : ""}`}
                    />
                    {errors.price && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 mt-1">
                        <X className="h-3 w-3" />
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="editDescription" className="text-sm sm:text-base font-semibold">
                    Description
                  </Label>
                  <Input
                    id="editDescription"
                    placeholder="Event description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-12 sm:h-12 text-base sm:text-base border-2"
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="editDressCode" className="text-sm sm:text-base font-semibold">
                    Dress Code
                  </Label>
                  <Input
                    id="editDressCode"
                    placeholder="e.g., Smart Casual"
                    value={formData.dressCode}
                    onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                    className="h-12 sm:h-12 text-base sm:text-base border-2"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 h-12 sm:h-12 text-base sm:text-base font-semibold border-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploadingImages}
                    className="flex-1 h-12 sm:h-12 text-base sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Update Event
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">All Bookings</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={bookingsStatusFilter} onValueChange={(value) => {
                setBookingsStatusFilter(value);
                setBookingsPage(1);
                loadBookings(1, bookingsSearch, value);
              }}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bookings..." 
                  className="pl-8 w-full sm:w-[250px] lg:w-[300px]"
                  value={bookingsSearch}
                  onChange={(e) => {
                    setBookingsSearch(e.target.value);
                    setBookingsPage(1);
                    loadBookings(1, e.target.value, bookingsStatusFilter);
                  }}
                />
              </div>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Booking List</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {bookings.length > 0 ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found` : "No bookings yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading && bookings.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border-2 p-3 sm:p-4 hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base">{booking.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.phone}</p>
                              <p className="text-xs sm:text-sm font-medium mt-1 truncate">{booking.event}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {booking.time || 'TBD'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  ₹{booking.totalPrice}
                                </Badge>
                                {booking.qrCode && (
                                  <Badge variant="outline" className="text-xs">
                                    <QrCode className="h-3 w-3 mr-1" />
                                    {booking.id.substring(0, 8)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 sm:flex-shrink-0">
                          <Badge
                            variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}
                            className="text-xs w-fit"
                          >
                            {booking.status}
                          </Badge>
                          <Badge
                            variant={booking.paymentStatus === "completed" ? "default" : "outline"}
                            className="text-xs w-fit"
                          >
                            {booking.paymentStatus}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs sm:text-sm flex-1 sm:flex-initial"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsBookingViewDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {bookingsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {bookingsPage} of {bookingsTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPage = bookingsPage - 1;
                            setBookingsPage(newPage);
                            loadBookings(newPage, bookingsSearch, bookingsStatusFilter);
                          }}
                          disabled={bookingsPage === 1 || bookingsLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPage = bookingsPage + 1;
                            setBookingsPage(newPage);
                            loadBookings(newPage, bookingsSearch, bookingsStatusFilter);
                          }}
                          disabled={bookingsPage >= bookingsTotalPages || bookingsLoading}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Check-in Tab */}
        <TabsContent value="checkin" className="space-y-4 mt-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <QrCode className="h-5 w-5" />
                QR Code Check-in
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Scan QR codes to verify and check-in guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input placeholder="Enter or scan QR code..." className="flex-1 h-11 sm:h-10" />
                <Button className="w-full sm:w-auto">Scan QR</Button>
              </div>
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <QrCode className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Use your device camera to scan QR codes from customer passes
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Recent Check-ins</h3>
                <div className="space-y-2">
                  {bookings
                    .filter((b) => b.status === "confirmed")
                    .slice(0, 5)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.event} - {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-muted-foreground">Checked in</span>
                        </div>
                      </div>
                    ))}
                  {bookings.filter((b) => b.status === "confirmed").length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No confirmed bookings yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4 mt-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Earnings & Payouts</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track your revenue and manage payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {earningsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="rounded-lg border-2 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1">₹{earnings.totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border-2 p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
                      <p className="text-xs sm:text-sm text-muted-foreground">Pending Payout</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1">₹{earnings.pendingPayout.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border-2 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
                      <p className="text-xs sm:text-sm text-muted-foreground">Last Payout</p>
                      {earnings.lastPayout ? (
                        <>
                          <p className="text-xl sm:text-2xl font-bold mt-1">₹{earnings.lastPayout.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(earnings.lastPayout.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">No payouts yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Payout History</h3>
                    {earnings.payoutHistory.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">No payout history</p>
                        <p className="text-xs text-muted-foreground">Your payout requests will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {earnings.payoutHistory.map((payout) => (
                          <div
                            key={payout.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-lg border-2 p-3 sm:p-4 hover:shadow-md transition-shadow"
                          >
                            <div>
                              <p className="font-semibold text-base sm:text-lg">₹{payout.amount.toLocaleString()}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(payout.date).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                payout.status === "completed" 
                                  ? "default" 
                                  : payout.status === "pending" 
                                  ? "secondary" 
                                  : payout.status === "processing"
                                  ? "outline"
                                  : "destructive"
                              } 
                              className="w-fit text-xs sm:text-sm"
                            >
                              {payout.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleRequestPayout}
                    disabled={earnings.pendingPayout <= 0 || earningsLoading}
                    className="w-full h-11 sm:h-10 text-sm sm:text-base disabled:opacity-50"
                  >
                    {earnings.pendingPayout > 0 
                      ? `Request Payout (₹${earnings.pendingPayout.toLocaleString()})`
                      : "No Pending Payout"
                    }
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Booking Details Dialog */}
      <Dialog open={isBookingViewDialogOpen} onOpenChange={setIsBookingViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Booking Details
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-2 text-muted-foreground">
              Verify booking and check entry pass
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-semibold text-sm sm:text-base">{selectedBooking.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-sm sm:text-base">{selectedBooking.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm sm:text-base">{selectedBooking.email || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Name</p>
                      <p className="font-semibold text-sm sm:text-base">{selectedBooking.event}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="font-medium text-sm sm:text-base">
                        {new Date(selectedBooking.date).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} at {selectedBooking.time || 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Number of People</p>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedBooking.numberOfPeople} {selectedBooking.numberOfPeople === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Booking ID</p>
                      <p className="font-mono font-semibold text-sm sm:text-base">{selectedBooking.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg sm:text-xl text-purple-600">₹{selectedBooking.totalPrice}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Status</p>
                      <Badge 
                        variant={selectedBooking.paymentStatus === "completed" ? "default" : "outline"}
                        className="mt-1"
                      >
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Status</p>
                      <Badge 
                        variant={selectedBooking.status === "confirmed" ? "default" : selectedBooking.status === "cancelled" ? "destructive" : "secondary"}
                        className="mt-1"
                      >
                        {selectedBooking.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Date</p>
                      <p className="font-medium text-sm sm:text-base">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code for Verification */}
              {selectedBooking.qrCode && (
                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-purple-600" />
                      Entry Pass QR Code
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Scan this QR code to verify entry at the venue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                      <img
                        src={selectedBooking.qrCode}
                        alt="Booking QR Code"
                        className="h-48 w-48 sm:h-64 sm:w-64 mx-auto"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
                      Booking ID: <span className="font-mono font-semibold">{selectedBooking.id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Show this QR code to the customer for verification
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsBookingViewDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedBooking.qrCode && (
                  <Button
                    onClick={() => {
                      // Print or download QR code
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Booking Pass - ${selectedBooking.id}</title>
                              <style>
                                body { 
                                  font-family: Arial, sans-serif; 
                                  padding: 20px; 
                                  text-align: center;
                                }
                                .qr-code { 
                                  margin: 20px auto; 
                                  border: 2px solid #000;
                                  padding: 20px;
                                  display: inline-block;
                                }
                                .details {
                                  margin-top: 20px;
                                  text-align: left;
                                  max-width: 400px;
                                  margin-left: auto;
                                  margin-right: auto;
                                }
                              </style>
                            </head>
                            <body>
                              <h1>ClubRadar Entry Pass</h1>
                              <div class="qr-code">
                                <img src="${selectedBooking.qrCode}" alt="QR Code" style="width: 300px; height: 300px;" />
                              </div>
                              <div class="details">
                                <p><strong>Booking ID:</strong> ${selectedBooking.id}</p>
                                <p><strong>Event:</strong> ${selectedBooking.event}</p>
                                <p><strong>Customer:</strong> ${selectedBooking.name}</p>
                                <p><strong>Date:</strong> ${new Date(selectedBooking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p><strong>Time:</strong> ${selectedBooking.time || 'TBD'}</p>
                                <p><strong>People:</strong> ${selectedBooking.numberOfPeople}</p>
                                <p><strong>Amount:</strong> ₹${selectedBooking.totalPrice}</p>
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Print Entry Pass
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

