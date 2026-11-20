import { MetadataRoute } from "next";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { ALL_PILLARS } from "@/data/pillars";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const parseSafeDate = (dateStr: string): Date => {
    const ts = Date.parse(dateStr);
    return !isNaN(ts) ? new Date(ts) : currentDate;
  };

  // Core static routes matching strict Phase 5 SEO priority specifications
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [`${SITE_URL}/emblem.svg`, `${SITE_URL}/opengraph-image`],
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [`${SITE_URL}/emblem.svg`],
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/join`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
      images: [`${SITE_URL}/games/opengraph-image`],
    },
    {
      url: `${SITE_URL}/dance`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/links`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [`${SITE_URL}/emblem.svg`],
    },
    {
      url: `${SITE_URL}/board`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ideas`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/suggestions`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/initiatives`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Dynamic Pillar Pages (The Five Pillars)
  const pillarPages: MetadataRoute.Sitemap = ALL_PILLARS.map((pillar) => ({
    url: `${SITE_URL}/pillars/${pillar.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.8,
    images: [`${SITE_URL}/emblem.svg`],
  }));

  // Dynamic Event Dossier pages with image attachments for Google Image Search
  const eventPages: MetadataRoute.Sitemap = EVENTS.map((event) => {
    const album = GALLERY_ALBUMS.find(
      (a) => a.eventSlug === event.slug || a.slug === event.slug
    );
    const albumImages = album
      ? [
          album.coverImage?.startsWith("http")
            ? album.coverImage
            : `${SITE_URL}${album.coverImage || "/emblem.svg"}`,
          ...album.photos.map((p) =>
            p.imageUrl?.startsWith("http") ? p.imageUrl : `${SITE_URL}${p.imageUrl}`
          ),
        ]
      : [];

    return {
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: parseSafeDate(event.date),
      changeFrequency: event.status === "upcoming" ? "weekly" : "monthly",
      priority: 0.85,
      images: [
        `${SITE_URL}/events/${event.slug}/opengraph-image`,
        event.posterImage?.startsWith("http")
          ? event.posterImage
          : `${SITE_URL}${event.posterImage || "/emblem.svg"}`,
        ...albumImages,
      ].filter(Boolean) as string[],
    };
  });

  return [...staticPages, ...pillarPages, ...eventPages];
}
