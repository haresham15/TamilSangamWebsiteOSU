import type { Metadata } from "next";
import { Suspense } from "react";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { EventsClientView } from "@/components/events/EventsClientView";
import { CalendarEventJsonLd } from "@/components/calendar/CalendarEventJsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.events.title,
  description: ROUTE_METADATA.events.description,
  path: ROUTE_METADATA.events.path,
  keywords: [
    "Campus Events & Festivals OSU Tamil Sangam",
    "Tamil Sangam at OSU events",
    "Ohio State Tamil events",
    "Kollywood Kollai OSU",
    "OSU Diwali",
    "Pongal banquets Ohio State",
    "Namma Jathara Carnival",
    "South Oval picnics Columbus OH",
    "Tamil student organization OSU",
  ],
});

export default async function EventsPage() {
  const calendarData = await getCalendarEvents();

  return (
    <>
      <CalendarEventJsonLd events={calendarData.events} />
      <Suspense fallback={null}>
        <EventsClientView initialCalendarData={calendarData} />
      </Suspense>
    </>
  );
}
