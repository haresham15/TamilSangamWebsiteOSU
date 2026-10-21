import React from "react";
import { CalendarEvent } from "@/lib/calendar/types";

interface CalendarEventJsonLdProps {
  events: CalendarEvent[];
}

export const CalendarEventJsonLd: React.FC<CalendarEventJsonLdProps> = ({ events }) => {
  // Only generate JSON-LD for upcoming events
  const now = new Date().toISOString();
  const upcoming = events.filter((e) => e.start >= now || e.end >= now).slice(0, 10);

  if (upcoming.length === 0) return null;

  const jsonLdData = upcoming.map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.titleEn,
    alternateName: e.titleTa ?? undefined,
    startDate: e.start,
    endDate: e.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43210",
        addressCountry: "US",
      },
    },
    description: e.description,
    organizer: {
      "@type": "Organization",
      name: "OSU Tamil Sangam",
      url: "https://tamilsangamosu.org",
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c') }}
    />
  );
};
