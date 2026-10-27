import { MetadataRoute } from "next";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { ALL_PILLARS } from "@/data/pillars";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseDate = new Date("2026-10-24T12:00:00.000Z");

  const buildAlternates = (path: string = "") => {
    const url = path ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}` : SITE_URL;
    return {
      languages: {
        "en-US": url,
        "ta-IN": url,
        "x-default": url,
      },
    };
  };

  const parseSafeDate = (dateStr: string): Date => {
    const ts = Date.parse(dateStr);
    return !isNaN(ts) ? new Date(ts) : baseDate;
  };

  // Core static routes
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: baseDate,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: buildAlternates("/"),
      images: [`${SITE_URL}/emblem.svg`],
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: baseDate,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildAlternates("/events"),
      images: [`${SITE_URL}/emblem.svg`],
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: buildAlternates("/about"),
      images: [`${SITE_URL}/emblem.svg`],
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: baseDate,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: buildAlternates("/guide"),
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: baseDate,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: buildAlternates("/games"),
    },
    {
      url: `${SITE_URL}/join`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: buildAlternates("/join"),
    },
    {
      url: `${SITE_URL}/board`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: buildAlternates("/board"),
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: baseDate,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: buildAlternates("/gallery"),
    },
    {
      url: `${SITE_URL}/suggestions`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: buildAlternates("/suggestions"),
    },
    {
      url: `${SITE_URL}/initiatives`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: buildAlternates("/initiatives"),
    },
    {
      url: `${SITE_URL}/links`,
      lastModified: baseDate,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates("/links"),
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: baseDate,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: buildAlternates("/privacy"),
    },
  ];

  // Dynamic Pillar Pages (The Five Pillars)
  const pillarPages: MetadataRoute.Sitemap = ALL_PILLARS.map((pillar) => ({
    url: `${SITE_URL}/pillars/${pillar.slug}`,
    lastModified: baseDate,
    changeFrequency: "monthly",
    priority: 0.85,
    alternates: buildAlternates(`/pillars/${pillar.slug}`),
    images: [`${SITE_URL}/emblem.svg`],
  }));

  // Dynamic Event Dossier pages with image attachments for Google Image Search
  const eventPages: MetadataRoute.Sitemap = EVENTS.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: parseSafeDate(event.date),
    changeFrequency: event.status === "upcoming" ? "weekly" : "monthly",
    priority: event.status === "upcoming" ? 0.95 : 0.8,
    alternates: buildAlternates(`/events/${event.slug}`),
    images: [
      event.posterImage?.startsWith("http")
        ? event.posterImage
        : `${SITE_URL}${event.posterImage || "/emblem.svg"}`,
    ],
  }));

  // Dynamic Gallery Album pages with photo previews
  const galleryPages: MetadataRoute.Sitemap = GALLERY_ALBUMS.map((album) => ({
    url: `${SITE_URL}/gallery/${album.slug}`,
    lastModified: parseSafeDate(album.eventDate),
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: buildAlternates(`/gallery/${album.slug}`),
    images: [
      album.coverImage?.startsWith("http")
        ? album.coverImage
        : `${SITE_URL}${album.coverImage || "/emblem.svg"}`,
      ...album.photos.slice(0, 4).map((p) =>
        p.imageUrl?.startsWith("http") ? p.imageUrl : `${SITE_URL}${p.imageUrl}`
      ),
    ].filter(Boolean),
  }));

  return [...staticPages, ...pillarPages, ...eventPages, ...galleryPages];
}
