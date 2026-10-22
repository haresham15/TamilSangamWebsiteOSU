import type { Metadata } from "next";
import { BreadcrumbJsonLd, EventsCollectionJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.events.title,
  description: ROUTE_METADATA.events.description,
  path: ROUTE_METADATA.events.path,
  keywords: [
    "Campus Events & Festivals OSU Tamil Sangam",
    "Tamil Sangam at OSU events",
    "Ohio State Tamil events",
    "Kollywood Kollai OSU",
    "OSU Diwali",
    "Pongal banquets Ohio State",
    "Namma Jathara Carnival",
    "South Oval picnics Columbus OH",
    "Tamil student organization OSU",
  ],
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Events & Festivals", url: "/events" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <EventsCollectionJsonLd />
      {children}
    </>
  );
}
