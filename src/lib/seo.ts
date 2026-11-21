import type { Metadata } from "next";
import { SITE_CONFIG } from "@/data/siteConfig";

/**
 * Single Source of Truth (SSOT) for SEO, Canonical URLs, and OpenGraph configuration
 * across OSU Tamil Sangam (The Ohio State University).
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "https://tamil-sangam-website-osu.vercel.app";

export const SITE_URL = rawSiteUrl.replace(/\/$/, "");

export const SEO_ENTITY = {
  name: "OSU Tamil Sangam",
  legalName: "Tamil Sangam at The Ohio State University",
  tamilName: "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
  alternateNames: [
    "Tamil Sangam at Ohio State",
    "Ohio State Tamil Sangam",
    "The Ohio State University Tamil Sangam",
    "OSU TS",
    "ஒஹையோ மாநிலப் பல்கலைக்கழகம் தமிழ் சங்கம்",
    "Tamil Sangam at OSU",
    "Tamil Sangam Ohio State University",
    "Tamil Student Association OSU",
    "ஓஹையோ பல்கலைக்கழக தமிழ் சங்கம்",
    "TS",
  ],
  email: "osutamilsangam@gmail.com",
  contactEmail: "osutamilsangam@gmail.com",
  location: "The Ohio State University, Columbus, OH 43210, United States",
  parentOrganization: {
    name: "The Ohio State University",
    url: "https://www.osu.edu",
    sameAs: [
      "https://en.wikipedia.org/wiki/Ohio_State_University",
      "https://www.wikidata.org/wiki/Q309331",
    ],
  },
  address: {
    streetAddress: "1739 N High St, Ohio Union",
    addressLocality: "Columbus",
    addressRegion: "OH",
    postalCode: "43210",
    addressCountry: "US",
  },
  geo: {
    latitude: 40.0067,
    longitude: -83.0305,
  },
  areaServed: ["The Ohio State University", "Columbus, Ohio"],
  languages: ["en", "ta"],
  memberOf: "Ohio State Student Activities",
  socials: [
    SITE_CONFIG.instagramUrl,
    "https://www.tiktok.com/@osutamilsangam",
    SITE_CONFIG.groupMeUrl,
    "https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam",
    "https://github.com/haresham15/TamilSangamWebsiteOSU",
  ],
};

export const DEFAULT_KEYWORDS = [
  "OSU Tamil Sangam",
  "Tamil Sangam at Ohio State",
  "Ohio State Tamil Sangam",
  "The Ohio State University Tamil Sangam",
  "OSU TS",
  "Tamil Sangam at OSU",
  "Tamil Sangam Ohio State University",
  "Tamil student organization OSU",
  "Ohio State Indian student organization",
  "Ohio State South Asian student organizations",
  "Columbus Tamil community",
  "Columbus Tamil events",
  "Columbus Indian grocery stores",
  "Indian restaurants near OSU",
  "Tamil word games",
  "Tamil Wordle Solla",
  "Tamil Connections Thodarpu",
  "Diwali Ohio State University",
  "Pongal celebration OSU",
  "The Ohio State University",
  "Columbus Ohio",
  "Aatam Paatam Kondatam",
  "ஒஹையோ மாநிலப் பல்கலைக்கழகம் தமிழ் சங்கம்",
  "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
];

export const DEFAULT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export function constructCanonical(path: string = ""): string {
  if (!path || path === "/") return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function constructAlternates(path: string = "") {
  const canonical = constructCanonical(path);
  return {
    canonical,
  };
}

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}

/**
 * Standardized Metadata generator for all App Router pages.
 * Enforces canonical URL, 145-160 char description, OpenGraph, Twitter Cards, and Googlebot directives.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  type = "website",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  const ogImage = image || `${SITE_URL}/opengraph-image`;
  const ogAlt = imageAlt || `${title} | OSU Tamil Sangam — Ohio State University`;

  return {
    title,
    description,
    keywords: keywords || DEFAULT_KEYWORDS,
    applicationName: SEO_ENTITY.name,
    category: "Student Organization",
    creator: "OSU Tamil Sangam Executive Board",
    publisher: "The Ohio State University Tamil Sangam",
    alternates: {
      canonical,
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SEO_ENTITY.name,
      locale: "en_US",
      alternateLocale: ["ta_IN"],
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@tamilsangam.osu",
      creator: "@tamilsangam.osu",
      images: [ogImage],
    },
  };
}

// Backward-compatible alias
export const buildRouteMetadata = buildMetadata;

export const ROUTE_METADATA = {
  home: {
    title: "OSU Tamil Sangam | Official Tamil Student Organization at The Ohio State University",
    description:
      "Official Tamil student organization at The Ohio State University in Columbus, OH. Join for free cultural festivals, Diwali & Pongal celebrations, dance, games, and fellowship.",
    path: "/",
  },
  events: {
    title: "Campus Events & Cultural Festivals | OSU Tamil Sangam",
    description:
      "Explore Tamil and South Asian events at Ohio State University: Diwali galas, Pongal harvest feasts, murder mystery nights, dance showcases, and campus picnics in Columbus.",
    path: "/events",
  },
  about: {
    title: "About Us, Heritage & Five Pillars | OSU Tamil Sangam",
    description:
      "Learn about OSU Tamil Sangam's mission, history since 2021, and the Five Pillars of fellowship rooted in Purananuru 192 on the banks of the Olentangy River in Columbus.",
    path: "/about",
  },
  board: {
    title: "Executive Board Leadership 2026-2027 | OSU Tamil Sangam",
    description:
      "Meet the elected student executive board officers and committee directors leading OSU Tamil Sangam at The Ohio State University in Columbus, Ohio.",
    path: "/board",
  },
  gallery: {
    title: "Campus Photo Vault & Event Archive | OSU Tamil Sangam",
    description:
      "Browse high-resolution 35mm photos, cultural performances, Diwali banquets, and campus memories from Tamil Sangam at The Ohio State University.",
    path: "/gallery",
  },
  games: {
    title: "Sangam Arcade: Tamil Wordle & Puzzle Games | OSU TS",
    description:
      "Play daily Tamil word games: Solla (Tamil Wordle) and Thodarpu (Tamil Connections) with streak tracking, Tanglish clues, and shareable puzzle cards.",
    path: "/games",
  },
  guide: {
    title: "Columbus Tamil Survival Guide & FAQs | OSU Tamil Sangam",
    description:
      "The ultimate guide for Indian & South Asian students at Ohio State: authentic Indian grocery stores in Columbus, Tamil restaurants near OSU campus, housing, and FAQs.",
    path: "/guide",
  },
  dance: {
    title: "Dance Troupe Auditions & Sign-Ups | OSU Tamil Sangam",
    description:
      "Audition for OSU Tamil Sangam collegiate dance troupes. Kuthu, Gaana, classical Bharatanatyam, and Kollywood choreography for Ohio State cultural galas. 100% free.",
    path: "/dance",
  },
  ideas: {
    title: "Suggest an Event & Collaborative Playlist | OSU Tamil Sangam",
    description:
      "Submit event proposals, music jam ideas, and collaborate on the All-OSU Tamil Spotify playlist directly with the OSU Tamil Sangam Executive Board.",
    path: "/ideas",
  },
  suggestions: {
    title: "The Ideas Hearth: Campus Proposals | OSU Tamil Sangam",
    description:
      "Submit event proposals, community initiatives, and collaborate on the All-OSU Tamil playlist directly with the OSU Tamil Sangam leadership.",
    path: "/suggestions",
  },
  join: {
    title: "Join OSU Tamil Sangam | Free Membership Portal",
    description:
      "Sign the campus guestbook to join Tamil Sangam at The Ohio State University. 100% free membership, zero dues, open to all students and language backgrounds.",
    path: "/join",
  },
  initiatives: {
    title: "Campus Initiatives & The Three Pillars | OSU Tamil Sangam",
    description:
      "Discover the three pillars of OSU Tamil Sangam — Aatam (Dance), Paatam (Music), and Kondatam (Celebration) — uniting Buckeyes through arts and fellowship.",
    path: "/initiatives",
  },
  links: {
    title: "Official Quick Links & Social Hub | OSU Tamil Sangam",
    description:
      "All official links for OSU Tamil Sangam: student GroupMe chat, Instagram @tamilsangam.osu, TikTok, event RSVP forms, photo vaults, and campus resources.",
    path: "/links",
  },
  privacy: {
    title: "Privacy Policy & Zero-Tracker Commitment | OSU Tamil Sangam",
    description:
      "Read OSU Tamil Sangam's privacy disclosure detailing anonymous aggregate FAQ telemetry, zero tracking cookies, and commitment to student privacy.",
    path: "/privacy",
  },
  faq: {
    title: "Frequently Asked Questions | OSU Tamil Sangam",
    description:
      "Get answers to top questions about OSU Tamil Sangam: free membership, meeting times, zero dues, language prerequisites, and how to get involved at Ohio State.",
    path: "/faq",
  },
} as const;
