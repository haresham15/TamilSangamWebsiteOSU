import { CalendarEvent } from "./types";
import { getNewYorkDateKey } from "./parse";

/**
 * Escapes characters for iCalendar (RFC 5545 Section 3.3.11):
 * Backslashes, semicolons, commas, and newlines must be escaped.
 */
export function escapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds iCalendar content lines to maximum 75 octets per line (RFC 5545 Section 3.1).
 * Continuation lines begin with a single space.
 */
export function foldIcsLine(line: string): string {
  if (!line) return "";

  const encoder = new TextEncoder();
  const maxBytes = 75;

  let currentLine = "";
  const resultLines: string[] = [];
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    // Continuation line has an extra space prefix, so max bytes on continuation is 74
    const limit = resultLines.length === 0 ? maxBytes : maxBytes - 1;

    if (currentBytes + charBytes > limit) {
      resultLines.push(currentLine);
      currentLine = " " + char;
      currentBytes = 1 + charBytes;
    } else {
      currentLine += char;
      currentBytes += charBytes;
    }
  }

  if (currentLine) {
    resultLines.push(currentLine);
  }

  return resultLines.join("\r\n");
}

/**
 * Formats an ISO date/time into iCalendar format (UTC or Date).
 */
export function formatIcsDateTime(isoString: string, isAllDay: boolean, isEnd = false): {
  prop: string;
  value: string;
} {
  if (isAllDay) {
    // Plain YYYY-MM-DD
    const dateKey = getNewYorkDateKey(isoString);
    const [y, m, d] = dateKey.split("-").map((v) => parseInt(v, 10));

    // RFC 5545 all-day DTEND is exclusive! So if isEnd is true, add 1 day
    let targetDate = new Date(Date.UTC(y, m - 1, d));
    if (isEnd) {
      targetDate = new Date(targetDate.getTime() + 86400000);
    }

    const yyyy = targetDate.getUTCFullYear().toString().padStart(4, "0");
    const mm = (targetDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const dd = targetDate.getUTCDate().toString().padStart(2, "0");

    return {
      prop: "VALUE=DATE",
      value: `${yyyy}${mm}${dd}`,
    };
  }

  // Timed event: convert to UTC representation YYYYMMDDTHHMMSSZ
  const date = new Date(isoString);
  const yyyy = date.getUTCFullYear().toString().padStart(4, "0");
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = date.getUTCDate().toString().padStart(2, "0");
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const min = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  return {
    prop: "",
    value: `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`,
  };
}

/**
 * Generates an RFC 5545 VEVENT block for a single CalendarEvent.
 */
export function buildVEvent(event: CalendarEvent): string[] {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");

  const uid = `${event.id}@tamilsangamosu.org`;
  lines.push(`UID:${uid}`);

  // DTSTAMP required by RFC 5545
  const now = new Date();
  const dtstamp = formatIcsDateTime(now.toISOString(), false).value;
  lines.push(`DTSTAMP:${dtstamp}`);

  // DTSTART
  const dtstart = formatIcsDateTime(event.start, event.allDay, false);
  if (dtstart.prop) {
    lines.push(`DTSTART;${dtstart.prop}:${dtstart.value}`);
  } else {
    lines.push(`DTSTART:${dtstart.value}`);
  }

  // DTEND
  const dtend = formatIcsDateTime(event.end, event.allDay, true);
  if (dtend.prop) {
    lines.push(`DTEND;${dtend.prop}:${dtend.value}`);
  } else {
    lines.push(`DTEND:${dtend.value}`);
  }

  // SUMMARY
  const summaryTitle = event.titleTa
    ? `${event.titleEn} (${event.titleTa}) — Tamil Sangam OSU`
    : `${event.titleEn} — Tamil Sangam OSU`;
  lines.push(`SUMMARY:${escapeIcsText(summaryTitle)}`);

  // DESCRIPTION
  let descText = event.description;
  if (event.slug) {
    descText += `\n\nEvent Dossier: https://tamilsangamosu.org/events/${event.slug}`;
  }
  lines.push(`DESCRIPTION:${escapeIcsText(descText)}`);

  // LOCATION
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  // URL
  const eventUrl = event.slug
    ? `https://tamilsangamosu.org/events/${event.slug}`
    : `https://tamilsangamosu.org/events?view=calendar&event=${encodeURIComponent(event.id)}`;
  lines.push(`URL:${escapeIcsText(eventUrl)}`);

  lines.push("STATUS:CONFIRMED");
  lines.push("CATEGORIES:CAMPUS,CULTURAL,STUDENT_LIFE");
  lines.push("END:VEVENT");

  return lines;
}

/**
 * Generates a complete standalone RFC 5545 .ics string for a single CalendarEvent.
 */
export function generateEventIcs(event: CalendarEvent): string {
  const rawLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tamil Sangam at The Ohio State University//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:OSU Tamil Sangam Events",
    "X-WR-TIMEZONE:America/New_York",
    ...buildVEvent(event),
    "END:VCALENDAR",
  ];

  return rawLines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/**
 * Generates an RFC 5545 feed of all events for subscription or bulk export.
 */
export function generateAlmanacIcs(events: CalendarEvent[]): string {
  const eventLines: string[] = [];
  for (const event of events) {
    eventLines.push(...buildVEvent(event));
  }

  const rawLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tamil Sangam at The Ohio State University//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:OSU Tamil Sangam Calendar Feed",
    "X-WR-TIMEZONE:America/New_York",
    ...eventLines,
    "END:VCALENDAR",
  ];

  return rawLines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/**
 * Generates a Google Calendar direct template URL for one-click add to Google Calendar.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const text = event.titleTa ? `${event.titleEn} (${event.titleTa})` : event.titleEn;

  // Format dates for Google Calendar TEMPLATE
  // Timed: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
  // All day: YYYYMMDD/YYYYMMDD
  const dtStart = formatIcsDateTime(event.start, event.allDay, false).value;
  const dtEnd = formatIcsDateTime(event.end, event.allDay, true).value;
  const dates = `${dtStart}/${dtEnd}`;

  let details = event.description;
  if (event.slug) {
    details += `\n\nEvent Dossier: https://tamilsangamosu.org/events/${event.slug}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text,
    dates,
    details,
    location: event.location,
    ctz: "America/New_York",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
