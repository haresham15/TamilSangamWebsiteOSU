"use client";

import type { FaqEngagementKind } from "@/lib/faq-engagement/contracts";

/** Best-effort telemetry: it never delays or changes the user interaction. */
export function trackFaqEngagement(faqId: string, kind: FaqEngagementKind) {
  if (typeof navigator === "undefined") return;
  const body = JSON.stringify({ faqId, kind });
  if (navigator.sendBeacon?.("/api/faq/engage", new Blob([body], { type: "application/json" }))) return;
  void fetch("/api/faq/engage", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => undefined);
}
