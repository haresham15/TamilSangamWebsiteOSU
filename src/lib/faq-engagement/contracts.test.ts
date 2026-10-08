import { FAQS } from "@/data/faq";
import { assertFaqBoardContentFits, rankPopularFaqs } from "./contracts";
import { LocalFaqEngagementStore } from "./store";

export interface FaqEngagementTestResult {
  test: string;
  passed: boolean;
  message?: string;
}

function result(test: string, assertion: boolean, message?: string): FaqEngagementTestResult {
  return { test, passed: assertion, message };
}

export function runFaqEngagementUnitTests(): FaqEngagementTestResult[] {
  const now = new Date("2026-10-06T12:00:00.000Z");
  const ranked = rankPopularFaqs(
    FAQS,
    [
      { faqId: "faq-01", day: "2026-10-06", count: 8 },
      { faqId: "faq-02", day: "2026-09-29", count: 20 },
      { faqId: "faq-99", day: "2026-10-06", count: 999 },
      { faqId: "faq-03", day: "2026-08-01", count: 999 },
    ],
    now
  );
  const coldStart = rankPopularFaqs(FAQS, [], now);
  const store = new LocalFaqEngagementStore(":memory:");
  const input = {
    faqId: "faq-01",
    visitorHash: "anonymous-hash",
    day: "2026-10-06",
    minuteBucket: "2026-10-06T12:00",
    nowMs: now.getTime(),
  };
  const firstWrite = store.record(input);
  const duplicateWrite = store.record(input);
  const aggregate = store.listDailyCounts("2026-10-01");
  store.close();

  let boardFit = true;
  try {
    assertFaqBoardContentFits(FAQS);
  } catch {
    boardFit = false;
  }

  return [
    result("weekly decay and editorial ranking", ranked.ranked[0]?.id === "faq-02", "A week-old twenty-count total should outrank eight fresh opens."),
    result("cold start uses pinned join FAQ", coldStart.coldStart && coldStart.ranked[0]?.id === "faq-02"),
    result("SQLite aggregate records once", firstWrite === "recorded" && aggregate[0]?.count === 1),
    result("SQLite dedupe rejects repeat visitor FAQ open", duplicateWrite === "duplicate"),
    result("all board editorial copy fits mobile", boardFit),
  ];
}
