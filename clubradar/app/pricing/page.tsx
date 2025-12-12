"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for trying out ClubRadar",
      features: [
        "Browse all events",
        "Book up to 5 events per month",
        "Digital entry passes",
        "Basic customer support",
        "Event reviews and ratings",
      ],
      limitations: [
        "Limited to 5 bookings/month",
        "No priority support",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Premium",
      price: "₹299",
      period: "per month",
      description: "For frequent party-goers",
      features: [
        "Unlimited event bookings",
        "Priority customer support",
        "Exclusive member-only events",
        "Early access to new events",
        "10% discount on all bookings",
        "Free cancellation (24h notice)",
        "Event recommendations",
      ],
      limitations: [],
      cta: "Upgrade Now",
      href: "/signup?plan=premium",
      popular: true,
    },
    {
      name: "Venue",
      price: "Custom",
      period: "pricing",
      description: "For venue owners and event organizers",
      features: [
        "List unlimited events",
        "Real-time booking management",
        "Analytics dashboard",
        "Marketing tools",
        "Payment processing",
        "Dedicated account manager",
        "Custom branding",
      ],
      limitations: [],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 px-4 py-20 text-white">
          <div className="container mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Choose the plan that works best for you. All plans include access to amazing events.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative transition-all hover:shadow-xl ${
                  plan.popular ? "border-2 border-purple-500 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && plan.period !== "pricing" && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start gap-2 text-muted-foreground">
                        <X className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : ""
                    }`}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto max-w-3xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change plans later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We accept all major credit cards, debit cards, UPI, and net banking. All payments are secure and encrypted.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there a free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The Free plan is always free. Premium plans come with a 7-day free trial—no credit card required.
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

