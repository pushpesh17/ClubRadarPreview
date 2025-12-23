import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clubradar.in"),
  title: {
    default: "ClubRadar - Discover Nightlife & Book Entry Passes",
    template: "%s | ClubRadar",
  },
  description:
    "ClubRadar is India's #1 nightlife discovery and booking platform. Discover clubs, bars, and events in your city, book instant QR entry passes, and manage venue bookings.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClubRadar - Discover Nightlife & Book Entry Passes",
    description:
      "Find the best clubs, bars, and nightlife events in India. Book instant QR entry passes, skip queues, and manage venue bookings with ClubRadar.",
    url: "https://clubradar.in",
    siteName: "ClubRadar",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClubRadar - Discover Nightlife & Book Entry Passes",
    description:
      "Discover the best nightlife in India, book instant QR entry passes, and manage venue bookings with ClubRadar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  // Once you generate a verification token in Google Search Console,
  // paste it here, e.g. verification: { google: "your-token" }
  // verification: {
  //   google: "YOUR_SEARCH_CONSOLE_VERIFICATION_TOKEN",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        {children}
        </Providers>
        <ToastProvider />
      </body>
    </html>
  );
}
