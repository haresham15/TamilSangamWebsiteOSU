import { getPopularFaqs } from "@/lib/faq-engagement/service";
import { GuideClient } from "./GuideClient";

export const revalidate = 300; // 5-minute freshness cache per PRD §7.3

/**
 * Server Component for /guide:
 * Retrieves server-ranked popular FAQs at SSR time and passes initialPopularRanking
 * to the client hero and console, eliminating loading layout shift.
 */
export default function UserGuideAndFaqPage() {
  const popularData = getPopularFaqs();
  return <GuideClient initialPopularRanking={popularData.ranked} />;
}
