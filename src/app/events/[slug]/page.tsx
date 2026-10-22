import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EVENTS } from "@/data/events";
import { getRandomizedEventPhotos } from "@/lib/event-photos";
import { EventDossierView } from "@/components/events/EventDossierView";
import { EventJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { constructAlternates, constructCanonical, DEFAULT_ROBOTS, SITE_URL } from "@/lib/seo";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);
  if (!event) return {};

  const title = `${event.titleEn} (${event.titleTa}) | OSU Tamil Sangam Events`;
  const summary = event.descriptionEn || event.taglineEn;
  const description = `${summary} — Hosted by OSU Tamil Sangam at ${event.location}, The Ohio State University on ${event.date}.`;
  const canonical = constructCanonical(`/events/${slug}`);
  const ogImage = event.posterImage?.startsWith("http")
    ? event.posterImage
    : `${SITE_URL}${event.posterImage || "/opengraph-image"}`;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      event.titleEn,
      event.titleTa,
      "OSU Tamil Sangam Events",
      "Tamil Sangam at OSU",
      "Ohio State cultural events",
      ...event.tags,
    ],
    alternates: constructAlternates(`/events/${slug}`),
    robots: DEFAULT_ROBOTS,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "OSU Tamil Sangam",
      locale: "en_US",
      alternateLocale: "ta_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${event.titleEn} - OSU Tamil Sangam`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Event Dossier Page (/events/[slug]).
 * Static pre-rendered via generateStaticParams() for instantaneous Googlebot indexing,
 * enriched with Schema.org Event JSON-LD, BreadcrumbList, and full metadata.
 */
export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    return notFound();
  }

  const randomizedPhotos = await getRandomizedEventPhotos(slug, 5, 8);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Events", url: "/events" },
    { name: event.titleEn, url: `/events/${event.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <EventJsonLd event={event} />
      <EventDossierView key={event.slug} event={event} photos={randomizedPhotos} />
    </>
  );
}
