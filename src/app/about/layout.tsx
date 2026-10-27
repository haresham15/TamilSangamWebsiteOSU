import type { Metadata } from "next";
import { BreadcrumbJsonLd, FaqJsonLd, AboutPageJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";
import { FAQS } from "@/data/faq";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.about.title,
  description: ROUTE_METADATA.about.description,
  path: ROUTE_METADATA.about.path,
  keywords: [
    "About OSU Tamil Sangam",
    "Tamil Sangam at OSU heritage",
    "Ohio State Tamil Sangam history",
    "Five Pillars Aatam Paatam Kondatam Santhippum Katral",
    "யாதும் ஊரே யாவரும் கேளிர்",
    "Ohio State student organization governance",
    "Tamil culture Columbus",
    "South Asian student orgs Ohio State",
  ],
  type: "article",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About Us & Heritage", url: "/about" },
  ];

  const faqItems = FAQS.map((faq) => ({
    question: faq.questionEn,
    answer: faq.answerEn,
    questionTa: faq.questionTa,
  }));

  return (
    <>
      <AboutPageJsonLd />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
