import { MetadataRoute } from "next";
import { EVENTS } from "@/data/events";
import { GALLERY_ALBUMS } from "@/data/gallery";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://osutamilsangam.org";
  const now = new Date();

  // Core static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/board`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/initiatives`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
  ];

  // Dynamic event pages
  const eventPages = EVENTS.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: event.status === "upcoming" ? 0.9 : 0.7,
  }));

  // Dynamic gallery album pages
  const galleryPages = GALLERY_ALBUMS.map((album) => ({
    url: `${baseUrl}/gallery/${album.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...eventPages, ...galleryPages];
}
