import { Suspense } from "react";
import type { Metadata } from "next";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { EventsClientView } from "@/components/events/EventsClientView";
import { CalendarEventJsonLd } from "@/components/calendar/CalendarEventJsonLd";
import { BreadcrumbJsonLd, EventsCollectionJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.events.title,
  description: ROUTE_METADATA.events.description,
  path: "/events",
  keywords: [
    "OSU Tamil Sangam events",
    "Diwali 2026 Ohio State",
    "Diwali celebration OSU",
    "Pongal festival Columbus Ohio",
    "Columbus Indian cultural festivals",
    "OSU South Asian events",
    "Tamil cultural nights Ohio State",
    "Ohio Union South Asian banquets",
  ],
});

export default async function EventsPage() {
  const calendarData = await getCalendarEvents();
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Events", url: "/events" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <EventsCollectionJsonLd />
      <CalendarEventJsonLd events={calendarData.events} />
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        Campus Events, Cultural Festivals &amp; Celebrations | OSU Tamil Sangam at The Ohio State University
      </h1>
      <Suspense fallback={<HeroKolamLoader route="/events" />}>
        <EventsClientView initialCalendarData={calendarData} />
      </Suspense>
    </>
  );
}
