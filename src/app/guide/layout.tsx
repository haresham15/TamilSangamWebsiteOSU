import type { Metadata } from "next";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Freshman & Student Guide | Columbus FAQs",
  description:
    "The essential collegiate survival guide for Ohio State Tamil students. Discover campus housing, South Asian dining and groceries in Columbus, CABS bus transit tips, and official Sangam FAQs.",
  keywords: [
    "OSU Tamil student guide",
    "Ohio State freshman guide",
    "Indian students Ohio State",
    "Columbus Indian groceries",
    "South Asian food Columbus",
    "OSU off-campus housing guide",
    "Ohio Union student organizations",
    "CABS bus tips Ohio State",
    "OSU Tamil Sangam FAQ",
    "student advice Columbus Ohio",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/guide",
  },
  openGraph: {
    title: "Freshman & Student Guide | Columbus FAQs | OSU Tamil Sangam",
    description:
      "Essential student advice for Ohio State Buckeyes: campus dining, off-campus housing, Columbus transit, and club FAQs.",
    url: "https://osutamilsangam.org/guide",
    siteName: "OSU Tamil Sangam",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "OSU Tamil Sangam Student Guide and Knowledge Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freshman & Student Guide | Columbus FAQs | OSU Tamil Sangam",
    description:
      "Essential student advice for Ohio State Buckeyes: campus dining, off-campus housing, Columbus transit, and club FAQs.",
    images: ["/emblem.svg"],
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FaqJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Student Guide & FAQs", url: "/guide" },
        ]}
      />
      {children}
    </>
  );
}
