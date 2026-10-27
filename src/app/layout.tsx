import type { Metadata, Viewport } from "next";
import { 
  Mukta_Malar, 
  JetBrains_Mono, 
  Anek_Tamil, 
  Halant, 
  Syne,
  Marcellus,
  Prata,
  Cormorant,
  Outfit,
  Kavivanar,
  Tiro_Tamil,
  Azeret_Mono,
  Fragment_Mono,
  Major_Mono_Display,
  Noto_Serif_Tamil,
  Space_Mono
} from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";

import { Providers } from "@/components/providers/Providers";
import { GlobalCanvas } from "@/components/gl/GlobalCanvas";
import { AppShell } from "@/components/global/AppShell";
import { RootGraphJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, ROUTE_METADATA, DEFAULT_ROBOTS, constructAlternates } from "@/lib/seo";
import { ViewfinderCursor } from "@/components/ui/ViewfinderCursor";

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["latin", "tamil"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

// Cultural Tamil & Indic Display Typefaces (replaces cold futuristic fonts)
const anekTamil = Anek_Tamil({
  variable: "--font-anek-tamil",
  subsets: ["latin", "tamil"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const halant = Halant({
  variable: "--font-halant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

// Cinematic English Serifs & Heritage Scripts
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const kavivanar = Kavivanar({
  variable: "--font-kavivanar",
  subsets: ["latin", "tamil"],
  weight: "400",
  display: "swap",
  preload: false,
});

const tiroTamil = Tiro_Tamil({
  variable: "--font-tiro-tamil",
  subsets: ["latin", "tamil"],
  weight: "400",
  display: "swap",
  preload: false,
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const majorMono = Major_Mono_Display({
  variable: "--font-major-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const notoSerifTamil = Noto_Serif_Tamil({
  variable: "--font-noto-serif-tamil",
  subsets: ["tamil"],
  weight: ["400", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#161210",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: ROUTE_METADATA.home.title,
    template: "%s | OSU Tamil Sangam",
  },
  description: ROUTE_METADATA.home.description,
  applicationName: "OSU Tamil Sangam",
  keywords: [
    "OSU Tamil Sangam",
    "Tamil Sangam at OSU",
    "Ohio State Tamil Sangam",
    "Tamil Sangam Ohio State University",
    "Tamil student organization OSU",
    "Indian South Asian student organizations at Ohio State",
    "Columbus Tamil student community",
    "The Ohio State University",
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
    "தமிழ் சங்கம்",
    "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
    "ஓஹையோ தமிழ் சங்கம்",
    "ஓஹையோ ஸ்டேட் பல்கலைக்கழகம்",
    "கொலம்பஸ் தமிழ்",
  ],
  category: "Student Organization",
  classification: "Collegiate Cultural Student Organization",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "OSU Tamil Sangam Executive Board", url: `${SITE_URL}/board` }],
  creator: "OSU Tamil Sangam Executive Board",
  publisher: "The Ohio State University Tamil Sangam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    ...constructAlternates("/"),
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: ROUTE_METADATA.home.title,
    description: ROUTE_METADATA.home.description,
    url: SITE_URL,
    siteName: "OSU Tamil Sangam",
    locale: "en_US",
    alternateLocale: "ta_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "OSU Tamil Sangam · The Ohio State University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ROUTE_METADATA.home.title,
    description: ROUTE_METADATA.home.description,
    site: "@tamilsangam.osu",
    creator: "@tamilsangam.osu",
    images: [`${SITE_URL}/opengraph-image`],
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
  robots: DEFAULT_ROBOTS,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    "apple-mobile-web-app-title": "OSU Tamil Sangam",
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
      className={`${muktaMalar.variable} ${jetbrainsMono.variable} ${syne.variable} ${anekTamil.variable} ${halant.variable} ${marcellus.variable} ${prata.variable} ${cormorant.variable} ${outfit.variable} ${kavivanar.variable} ${tiroTamil.variable} ${azeretMono.variable} ${fragmentMono.variable} ${majorMono.variable} ${notoSerifTamil.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof window==='undefined')return;try{var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var lt=localStorage.getItem('sangam_lite_mode')==='true';var tr=localStorage.getItem('sangam_tier')==='C';if(rm||lt||tr){document.documentElement.classList.add('sangam-fallback');}}catch(e){}function clickHandler(e){var g=e.target&&e.target.closest?e.target.closest('[data-guide-category]'):null;if(g){var c=g.getAttribute('data-guide-category');window.__pendingGuideCategory=c;window.dispatchEvent(new CustomEvent('guide-category-click',{detail:c}));}var m=e.target&&e.target.closest?e.target.closest('[data-membership-type]'):null;if(m){var t=m.getAttribute('data-membership-type');window.__pendingMembershipType=t;window.dispatchEvent(new CustomEvent('membership-type-select',{detail:t}));}}document.addEventListener('click',clickHandler,true);function sync(e){var t=e.target;if(!t)return;if(t.id==='guestbook-name')window.__pendingGuestbookName=t.value;if(t.id==='guestbook-email')window.__pendingGuestbookEmail=t.value;if(t.id==='guestbook-major')window.__pendingGuestbookMajor=t.value;window.dispatchEvent(new CustomEvent('guestbook-input-sync'));}document.addEventListener('input',sync,true);document.addEventListener('change',sync,true);})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body text-[var(--text-primary)] relative overflow-x-clip w-full max-w-[100vw]">
        {/* Floating Tamil Letter Cursor */}
        <ViewfinderCursor />
        <HeritageTextureOverlay variant="sandstone" opacity={0.03} blendMode="multiply" className="parchment-grain" />

        {/* Linked Schema.org Knowledge Graph (@graph) for Search Engines */}
        <RootGraphJsonLd />

        <Providers>
          <div id="app-root" className="min-h-full flex flex-col flex-1">
            <AppShell>{children}</AppShell>
          </div>
          <GlobalCanvas />
        </Providers>
      </body>
    </html>
  );
}
