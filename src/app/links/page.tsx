import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, LinksPageJsonLd } from "@/components/seo/JsonLd";
import { LinksClient } from "./LinksClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.links.title,
  description: ROUTE_METADATA.links.description,
  path: "/links",
  keywords: [
    "OSU Tamil Sangam links",
    "Tamil Sangam GroupMe Ohio State",
    "Tamil Sangam Instagram",
    "OSU Tamil TikTok",
    "Diwali sign up form OSU",
    "Buckeye South Asian student links",
  ],
});

export default function LinksPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Links", url: "/links" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <LinksPageJsonLd />
      <LinksClient />
    </>
  );
}
