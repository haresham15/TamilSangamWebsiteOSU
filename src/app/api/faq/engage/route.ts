import { NextRequest, NextResponse } from "next/server";
import { createDailyVisitorHash, isFaqEngagementKind, recordFaqEngagement } from "@/lib/faq-engagement/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isLikelyBot(userAgent: string | null, acceptLanguage: string | null) {
  return !acceptLanguage || !userAgent || /bot|crawler|spider|preview/i.test(userAgent);
}

/** Records only anonymous aggregate engagement. A 204 response never reveals dedupe/rate-limit state. */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return new NextResponse(null, { status: 400 });
    const { faqId, kind } = body as { faqId?: unknown; kind?: unknown };
    if (typeof faqId !== "string" || !isFaqEngagementKind(kind)) return new NextResponse(null, { status: 400 });

    const userAgent = request.headers.get("user-agent");
    const acceptLanguage = request.headers.get("accept-language");
    if (!userAgent || isLikelyBot(userAgent, acceptLanguage)) return new NextResponse(null, { status: 204 });

    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return new NextResponse(null, { status: 403 });
        }
      } catch {
        return new NextResponse(null, { status: 400 });
      }
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
    const result = recordFaqEngagement(faqId, kind, createDailyVisitorHash(ip, userAgent));
    return new NextResponse(null, { status: result === "invalid" ? 400 : 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
