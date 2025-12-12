"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "We collect information that you provide directly to us, including:",
        "• Personal information (name, email, phone number) when you create an account",
        "• Payment information when you make bookings (processed securely through our payment partners)",
        "• Event preferences and booking history",
        "• Venue information if you register as a venue owner",
        "• Communications you send to us (support requests, feedback)",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "We use the information we collect to:",
        "• Process and manage your bookings and transactions",
        "• Send you booking confirmations, entry passes, and event updates",
        "• Improve our services and develop new features",
        "• Communicate with you about your account and our services",
        "• Send you promotional communications (you can opt-out anytime)",
        "• Detect, prevent, and address technical issues and fraud",
        "• Comply with legal obligations",
      ],
    },
    {
      title: "3. Information Sharing",
      content: [
        "We do not sell your personal information. We may share your information only in the following circumstances:",
        "• With venue owners: When you book an event, we share necessary booking details (name, contact info, number of tickets) with the venue",
        "• With service providers: We share information with trusted third-party services that help us operate (payment processors, email services)",
        "• For legal reasons: We may disclose information if required by law or to protect our rights",
        "• With your consent: We may share information in other ways with your explicit permission",
      ],
    },
    {
      title: "4. Data Security",
      content: [
        "We implement appropriate technical and organizational measures to protect your personal information:",
        "• All data is encrypted in transit and at rest",
        "• We use secure payment processing partners",
        "• Access to personal data is restricted to authorized personnel only",
        "• We regularly review and update our security practices",
        "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "5. Your Rights",
      content: [
        "You have the right to:",
        "• Access your personal information",
        "• Correct inaccurate or incomplete information",
        "• Request deletion of your account and data",
        "• Opt-out of promotional communications",
        "• Request a copy of your data",
        "• Withdraw consent where processing is based on consent",
        "To exercise these rights, please contact us at pushpeshlodiyaee@gmail.com",
      ],
    },
    {
      title: "6. Cookies and Tracking",
      content: [
        "We use cookies and similar technologies to:",
        "• Remember your preferences and settings",
        "• Analyze how you use our website",
        "• Provide personalized content and advertisements",
        "You can control cookies through your browser settings, but this may affect website functionality.",
      ],
    },
    {
      title: "7. Third-Party Links",
      content: [
        "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.",
      ],
    },
    {
      title: "8. Children's Privacy",
      content: [
        "Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
      ],
    },
    {
      title: "9. Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date. Your continued use of our services after changes constitutes acceptance of the updated policy.",
      ],
    },
    {
      title: "10. Contact Us",
      content: [
        "If you have questions about this Privacy Policy or our data practices, please contact us:",
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
              Privacy Policy
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-purple-100">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                  At ClubRadar, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our website and services.
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
                  <h3 className="mb-2 text-lg font-semibold">Questions About Privacy?</h3>
                  <p className="mb-4 text-muted-foreground">
                    If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to contact us.
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

