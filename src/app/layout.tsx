import type { Metadata, Viewport } from "next";
import { Mukta_Malar, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/context/LocaleContext";
import { TinaiProvider } from "@/context/TinaiContext";
import { AudioProvider } from "@/context/AudioContext";
import { LiteModeProvider } from "@/context/LiteModeContext";
import { AppShell } from "@/components/global/AppShell";
import { OrganizationJsonLd, EventJsonLd } from "@/components/global/JsonLd";

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["latin", "tamil"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#462270",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://osutamilsangam.org"),
  title: {
    default: "OSU Tamil Sangam · The Ohio State University",
    template: "%s | OSU Tamil Sangam",
  },
  description:
    "Official student organization for Tamil culture, performing arts, and community at The Ohio State University. Home of Pattas Tappas Diwali, collegiate dance, live music, and campus fellowship in Columbus.",
  applicationName: "OSU Tamil Sangam",
  keywords: [
    "OSU Tamil Sangam",
    "Ohio State University",
    "Tamil Sangam OSU",
    "Pattas Tappas Diwali",
    "Tamil Students Ohio",
    "Buckeyes",
    "Columbus Tamil",
    "Aatam Paatam Kondatam",
    "South Asian Student Orgs OSU",
    "Bharatanatyam Columbus",
    "Ohio Union Events",
  ],
  authors: [{ name: "OSU Tamil Sangam Executive Board", url: "https://osutamilsangam.org/board" }],
  creator: "The Ohio State University Tamil Sangam",
  publisher: "OSU Tamil Sangam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://osutamilsangam.org",
    languages: {
      "en-US": "https://osutamilsangam.org",
      "ta-IN": "https://osutamilsangam.org",
    },
  },
  openGraph: {
    title: "OSU Tamil Sangam · The Ohio State University",
    description:
      "Start the Aatam, Paatam, and Kondatam! Bridging classical Tamil heritage with student dance, feasts, live concerts, and campus community in Columbus.",
    url: "https://osutamilsangam.org",
    siteName: "OSU Tamil Sangam",
    locale: "en_US",
    alternateLocale: "ta_IN",
    type: "website",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        type: "image/svg+xml",
        alt: "Ohio State University Tamil Sangam Official Circular Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSU Tamil Sangam · The Ohio State University",
    description:
      "Start the Aatam, Paatam, and Kondatam! Celebrating Tamil performing arts and student community at Ohio State.",
    images: ["/emblem.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/emblem.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${muktaMalar.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Structured Data for Search Engine Crawlers */}
        <OrganizationJsonLd />
        <EventJsonLd />

        <LocaleProvider>
          <TinaiProvider>
            <AudioProvider>
              <LiteModeProvider>
                <AppShell>{children}</AppShell>
              </LiteModeProvider>
            </AudioProvider>
          </TinaiProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
