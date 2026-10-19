import type { Metadata } from "next";
import { Suspense } from "react";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { EventsClientView } from "@/components/events/EventsClientView";
import { CalendarEventJsonLd } from "@/components/calendar/CalendarEventJsonLd";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Gatherings — OSU Tamil Sangam",
  description:
    "Explore upcoming cultural festivals, street food nights, picnics, and collegiate traditions at The Ohio State University.",
};

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
