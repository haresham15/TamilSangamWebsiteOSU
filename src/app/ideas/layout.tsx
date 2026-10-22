import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.ideas.title,
  description: ROUTE_METADATA.ideas.description,
  path: ROUTE_METADATA.ideas.path,
  keywords: [
    "The Ideas Hearth OSU Tamil Sangam",
    "Propose a Campus Event Ohio State",
    "Tamil Sangam at OSU student proposals",
    "music jam ideas OSU",
    "Tamil language workshops Columbus",
    "campus collaborations Ohio State",
  ],
});

export default function IdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "The Ideas Hearth", url: "/ideas" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
