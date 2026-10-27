import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.initiatives.title,
  description: ROUTE_METADATA.initiatives.description,
  path: ROUTE_METADATA.initiatives.path,
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
  type: "article",
});

export default function InitiativesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Initiatives & Pillars", url: "/initiatives" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
