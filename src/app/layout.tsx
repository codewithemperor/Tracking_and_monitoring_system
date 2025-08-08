import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SkipLink, AccessibilityAnnouncer } from "@/components/accessibility/skip-link";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NIPOST Track - Real-time Parcel Tracking System",
  description: "Advanced parcel tracking and monitoring system for NIPOST with real-time updates, comprehensive dashboards, and intelligent delivery management.",
  keywords: ["NIPOST", "parcel tracking", "delivery management", "real-time tracking", "logistics", "shipping", "Nigeria"],
  authors: [{ name: "NIPOST Track Team" }],
  openGraph: {
    title: "NIPOST Track - Real-time Parcel Tracking",
    description: "Advanced parcel tracking and monitoring system for NIPOST",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIPOST Track - Real-time Parcel Tracking",
    description: "Advanced parcel tracking and monitoring system for NIPOST",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className="h-full"
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </head>
      <body
        className={`${urbanist.variable} font-sans antialiased bg-background text-foreground h-full text-sm`}
      >
        <SkipLink targetId="main-content" />
        <AccessibilityAnnouncer message="Page loaded" politeness="polite" />
        
        <main id="main-content" tabIndex={-1} className="h-full focus:outline-none">
          {children}
        </main>
        
        <Toaster />
      </body>
    </html>
  );
}
