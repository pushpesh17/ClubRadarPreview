"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const redirectTo = searchParams.get("redirect") || "/discover";
  const type = searchParams.get("type") || "signin"; // signin or signup
  
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  
  const isLoaded = type === "signup" ? signUpLoaded : signInLoaded;
  const authObject = type === "signup" ? signUp : signIn;
  const setActive = type === "signup" ? setSignUpActive : setSignInActive;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email address is required");
      router.push("/login");
    }
  }, [email, router]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!isLoaded || !authObject) {
      toast.error("Authentication is loading, please wait...");
      return;
    }

    setLoading(true);

    try {
      if (type === "signup") {
        // Verify sign-up OTP
        const completeSignUp = await (authObject as any).attemptEmailAddressVerification({
          code: otp.trim(),
        });

        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId });
          
          toast.success("Account created successfully! Welcome to ClubRadar! 🎉", {
            duration: 2000,
          });
          
          setTimeout(() => {
            router.replace(redirectTo);
          }, 1000);
        } else {
          throw new Error("Verification incomplete");
        }
      } else {
        // Verify sign-in OTP
        const completeSignIn = await (authObject as any).attemptFirstFactor({
          strategy: "email_code",
          code: otp.trim(),
        });

        if (completeSignIn.status === "complete") {
          await setActive({ session: completeSignIn.createdSessionId });
          
          toast.success("Login successful! Welcome back!", {
            duration: 2000,
          });
          
          setTimeout(() => {
            router.replace(redirectTo);
          }, 1000);
        } else {
          throw new Error("Verification incomplete");
        }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMessage = error.errors?.[0]?.message || error.message || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
      setOtp(""); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!isLoaded || !authObject) {
      toast.error("Authentication is loading, please wait...");
      return;
    }

    setLoading(true);
    setOtp("");

    try {
      if (type === "signup") {
        await (authObject as any).prepareEmailAddressVerification({
          strategy: "email_code",
        });
      } else {
        // For sign-in, we need to recreate the sign-in attempt
        const signInAttempt = await (authObject as any).create({
          identifier: email,
        });
        
        const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await (authObject as any).prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        } else {
          throw new Error("Email code verification not available");
        }
      }

      toast.success("Verification code resent! Check your email.", {
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage = error.errors?.[0]?.message || error.message || "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950 dark:via-pink-950 dark:to-black px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Verify your email
              </CardTitle>
              <CardDescription className="text-base">
                We sent a 6-digit verification code to
              </CardDescription>
              <p className="text-base font-semibold text-purple-600 dark:text-purple-400 break-all">
                {email}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold">
                  Enter verification code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6 && !loading) {
                      handleVerifyOTP();
                    }
                  }}
                  disabled={loading || !isLoaded}
                  className="h-14 text-2xl text-center tracking-widest font-bold border-2 focus:border-purple-500 transition-colors"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                onClick={handleVerifyOTP}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
                disabled={loading || otp.length !== 6 || !isLoaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 h-11 border-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  className="flex-1 h-11 border-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                  disabled={loading || !isLoaded}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend code"
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOTP}
                  className="underline hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                  disabled={loading}
                >
                  Resend
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

