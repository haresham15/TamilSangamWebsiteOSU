import type { Metadata } from "next";
import { BreadcrumbJsonLd, BoardJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.board.title,
  description: ROUTE_METADATA.board.description,
  path: ROUTE_METADATA.board.path,
  keywords: [
    "Executive Board OSU Tamil Sangam",
    "Tamil Sangam at OSU student leadership",
    "Ohio State Tamil Sangam officers",
    "Meenakshi Varadarajan President",
    "Shrinidhi Nagappan Vice President",
    "Srinivas Sankaranarayanan Creative Director",
    "Student organization officers Ohio State",
    "Columbus Tamil student leadership",
  ],
  type: "profile",
});

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Executive Board", url: "/board" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BoardJsonLd />
      {children}
    </>
  );
}
