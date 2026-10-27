import { Suspense } from "react";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { EventsClientView } from "@/components/events/EventsClientView";
import { CalendarEventJsonLd } from "@/components/calendar/CalendarEventJsonLd";

export const revalidate = 300;

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
