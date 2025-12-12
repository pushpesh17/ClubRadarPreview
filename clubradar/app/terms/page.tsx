"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using ClubRadar, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
        "We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the updated terms.",
      ],
    },
    {
      title: "2. Description of Service",
      content: [
        "ClubRadar is a platform that connects users with nightlife events and venues. We provide:",
        "• Event discovery and browsing",
        "• Online booking and ticket purchasing",
        "• Digital entry passes",
        "• Venue registration and management tools",
        "• User reviews and ratings",
      ],
    },
    {
      title: "3. User Accounts",
      content: [
        "To use certain features, you must create an account. You agree to:",
        "• Provide accurate, current, and complete information",
        "• Maintain and update your account information",
        "• Keep your password secure and confidential",
        "• Notify us immediately of any unauthorized access",
        "• Be responsible for all activities under your account",
        "You must be at least 18 years old to create an account and use our services.",
      ],
    },
    {
      title: "4. Bookings and Payments",
      content: [
        "When you book an event through ClubRadar:",
        "• You agree to pay the total amount shown at checkout",
        "• All prices are in Indian Rupees (₹) unless otherwise stated",
        "• Payment is processed securely through our payment partners",
        "• Booking confirmations and entry passes are sent via email",
        "• Refunds are subject to the event's cancellation policy",
        "• We reserve the right to cancel bookings in case of fraud or error",
      ],
    },
    {
      title: "5. Cancellation and Refunds",
      content: [
        "Cancellation policies vary by event:",
        "• Most events allow cancellation up to 24 hours before the event",
        "• Refunds are processed according to the specific event's policy",
        "• Processing fees may apply to refunds",
        "• Refunds are issued to the original payment method within 5-10 business days",
        "• Contact support for cancellation requests",
      ],
    },
    {
      title: "6. Venue Registration",
      content: [
        "Venue owners who register agree to:",
        "• Provide accurate venue and business information",
        "• Submit required documentation for verification",
        "• Maintain accurate event listings",
        "• Honor all bookings made through the platform",
        "• Comply with all applicable laws and regulations",
        "• Pay applicable fees and commissions as agreed",
      ],
    },
    {
      title: "7. Prohibited Activities",
      content: [
        "You agree not to:",
        "• Use the service for any illegal purpose",
        "• Attempt to gain unauthorized access to the platform",
        "• Interfere with or disrupt the service",
        "• Create fake accounts or bookings",
        "• Resell tickets without authorization",
        "• Use automated systems to access the service",
        "• Post false, misleading, or defamatory content",
        "• Violate any applicable laws or regulations",
      ],
    },
    {
      title: "8. Intellectual Property",
      content: [
        "All content on ClubRadar, including text, graphics, logos, and software, is the property of ClubRadar or its licensors and is protected by copyright and trademark laws.",
        "You may not reproduce, distribute, or create derivative works without our written permission.",
      ],
    },
    {
      title: "9. Limitation of Liability",
      content: [
        "ClubRadar acts as an intermediary between users and venues. We are not responsible for:",
        "• The quality, safety, or legality of events",
        "• Venue operations or services",
        "• Disputes between users and venues",
        "• Any damages arising from event attendance",
        "Our total liability is limited to the amount you paid for the specific booking in question.",
      ],
    },
    {
      title: "10. Indemnification",
      content: [
        "You agree to indemnify and hold ClubRadar harmless from any claims, damages, or expenses arising from:",
        "• Your use of the service",
        "• Your violation of these terms",
        "• Your violation of any rights of another party",
      ],
    },
    {
      title: "11. Termination",
      content: [
        "We may terminate or suspend your account and access to the service at any time, with or without cause, for:",
        "• Violation of these terms",
        "• Fraudulent activity",
        "• Legal or regulatory requirements",
        "• At our sole discretion",
        "You may terminate your account at any time by contacting support.",
      ],
    },
    {
      title: "12. Dispute Resolution",
      content: [
        "Any disputes arising from these terms or your use of the service will be resolved through:",
        "• Good faith negotiation",
        "• Mediation if negotiation fails",
        "• Binding arbitration in accordance with Indian law",
        "These terms are governed by the laws of India.",
      ],
    },
    {
      title: "13. Contact Information",
      content: [
        "For questions about these Terms of Service, please contact us:",
        "Email: pushpeshlodiyaee@gmail.com",
        "We will respond to your inquiry within 30 days.",
      ],
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
              Terms of Service
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Please read these terms carefully before using ClubRadar
            </p>
            <p className="mt-4 text-sm text-purple-200">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardContent className="p-8">
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                  These Terms of Service ("Terms") govern your access to and use of ClubRadar's website and services. By using our services, you agree to be bound by these Terms.
                </p>

                {sections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-12 rounded-lg bg-purple-50 p-6 dark:bg-purple-950">
                  <h3 className="mb-2 text-lg font-semibold">Questions About Terms?</h3>
                  <p className="mb-4 text-muted-foreground">
                    If you have any questions about these Terms of Service, please contact us.
                  </p>
                  <a
                    href="mailto:pushpeshlodiyaee@gmail.com"
                    className="inline-flex items-center text-purple-600 hover:underline dark:text-purple-400"
                  >
                    pushpeshlodiyaee@gmail.com
                  </a>
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

