import { getPopularFaqs } from "@/lib/faq-engagement/service";
import { GuideClient } from "./GuideClient";

export const revalidate = 300; // 5-minute freshness cache per PRD §7.3

/**
 * Server Component for /guide:
 * Retrieves server-ranked popular FAQs at SSR time and passes initialPopularRanking
 * to the client hero and console, eliminating loading layout shift.
 * Embeds SSR semantic <h1> for instant indexing by Googlebot.
 */
export default function UserGuideAndFaqPage() {
  const popularData = getPopularFaqs();
  return (
    <>
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        Student Guide &amp; Frequently Asked Questions — OSU Tamil Sangam at The Ohio State University
      </h1>
      <GuideClient initialPopularRanking={popularData.ranked} />
    </>
  );
}
