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
import { SITE_URL, ROUTE_METADATA, DEFAULT_ROBOTS, constructAlternates, DEFAULT_KEYWORDS } from "@/lib/seo";
import { ViewfinderCursor } from "@/components/ui/ViewfinderCursor";
import { CinematicBootCurtain } from "@/components/ui/CinematicBootCurtain";

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["latin", "tamil"],
  weight: ["400", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  preload: false,
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Cultural Tamil & Indic Display Typefaces (replaces cold futuristic fonts)
const anekTamil = Anek_Tamil({
  variable: "--font-anek-tamil",
  preload: false,
  subsets: ["latin", "tamil"],
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
  preload: false,
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  preload: false,
  subsets: ["latin"],
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
  preload: false,
  subsets: ["tamil"],
  weight: ["400", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#140C20" },
    { media: "(prefers-color-scheme: dark)", color: "#140C20" },
  ],
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
  keywords: DEFAULT_KEYWORDS,
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/emblem.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
  },
  robots: DEFAULT_ROBOTS,
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "YJJyZIzkF4tlcLo3GJIg3hIosEOiVp-j8t7MLUqffL8",
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
        <link rel="help" href="/llms.txt" type="text/markdown" title="LLM Context Summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Exhaustive LLM Knowledge Base" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof window==='undefined')return;setTimeout(function(){if(window.__ts_curtain_mounted)return;var c=document.getElementById('app-boot-curtain');if(c&&c.style.display!=='none'){document.documentElement.style.overflow='';document.body.style.overflow='';c.style.opacity='0';c.style.pointerEvents='none';setTimeout(function(){if(c)c.style.display='none';},900);}},15000);try{if('scrollRestoration' in history){history.scrollRestoration='manual';}if(!window.location.hash&&!window.location.search.includes('skipHero')){window.scrollTo(0,0);}var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var lt=localStorage.getItem('sangam_lite_mode')==='true';var tr=localStorage.getItem('sangam_tier')==='C';if(rm||lt||tr){document.documentElement.classList.add('sangam-fallback');}}catch(e){}function clickHandler(e){var g=e.target&&e.target.closest?e.target.closest('[data-guide-category]'):null;if(g){var c=g.getAttribute('data-guide-category');window.__pendingGuideCategory=c;window.dispatchEvent(new CustomEvent('guide-category-click',{detail:c}));}var m=e.target&&e.target.closest?e.target.closest('[data-membership-type]'):null;if(m){var t=m.getAttribute('data-membership-type');window.__pendingMembershipType=t;window.dispatchEvent(new CustomEvent('membership-type-select',{detail:t}));}}document.addEventListener('click',clickHandler,true);function sync(e){var t=e.target;if(!t)return;if(t.id==='guestbook-name')window.__pendingGuestbookName=t.value;if(t.id==='guestbook-email')window.__pendingGuestbookEmail=t.value;if(t.id==='guestbook-major')window.__pendingGuestbookMajor=t.value;window.dispatchEvent(new CustomEvent('guestbook-input-sync'));}document.addEventListener('input',sync,true);document.addEventListener('change',sync,true);})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body text-[var(--text-primary)] relative overflow-x-clip w-full max-w-[100vw]">
        {/* Full-Screen Initial Boot Veil: First thing seen on cold load; dissolves cinematically */}
        <CinematicBootCurtain />

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
