import { NextResponse } from "next/server";
import { getPopularFaqs } from "@/lib/faq-engagement/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The response deliberately exposes ranks, never raw behavioural counts. */
export function GET() {
  return NextResponse.json(getPopularFaqs(), {
    headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=60" },
  });
}
