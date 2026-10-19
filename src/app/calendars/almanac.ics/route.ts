import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { generateAlmanacIcs } from "@/lib/calendar/ics";

export const dynamic = "force-dynamic";

export async function GET() {
  const { events } = await getCalendarEvents();
  const icsData = generateAlmanacIcs(events);

  return new NextResponse(icsData, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sangam-almanac.ics"',
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
