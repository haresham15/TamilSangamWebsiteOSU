import type { Metadata } from "next";
import { EVENTS } from "@/data/events";
import { SingleEventJsonLd, BreadcrumbJsonLd } from "@/components/global/JsonLd";

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    return {
      title: "Event Details | OSU Tamil Sangam",
      description: "Ohio State University Tamil Sangam collegiate event details.",
    };
  }

  const title = `${event.titleEn} | ${event.titleTa}`;
  const description = `${event.descriptionEn} Happening on ${event.date} (${event.time}) at ${event.location}. Open to all Ohio State students and friends.`;
  const poster = event.posterImage || "/emblem.svg";

  return {
    title,
    description,
    keywords: [
      event.titleEn,
      event.titleTa,
      "OSU Tamil Sangam",
      "Ohio State cultural festival",
      "South Asian campus events",
      event.location,
      event.statusBadgeEn,
      ...(event.tags || []),
      "Columbus Tamil events",
      "Ohio Union Tamil Sangam",
    ],
    alternates: {
      canonical: `https://osutamilsangam.org/events/${event.slug}`,
    },
    openGraph: {
      title: `${event.titleEn} · OSU Tamil Sangam`,
      description,
      url: `https://osutamilsangam.org/events/${event.slug}`,
      siteName: "OSU Tamil Sangam",
      type: "article",
      images: [
        {
          url: poster,
          width: 1200,
          height: 800,
          alt: `${event.titleEn} Event Poster`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.titleEn} · OSU Tamil Sangam`,
      description,
      images: [poster],
    },
  };
}

export default async function EventDetailLayout({
  children,
  params,
}: EventLayoutProps) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);

  return (
    <>
      {event && (
        <>
          <SingleEventJsonLd event={event} />
          <BreadcrumbJsonLd
            items={[
              { name: "Home", url: "/" },
              { name: "Events", url: "/events" },
              { name: event.titleEn, url: `/events/${event.slug}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
