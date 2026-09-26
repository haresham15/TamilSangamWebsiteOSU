import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "The Three Pillars: Aatam, Paatam, Kondatam",
  description:
    "Discover the foundational pillars of OSU Tamil Sangam: Aatam (Dance & Performance), Paatam (Music & Live Acoustics), and Kondatam (Celebration & Buckeye Fellowship).",
  keywords: [
    "Aatam Paatam Kondatam",
    "Tamil Sangam Three Pillars",
    "Tamil dance Ohio State",
    "Tamil music OSU",
    "Buckeye Tamil fellowship",
    "Gaana dance Columbus",
    "Carnatic acoustic sessions Ohio State",
    "South Asian student culture",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/initiatives",
  },
  openGraph: {
    title: "The Three Pillars: Aatam, Paatam, Kondatam | OSU Tamil Sangam",
    description:
      "Discover the foundational pillars of OSU Tamil Sangam: Aatam (Dance), Paatam (Music), and Kondatam (Celebration) at The Ohio State University.",
    url: "https://osutamilsangam.org/initiatives",
    siteName: "OSU Tamil Sangam",
    type: "article",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "The Three Pillars of OSU Tamil Sangam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Three Pillars | OSU Tamil Sangam",
    description:
      "Aatam (Dance), Paatam (Music), and Kondatam (Celebration) at The Ohio State University.",
    images: ["/emblem.svg"],
  },
};

export default function InitiativesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Initiatives & Pillars", url: "https://osutamilsangam.org/initiatives" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
