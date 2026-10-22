import type { Metadata } from "next";

/**
 * Single Source of Truth (SSOT) for SEO, Canonical URLs, and OpenGraph configuration
 * across OSU Tamil Sangam (The Ohio State University).
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tamil-sangam-website-osu.vercel.app"
).replace(/\/$/, "");

export const SEO_ENTITY = {
  name: "OSU Tamil Sangam",
  legalName: "Tamil Sangam at The Ohio State University",
  tamilName: "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
  alternateNames: [
    "Tamil Sangam at OSU",
    "Ohio State Tamil Sangam",
    "Tamil Sangam Ohio State University",
    "Tamil Sangam at The Ohio State University",
    "OSU Tamil Sangam",
    "Tamil Student Association OSU",
    "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
    "OSU TS",
  ],
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
  contactEmail: "osutamilsangam@gmail.com",
  socials: [
    "https://www.instagram.com/osutamilsangam",
    "https://groupme.com/join_group/osutamilsangam",
    "https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam",
    "https://github.com/haresham15/TamilSangamWebsiteOSU",
  ],
};

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
    languages: {
      "en-US": canonical,
      "ta-IN": canonical,
      "x-default": canonical,
    },
  };
}

export const ROUTE_METADATA = {
  home: {
    title: "OSU Tamil Sangam | Official Tamil Student Organization at The Ohio State University",
    description:
      "Welcome to OSU Tamil Sangam ( ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம் ) — the official Tamil cultural student organization at The Ohio State University in Columbus, Ohio. 100% free membership, Kollywood galas, Pongal banquets, and Buckeye community.",
    path: "/",
  },
  events: {
    title: "Campus Events & Festivals | OSU Tamil Sangam at Ohio State",
    description:
      "Explore upcoming and archived gatherings hosted by Tamil Sangam at OSU — including Kollywood Kollai, Diwali, Pongal banquets, Namma Jathara Carnival, and South Oval picnics in Columbus, OH.",
    path: "/events",
  },
  about: {
    title: "About Us & Heritage (யாதும் ஊரே யாவரும் கேளிர்) | OSU Tamil Sangam",
    description:
      "Learn the history, mission, and Five Pillars (Aatam, Paatam, Kondatam, Santhippum, Katral) of Tamil Sangam at The Ohio State University — a home for all languages on the banks of the Olentangy.",
    path: "/about",
  },
  board: {
    title: "Executive Board & Student Leadership | OSU Tamil Sangam",
    description:
      "Meet the elected Executive Board officers and Subcommittee Coordinators leading OSU Tamil Sangam across The Ohio State University campus in Columbus, Ohio.",
    path: "/board",
  },
  gallery: {
    title: "Photo Gallery & 35mm Campus Archive | OSU Tamil Sangam",
    description:
      "Browse candid photographs, cultural dance performances, banana-leaf feasts, and South Oval memories from Tamil Sangam at OSU.",
    path: "/gallery",
  },
  guide: {
    title: "Student Guide & Frequently Asked Questions | OSU Tamil Sangam",
    description:
      "Everything you need to know about joining Tamil Sangam at OSU: 100% free zero-dues membership, open to all majors and languages at Ohio State, Columbus Tamil dining, and campus resources.",
    path: "/guide",
  },
  ideas: {
    title: "The Ideas Hearth — Propose a Campus Event | OSU Tamil Sangam",
    description:
      "Submit event proposals, music jam ideas, Tamil language workshops, and campus collaborations directly to the OSU Tamil Sangam Executive Board.",
    path: "/ideas",
  },
  suggestions: {
    title: "The Ideas Hearth — Propose a Campus Event | OSU Tamil Sangam",
    description:
      "Submit event proposals, music jam ideas, Tamil language workshops, and campus collaborations directly to the OSU Tamil Sangam Executive Board.",
    path: "/suggestions",
  },
  join: {
    title: "Join OSU Tamil Sangam | Free Membership Guestbook at Ohio State",
    description:
      "Join Tamil Sangam at The Ohio State University. 100% free, zero dues, and open to every Buckeye student regardless of language. Sign our campus guestbook today.",
    path: "/join",
  },
} as const;

export function buildRouteMetadata(config: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  image?: string;
  imageAlt?: string;
}): Metadata {
  const canonical = constructCanonical(config.path);
  const ogImage = config.image || `${SITE_URL}/opengraph-image`;
  const ogAlt = config.imageAlt || `${config.title} - OSU Tamil Sangam`;

  return {
    title: {
      absolute: config.title,
    },
    description: config.description,
    keywords: config.keywords || [
      "OSU Tamil Sangam",
      "Tamil Sangam at OSU",
      "Ohio State Tamil Sangam",
      "Tamil Sangam Ohio State University",
      "Tamil student organization OSU",
      "Indian South Asian student organizations Ohio State",
      "Columbus Tamil student community",
      "The Ohio State University",
      "Columbus Ohio",
      "Aatam Paatam Kondatam",
      "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
    ],
    applicationName: "OSU Tamil Sangam",
    category: "Student Organization",
    creator: "OSU Tamil Sangam Executive Board",
    publisher: "The Ohio State University Tamil Sangam",
    alternates: constructAlternates(config.path),
    robots: DEFAULT_ROBOTS,
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonical,
      siteName: "OSU Tamil Sangam",
      locale: "en_US",
      alternateLocale: "ta_IN",
      type: config.type || "website",
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
      title: config.title,
      description: config.description,
      images: [ogImage],
    },
  };
}
