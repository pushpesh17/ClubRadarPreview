"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Booking",
      questions: [
        {
          q: "How do I book an event?",
          a: "Simply browse events on the Discover page, select the event you want to attend, choose the number of tickets, and confirm your booking. You'll receive a digital entry pass with QR code instantly.",
        },
        {
          q: "Can I cancel my booking?",
          a: "Yes, you can cancel bookings up to 24 hours before the event. Cancellation policies may vary by event. Check the event details for specific cancellation terms.",
        },
        {
          q: "What payment methods are accepted?",
          a: "We accept all major credit cards, debit cards, UPI, and net banking. All payments are processed securely through our payment partners.",
        },
        {
          q: "Will I get a refund if I cancel?",
          a: "Refunds depend on the event's cancellation policy. Most events offer full refunds if cancelled 24+ hours in advance. Check the event details for specific refund terms.",
        },
      ],
    },
    {
      category: "Account",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Sign Up' in the top right corner, enter your email, and follow the verification steps. You can also sign up using Google for faster registration.",
        },
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click on 'Sign In', then 'Forgot Password'. Enter your email address and follow the instructions sent to your email to reset your password.",
        },
        {
          q: "Can I change my email address?",
          a: "Yes, you can update your email address in your profile settings. You'll need to verify the new email address.",
        },
      ],
    },
    {
      category: "Events",
      questions: [
        {
          q: "How do I find events near me?",
          a: "Use the city filter on the Discover page to see events in your area. You can also filter by date, genre, and price to find exactly what you're looking for.",
        },
        {
          q: "What if an event is sold out?",
          a: "If an event is sold out, you'll see a 'Sold Out' badge. You can join the waitlist if available, or check back later as sometimes tickets become available due to cancellations.",
        },
        {
          q: "Can I transfer my booking to someone else?",
          a: "Yes, you can transfer your booking to another person. Contact support with your booking ID and the new attendee's details, and we'll help you transfer the booking.",
        },
      ],
    },
    {
      category: "Venue",
      questions: [
        {
          q: "How do I register my venue?",
          a: "Click on 'Register Your Venue' in the footer or go to the Venue Signup page. Fill out the registration form with your venue details and submit required documents. Our team will review and approve your application.",
        },
        {
          q: "What documents do I need to register?",
          a: "You'll need business registration documents, license numbers, GST certificate (if applicable), and venue photos. Check the venue registration page for a complete list.",
        },
        {
          q: "How long does venue approval take?",
          a: "Venue approval typically takes 2-3 business days after you submit all required documents. You'll receive an email notification once your venue is approved.",
        },
        {
          q: "What are the fees for listing events?",
          a: "We offer flexible pricing plans for venues. Check our Pricing page for details. There's no upfront cost—we only charge a small commission on successful bookings.",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "I'm not receiving my entry pass. What should I do?",
          a: "Check your email spam folder first. If you still don't see it, go to 'My Bookings' in your account to view and download your entry pass. You can also contact support for assistance.",
        },
        {
          q: "The QR code on my entry pass isn't working. What do I do?",
          a: "Make sure your phone screen is bright and the QR code is clearly visible. If it still doesn't work, contact the venue directly or reach out to our support team with your booking ID.",
        },
        {
          q: "Can I use the website on mobile?",
          a: "Yes! Our website is fully responsive and works great on mobile devices. We're also working on a mobile app—sign up to be notified when it launches.",
        },
      ],
    },
  ];

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 px-4 py-20 text-white">
          <div className="container mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Find answers to common questions about ClubRadar
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container px-4 -mt-8">
          <Card className="mx-auto max-w-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Content */}
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="mb-6 text-2xl font-bold">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((item, itemIndex) => {
                    const globalIndex = faqs
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.questions.length, 0) + itemIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <Card key={itemIndex} className="transition-all hover:shadow-md">
                        <CardHeader
                          className="cursor-pointer"
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{item.q}</CardTitle>
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                        </CardHeader>
                        {isOpen && (
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="mt-20">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-12 text-center">
                <h2 className="mb-4 text-3xl font-bold">Still Have Questions?</h2>
                <p className="mb-8 mx-auto max-w-2xl text-muted-foreground">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/support">View Support Options</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

