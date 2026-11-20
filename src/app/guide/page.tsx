import type { Metadata } from "next";
import { getPopularFaqs } from "@/lib/faq-engagement/service";
import { GuideClient } from "./GuideClient";
import { BreadcrumbJsonLd, GuideDirectoryJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";

export const revalidate = 300; // 5-minute freshness cache per PRD §7.3

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.guide.title,
  description: ROUTE_METADATA.guide.description,
  path: "/guide",
  keywords: [
    "Columbus Tamil survival guide",
    "Indian restaurants near OSU",
    "Indian grocery stores Columbus OH",
    "South Asian student guide Ohio State",
    "Patel Brothers Columbus",
    "Bhavani Cash and Carry",
    "Cinemark Carriage Place Tamil movies",
    "CABS bus routes OSU",
  ],
});

/**
 * Server Component for /guide:
 * Retrieves server-ranked popular FAQs at SSR time and passes initialPopularRanking
 * to the client hero and console, eliminating loading layout shift.
 * Embeds SSR semantic <h1> for instant indexing by Googlebot.
 */
export default function UserGuideAndFaqPage() {
  const popularData = getPopularFaqs();
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Guide", url: "/guide" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <GuideDirectoryJsonLd />
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        Student Guide &amp; Frequently Asked Questions — OSU Tamil Sangam at The Ohio State University
      </h1>
      <GuideClient initialPopularRanking={popularData.ranked} />
    </>
  );
}
