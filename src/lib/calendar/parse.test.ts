import { describe, it, expect } from "vitest";
import {
  parseEventTitle,
  parseEventDescription,
  decodeHtmlEntities,
  normalizeAllDayDates,
  getNewYorkDateKey,
  formatEventTimeET,
} from "./parse";

describe("Google Calendar Parser (parse.ts)", () => {
  describe("parseEventTitle", () => {
    it("splits title with pipe into English and Tamil", () => {
      const res = parseEventTitle("Kollywood Kollai | கோலிவுட் கொள்ளை");
      expect(res.titleEn).toBe("Kollywood Kollai");
      expect(res.titleTa).toBe("கோலிவுட் கொள்ளை");
    });

    it("handles title without pipe (Tamil is null)", () => {
      const res = parseEventTitle("Welcome Chai Social");
      expect(res.titleEn).toBe("Welcome Chai Social");
      expect(res.titleTa).toBeNull();
    });

    it("handles title with multiple pipe characters by splitting on the first pipe only", () => {
      const res = parseEventTitle("Streetside Sapad | Kothu & Chai | தெருவோரச் சாப்பாடு");
      expect(res.titleEn).toBe("Streetside Sapad");
      expect(res.titleTa).toBe("Kothu & Chai | தெருவோரச் சாப்பாடு");
    });

    it("handles whitespace and empty titles gracefully", () => {
      const res1 = parseEventTitle("   ");
      expect(res1.titleEn).toBe("Untitled Gathering");
      expect(res1.titleTa).toBeNull();

      const res2 = parseEventTitle("Single |   ");
      expect(res2.titleEn).toBe("Single");
      expect(res2.titleTa).toBeNull();
    });
  });

  describe("parseEventDescription & HTML stripping", () => {
    it("extracts and strips slug directive from the last line", () => {
      const raw = "Come join us for hot chai and samosas on the Oval.\n\nslug: chai-social-2026";
      const res = parseEventDescription(raw);
      expect(res.slug).toBe("chai-social-2026");
      expect(res.description).toBe("Come join us for hot chai and samosas on the Oval.");
      expect(res.description.includes("slug:")).toBe(false);
    });

    it("handles case-insensitive slug directive", () => {
      const raw = "Annual harvest celebration.\nSLUG: PONGAL-2027";
      const res = parseEventDescription(raw);
      expect(res.slug).toBe("pongal-2027");
      expect(res.description).toBe("Annual harvest celebration.");
    });

    it("leaves description alone if no slug is present", () => {
      const raw = "Regular meeting in the Union.";
      const res = parseEventDescription(raw);
      expect(res.slug).toBeNull();
      expect(res.description).toBe("Regular meeting in the Union.");
    });

    it("strips HTML tags, converts br/p to newlines, and decodes entities", () => {
      const rawHtml =
        "<p>Welcome to <b>Tamil Sangam</b> &amp; friends!<br>Enjoy hot dosa &lt;&gt; &quot;degree kaapi&quot; &amp; sweets.</p><p>Free for all.</p>";
      const res = parseEventDescription(rawHtml);
      expect(res.description).toContain("Welcome to Tamil Sangam & friends!");
      expect(res.description).toContain('Enjoy hot dosa <> "degree kaapi" & sweets.');
      expect(res.description).toContain("Free for all.");
      expect(res.description.includes("<p>")).toBe(false);
      expect(res.description.includes("<br>")).toBe(false);
      expect(res.description.includes("&amp;")).toBe(false);
    });

    it("safely handles <a> links in descriptions", () => {
      const raw = '<p>Check out our photos at <a href="https://photos.app.goo.gl/xyz">Google Photos</a></p>';
      const res = parseEventDescription(raw);
      expect(res.description).toBe("Check out our photos at Google Photos (https://photos.app.goo.gl/xyz)");
    });
  });

  describe("decodeHtmlEntities", () => {
    it("decodes HTML entities correctly", () => {
      expect(decodeHtmlEntities("&lt;tag&gt; &amp; &#39;quotes&#39; &quot;double&quot;")).toBe(
        "<tag> & 'quotes' \"double\""
      );
    });
  });

  describe("normalizeAllDayDates (All-day exclusive end date handling)", () => {
    it("converts single-day all-day event from exclusive to inclusive end date", () => {
      // Oct 31 all-day: start="2026-10-31", exclusive end="2026-11-01"
      const res = normalizeAllDayDates("2026-10-31", "2026-11-01");
      expect(res.start).toBe("2026-10-31");
      expect(res.end).toBe("2026-10-31");
    });

    it("converts multi-day all-day event correctly", () => {
      // 3-day event: Nov 10 through Nov 12 (Google API end="2026-11-13")
      const res = normalizeAllDayDates("2026-11-10", "2026-11-13");
      expect(res.start).toBe("2026-11-10");
      expect(res.end).toBe("2026-11-12");
    });
  });

  describe("Timezone safety: America/New_York date key", () => {
    it("timed event on Oct 31 8:00 PM ET lands on Oct 31 regardless of machine timezone", () => {
      // 8:00 PM EDT is UTC-4 -> 2026-10-31T20:00:00-04:00 (which is 2026-11-01T00:00:00Z in UTC!)
      const isoWithOffset = "2026-10-31T20:00:00-04:00";
      const dateKey = getNewYorkDateKey(isoWithOffset);
      expect(dateKey).toBe("2026-10-31");
    });

    it("timed event at 11:30 PM ET on Oct 31 lands on Oct 31", () => {
      const isoLateNight = "2026-10-31T23:30:00-04:00";
      const dateKey = getNewYorkDateKey(isoLateNight);
      expect(dateKey).toBe("2026-10-31");
    });

    it("timed event in UTC format (2026-11-01T00:00:00Z) resolves to Oct 31 in New York", () => {
      const utcIso = "2026-11-01T00:00:00Z";
      const dateKey = getNewYorkDateKey(utcIso);
      expect(dateKey).toBe("2026-10-31");
    });

    it("formats time display with ET and not EST", () => {
      const formatted = formatEventTimeET("2026-10-31T20:00:00-04:00", "2026-10-31T23:30:00-04:00");
      expect(formatted).toBe("8:00 PM – 11:30 PM ET");
      expect(formatted.includes("EST")).toBe(false);
      expect(formatted.includes("EDT")).toBe(false);
    });
  });
});
