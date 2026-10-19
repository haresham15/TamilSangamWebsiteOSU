import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar/getEvents";
import { generateEventIcs } from "@/lib/calendar/ics";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const { events } = await getCalendarEvents();
  const event = events.find((e) => e.id === decodedId || e.slug === decodedId);

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const icsData = generateEventIcs(event);
  const filename = `${event.slug || event.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.ics`;

  return new NextResponse(icsData, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
