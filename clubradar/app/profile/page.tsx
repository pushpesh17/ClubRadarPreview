"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  User,
  Camera,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/use-auth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }

    // Load user data from Clerk
    if (user) {
      setName(user.name || "");
      setAge(""); // Age not in Clerk by default, can be added to profile later
      setPhoto(user.image || null);
    }
  }, [user, authLoading, router]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!age || parseInt(age) < 18) {
      toast.error("You must be 18 or older");
      return;
    }

    setLoading(true);
    
    // Save to localStorage (in real app, save to backend)
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    
    const updatedUser = {
      ...user,
      name: name.trim(),
      age: parseInt(age),
      photo: photo,
    };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully!");
      router.push("/discover");
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black px-4 py-8 sm:py-12">
        <div className="container max-w-4xl">
          <Link
            href="/discover"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discover
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card - Left Side */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-24">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                      <AvatarImage src={photo || undefined} alt={name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl">
                        {name ? name.charAt(0).toUpperCase() : <User className="h-16 w-16" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{name || "User"}</h2>
                      {age && (
                        <p className="text-sm text-muted-foreground">Age: {age}</p>
                      )}
                    </div>
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                        className="w-full flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        {photo ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form - Right Side */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-semibold">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="text"
                      inputMode="numeric"
                      placeholder="18"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Only allow digits, max 3 digits (for ages up to 100)
                        const numericVal = val.replace(/\D/g, "").slice(0, 3);
                        setAge(numericVal);
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        const num = parseInt(val, 10);
                        if (val && (isNaN(num) || num < 18)) {
                          toast.error("You must be 18 or older");
                          setAge("");
                        } else if (val && num > 100) {
                          toast.error("Please enter a valid age");
                          setAge("");
                        }
                      }}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      You must be 18 or older to use ClubRadar
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading || !name.trim() || !age}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Your profile information is kept private and secure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

