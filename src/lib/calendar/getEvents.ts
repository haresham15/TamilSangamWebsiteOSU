import "server-only";

import {
  CALENDAR_ID,
  CALENDAR_API_KEY,
  CALENDAR_TIMEZONE,
  CALENDAR_REVALIDATE_SECONDS,
  isCalendarConfigured,
  SUBSCRIBE_URL,
  WEBCAL_URL,
} from "./config";
import { CalendarEvent, CalendarResponse } from "./types";
import { normalizeGoogleEvent, GoogleCalendarApiItem } from "./parse";
import { MOCK_CALENDAR_EVENTS } from "./mockEvents";

/**
 * Server-only fetcher for Google Calendar events.
 * Handles caching via Next.js ISR, error catching, and dev mock fallback.
 * Never throws to callers; returns structured response with error message if failed.
 */
export async function getCalendarEvents(): Promise<CalendarResponse> {
  // If calendar credentials are missing or placeholders:
  if (!isCalendarConfigured) {
    if (process.env.NODE_ENV !== "production") {
      return {
        events: MOCK_CALENDAR_EVENTS,
        isMock: true,
        error: null,
        updatedAt: new Date().toISOString(),
        subscribeUrl: SUBSCRIBE_URL,
        webcalUrl: WEBCAL_URL,
      };
    }
    return {
      events: [],
      isMock: false,
      error: null,
      updatedAt: new Date().toISOString(),
      subscribeUrl: SUBSCRIBE_URL,
      webcalUrl: WEBCAL_URL,
    };
  }

  try {
    // 2 years range: August 1, 2025 to ~18 months into the future
    const timeMin = new Date("2025-08-01T00:00:00Z").toISOString();
    const timeMax = new Date(Date.now() + 18 * 30 * 86400000).toISOString();

    const params = new URLSearchParams({
      key: CALENDAR_API_KEY,
      singleEvents: "true",
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: "250",
      timeZone: CALENDAR_TIMEZONE,
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?${params.toString()}`;

    const res = await fetch(url, {
      next: {
        revalidate: CALENDAR_REVALIDATE_SECONDS,
        tags: ["calendar-events"],
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      // Safe server-side log omitting API Key
      console.error(
        `[GoogleCalendar] API error (status: ${res.status}):`,
        errorText.slice(0, 300)
      );

      // In development, fall back to mock events with warning
      if (process.env.NODE_ENV !== "production") {
        return {
          events: MOCK_CALENDAR_EVENTS,
          isMock: true,
          error: `Google Calendar API returned status ${res.status}. Showing mock events.`,
          updatedAt: new Date().toISOString(),
          subscribeUrl: SUBSCRIBE_URL,
          webcalUrl: WEBCAL_URL,
        };
      }

      return {
        events: [],
        isMock: false,
        error: "Calendar is taking a nap. Try again soon.",
        updatedAt: new Date().toISOString(),
        subscribeUrl: SUBSCRIBE_URL,
        webcalUrl: WEBCAL_URL,
      };
    }

    const data = await res.json();
    const items: GoogleCalendarApiItem[] = data.items ?? [];

    const normalizedEvents: CalendarEvent[] = [];
    for (const item of items) {
      const parsed = normalizeGoogleEvent(item);
      if (parsed) {
        normalizedEvents.push(parsed);
      }
    }

    // Sort ascending by start time
    normalizedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return {
      events: normalizedEvents,
      isMock: false,
      error: null,
      updatedAt: new Date().toISOString(),
      subscribeUrl: SUBSCRIBE_URL,
      webcalUrl: WEBCAL_URL,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GoogleCalendar] Network/fetch error:", message);

    if (process.env.NODE_ENV !== "production") {
      return {
        events: MOCK_CALENDAR_EVENTS,
        isMock: true,
        error: "Failed to connect to Google Calendar API. Showing mock events.",
        updatedAt: new Date().toISOString(),
        subscribeUrl: SUBSCRIBE_URL,
        webcalUrl: WEBCAL_URL,
      };
    }

    return {
      events: [],
      isMock: false,
      error: "Calendar is taking a nap. Try again soon.",
      updatedAt: new Date().toISOString(),
      subscribeUrl: SUBSCRIBE_URL,
      webcalUrl: WEBCAL_URL,
    };
  }
}

/**
 * Returns a single calendar event by its id or slug.
 */
export async function getCalendarEventById(idOrSlug: string): Promise<CalendarEvent | null> {
  const { events } = await getCalendarEvents();
  return events.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null;
}
