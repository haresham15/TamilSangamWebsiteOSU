import { createHmac } from "node:crypto";
import { FAQS } from "@/data/faq";
import {
  FAQ_ENGAGEMENT_KINDS,
  type FaqEngagementKind,
  type PopularFaqResult,
  rankPopularFaqs,
} from "./contracts";
import { getFaqEngagementStore } from "./store";

const FIVE_MINUTES = 300_000;
let cachedPopular: { expiresAt: number; value: PopularFaqResult } | undefined;

function dayStamp(now: Date) {
  return now.toISOString().slice(0, 10);
}

function daysAgo(now: Date, days: number) {
  const result = new Date(now);
  result.setUTCDate(now.getUTCDate() - days);
  return dayStamp(result);
}

function minuteStamp(now: Date) {
  return now.toISOString().slice(0, 16);
}

export function isFaqEngagementKind(value: unknown): value is FaqEngagementKind {
  return typeof value === "string" && (FAQ_ENGAGEMENT_KINDS as readonly string[]).includes(value);
}

export function createDailyVisitorHash(ip: string, userAgent: string, now = new Date()) {
  const salt = process.env.FAQ_ENGAGEMENT_SALT ?? "local-development-only-faq-salt";
  return createHmac("sha256", `${salt}:${dayStamp(now)}`).update(`${ip}\n${userAgent}`).digest("hex").slice(0, 32);
}

export function getPopularFaqs(now = new Date()) {
  const nowMs = now.getTime();
  if (cachedPopular && cachedPopular.expiresAt > nowMs) return cachedPopular.value;
  const value = rankPopularFaqs(FAQS, getFaqEngagementStore().listDailyCounts(daysAgo(now, 27)), now);
  cachedPopular = { value, expiresAt: nowMs + FIVE_MINUTES };
  return value;
}

export function recordFaqEngagement(
  faqId: string,
  kind: FaqEngagementKind,
  visitorHash: string,
  now = new Date()
) {
  void kind; // The aggregate intentionally stores no event-level behavioural profile.
  if (!FAQS.some((faq) => faq.id === faqId)) return "invalid" as const;
  const result = getFaqEngagementStore().record({
    faqId,
    visitorHash,
    day: dayStamp(now),
    minuteBucket: minuteStamp(now),
    nowMs: now.getTime(),
  });
  if (result === "recorded") cachedPopular = undefined;
  return result;
}
