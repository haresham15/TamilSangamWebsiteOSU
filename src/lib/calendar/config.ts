import "server-only";

// TODO(PLACEHOLDER): replace GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_API_KEY with production credentials
export const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? '';
export const CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY ?? '';
export const CALENDAR_TIMEZONE = 'America/New_York';
export const CALENDAR_REVALIDATE_SECONDS = 300;

// Check if credentials are present and not placeholder values
export const isCalendarConfigured = Boolean(
  CALENDAR_ID &&
  CALENDAR_API_KEY &&
  !CALENDAR_ID.includes('PLACEHOLDER') &&
  !CALENDAR_API_KEY.includes('PLACEHOLDER')
);

// PLACEHOLDER: public subscribe link. Swap in the real calendar ID once the club calendar exists.
// Built from the ID so only one value needs changing:
export const SUBSCRIBE_URL = isCalendarConfigured
  ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(CALENDAR_ID)}`
  : '#'; // TODO(PLACEHOLDER): replace with real subscribe URL when calendar ID is set

export const WEBCAL_URL = isCalendarConfigured
  ? `webcal://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`
  : '#'; // TODO(PLACEHOLDER): replace with real webcal URL when calendar ID is set
