import type { Metadata } from "next";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.guide.title,
  description: ROUTE_METADATA.guide.description,
  path: ROUTE_METADATA.guide.path,
  keywords: [
    "Student Guide OSU Tamil Sangam",
    "Tamil Sangam at OSU FAQ",
    "Ohio State Tamil student advice",
    "free zero-dues membership Ohio State",
    "open to all majors and languages",
    "Columbus Tamil dining and groceries",
    "freshman survival guide OSU",
    "CABS bus tips Ohio State",
  ],
});

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Student Guide & FAQ", url: "/guide" },
        ]}
      />
      <FaqJsonLd />
      {children}
    </>
  );
}
