"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  LayoutDashboard,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  bookingPaused: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  rejectedAt: string | null;
  rejectionCount: number;
  rejectionReason: string | null;
  createdAt: string;
}

interface RejectionHistoryItem {
  id: string;
  rejectionNumber: number;
  rejectionReason: string;
  rejectedBy: string | null;
  rejectedAt: string;
  venueSnapshot: {
    name: string;
    description: string | null;
    address: string;
    city: string;
    pincode: string | null;
    phone: string | null;
    email: string | null;
    owner_name: string | null;
    alternate_phone: string | null;
    gst_number: string | null;
    license_number: string | null;
    pan_number: string | null;
    bank_account: string | null;
    ifsc_code: string | null;
    documents: string[];
    images: string[];
    owner: {
      id: string;
      name: string;
      email: string;
      phone: string;
    } | null;
  };
}

interface VenueDetail {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  status: "pending" | "approved" | "rejected";
  bookingPaused: boolean;
  images: string[];
  documents: string[];
  ownerName: string | null;
  alternatePhone: string | null;
  capacity: number | null;
  gstNumber: string | null;
  licenseNumber: string | null;
  panNumber: string | null;
  bankAccount: string | null;
  ifscCode: string | null;
  rejectedAt: string | null;
  rejectionCount: number;
  rejectionReason: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  rejectionHistory?: RejectionHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  event: {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: {
      id: string;
      name: string;
      city: string;
    } | null;
  } | null;
  numberOfPeople: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface Stats {
  venues: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    today: number;
  };
  events: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  revenue: {
    total: number;
    formatted: string;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]); // For Venues tab (filtered)
  const [overviewVenues, setOverviewVenues] = useState<Venue[]>([]); // For Overview tab (always all venues)
  const [overviewVenuesLoading, setOverviewVenuesLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Filters
  const [venueSearch, setVenueSearch] = useState("");
  const [venueStatusFilter, setVenueStatusFilter] = useState("all");
  const [venuePage, setVenuePage] = useState(1);
  const [venueTotalPages, setVenueTotalPages] = useState(1);
  
  // Venue detail modal
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<VenueDetail | null>(null);
  const [isVenueDetailOpen, setIsVenueDetailOpen] = useState(false);
  const [venueDetailLoading, setVenueDetailLoading] = useState(false);

  const sidebarItems = [
    { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, tabValue: "overview" },
    { title: "Venues", href: "/admin/dashboard", icon: Building2, tabValue: "venues" },
    { title: "Bookings", href: "/admin/dashboard", icon: Users, tabValue: "bookings" },
    { title: "Payments", href: "/admin/dashboard", icon: DollarSign, tabValue: "payments" },
  ];

  // Load stats
  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load stats");
      }

      setStats(data.stats);
    } catch (error: any) {
      console.error("Error loading stats:", error);
      toast.error(error.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  // Load venues (for Venues tab with filters)
  const loadVenues = async (page: number = 1, search: string = "", status: string = "all") => {
    setVenuesLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/admin/venues?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load venues");
      }

      setVenues(data.venues || []);
      setVenueTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Error loading venues:", error);
      toast.error(error.message || "Failed to load venues");
    } finally {
      setVenuesLoading(false);
    }
  };

  // Load overview venues (always loads all venues for Overview tab)
  const loadOverviewVenues = async () => {
    setOverviewVenuesLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100", // Load more to get pending and rejected venues
        status: "all",
      });

      const response = await fetch(`/api/admin/venues?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load overview venues");
      }

      setOverviewVenues(data.venues || []);
    } catch (error: any) {
      console.error("Error loading overview venues:", error);
      // Don't show toast for overview venues, just log error
    } finally {
      setOverviewVenuesLoading(false);
    }
  };

  // Load bookings
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await fetch("/api/admin/bookings?limit=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast.error(error.message || "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  // Approve venue
  const handleApproveVenue = async (venueId: string) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve venue");
      }

      toast.success("Venue approved successfully! Owner can now access the dashboard.");
      loadVenues(venuePage, venueSearch, venueStatusFilter);
      loadOverviewVenues(); // Refresh overview venues too
      loadStats();
      setIsVenueDetailOpen(false);
      setSelectedVenueDetail(null);
    } catch (error: any) {
      console.error("Error approving venue:", error);
      toast.error(error.message || "Failed to approve venue");
    }
  };

  // Load venue details
  const loadVenueDetails = async (venueId: string) => {
    setVenueDetailLoading(true);
    setIsVenueDetailOpen(true);
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load venue details");
      }

      setSelectedVenueDetail(data.venue);
    } catch (error: any) {
      console.error("Error loading venue details:", error);
      toast.error(error.message || "Failed to load venue details");
      setIsVenueDetailOpen(false);
    } finally {
      setVenueDetailLoading(false);
    }
  };

  // Reject venue
  const handleRejectVenue = async (venueId: string, reason?: string) => {
    const rejectionReason = reason || prompt("Enter rejection reason (optional):") || "Registration rejected by admin. Please re-register with valid documents.";
    
    if (!rejectionReason) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/venues/${venueId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject venue");
      }

      toast.success("Venue rejected successfully. Owner will be notified to re-register.");
      loadVenues(venuePage, venueSearch, venueStatusFilter);
      loadOverviewVenues(); // Refresh overview venues too
      loadStats();
      setIsVenueDetailOpen(false);
      setSelectedVenueDetail(null);
    } catch (error: any) {
      console.error("Error rejecting venue:", error);
      toast.error(error.message || "Failed to reject venue");
    }
  };

  // Load data on mount and tab change
  // Load initial data on mount
  useEffect(() => {
    loadStats();
    // Load overview venues (all venues for Overview tab)
    loadOverviewVenues();
    loadBookings();
  }, []);

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === "venues") {
      // Load filtered venues for Venues tab
      loadVenues(1, venueSearch, venueStatusFilter);
    } else if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "overview") {
      // Refresh overview venues when switching to Overview tab
      loadOverviewVenues();
    }
  }, [activeTab]);

  // Reload venues when filters change (only if on venues tab)
  useEffect(() => {
    if (activeTab === "venues") {
      loadVenues(venuePage, venueSearch, venueStatusFilter);
    }
  }, [venuePage, venueSearch, venueStatusFilter, activeTab]);

  // Get pending and rejected venues for overview (from overviewVenues, not filtered venues)
  const pendingVenues = overviewVenues.filter((v) => v.status === "pending").slice(0, 5);
  // Show venues that have been rejected (have rejectedAt) regardless of current status
  // This includes venues that were rejected and then re-registered (status = "pending" but rejectedAt exists)
  const rejectedVenues = overviewVenues
    .filter((v) => v.rejectedAt !== null && v.rejectedAt !== undefined)
    .sort((a, b) => {
      // Sort by rejectedAt date (most recent first)
      if (!a.rejectedAt || !b.rejectedAt) return 0;
      return new Date(b.rejectedAt).getTime() - new Date(a.rejectedAt).getTime();
    })
    .slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <Sidebar
        items={sidebarItems}
        title="Admin Dashboard"
        mobileTitle="Admin"
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      <main className="flex-1 w-full lg:pl-64">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-6 pt-14 lg:pt-6 pb-20 lg:pb-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Manage venues, events, and platform operations
            </p>
          </div>

          {/* Stats Overview */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="mb-4 sm:mb-6 lg:mb-8 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.venues.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.venues.approved} approved
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.venues.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">Require review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected Venues</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.venues.rejected || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Rejected registrations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.revenue.formatted}</div>
                  <p className="text-xs text-muted-foreground">Platform revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.bookings.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.bookings.completed} completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.events.active}</div>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
              <TabsList className="grid w-full min-w-[400px] md:min-w-0 grid-cols-4 h-auto p-1 bg-muted/50">
                <TabsTrigger
                  value="overview"
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="venues"
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Venues
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Bookings
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Payments
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Venue Approvals</CardTitle>
                    <CardDescription>Venues awaiting review</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overviewVenuesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pendingVenues.length > 0 ? (
                      <>
                        {pendingVenues.map((venue) => (
                          <div
                            key={venue.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0"
                          >
                            <div>
                              <h3 className="font-semibold">{venue.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {venue.city} • {venue.address}
                              </p>
                              {venue.owner && (
                                <p className="text-sm text-muted-foreground">
                                  {venue.owner.name} • {venue.owner.email}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveVenue(venue.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setVenueStatusFilter("pending");
                            setActiveTab("venues");
                          }}
                        >
                          View All Pending Approvals
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending approvals
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rejected Venues</CardTitle>
                    <CardDescription>Recently rejected registrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overviewVenuesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : rejectedVenues.length > 0 ? (
                      <>
                        {rejectedVenues.map((venue) => (
                          <div
                            key={venue.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{venue.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {venue.city} • {venue.address}
                              </p>
                              {venue.owner && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {venue.owner.name} • {venue.owner.email}
                                </p>
                              )}
                              <div className="mt-1 space-y-0.5">
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(venue.createdAt).toLocaleDateString()}
                                </p>
                                {venue.rejectedAt && (
                                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    Rejected {venue.rejectionCount ? `${venue.rejectionCount} time${venue.rejectionCount > 1 ? 's' : ''}` : 'once'} on {new Date(venue.rejectedAt).toLocaleDateString()}
                                    {venue.status === "pending" && " (Re-registered)"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadVenueDetails(venue.id)}
                              className="ml-2 shrink-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setVenueStatusFilter("rejected");
                            setActiveTab("venues");
                          }}
                        >
                          View All Rejected Venues
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No rejected venues
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest platform bookings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentBookings.length > 0 ? (
                      <>
                        {recentBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0"
                          >
                            <div>
                              <h3 className="font-semibold">
                                {booking.event?.name || "Unknown Event"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.user?.name || "Unknown User"} •{" "}
                                {booking.event?.venue?.name || "Unknown Venue"}
                              </p>
                              <p className="text-sm font-medium">
                                ₹{booking.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                booking.paymentStatus === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.paymentStatus}
                            </Badge>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("bookings")}
                        >
                          View All Bookings
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent bookings
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues" className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Venue Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search venues..."
                      className="pl-8 w-full text-sm sm:text-base h-9 sm:h-10"
                      value={venueSearch}
                      onChange={(e) => setVenueSearch(e.target.value)}
                    />
                  </div>
                  <Select
                    value={venueStatusFilter}
                    onValueChange={setVenueStatusFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-sm sm:text-base">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">All Venues</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Manage venue registrations and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {venuesLoading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : venues.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {venues.map((venue) => (
                        <div
                          key={venue.id}
                          className="flex flex-col gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4"
                        >
                          {/* Header Section */}
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900 shrink-0">
                              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{venue.name}</h3>
                                <Badge
                                  variant={
                                    venue.status === "approved"
                                      ? "default"
                                      : venue.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-[10px] sm:text-xs shrink-0"
                                >
                                  {venue.status}
                                </Badge>
                                {venue.bookingPaused && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                                    Paused
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {venue.city} • {venue.address}
                              </p>
                              {venue.owner && (
                                <div className="mt-1.5 space-y-0.5">
                                  <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
                                    Owner: {venue.owner.name}
                                  </p>
                                  <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
                                    {venue.owner.email}
                                  </p>
                                  <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
                                    {venue.owner.phone}
                                  </p>
                                </div>
                              )}
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                                Created: {new Date(venue.createdAt).toLocaleDateString()}
                              </p>
                              {venue.rejectedAt && (
                                <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1">
                                  Rejected {venue.rejectionCount ? `${venue.rejectionCount} time${venue.rejectionCount > 1 ? 's' : ''}` : ''} on {new Date(venue.rejectedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadVenueDetails(venue.id)}
                              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                            >
                              <Eye className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              View Details
                            </Button>
                            {venue.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectVenue(venue.id)}
                                  className="flex-1 sm:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                                >
                                  <XCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveVenue(venue.id)}
                                  className="flex-1 sm:flex-initial text-xs sm:text-sm h-8 sm:h-9"
                                >
                                  <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {venueTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={venuePage === 1}
                            onClick={() => setVenuePage((p) => Math.max(1, p - 1))}
                            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                          >
                            Previous
                          </Button>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Page {venuePage} of {venueTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={venuePage >= venueTotalPages}
                            onClick={() =>
                              setVenuePage((p) => Math.min(venueTotalPages, p + 1))
                            }
                            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No venues found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Bookings</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Bookings</CardTitle>
                  <CardDescription>
                    View all bookings across all venues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {booking.event?.name || "Unknown Event"}
                              </h3>
                              <Badge
                                variant={
                                  booking.paymentStatus === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Venue: {booking.event?.venue?.name || "Unknown"} •{" "}
                              {booking.event?.venue?.city || ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              User: {booking.user?.name || "Unknown"} •{" "}
                              {booking.user?.email || ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Date: {booking.event?.date || "N/A"} • Time:{" "}
                              {booking.event?.time || "N/A"}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              ₹{booking.totalAmount.toLocaleString()} •{" "}
                              {booking.numberOfPeople} person
                              {booking.numberOfPeople !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Booked: {new Date(booking.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No bookings found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment & Revenue Reports</CardTitle>
                  <CardDescription>
                    Platform revenue and financial overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">
                            Total Platform Revenue
                          </p>
                          <p className="text-2xl font-bold">{stats.revenue.formatted}</p>
                          <p className="text-xs text-muted-foreground">
                            From {stats.bookings.completed} completed bookings
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Total Bookings</p>
                          <p className="text-2xl font-bold">
                            {stats.bookings.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.bookings.pending} pending
                          </p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Today&apos;s Bookings</p>
                          <p className="text-2xl font-bold">{stats.bookings.today}</p>
                          <p className="text-xs text-muted-foreground">New bookings today</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Venue Detail Modal */}
      <Dialog open={isVenueDetailOpen} onOpenChange={setIsVenueDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-3 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-lg sm:text-2xl">Venue Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review all venue information and documents before approval
            </DialogDescription>
          </DialogHeader>

          {venueDetailLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedVenueDetail ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Venue Name</p>
                    <p className="font-medium text-sm sm:text-base break-words">{selectedVenueDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      variant={
                        selectedVenueDetail.status === "approved"
                          ? "default"
                          : selectedVenueDetail.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-[10px] sm:text-xs"
                    >
                      {selectedVenueDetail.status}
                    </Badge>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Description</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {selectedVenueDetail.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-medium text-sm sm:text-base break-words">{selectedVenueDetail.address}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">City</p>
                    <p className="font-medium text-sm sm:text-base">{selectedVenueDetail.city}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pincode</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedVenueDetail.pincode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Alternate Phone</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.alternatePhone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              {selectedVenueDetail.owner && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Owner Name</p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {selectedVenueDetail.owner.name || selectedVenueDetail.ownerName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Owner Email</p>
                      <p className="font-medium text-sm sm:text-base break-all">{selectedVenueDetail.owner.email}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Owner Phone</p>
                      <p className="font-medium text-sm sm:text-base break-all">{selectedVenueDetail.owner.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Details */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  KYC & Business Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">PAN Number</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.panNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">GST Number</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.gstNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">License Number</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.licenseNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Capacity</p>
                    <p className="font-medium text-sm sm:text-base">
                      {selectedVenueDetail.capacity || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Bank Account</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.bankAccount || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">IFSC Code</p>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {selectedVenueDetail.ifscCode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedVenueDetail.images && selectedVenueDetail.images.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Venue Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {selectedVenueDetail.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image
                          src={image}
                          alt={`Venue image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedVenueDetail.documents && selectedVenueDetail.documents.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    Uploaded Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedVenueDetail.documents.map((doc, index) => {
                      const isError = doc.startsWith("ERROR:");
                      return (
                        <div
                          key={index}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 border rounded-lg ${
                            isError ? "bg-red-50 dark:bg-red-950/20 border-red-200" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className={`text-xs sm:text-sm break-words ${isError ? "text-red-600 dark:text-red-400" : ""}`}>
                              {isError ? doc : `Document ${index + 1}`}
                            </span>
                          </div>
                          {!isError && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc, "_blank")}
                              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                            >
                              View
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejection History */}
              {selectedVenueDetail.rejectionHistory && selectedVenueDetail.rejectionHistory.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    Rejection History ({selectedVenueDetail.rejectionHistory.length})
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedVenueDetail.rejectionHistory.map((history, index) => {
                      const snapshot = history.venueSnapshot;
                      const currentData = selectedVenueDetail;
                      const hasChanges = 
                        snapshot.name !== currentData.name ||
                        snapshot.address !== currentData.address ||
                        snapshot.city !== currentData.city ||
                        snapshot.phone !== currentData.phone ||
                        snapshot.email !== currentData.email ||
                        snapshot.owner_name !== currentData.ownerName ||
                        snapshot.gst_number !== currentData.gstNumber ||
                        snapshot.license_number !== currentData.licenseNumber ||
                        snapshot.pan_number !== currentData.panNumber ||
                        JSON.stringify(snapshot.documents || []) !== JSON.stringify(currentData.documents || []);

                      return (
                        <div
                          key={history.id}
                          className="border rounded-lg p-3 sm:p-4 bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                Rejection #{history.rejectionNumber}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(history.rejectedAt).toLocaleString()}
                                {history.rejectedBy && ` • By ${history.rejectedBy}`}
                              </p>
                            </div>
                            {hasChanges && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                Changes Detected
                              </Badge>
                            )}
                          </div>

                          <div className="mb-3">
                            <p className="text-xs sm:text-sm font-medium mb-1">Rejection Reason:</p>
                            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                              {history.rejectionReason}
                            </p>
                          </div>

                          {/* Comparison View */}
                          {hasChanges && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs sm:text-sm font-semibold">Comparison with Current Submission:</p>
                              <div className="space-y-1.5 text-xs sm:text-sm">
                                {snapshot.name !== currentData.name && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">Name:</span>
                                    <span className="line-through text-red-600">{snapshot.name}</span>
                                    <span className="text-green-600">→ {currentData.name}</span>
                                  </div>
                                )}
                                {snapshot.address !== currentData.address && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">Address:</span>
                                    <span className="line-through text-red-600 break-words">{snapshot.address}</span>
                                    <span className="text-green-600 break-words">→ {currentData.address}</span>
                                  </div>
                                )}
                                {snapshot.city !== currentData.city && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">City:</span>
                                    <span className="line-through text-red-600">{snapshot.city}</span>
                                    <span className="text-green-600">→ {currentData.city}</span>
                                  </div>
                                )}
                                {snapshot.phone !== currentData.phone && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">Phone:</span>
                                    <span className="line-through text-red-600">{snapshot.phone || "N/A"}</span>
                                    <span className="text-green-600">→ {currentData.phone || "N/A"}</span>
                                  </div>
                                )}
                                {snapshot.email !== currentData.email && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">Email:</span>
                                    <span className="line-through text-red-600 break-all">{snapshot.email || "N/A"}</span>
                                    <span className="text-green-600 break-all">→ {currentData.email || "N/A"}</span>
                                  </div>
                                )}
                                {snapshot.gst_number !== currentData.gstNumber && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">GST:</span>
                                    <span className="line-through text-red-600">{snapshot.gst_number || "N/A"}</span>
                                    <span className="text-green-600">→ {currentData.gstNumber || "N/A"}</span>
                                  </div>
                                )}
                                {snapshot.pan_number !== currentData.panNumber && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">PAN:</span>
                                    <span className="line-through text-red-600">{snapshot.pan_number || "N/A"}</span>
                                    <span className="text-green-600">→ {currentData.panNumber || "N/A"}</span>
                                  </div>
                                )}
                                {JSON.stringify(snapshot.documents || []) !== JSON.stringify(currentData.documents || []) && (
                                  <div className="flex gap-2">
                                    <span className="text-muted-foreground min-w-[80px]">Documents:</span>
                                    <span className="text-muted-foreground">
                                      {snapshot.documents?.length || 0} → {currentData.documents?.length || 0} files
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Previous Submission Details (Collapsible) */}
                          <details className="mt-3">
                            <summary className="text-xs sm:text-sm font-medium cursor-pointer hover:text-primary">
                              View Previous Submission Details
                            </summary>
                            <div className="mt-2 p-2 bg-muted rounded text-xs sm:text-sm space-y-1.5">
                              <div><strong>Name:</strong> {snapshot.name}</div>
                              <div><strong>Address:</strong> {snapshot.address}</div>
                              <div><strong>City:</strong> {snapshot.city}</div>
                              <div><strong>Phone:</strong> {snapshot.phone || "N/A"}</div>
                              <div><strong>Email:</strong> {snapshot.email || "N/A"}</div>
                              <div><strong>Owner:</strong> {snapshot.owner_name || "N/A"}</div>
                              <div><strong>GST:</strong> {snapshot.gst_number || "N/A"}</div>
                              <div><strong>License:</strong> {snapshot.license_number || "N/A"}</div>
                              <div><strong>PAN:</strong> {snapshot.pan_number || "N/A"}</div>
                              <div><strong>Documents:</strong> {snapshot.documents?.length || 0} files</div>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedVenueDetail.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                  <Button
                    variant="destructive"
                    className="flex-1 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                    onClick={() => handleRejectVenue(selectedVenueDetail.id)}
                  >
                    <XCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Reject Venue
                  </Button>
                  <Button
                    className="flex-1 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                    onClick={() => handleApproveVenue(selectedVenueDetail.id)}
                  >
                    <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Approve Venue
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No venue details available
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
