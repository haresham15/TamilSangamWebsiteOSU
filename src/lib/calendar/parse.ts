import { CalendarEvent } from "./types";

/**
 * Splits a Google Calendar event summary into English and optional Tamil title.
 * Officer convention: "English Title | தமிழ் தலைப்பு"
 * If multiple pipes exist, splits only on the first pipe.
 */
export function parseEventTitle(rawSummary: string): { titleEn: string; titleTa: string | null } {
  if (!rawSummary) {
    return { titleEn: "Untitled Gathering", titleTa: null };
  }

  const pipeIndex = rawSummary.indexOf("|");
  if (pipeIndex === -1) {
    const trimmed = rawSummary.trim();
    return { titleEn: trimmed || "Untitled Gathering", titleTa: null };
  }

  const titleEn = rawSummary.slice(0, pipeIndex).trim() || "Untitled Gathering";
  const rawTa = rawSummary.slice(pipeIndex + 1).trim();
  const titleTa = rawTa.length > 0 ? rawTa : null;

  return {
    titleEn: titleEn || "Untitled Gathering",
    titleTa,
  };
}

/**
 * Decodes HTML entities commonly produced by rich-text editors and Google Calendar.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return _;
      }
    });
}

/**
 * Strips HTML tags, converts line breaks to newlines, decodes entities,
 * and extracts any trailing "slug: <slug>" directive.
 */
export function parseEventDescription(rawDescription?: string): {
  description: string;
  slug: string | null;
} {
  if (!rawDescription) {
    return { description: "", slug: null };
  }

  // Convert break tags and paragraph tags to newlines
  let text = rawDescription
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    // Convert <a> tags to link with href or text
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href, inner) => {
      const cleanInner = inner.replace(/<[^>]+>/g, "").trim();
      return cleanInner && cleanInner !== href ? `${cleanInner} (${href})` : href;
    })
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, "");

  text = decodeHtmlEntities(text);

  // Split lines to search for trailing slug line: ^slug:\s*([a-z0-9-]+)$
  const rawLines = text.split(/\r?\n/);
  // Find trailing non-empty line
  let slug: string | null = null;
  let slugLineIndex = -1;

  for (let i = rawLines.length - 1; i >= 0; i--) {
    const line = rawLines[i].trim();
    if (!line) continue;
    const match = line.match(/^slug:\s*([a-z0-9-]+)$/i);
    if (match) {
      slug = match[1].toLowerCase();
      slugLineIndex = i;
    }
    // Only check the last non-empty line for the slug directive
    break;
  }

  if (slugLineIndex !== -1) {
    rawLines.splice(slugLineIndex, 1);
  }

  // Clean up excess blank lines (max 2 consecutive newlines)
  const cleanedText = rawLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return {
    description: cleanedText,
    slug,
  };
}

/**
 * Handles all-day exclusive end date calculation.
 * Google Calendar API returns exclusive end.date for all-day events.
 * Example: single-day Oct 31 event has start.date="2026-10-31" and end.date="2026-11-01".
 * We return inclusive end date ("2026-10-31").
 */
export function normalizeAllDayDates(
  startDateStr: string,
  endDateStr: string
): { start: string; end: string } {
  // Parse year, month, day components
  const [sy, sm, sd] = startDateStr.split("-").map((s) => parseInt(s, 10));
  const [ey, em, ed] = endDateStr.split("-").map((s) => parseInt(s, 10));

  const startObj = new Date(Date.UTC(sy, sm - 1, sd));
  const endObj = new Date(Date.UTC(ey, em - 1, ed));

  // Subtract 1 day (86,400,000 ms) from exclusive end
  const inclusiveEnd = new Date(endObj.getTime() - 86400000);

  // If inclusive end is before start (e.g. malformed input), fallback to start
  const finalEnd = inclusiveEnd < startObj ? startObj : inclusiveEnd;

  const endIso = finalEnd.toISOString().split("T")[0];

  return {
    start: startDateStr,
    end: endIso,
  };
}

/**
 * Raw Google Calendar API event item schema (relevant fields).
 */
export interface GoogleCalendarApiItem {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

/**
 * Normalizes a Google Calendar API item into a clean, uniform CalendarEvent.
 */
export function normalizeGoogleEvent(item: GoogleCalendarApiItem): CalendarEvent | null {
  if (item.status === "cancelled") {
    return null;
  }

  const { titleEn, titleTa } = parseEventTitle(item.summary ?? "");
  const { description, slug } = parseEventDescription(item.description);

  const isAllDay = Boolean(item.start?.date && !item.start?.dateTime);

  let start = "";
  let end = "";

  if (isAllDay && item.start?.date && item.end?.date) {
    const dates = normalizeAllDayDates(item.start.date, item.end.date);
    start = dates.start;
    end = dates.end;
  } else if (item.start?.dateTime) {
    start = item.start.dateTime;
    end = item.end?.dateTime ?? item.start.dateTime;
  } else if (item.start?.date) {
    start = item.start.date;
    end = item.end?.date ?? item.start.date;
  } else {
    return null; // Invalid event without dates
  }

  return {
    id: item.id,
    slug,
    titleEn,
    titleTa,
    description,
    location: item.location?.trim() ?? "The Ohio State University, Columbus, OH",
    allDay: isAllDay,
    start,
    end,
    googleLink: item.htmlLink ?? "https://calendar.google.com",
  };
}

/**
 * Returns YYYY-MM-DD date key in America/New_York timezone regardless of client machine time.
 */
export function getNewYorkDateKey(dateStrOrIso: string): string {
  // If it's already a plain YYYY-MM-DD date string (all-day event)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStrOrIso)) {
    return dateStrOrIso;
  }

  const date = new Date(dateStrOrIso);
  if (isNaN(date.getTime())) {
    return "";
  }

  // Format in America/New_York using Intl.DateTimeFormat parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  let year = "";
  let month = "";
  let day = "";

  for (const part of parts) {
    if (part.type === "year") year = part.value;
    if (part.type === "month") month = part.value;
    if (part.type === "day") day = part.value;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Formats a start/end time into human-friendly Eastern Time (e.g. "8:00 PM – 11:30 PM ET").
 * Always specifies "ET" rather than "EST" / "EDT".
 */
export function formatEventTimeET(startIso: string, endIso?: string, allDay = false): string {
  if (allDay) {
    return "All Day";
  }

  const startDate = new Date(startIso);
  if (isNaN(startDate.getTime())) return "";

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedStart = timeFormatter.format(startDate);

  if (!endIso) {
    return `${formattedStart} ET`;
  }

  const endDate = new Date(endIso);
  if (isNaN(endDate.getTime())) {
    return `${formattedStart} ET`;
  }

  const formattedEnd = timeFormatter.format(endDate);
  return `${formattedStart} – ${formattedEnd} ET`;
}

/**
 * Formats event date into friendly display (e.g. "Saturday, October 31, 2026").
 */
export function formatEventDateDisplay(startIso: string): string {
  const dateKey = getNewYorkDateKey(startIso);
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map((v) => parseInt(v, 10));
  // Create UTC date with same year, month, day to avoid local timezone offset shifts
  const utcDate = new Date(Date.UTC(y, m - 1, d));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(utcDate);
}
