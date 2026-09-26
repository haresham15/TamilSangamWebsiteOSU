import type { Metadata } from "next";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/global/JsonLd";
import { FAQS } from "@/data/faq";

export const metadata: Metadata = {
  title: "About Us, Heritage & Constitution",
  description:
    "Learn about the mission, 2000-year classical Tamil heritage, history at Ohio State, student constitution, campus partners, and governance of OSU Tamil Sangam.",
  keywords: [
    "About OSU Tamil Sangam",
    "Tamil Sangam history Ohio State",
    "Tamil heritage Columbus Ohio",
    "Sangam literature university",
    "OSU Tamil Sangam constitution",
    "Ohio State student organization governance",
    "Telugu Thallulu collaboration",
    "South Asian student orgs Ohio State",
    "Tamil culture Columbus",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/about",
  },
  openGraph: {
    title: "About Us & Classical Heritage | OSU Tamil Sangam",
    description:
      "Explore the mission, classical heritage, student constitution, campus partners, and leadership history of OSU Tamil Sangam at The Ohio State University.",
    url: "https://osutamilsangam.org/about",
    siteName: "OSU Tamil Sangam",
    type: "article",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "OSU Tamil Sangam Official Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us & Classical Heritage | OSU Tamil Sangam",
    description:
      "Learn about the mission, classical heritage, student constitution, and campus partners of OSU Tamil Sangam.",
    images: ["/emblem.svg"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "About Us", url: "https://osutamilsangam.org/about" },
  ];

  const faqItems = FAQS.map((faq) => ({
    question: faq.questionEn,
    answer: faq.answerEn,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
