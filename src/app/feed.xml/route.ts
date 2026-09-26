import { NextResponse } from "next/server";
import { EVENTS } from "@/data/events";

export const dynamic = "force-dynamic";

function parseEventDate(dateStr: string): string {
  const ts = Date.parse(dateStr);
  if (!isNaN(ts)) {
    return new Date(ts).toUTCString();
  }
  return new Date().toUTCString();
}

export async function GET() {
  const baseUrl = "https://osutamilsangam.org";
  const now = new Date().toUTCString();

  const itemsXml = EVENTS.map((event) => {
    const eventUrl = `${baseUrl}/events/${event.slug}`;
    const pubDate = parseEventDate(event.date);
    const category = event.tags?.[0] || event.statusBadgeEn || "Cultural Event";
    const imageUrl = event.posterImage;

    return `
    <item>
      <title><![CDATA[${event.titleEn} | ${event.titleTa}]]></title>
      <link>${eventUrl}</link>
      <guid isPermaLink="true">${eventUrl}</guid>
      <description><![CDATA[${event.descriptionEn} - Location: ${event.location} at ${event.time}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />` : ""}
    </item>`;
  }).join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OSU Tamil Sangam Events &amp; Festivals</title>
    <link>${baseUrl}</link>
    <description>Official events, cultural celebrations, dance workshops, and community socials from The Ohio State University Tamil Sangam in Columbus, Ohio.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
