import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { InitiativesClient } from "./InitiativesClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.initiatives.title,
  description: ROUTE_METADATA.initiatives.description,
  path: "/initiatives",
  keywords: [
    "OSU Tamil Sangam initiatives",
    "The Three Pillars",
    "Aatam Paatam Kondatam",
    "Tamil cultural hubs Ohio State",
    "Collegiate dance music fellowship OSU",
  ],
});

export default function InitiativesPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Initiatives", url: "/initiatives" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <InitiativesClient />
    </>
  );
}
