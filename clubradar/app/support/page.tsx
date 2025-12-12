"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Book, HelpCircle, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");

  const supportOptions = [
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base for answers to common questions",
      href: "/faq",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time (Available 9 AM - 6 PM IST)",
      href: "#",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll get back to you within 24 hours",
      href: "/contact",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Access guides, tutorials, and API documentation",
      href: "#",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const quickLinks = [
    { title: "How to book an event", href: "/how-it-works" },
    { title: "Payment issues", href: "/faq" },
    { title: "Cancel a booking", href: "/faq" },
    { title: "Venue registration", href: "/venue/signup" },
    { title: "Account settings", href: "/profile" },
    { title: "Privacy concerns", href: "/privacy" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 px-4 py-20 text-white">
          <div className="container mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              We're Here to Help
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Get the support you need, when you need it. Our team is ready to assist you.
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
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Options */}
        <div className="container px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Get Support</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Choose the best way to reach us
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${option.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={option.href}>Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="mt-20">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold">Quick Links</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Common questions and resources
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <Link href={link.href} className="flex items-center justify-between">
                      <span className="font-medium">{link.title}</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-20">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-12">
                <div className="text-center">
                  <h2 className="mb-4 text-3xl font-bold">Still Need Help?</h2>
                  <p className="mb-8 mx-auto max-w-2xl text-muted-foreground">
                    Can't find what you're looking for? Our support team is here to help you.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Link href="/contact">
                        <Mail className="mr-2 h-5 w-5" />
                        Contact Support
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/faq">
                        <Book className="mr-2 h-5 w-5" />
                        View FAQ
                      </Link>
                    </Button>
                  </div>
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

