import { MetadataRoute } from "next";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { ALL_PILLARS } from "@/data/pillars";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core static pages with exact priority weights
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/join`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/board`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ideas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/suggestions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic Pillar Pages (The Five Pillars)
  const pillarPages: MetadataRoute.Sitemap = ALL_PILLARS.map((pillar) => ({
    url: `${SITE_URL}/pillars/${pillar.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Dynamic Event Dossier pages with image attachments for Google Image Search
  const eventPages: MetadataRoute.Sitemap = EVENTS.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: event.status === "upcoming" ? 0.95 : 0.8,
    images: [
      event.posterImage?.startsWith("http")
        ? event.posterImage
        : `${SITE_URL}${event.posterImage || "/emblem.svg"}`,
    ],
  }));

  // Dynamic Gallery Album pages with photo previews
  const galleryPages: MetadataRoute.Sitemap = GALLERY_ALBUMS.map((album) => ({
    url: `${SITE_URL}/gallery/${album.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
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
