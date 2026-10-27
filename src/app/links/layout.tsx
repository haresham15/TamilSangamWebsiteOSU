import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.links.title,
  description: ROUTE_METADATA.links.description,
  path: ROUTE_METADATA.links.path,
  keywords: [
    "OSU Tamil Sangam Links",
    "Tamil Sangam Instagram",
    "OSU Tamil Sangam Linktree",
    "Tamil Sangam GroupMe link",
    "Ohio State Tamil social media",
    "Columbus Tamil student links",
  ],
});

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Official Links", url: "/links" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
