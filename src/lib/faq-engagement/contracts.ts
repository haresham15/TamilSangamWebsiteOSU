import type { FaqItem } from "@/data/faq";

export const FAQ_ENGAGEMENT_KINDS = ["open", "board", "search"] as const;
export type FaqEngagementKind = (typeof FAQ_ENGAGEMENT_KINDS)[number];

export interface DailyFaqCount {
  faqId: string;
  day: string;
  count: number;
}

export interface RankedFaq {
  id: string;
  rank: number;
}

export interface PopularFaqResult {
  ranked: RankedFaq[];
  generatedAt: string;
  coldStart: boolean;
}

export const POPULAR_FAQ_FALLBACK_ID = "faq-02";
const COLD_START_WEIGHTED_ENGAGEMENT = 15;
const RANKING_WINDOW_DAYS = 28;

function dayStamp(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dayDistance(from: string, to: string) {
  const milliseconds = Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`);
  return Math.max(0, Math.round(milliseconds / 86_400_000));
}

/** Pure 28-day half-life ranking. Editorial source order resolves exact ties. */
export function rankPopularFaqs(
  faqs: readonly FaqItem[],
  dailyCounts: readonly DailyFaqCount[],
  now = new Date(),
  fallbackId = POPULAR_FAQ_FALLBACK_ID
): PopularFaqResult {
  const today = dayStamp(now);
  const scoreByFaqId = new Map(faqs.map((faq) => [faq.id, 0]));

  for (const row of dailyCounts) {
    const age = dayDistance(row.day, today);
    if (!scoreByFaqId.has(row.faqId) || age >= RANKING_WINDOW_DAYS || row.count <= 0) continue;
    scoreByFaqId.set(row.faqId, (scoreByFaqId.get(row.faqId) ?? 0) + row.count * 0.5 ** (age / 7));
  }

  const totalWeightedEngagement = [...scoreByFaqId.values()].reduce((total, value) => total + value, 0);
  const fallback = faqs.find((faq) => faq.id === fallbackId) ?? faqs[0];
  const ordered = [...faqs].sort((left, right) => {
    const scoreDelta = (scoreByFaqId.get(right.id) ?? 0) - (scoreByFaqId.get(left.id) ?? 0);
    return scoreDelta === 0 ? faqs.indexOf(left) - faqs.indexOf(right) : scoreDelta;
  });
  const rankingSource = totalWeightedEngagement < COLD_START_WEIGHTED_ENGAGEMENT && fallback
    ? [fallback, ...ordered.filter((faq) => faq.id !== fallback.id)]
    : ordered;

  return {
    ranked: rankingSource.map((faq, index) => ({ id: faq.id, rank: index + 1 })),
    generatedAt: now.toISOString(),
    coldStart: totalWeightedEngagement < COLD_START_WEIGHTED_ENGAGEMENT,
  };
}

/** Board-fit copy intentionally uses the editorial board field, never the raw FAQ question. */
export function popularFaqBoardItem(faq: FaqItem, rank: number) {
  return {
    no: rank,
    text: faq.boardText,
    catCode: faq.catCode ?? "GENL",
    statusText: `MOST ASKED ${faq.category.toUpperCase()} PF ${String(rank).padStart(2, "0")}`,
  };
}

/** Prevents content changes from silently truncating a 14 x 9 mobile board. */
export function assertFaqBoardContentFits(faqs: readonly FaqItem[]) {
  for (const faq of faqs) {
    const text = faq.boardText.normalize("NFKD").replace(/[^ A-Z0-9.,?!'\-&/:+()$]/gi, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ");
    let lineLength = 0;
    let lineCount = 1;
    for (const word of words) {
      const nextLength = lineLength === 0 ? word.length : lineLength + word.length + 1;
      if (nextLength > 14) {
        lineCount += 1;
        lineLength = word.length;
      } else {
        lineLength = nextLength;
      }
    }
    if (text && lineCount > 7) {
      throw new Error(`FAQ ${faq.id} board copy does not fit the 14 x 9 mobile layout.`);
    }
  }
}
