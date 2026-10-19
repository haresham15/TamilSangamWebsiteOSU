import { describe, it, expect } from "vitest";
import {
  escapeIcsText,
  foldIcsLine,
  generateEventIcs,
  generateAlmanacIcs,
  buildGoogleCalendarUrl,
} from "./ics";
import { CalendarEvent } from "./types";

describe("iCalendar Generator (ics.ts)", () => {
  describe("escapeIcsText", () => {
    it("escapes backslashes, semicolons, commas, and newlines", () => {
      const input = "Columbus, OH; Hall \\ Room 101\nNext line";
      const escaped = escapeIcsText(input);
      expect(escaped).toBe("Columbus\\, OH\\; Hall \\\\ Room 101\\nNext line");
    });
  });

  describe("foldIcsLine (RFC 5545 75-octet limit)", () => {
    it("leaves lines shorter than 75 octets untouched", () => {
      const short = "SUMMARY:Kollywood Kollai";
      expect(foldIcsLine(short)).toBe(short);
    });

    it("folds lines exceeding 75 octets with CRLF followed by a single space", () => {
      const longText =
        "DESCRIPTION:This is an extremely long description designed to verify that the RFC 5545 line folding mechanism properly segments content at or before 75 octets without corrupting unicode characters.";
      const folded = foldIcsLine(longText);

      expect(folded).toContain("\r\n ");

      // Check each physical line
      const lines = folded.split("\r\n");
      const encoder = new TextEncoder();
      for (const line of lines) {
        expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      }
    });
  });

  describe("generateEventIcs", () => {
    const testEvent: CalendarEvent = {
      id: "kollywood-kollai-2026",
      slug: "kollywood-kollai",
      titleEn: "Kollywood Kollai",
      titleTa: "கோலிவுட் கொள்ளை",
      description: "An autumn evening of folk dance and cinematic soundtracks.\nFree admission.",
      location: "Ohio Union, 1739 N High St, Columbus, OH",
      allDay: false,
      start: "2026-10-31T20:00:00-04:00",
      end: "2026-10-31T23:30:00-04:00",
      googleLink: "https://calendar.google.com/event?eid=123",
    };

    it("produces valid RFC 5545 calendar structure", () => {
      const ics = generateEventIcs(testEvent);
      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("VERSION:2.0\r\n");
      expect(ics).toContain("PRODID:-//Tamil Sangam at The Ohio State University//Event Calendar//EN\r\n");
      expect(ics).toContain("BEGIN:VEVENT\r\n");
      expect(ics).toContain("UID:kollywood-kollai-2026@tamilsangamosu.org\r\n");
      expect(ics).toContain("DTSTAMP:");
      expect(ics).toContain("DTSTART:");
      expect(ics).toContain("DTEND:");
      expect(ics).toContain("SUMMARY:Kollywood Kollai");
      expect(ics).toContain("Tamil Sangam OSU");
      expect(ics).toContain("LOCATION:Ohio Union\\, 1739 N High St\\, Columbus\\, OH");
      expect(ics).toContain("STATUS:CONFIRMED\r\n");
      expect(ics).toContain("END:VEVENT\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");
    });

    it("includes Event Dossier URL when slug is present", () => {
      const ics = generateEventIcs(testEvent);
      expect(ics).toContain("https://tamilsangamosu.org/events/kollywood-kollai");
    });

    it("handles all-day events with VALUE=DATE and exclusive DTEND", () => {
      const allDayEvent: CalendarEvent = {
        id: "all-day-picnic",
        slug: null,
        titleEn: "All Day Lawn Picnic",
        titleTa: null,
        description: "Relaxed hangout on the lawn.",
        location: "South Oval",
        allDay: true,
        start: "2026-10-15",
        end: "2026-10-15",
        googleLink: "https://calendar.google.com",
      };

      const ics = generateEventIcs(allDayEvent);
      expect(ics).toContain("DTSTART;VALUE=DATE:20261015");
      // End date must be exclusive in RFC 5545 (+1 day -> 20261016)
      expect(ics).toContain("DTEND;VALUE=DATE:20261016");
    });
  });

  describe("generateAlmanacIcs", () => {
    it("generates calendar feed containing multiple VEVENT blocks", () => {
      const events: CalendarEvent[] = [
        {
          id: "evt-1",
          slug: "event-one",
          titleEn: "First Event",
          titleTa: null,
          description: "Desc 1",
          location: "Union",
          allDay: false,
          start: "2026-10-15T18:00:00-04:00",
          end: "2026-10-15T20:00:00-04:00",
          googleLink: "https://calendar.google.com",
        },
        {
          id: "evt-2",
          slug: "event-two",
          titleEn: "Second Event",
          titleTa: "இரண்டாம் நிகழ்வு",
          description: "Desc 2",
          location: "Oval",
          allDay: false,
          start: "2026-10-20T14:00:00-04:00",
          end: "2026-10-20T16:00:00-04:00",
          googleLink: "https://calendar.google.com",
        },
      ];

      const feed = generateAlmanacIcs(events);
      expect(feed).toContain("X-WR-CALNAME:OSU Tamil Sangam Calendar Feed");
      expect(feed.match(/BEGIN:VEVENT/g)?.length).toBe(2);
      expect(feed.match(/END:VEVENT/g)?.length).toBe(2);
    });
  });

  describe("buildGoogleCalendarUrl", () => {
    it("constructs valid Google Calendar TEMPLATE URL with America/New_York timezone", () => {
      const event: CalendarEvent = {
        id: "evt-test",
        slug: "kollywood-kollai",
        titleEn: "Kollywood Kollai",
        titleTa: "கோலிவுட் கொள்ளை",
        description: "Great event",
        location: "Ohio Union",
        allDay: false,
        start: "2026-10-31T20:00:00-04:00",
        end: "2026-10-31T23:30:00-04:00",
        googleLink: "https://calendar.google.com",
      };

      const url = buildGoogleCalendarUrl(event);
      expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
      expect(url).toContain("text=Kollywood+Kollai");
      expect(url).toContain("ctz=America%2FNew_York");
      expect(url).toContain("location=Ohio+Union");
    });
  });
});
