export type CalendarEvent = {
  id: string;
  slug: string | null;       // from "slug: xyz" line in description, if present
  titleEn: string;
  titleTa: string | null;    // from "English | தமிழ்" title convention
  description: string;       // plain text, HTML stripped/sanitized
  location: string;
  allDay: boolean;
  start: string;             // ISO with offset
  end: string;               // ISO with offset (inclusive end date for all-day)
  googleLink: string;        // e.htmlLink
  isMock?: boolean;
};

export type CalendarResponse = {
  events: CalendarEvent[];
  isMock: boolean;
  error: string | null;
  updatedAt?: string;
  subscribeUrl?: string;
  webcalUrl?: string;
};
