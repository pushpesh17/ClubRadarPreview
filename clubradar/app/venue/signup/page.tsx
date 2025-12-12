"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Building2,
  User,
  FileText,
  Upload,
  Loader2,
  X,
  ArrowRight,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VenueSignup() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    { name: string; url: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Venue status state
  const [venueStatus, setVenueStatus] = useState<{
    hasVenue: boolean;
    status?: "pending" | "approved" | "rejected";
    venueName?: string;
    submittedAt?: string;
  } | null>(null);
  const [isCheckingVenue, setIsCheckingVenue] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    venueName: "",
    venueType: "",
    address: "",
    city: "",
    pincode: "",
    capacity: "",
    // Step 2: Contact Details
    ownerName: "",
    phone: "",
    email: "",
    alternatePhone: "",
    // Step 3: KYC Documents
    gstNumber: "",
    licenseNumber: "",
    panNumber: "",
    bankAccount: "",
    ifscCode: "",
  });

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Contact Details", icon: User },
    { id: 3, title: "KYC Documents", icon: FileText },
  ];

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to upload documents");
      router.push("/login?redirect=/venue/signup");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/venues/upload-documents", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload documents");
      }

      // Add uploaded files to the list
      setUploadedDocuments((prev) => [...prev, ...data.files]);
      toast.success(data.message || "Documents uploaded successfully!");

      // Reset progress after a moment
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error: unknown) {
      console.error("File upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload documents. Please try again.";
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to register your venue");
      router.push("/login?redirect=/venue/signup");
      return;
    }

    // Validate required fields
    const errors: string[] = [];

    if (!formData.venueName?.trim()) {
      errors.push("Venue name is required");
    }
    if (!formData.address?.trim()) {
      errors.push("Address is required");
    }
    if (!formData.city?.trim()) {
      errors.push("City is required");
    }
    if (!formData.pincode?.trim()) {
      errors.push("Pincode is required");
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      errors.push("Valid capacity is required");
    }
    if (!formData.ownerName?.trim()) {
      errors.push("Owner/Manager name is required");
    }
    if (!formData.phone?.trim()) {
      errors.push("Phone number is required");
    }
    if (!formData.email?.trim()) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    if (!formData.licenseNumber?.trim()) {
      errors.push("License number is required");
    }
    if (!formData.panNumber?.trim()) {
      errors.push("PAN number is required");
    }
    if (!formData.bankAccount?.trim()) {
      errors.push("Bank account number is required");
    }
    if (!formData.ifscCode?.trim()) {
      errors.push("IFSC code is required");
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setIsSubmitting(true);

    try {
      // Try to sync user to Supabase (optional - venue registration will create user if needed)
      try {
        const syncResponse = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name || formData.ownerName,
            email: user.email || formData.email,
            phone: user.phone || formData.phone,
            photo: user.image || null,
          }),
        });

        if (!syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.warn(
            "User sync failed, but continuing...",
            syncData.error || "Unknown error"
          );
          // Don't throw - venue registration will handle user creation
        }
      } catch (syncError) {
        console.warn("User sync error (non-fatal):", syncError);
        // Continue with venue registration - it will create user if needed
      }

      // Register venue
      const response = await fetch("/api/venues/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.venueName,
          description: formData.venueType
            ? `${formData.venueType} venue`
            : null,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          phone: formData.phone,
          email: formData.email,
          ownerName: formData.ownerName,
          alternatePhone: formData.alternatePhone || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          gstNumber: formData.gstNumber || null,
          licenseNumber: formData.licenseNumber || null,
          panNumber: formData.panNumber || null,
          bankAccount: formData.bankAccount || null,
          ifscCode: formData.ifscCode || null,
          documents: uploadedDocuments.map((doc) => doc.url), // Include uploaded document URLs
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register venue");
      }

      toast.success(
        data.venue.message || "Venue registration submitted successfully!"
      );

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/venue/dashboard");
      }, 2000);
    } catch (error: unknown) {
      console.error("Venue registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register venue. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user already has a venue
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If already checked, don't check again
    if (venueStatus !== null) {
      return;
    }

    // If currently checking, don't start another check
    if (isCheckingVenue) {
      return;
    }

    // If no user, redirect to login
    if (!user) {
      router.push("/login?redirect=/venue/signup");
      return;
    }

    let isMounted = true;

    const checkExistingVenue = async () => {
      if (!isMounted) return;
      setIsCheckingVenue(true);

      console.log("Checking venue status for user:", user?.id);

      // Add a timeout fallback to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Venue status check timed out, allowing registration");
          setVenueStatus({ hasVenue: false });
          setIsCheckingVenue(false);
        }
      }, 10000); // 10 second timeout

      try {
        const response = await fetch("/api/venues/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", // Prevent caching
        });

        // Handle 404 or other errors gracefully
        if (!response.ok) {
          // Clear timeout since we got a response (even if error)
          clearTimeout(timeoutId);

          // If 404, the route might not be available - assume no venue
          if (response.status === 404) {
            console.warn(
              "Venue status API not found (404), allowing registration"
            );
            if (isMounted) {
              setVenueStatus({ hasVenue: false });
              setIsCheckingVenue(false);
            }
            return;
          }

          // For 401, redirect to login
          if (response.status === 401) {
            if (isMounted) {
              router.push("/login?redirect=/venue/signup");
            }
            return;
          }

          // For other errors, try to parse JSON or assume no venue
          try {
            const errorData = await response.json();
            console.warn("Venue status API error:", errorData);
          } catch {
            // Not JSON, just log the status
            console.warn(
              "Venue status API returned non-JSON error:",
              response.status
            );
          }

          // Assume no venue for any error
          if (isMounted) {
            setVenueStatus({ hasVenue: false });
            setIsCheckingVenue(false);
          }
          return;
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.hasVenue && data.venue) {
          // Clear timeout since we got a successful response
          clearTimeout(timeoutId);
          if (isMounted) {
            setVenueStatus({
              hasVenue: true,
              status: data.venue.status,
              venueName: data.venue.name,
              submittedAt: data.venue.createdAt,
            });
          }
        } else {
          // Clear timeout since we got a response
          clearTimeout(timeoutId);
          if (isMounted) {
            setVenueStatus({
              hasVenue: false,
            });
          }
        }
      } catch (error) {
        if (!isMounted) return;
        // Clear timeout on error
        clearTimeout(timeoutId);
        console.error("Error checking venue status:", error);
        // If error (network error, 404, etc.), assume no venue and allow registration
        // This prevents the page from being stuck in loading state
        setVenueStatus({
          hasVenue: false,
        });
      } finally {
        if (isMounted) {
          setIsCheckingVenue(false);
        }
      }
    };

    checkExistingVenue();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]); // Only depend on user.id, not the whole user object or router

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push("/login?redirect=/venue/signup");
    return null;
  }

  // Show loading state while checking venue
  if (isCheckingVenue) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">
              Checking registration status...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show status message if venue already exists
  if (venueStatus?.hasVenue) {
    const statusConfig = {
      pending: {
        icon: Clock,
        title: "Registration Under Review",
        description:
          "Your venue registration has been submitted and is currently under review.",
        message:
          "Our team is reviewing your application. You&apos;ll receive an email notification once your venue is approved. This usually takes 24-48 hours.",
        color: "text-yellow-600 dark:text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      },
      approved: {
        icon: CheckCircle2,
        title: "Registration Successfully Approved!",
        description:
          "Your venue registration has been approved and is now active.",
        message:
          "Congratulations! Your venue registration has been successfully approved. You can now check your dashboard and organize events.",
        color: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800",
        iconBg: "bg-green-100 dark:bg-green-900/30",
      },
      rejected: {
        icon: AlertCircle,
        title: "Registration Rejected",
        description: "Your venue registration was not approved.",
        message:
          "Unfortunately, your venue registration was rejected. Please contact support for more information or submit a new registration.",
        color: "text-red-600 dark:text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
        iconBg: "bg-red-100 dark:bg-red-900/30",
      },
    };

    const config = statusConfig[venueStatus.status || "pending"];
    const StatusIcon = config.icon;

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="mx-auto max-w-2xl">
              <Card
                className={`shadow-xl border-2 ${config.borderColor} ${config.bgColor}`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg} ${config.borderColor} border-2`}
                  >
                    <StatusIcon className={`h-10 w-10 ${config.color}`} />
                  </div>
                  <CardTitle
                    className={`text-2xl sm:text-3xl font-bold mb-2 ${config.color}`}
                  >
                    {config.title}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {venueStatus.venueName && (
                    <div className="rounded-lg bg-background/50 p-4 border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Venue Name
                      </p>
                      <p className="text-lg font-semibold">
                        {venueStatus.venueName}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg bg-background/50 p-4 border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {config.message}
                    </p>
                  </div>

                  {venueStatus.status === "pending" && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-200">
                        <strong>What&apos;s next?</strong> Once approved,
                        you&apos;ll be able to create events, manage bookings,
                        and track your earnings from your venue dashboard.
                      </p>
                    </div>
                  )}

                  {venueStatus.status === "approved" && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-900 dark:text-green-200">
                        <strong>Ready to get started?</strong> You can now
                        access your dashboard to create events, manage bookings,
                        and track your earnings. Click &quot;Go to
                        Dashboard&quot; below to get started!
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Back
                    </Button>
                    <Button
                      onClick={() => router.push("/venue/dashboard")}
                      className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {venueStatus.status === "approved"
                        ? "Go to Dashboard"
                        : "View Dashboard"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {venueStatus.status === "rejected" && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVenueStatus({ hasVenue: false });
                        }}
                        className="w-full h-11 sm:h-12 text-sm sm:text-base"
                      >
                        Submit New Registration
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-4xl">
            {/* Header Section */}
            <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Register Your Venue
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Join ClubRadar and start managing your bookings today. It&apos;s
                free to get started.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-6 sm:mb-8">
              <div className="hidden sm:flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-colors ${
                          currentStep >= step.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </div>
                      <span className="mt-2 text-xs sm:text-sm font-medium hidden md:block">
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-1 flex-1 transition-colors ${
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile Progress Steps */}
              <div className="sm:hidden flex items-center justify-center gap-2 mb-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep >= step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
              <div className="sm:hidden text-center">
                <p className="text-sm font-medium">
                  Step {currentStep} of {steps.length}:{" "}
                  {steps[currentStep - 1].title}
                </p>
              </div>
            </div>

            <Card className="shadow-xl border-2">
              <CardHeader className="pb-4 sm:pb-6 border-b">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  Venue Registration
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Fill in your venue details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <Tabs
                  value={currentStep.toString()}
                  onValueChange={(v) => setCurrentStep(parseInt(v))}
                >
                  <TabsList className="hidden sm:grid w-full grid-cols-3 mb-6">
                    {steps.map((step) => (
                      <TabsTrigger
                        key={step.id}
                        value={step.id.toString()}
                        className="text-xs sm:text-sm"
                      >
                        {step.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Step 1: Basic Info */}
                  <TabsContent
                    value="1"
                    className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="venueName"
                        className="text-sm sm:text-base"
                      >
                        Venue Name *
                      </Label>
                      <Input
                        id="venueName"
                        placeholder="Enter your venue name"
                        className="h-11 sm:h-12"
                        value={formData.venueName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            venueName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="venueType"
                        className="text-sm sm:text-base"
                      >
                        Venue Type *
                      </Label>
                      <Input
                        id="venueType"
                        placeholder="Club, Bar, Lounge, etc."
                        className="h-11 sm:h-12"
                        value={formData.venueType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            venueType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm sm:text-base">
                        Address *
                      </Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        className="h-11 sm:h-12"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm sm:text-base">
                          City *
                        </Label>
                        <Input
                          id="city"
                          placeholder="City"
                          className="h-11 sm:h-12"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="pincode"
                          className="text-sm sm:text-base"
                        >
                          Pincode *
                        </Label>
                        <Input
                          id="pincode"
                          placeholder="Pincode"
                          className="h-11 sm:h-12"
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pincode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="capacity"
                        className="text-sm sm:text-base"
                      >
                        Capacity *
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Maximum capacity"
                        className="h-11 sm:h-12"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: e.target.value })
                        }
                        min="1"
                      />
                    </div>
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
                    >
                      Next: Contact Details
                    </Button>
                  </TabsContent>

                  {/* Step 2: Contact Details */}
                  <TabsContent
                    value="2"
                    className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="ownerName"
                        className="text-sm sm:text-base"
                      >
                        Owner/Manager Name *
                      </Label>
                      <Input
                        id="ownerName"
                        placeholder="Full name"
                        className="h-11 sm:h-12"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm sm:text-base">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        className="h-11 sm:h-12"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="venue@example.com"
                        className="h-11 sm:h-12"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="alternatePhone"
                        className="text-sm sm:text-base"
                      >
                        Alternate Phone (Optional)
                      </Label>
                      <Input
                        id="alternatePhone"
                        type="tel"
                        placeholder="+91 9876543210"
                        className="h-11 sm:h-12"
                        value={formData.alternatePhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            alternatePhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => {
                          // Validate step 2 before proceeding
                          if (
                            !formData.ownerName?.trim() ||
                            !formData.phone?.trim() ||
                            !formData.email?.trim()
                          ) {
                            toast.error(
                              "Please fill in all required fields in Step 2"
                            );
                            return;
                          }
                          if (
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ) {
                            toast.error("Please enter a valid email address");
                            return;
                          }
                          setCurrentStep(3);
                        }}
                        className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Next: KYC Documents
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Step 3: KYC Documents */}
                  <TabsContent
                    value="3"
                    className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="gst" className="text-sm sm:text-base">
                        GST Number (Optional)
                      </Label>
                      <Input
                        id="gst"
                        placeholder="GSTIN"
                        className="h-11 sm:h-12"
                        value={formData.gstNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gstNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license" className="text-sm sm:text-base">
                        License Number *
                      </Label>
                      <Input
                        id="license"
                        placeholder="Business/Liquor license number"
                        className="h-11 sm:h-12"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pan" className="text-sm sm:text-base">
                        PAN Number *
                      </Label>
                      <Input
                        id="pan"
                        placeholder="PAN card number"
                        className="h-11 sm:h-12"
                        value={formData.panNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            panNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="bankAccount"
                        className="text-sm sm:text-base"
                      >
                        Bank Account Number *
                      </Label>
                      <Input
                        id="bankAccount"
                        placeholder="For payouts"
                        className="h-11 sm:h-12"
                        value={formData.bankAccount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankAccount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc" className="text-sm sm:text-base">
                        IFSC Code *
                      </Label>
                      <Input
                        id="ifsc"
                        placeholder="IFSC code"
                        className="h-11 sm:h-12"
                        value={formData.ifscCode}
                        onChange={(e) =>
                          setFormData({ ...formData, ifscCode: e.target.value })
                        }
                      />
                    </div>
                    <div className="rounded-lg border-2 border-dashed p-4 sm:p-6 text-center bg-muted/30">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-muted-foreground" />
                      <p className="mb-1 sm:mb-2 text-sm sm:text-base font-medium">
                        Upload Documents
                      </p>
                      <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground px-2">
                        Upload license, PAN card, and bank statement (PDF or
                        Images, max 5MB each)
                      </p>
                      <input
                        type="file"
                        id="document-upload"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        onClick={() =>
                          document.getElementById("document-upload")?.click()
                        }
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Files
                          </>
                        )}
                      </Button>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {uploadProgress}% uploaded
                          </p>
                        </div>
                      )}
                      {uploadedDocuments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Uploaded Documents:
                          </p>
                          <div className="space-y-1">
                            {uploadedDocuments.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-background rounded border text-xs sm:text-sm"
                              >
                                <span className="truncate flex-1">
                                  {doc.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 ml-2"
                                  onClick={() => {
                                    setUploadedDocuments(
                                      uploadedDocuments.filter(
                                        (_, i) => i !== index
                                      )
                                    );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold"
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={handleSubmit}
                        disabled={isSubmitting || authLoading || !user}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Registration"
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
                      By submitting, you agree to our Terms of Service and
                      Privacy Policy. Your application will be reviewed within
                      24-48 hours.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/venue/dashboard"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in to your dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
