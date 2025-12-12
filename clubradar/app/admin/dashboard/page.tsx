"use client";

import { useState } from "react";
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
  TrendingUp,
  Search,
  Filter,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, tabValue: "overview" },
    { title: "Venues", href: "/admin/dashboard", icon: Building2, tabValue: "venues" },
    { title: "Events", href: "/admin/dashboard", icon: Calendar, tabValue: "events" },
    { title: "Payments", href: "/admin/dashboard", icon: DollarSign, tabValue: "payments" },
    { title: "Issues", href: "/admin/dashboard", icon: AlertCircle, tabValue: "issues" },
  ];

  // Mock data
  const stats = {
    totalVenues: 45,
    pendingApprovals: 8,
    totalRevenue: 2500000,
    totalBookings: 12450,
    activeEvents: 120,
    issues: 3,
  };

  const pendingVenues = [
    {
      id: 1,
      name: "Night Club Mumbai",
      city: "Mumbai",
      type: "Club",
      submittedDate: "2024-01-10",
      owner: "Rajesh Kumar",
      phone: "+91 9876543210",
    },
    {
      id: 2,
      name: "The Lounge Bar",
      city: "Delhi",
      type: "Bar",
      submittedDate: "2024-01-11",
      owner: "Priya Sharma",
      phone: "+91 9876543211",
    },
  ];

  const pendingEvents = [
    {
      id: 1,
      venue: "Club XYZ",
      name: "New Year Party",
      date: "2024-01-20",
      status: "pending",
    },
    {
      id: 2,
      venue: "Bar ABC",
      name: "DJ Night",
      date: "2024-01-18",
      status: "pending",
    },
  ];

  const recentIssues = [
    {
      id: 1,
      type: "Refund Request",
      venue: "Club XYZ",
      user: "Rahul S.",
      amount: 500,
      status: "pending",
      date: "2024-01-12",
    },
    {
      id: 2,
      type: "Booking Issue",
      venue: "Bar ABC",
      user: "Priya M.",
      amount: 0,
      status: "resolved",
      date: "2024-01-11",
    },
  ];

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
            <p className="text-sm lg:text-base text-muted-foreground">Manage venues, events, and platform operations</p>
          </div>

          {/* Stats Overview */}
          <div className="mb-4 sm:mb-6 lg:mb-8 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVenues}</div>
                <p className="text-xs text-muted-foreground">Active venues</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Require review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">Platform revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeEvents}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.issues}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
              <TabsList className="grid w-full min-w-[500px] md:min-w-0 grid-cols-5 h-auto p-1 bg-muted/50">
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="venues" className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Venues</TabsTrigger>
                <TabsTrigger value="events" className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Events</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Payments</TabsTrigger>
                <TabsTrigger value="issues" className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Issues</TabsTrigger>
              </TabsList>
            </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Venue Approvals</CardTitle>
                <CardDescription>Venues awaiting review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingVenues.slice(0, 3).map((venue) => (
                  <div
                    key={venue.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {venue.type} • {venue.city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {venue.owner} • {venue.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("venues")}>
                  View All Pending Approvals
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold">{issue.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {issue.venue} • {issue.user}
                      </p>
                      {issue.amount > 0 && (
                        <p className="text-sm font-medium">₹{issue.amount}</p>
                      )}
                    </div>
                    <Badge
                      variant={issue.status === "pending" ? "destructive" : "default"}
                    >
                      {issue.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("issues")}>
                  View All Issues
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Venue Approvals Tab */}
        <TabsContent value="venues" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Venue Approvals</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search venues..." className="pl-8 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
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
            <CardHeader>
              <CardTitle>Pending Venue Applications</CardTitle>
              <CardDescription>Review and approve venue registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{venue.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {venue.type} • {venue.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {venue.owner} • {venue.phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {venue.submittedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Moderation Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Event Moderation</h2>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending Event Approvals</CardTitle>
              <CardDescription>Review and moderate venue events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.venue} • {event.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive">
                        Reject
                      </Button>
                      <Button size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments & Reports Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment & Payout Reports</CardTitle>
              <CardDescription>View platform revenue and venue payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Platform Revenue</p>
                  <p className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-green-600">+15% this month</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Venue Payouts</p>
                  <p className="text-2xl font-bold">₹20.5L</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <p className="text-2xl font-bold">₹2.5L</p>
                  <p className="text-xs text-yellow-600">Awaiting processing</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold">12.5%</p>
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold">Recent Payouts</h3>
                <div className="space-y-2">
                  {[
                    { venue: "Club XYZ", amount: 45000, date: "2024-01-12", status: "completed" },
                    { venue: "Bar ABC", amount: 32000, date: "2024-01-11", status: "completed" },
                    { venue: "Lounge 123", amount: 28000, date: "2024-01-10", status: "pending" },
                  ].map((payout, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{payout.venue}</p>
                        <p className="text-sm text-muted-foreground">{payout.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">₹{payout.amount.toLocaleString()}</p>
                        <Badge variant={payout.status === "completed" ? "default" : "secondary"}>
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Reports
                </Button>
                <Button variant="outline">Export CSV</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues & Refunds Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issues & Refund Management</CardTitle>
              <CardDescription>Handle customer issues and process refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{issue.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {issue.venue} • {issue.user}
                      </p>
                      <p className="text-sm text-muted-foreground">Date: {issue.date}</p>
                      {issue.amount > 0 && (
                        <p className="mt-1 font-medium">Refund Amount: ₹{issue.amount}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant={issue.status === "pending" ? "destructive" : "default"}
                      >
                        {issue.status}
                      </Badge>
                      {issue.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {issue.amount > 0 && (
                            <Button size="sm">Process Refund</Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

