import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar/getEvents";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCalendarEvents();

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
