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
  ArrowLeft,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import toast from "react-hot-toast";
import { generatePayoutPDF } from "@/lib/pdf-generator";
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

interface Payout {
  id: string;
  venueId: string;
  venue: {
    id: string;
    name: string;
    city: string;
    ownerName: string | null;
    bankAccount: string | null;
    ifscCode: string | null;
  } | null;
  payoutAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  periodStartDate: string;
  periodEndDate: string;
  status: "pending" | "processing" | "processed" | "failed" | "cancelled";
  paymentMethod: string;
  bankAccount: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  transactionId: string | null;
  transactionDate: string | null;
  processedBy: string | null;
  processedAt: string | null;
  notes: string | null;
  bookingCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
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
  const [approvedVenues, setApprovedVenues] = useState<Venue[]>([]); // For payout dialog (only approved venues)
  const [overviewVenuesLoading, setOverviewVenuesLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [venueRevenue, setVenueRevenue] = useState<any[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  
  // Revenue analytics filters
  const [revenueStartDate, setRevenueStartDate] = useState("");
  const [revenueEndDate, setRevenueEndDate] = useState("");
  const [showRevenueAnalytics, setShowRevenueAnalytics] = useState(false);
  
  // Filters
  const [venueSearch, setVenueSearch] = useState("");
  const [venueStatusFilter, setVenueStatusFilter] = useState("all");
  const [venuePage, setVenuePage] = useState(1);
  const [venueTotalPages, setVenueTotalPages] = useState(1);
  
  // Payout filters
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutTotalPages, setPayoutTotalPages] = useState(1);
  const [payoutVenueFilter, setPayoutVenueFilter] = useState("all");
  
  // Venue detail modal
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<VenueDetail | null>(null);
  const [isVenueDetailOpen, setIsVenueDetailOpen] = useState(false);
  const [venueDetailLoading, setVenueDetailLoading] = useState(false);

  // Generate payout dialog
  const [showGeneratePayoutDialog, setShowGeneratePayoutDialog] = useState(false);
  const [generatePayoutData, setGeneratePayoutData] = useState({
    venueId: "",
    periodStartDate: "",
    periodEndDate: "",
    commissionRate: 10.0,
  });
  const [isGeneratingPayout, setIsGeneratingPayout] = useState(false);

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

  // Load approved venues for payout dialog
  const loadApprovedVenues = async () => {
    try {
      console.log("Loading approved venues...");
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Get all approved venues
        status: "approved",
      });

      const response = await fetch(`/api/admin/venues?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load venues");
      }

      console.log("Approved venues loaded:", data.venues?.length || 0);
      setApprovedVenues(data.venues || []);
    } catch (error: any) {
      console.error("Error loading approved venues:", error);
      toast.error(`Failed to load venues: ${error.message}`);
      setApprovedVenues([]);
    }
  };

  // Load payouts
  const loadPayouts = async (page: number = 1, status: string = "all", venueId: string = "all") => {
    setPayoutsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(status !== "all" && { status }),
        ...(venueId !== "all" && { venueId }),
      });

      const response = await fetch(`/api/admin/payouts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load payouts");
      }

      setPayouts(data.payouts || []);
      setPayoutTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error("Error loading payouts:", error);
      toast.error(error.message || "Failed to load payouts");
    } finally {
      setPayoutsLoading(false);
    }
  };

  // Load venue revenue analytics
  const loadVenueRevenue = async (startDate?: string, endDate?: string) => {
    setRevenueLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/admin/payouts/revenue?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load revenue data");
      }

      setVenueRevenue(data.revenue || []);
    } catch (error: any) {
      console.error("Error loading venue revenue:", error);
      toast.error(error.message || "Failed to load revenue data");
    } finally {
      setRevenueLoading(false);
    }
  };

  // Bulk generate payouts
  const handleBulkGeneratePayouts = async () => {
    if (!revenueStartDate || !revenueEndDate) {
      toast.error("Please select a date range first");
      return;
    }

    if (!confirm(`Generate payouts for ALL approved venues from ${revenueStartDate} to ${revenueEndDate}?`)) {
      return;
    }

    setIsGeneratingPayout(true);
    try {
      const response = await fetch("/api/admin/payouts/bulk-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          periodStartDate: revenueStartDate,
          periodEndDate: revenueEndDate,
          commissionRate: generatePayoutData.commissionRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate bulk payouts");
      }

      toast.success(
        `Bulk payout generation complete: ${data.summary.successful} successful, ${data.summary.skipped} skipped, ${data.summary.failed} failed`
      );
      loadPayouts(payoutPage, payoutStatusFilter, payoutVenueFilter);
      loadVenueRevenue(revenueStartDate, revenueEndDate);
    } catch (error: any) {
      console.error("Error generating bulk payouts:", error);
      toast.error(error.message || "Failed to generate bulk payouts");
    } finally {
      setIsGeneratingPayout(false);
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

  // Generate payout
  const handleGeneratePayout = async () => {
    if (!generatePayoutData.venueId || !generatePayoutData.periodStartDate || !generatePayoutData.periodEndDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsGeneratingPayout(true);
    try {
      const response = await fetch("/api/admin/payouts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueId: generatePayoutData.venueId,
          periodStartDate: generatePayoutData.periodStartDate,
          periodEndDate: generatePayoutData.periodEndDate,
          commissionRate: generatePayoutData.commissionRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payout");
      }

      // Show appropriate message based on payout amount
      if (data.payout.totalRevenue === 0) {
        toast.success(data.message || `Payout created: ₹0 (No revenue in this period)`);
      } else {
        toast.success(data.message || `Payout generated: ₹${data.payout.netAmount.toLocaleString()} for ${data.payout.bookingCount} booking${data.payout.bookingCount !== 1 ? 's' : ''}`);
      }
      setShowGeneratePayoutDialog(false);
      setGeneratePayoutData({
        venueId: "",
        periodStartDate: "",
        periodEndDate: "",
        commissionRate: 10.0,
      });
      loadPayouts(payoutPage, payoutStatusFilter, payoutVenueFilter);
    } catch (error: any) {
      console.error("Error generating payout:", error);
      toast.error(error.message || "Failed to generate payout");
    } finally {
      setIsGeneratingPayout(false);
    }
  };

  // Process payout
  const handleProcessPayout = async (payoutId: string) => {
    const transactionId = prompt("Enter transaction ID (NEFT/RTGS reference):");
    if (!transactionId) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          status: "processed",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payout");
      }

      toast.success("Payout marked as processed successfully");
      loadPayouts(payoutPage, payoutStatusFilter, payoutVenueFilter);
    } catch (error: any) {
      console.error("Error processing payout:", error);
      toast.error(error.message || "Failed to process payout");
    }
  };

  // Download payout PDF
  const handleDownloadPayoutPDF = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/download`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch payout data");
      }

      // Generate and download PDF
      generatePayoutPDF(data.payout);
      toast.success("Payout slip downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading payout PDF:", error);
      toast.error(error.message || "Failed to download payout slip");
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
    } else if (activeTab === "payments") {
      loadPayouts(1, payoutStatusFilter, payoutVenueFilter);
      // Always load approved venues when switching to Payments tab
      loadApprovedVenues();
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

  // Reload payouts when filters change (only if on payments tab)
  useEffect(() => {
    if (activeTab === "payments") {
      loadPayouts(payoutPage, payoutStatusFilter, payoutVenueFilter);
    }
  }, [payoutPage, payoutStatusFilter, payoutVenueFilter, activeTab]);

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
            <TabsContent value="payments" className="space-y-4 mt-4">
              {/* Revenue Analytics Section */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                        Revenue Analytics & Management
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        View revenue for all venues and manage bulk payouts
                      </CardDescription>
                    </div>
                    <Button
                      variant={showRevenueAnalytics ? "default" : "outline"}
                      onClick={() => {
                        setShowRevenueAnalytics(!showRevenueAnalytics);
                        if (!showRevenueAnalytics) {
                          // Set default to current month if not set
                          if (!revenueStartDate || !revenueEndDate) {
                            const now = new Date();
                            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                            setRevenueStartDate(firstDay.toISOString().split('T')[0]);
                            setRevenueEndDate(lastDay.toISOString().split('T')[0]);
                            loadVenueRevenue(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
                          } else {
                            loadVenueRevenue(revenueStartDate, revenueEndDate);
                          }
                        }
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <TrendingUp className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {showRevenueAnalytics ? "Hide Analytics" : "Show Revenue Analytics"}
                    </Button>
                  </div>
                </CardHeader>
                {showRevenueAnalytics && (
                  <CardContent className="p-3 sm:p-6 space-y-4">
                    {/* Date Range Filter */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="revenue-start-date" className="text-xs sm:text-sm">Start Date</Label>
                        <Input
                          id="revenue-start-date"
                          type="date"
                          value={revenueStartDate}
                          onChange={(e) => {
                            setRevenueStartDate(e.target.value);
                            if (revenueEndDate) {
                              loadVenueRevenue(e.target.value, revenueEndDate);
                            }
                          }}
                          className="text-xs sm:text-sm h-9 sm:h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="revenue-end-date" className="text-xs sm:text-sm">End Date</Label>
                        <Input
                          id="revenue-end-date"
                          type="date"
                          value={revenueEndDate}
                          onChange={(e) => {
                            setRevenueEndDate(e.target.value);
                            if (revenueStartDate) {
                              loadVenueRevenue(revenueStartDate, e.target.value);
                            }
                          }}
                          className="text-xs sm:text-sm h-9 sm:h-10"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => {
                            if (revenueStartDate && revenueEndDate) {
                              loadVenueRevenue(revenueStartDate, revenueEndDate);
                            }
                          }}
                          disabled={!revenueStartDate || !revenueEndDate}
                          className="w-full text-xs sm:text-sm h-9 sm:h-10"
                        >
                          <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Load Revenue
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    {revenueStartDate && revenueEndDate && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                        <Button
                          onClick={handleBulkGeneratePayouts}
                          disabled={isGeneratingPayout}
                          className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                        >
                          {isGeneratingPayout ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Generate Payouts for All Venues
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Revenue Table */}
                    {revenueLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : venueRevenue.length > 0 ? (
                      <div className="space-y-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left p-2 sm:p-3 font-semibold">Venue</th>
                                <th className="text-left p-2 sm:p-3 font-semibold">City</th>
                                <th className="text-right p-2 sm:p-3 font-semibold">Revenue</th>
                                <th className="text-right p-2 sm:p-3 font-semibold">Bookings</th>
                                <th className="text-center p-2 sm:p-3 font-semibold">Payout Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {venueRevenue.map((venue) => (
                                <tr key={venue.venueId} className="border-b hover:bg-muted/50">
                                  <td className="p-2 sm:p-3 font-medium">{venue.venueName}</td>
                                  <td className="p-2 sm:p-3 text-muted-foreground">{venue.city}</td>
                                  <td className="p-2 sm:p-3 text-right font-semibold text-green-600">
                                    ₹{venue.totalRevenue.toLocaleString()}
                                  </td>
                                  <td className="p-2 sm:p-3 text-right">{venue.bookingCount}</td>
                                  <td className="p-2 sm:p-3 text-center">
                                    {venue.hasExistingPayout ? (
                                      <Badge variant="default" className="text-[10px] sm:text-xs">
                                        Payout Exists
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                                        No Payout
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 font-bold bg-muted/50">
                                <td colSpan={2} className="p-2 sm:p-3">Total</td>
                                <td className="p-2 sm:p-3 text-right text-green-600">
                                  ₹{venueRevenue.reduce((sum, v) => sum + v.totalRevenue, 0).toLocaleString()}
                                </td>
                                <td className="p-2 sm:p-3 text-right">
                                  {venueRevenue.reduce((sum, v) => sum + v.bookingCount, 0)}
                                </td>
                                <td className="p-2 sm:p-3 text-center">
                                  {venueRevenue.filter(v => v.hasExistingPayout).length} / {venueRevenue.length}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {revenueStartDate && revenueEndDate
                          ? "No revenue data found for selected period"
                          : "Select a date range to view revenue analytics"}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Summary Stats */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats?.revenue.formatted || "₹0"}</div>
                    <p className="text-xs text-muted-foreground">Platform revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                      ₹{payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.netAmount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {payouts.filter(p => p.status === "pending").length} payouts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Processed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      ₹{payouts.filter(p => p.status === "processed").reduce((sum, p) => sum + p.netAmount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {payouts.filter(p => p.status === "processed").length} payouts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">
                      ₹{payouts.reduce((sum, p) => sum + p.commissionAmount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Platform earnings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Actions */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Venue Payouts</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Manage payments to venues (like Zomato/Swiggy)
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        // Open generate payout dialog
                        setShowGeneratePayoutDialog(true);
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Generate Payout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                    <Select
                      value={payoutStatusFilter}
                      onValueChange={(value) => {
                        setPayoutStatusFilter(value);
                        setPayoutPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={payoutVenueFilter}
                      onValueChange={(value) => {
                        setPayoutVenueFilter(value);
                        setPayoutPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                        <SelectValue placeholder="Filter by venue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Venues</SelectItem>
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payouts List */}
                  {payoutsLoading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : payouts.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex flex-col gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {payout.venue?.name || "Unknown Venue"}
                                </h3>
                                <Badge
                                  variant={
                                    payout.status === "processed"
                                      ? "default"
                                      : payout.status === "pending"
                                      ? "secondary"
                                      : payout.status === "processing"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className="text-[10px] sm:text-xs shrink-0"
                                >
                                  {payout.status}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {payout.venue?.city || ""} • Period: {new Date(payout.periodStartDate).toLocaleDateString()} - {new Date(payout.periodEndDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base sm:text-lg font-bold text-green-600">
                                ₹{payout.netAmount.toLocaleString()}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {payout.bookingCount} bookings
                              </p>
                            </div>
                          </div>

                          {/* Payout Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-2 border-t text-xs sm:text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Revenue</p>
                              <p className="font-medium">₹{payout.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Commission ({payout.commissionRate}%)</p>
                              <p className="font-medium text-red-600">-₹{payout.commissionAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Net Amount</p>
                              <p className="font-medium text-green-600">₹{payout.netAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-medium">{new Date(payout.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Bank Details */}
                          {payout.bankAccount && (
                            <div className="pt-2 border-t text-xs sm:text-sm">
                              <p className="text-muted-foreground mb-1">Bank Details:</p>
                              <p className="font-medium">
                                {payout.accountHolderName || payout.venue?.ownerName || "N/A"} • 
                                A/C: {payout.bankAccount} • 
                                IFSC: {payout.ifscCode || payout.venue?.ifscCode || "N/A"}
                              </p>
                            </div>
                          )}

                          {/* Transaction Details */}
                          {payout.status === "processed" && payout.transactionId && (
                            <div className="pt-2 border-t text-xs sm:text-sm">
                              <p className="text-muted-foreground mb-1">Transaction Details:</p>
                              <p className="font-medium">
                                Txn ID: {payout.transactionId} • 
                                Processed: {payout.processedAt ? new Date(payout.processedAt).toLocaleString() : "N/A"}
                                {payout.processedBy && ` • By ${payout.processedBy}`}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPayoutPDF(payout.id)}
                              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                            >
                              <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Download PDF
                            </Button>
                            {payout.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleProcessPayout(payout.id)}
                                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                              >
                                <CheckCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Mark as Processed
                              </Button>
                            )}
                            {payout.status === "processed" && (
                              <Badge variant="default" className="w-fit text-xs sm:text-sm">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Payment Sent
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {payoutTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPayoutPage((p) => Math.max(1, p - 1))}
                            disabled={payoutPage === 1}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Previous
                          </Button>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Page {payoutPage} of {payoutTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPayoutPage((p) => Math.min(payoutTotalPages, p + 1))}
                            disabled={payoutPage === payoutTotalPages}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                          >
                            Next
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No payouts found
                    </p>
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

      {/* Generate Payout Dialog */}
      <Dialog 
        open={showGeneratePayoutDialog} 
        onOpenChange={(open) => {
          setShowGeneratePayoutDialog(open);
          // Always load approved venues when dialog opens (refresh list)
          if (open) {
            loadApprovedVenues();
          }
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">Generate Payout</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a payout for a venue based on completed bookings in a period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="venue-select" className="text-xs sm:text-sm">Select Venue *</Label>
              <Select
                value={generatePayoutData.venueId}
                onValueChange={(value) => setGeneratePayoutData({ ...generatePayoutData, venueId: value })}
              >
                <SelectTrigger id="venue-select" className="w-full text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Choose a venue" />
                </SelectTrigger>
                <SelectContent>
                  {approvedVenues.length > 0 ? (
                    approvedVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading venues...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {approvedVenues.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No approved venues found. Please approve venues first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="text-xs sm:text-sm">Period Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={generatePayoutData.periodStartDate}
                  onChange={(e) => setGeneratePayoutData({ ...generatePayoutData, periodStartDate: e.target.value })}
                  className="text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs sm:text-sm">Period End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={generatePayoutData.periodEndDate}
                  onChange={(e) => setGeneratePayoutData({ ...generatePayoutData, periodEndDate: e.target.value })}
                  className="text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="commission-rate" className="text-xs sm:text-sm">Commission Rate (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={generatePayoutData.commissionRate}
                onChange={(e) => setGeneratePayoutData({ ...generatePayoutData, commissionRate: parseFloat(e.target.value) || 10 })}
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: 10% (Platform commission)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowGeneratePayoutDialog(false)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm h-9 sm:h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePayout}
                disabled={isGeneratingPayout}
                className="flex-1 sm:flex-initial text-xs sm:text-sm h-9 sm:h-10"
              >
                {isGeneratingPayout ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Payout
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
