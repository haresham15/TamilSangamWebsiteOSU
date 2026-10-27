import type { Metadata } from "next";
import { BreadcrumbJsonLd, JoinPageJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.join.title,
  description: ROUTE_METADATA.join.description,
  path: ROUTE_METADATA.join.path,
  keywords: [
    "Join OSU Tamil Sangam",
    "Tamil Sangam at OSU membership",
    "Free membership guestbook Ohio State",
    "zero dues student organizations OSU",
    "open to all Buckeyes regardless of language",
    "collegiate dance and music signup",
    "Tamil student community Columbus",
  ],
});

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Join Sangam", url: "/join" },
  ];

  return (
    <>
      <JoinPageJsonLd />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
