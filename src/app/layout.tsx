import type { Metadata, Viewport } from "next";
import { Mukta_Malar, JetBrains_Mono, Anek_Tamil, Halant, Rozha_One } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/context/LocaleContext";
import { TinaiProvider } from "@/context/TinaiContext";
import { AudioProvider } from "@/context/AudioContext";
import { LiteModeProvider } from "@/context/LiteModeContext";
import { AppShell } from "@/components/global/AppShell";
import { OrganizationJsonLd, EventJsonLd, WebSiteJsonLd } from "@/components/global/JsonLd";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { GlobalCanvas } from "@/components/canvas/GlobalCanvas";

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["latin", "tamil"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Cultural Tamil & Indic Display Typefaces (replaces cold futuristic fonts)
const anekTamil = Anek_Tamil({
  variable: "--font-anek-tamil",
  subsets: ["latin", "tamil"],
  weight: ["500", "600", "700", "800"],
});

const halant = Halant({
  variable: "--font-halant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const rozhaOne = Rozha_One({
  variable: "--font-rozha",
  subsets: ["latin"],
  weight: ["400"],
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
    "Official student organization at The Ohio State University. A welcoming campus hub for Tamil culture, good food, casual hangouts, collegiate dance, and fellowship in Columbus — open to all students and languages.",
  applicationName: "OSU Tamil Sangam",
  keywords: [
    "OSU Tamil Sangam",
    "The Ohio State University Tamil Sangam",
    "Ohio State University",
    "Tamil Sangam OSU",
    "Tamil student organization Ohio State",
    "OSU South Asian student organizations",
    "Columbus Tamil Sangam",
    "Columbus Tamil",
    "Tamil Students Ohio",
    "Buckeye Tamil",
    "Aatam Paatam Kondatam",
    "Aatam Paatam Kondatam Ohio State",
    "OSU Diwali",
    "OSU Pongal",
    "Ohio Union cultural events",
    "Bharatanatyam Columbus",
    "Gaana dance team OSU",
    "South Asian student orgs OSU",
    "Tamil culture Columbus Ohio",
    "Tamil diaspora Midwest",
    "Midwest collegiate Tamil Sangam",
    "Thirukkural study Ohio State",
    "Kanchipuram silk exhibition",
    "Tamil movies Ohio State",
    "OSU Indian student freshman guide",
    "Columbus Indian grocery guide",
    "தமிழ் சங்கம்",
    "ஓஹியோ தமிழ் சங்கம்",
    "ஓஹியோ ஸ்டேட் பல்கலைக்கழகம்",
    "கொலம்பஸ் தமிழ்",
  ],
  category: "culture",
  classification: "Collegiate Cultural Student Organization",
  referrer: "origin-when-cross-origin",
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
    types: {
      "application/rss+xml": "https://osutamilsangam.org/feed.xml",
    },
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
      className={`${muktaMalar.variable} ${jetbrainsMono.variable} ${anekTamil.variable} ${halant.variable} ${rozhaOne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Structured Data for Search Engine Crawlers */}
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <EventJsonLd />

        <LocaleProvider>
          <TinaiProvider>
            <AudioProvider>
              <LiteModeProvider>
                <SmoothScroll>
                  <GlobalCanvas />
                  <AppShell>{children}</AppShell>
                </SmoothScroll>
              </LiteModeProvider>
            </AudioProvider>
          </TinaiProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
