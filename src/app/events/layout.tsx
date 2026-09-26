import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Events, Festivals & Ticket Drops",
  description:
    "Explore upcoming festivals, ticket reservations, and campus gatherings hosted by OSU Tamil Sangam. Join us for Aatam Paatam Kondatam, Diwali Night, lawn picnics, and street food kickbacks in Columbus.",
  keywords: [
    "OSU Tamil Sangam Events",
    "Aatam Paatam Kondatam 2026",
    "OSU Diwali Night",
    "Pongal Ohio State",
    "Ohio Union cultural celebrations",
    "South Asian festivals Ohio State",
    "Columbus Tamil events",
    "Tamil festival tickets OSU",
    "Student culture night Columbus",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/events",
  },
  openGraph: {
    title: "Events & Festivals | OSU Tamil Sangam",
    description:
      "Explore upcoming cultural festivals, ticket drops, and campus gatherings hosted by OSU Tamil Sangam at The Ohio State University.",
    url: "https://osutamilsangam.org/events",
    siteName: "OSU Tamil Sangam",
    type: "website",
    images: [
      {
        url: "/posters/diwali-2025.webp",
        width: 1200,
        height: 630,
        alt: "OSU Tamil Sangam Cultural Festival Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events & Festivals | OSU Tamil Sangam",
    description:
      "Explore upcoming cultural festivals, ticket drops, and campus gatherings at Ohio State.",
    images: ["/posters/diwali-2025.webp"],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Events & Festivals", url: "https://osutamilsangam.org/events" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
