import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, JoinPageJsonLd } from "@/components/seo/JsonLd";
import { JoinClient } from "./JoinClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.join.title,
  description: ROUTE_METADATA.join.description,
  path: "/join",
  keywords: [
    "Join OSU Tamil Sangam",
    "Free Indian student club Ohio State",
    "OSU South Asian freshman mentorship",
    "Tamil Sangam membership Columbus",
    "Zero dues student club OSU",
    "Ohio State student guestbook",
  ],
});

export default function JoinPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Join", url: "/join" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JoinPageJsonLd />
      {/* Semantic SSR H1 for immediate crawlability */}
      <h1 className="sr-only">
        Join OSU Tamil Sangam — 100% Free Membership &amp; Campus Guestbook at The Ohio State University
      </h1>
      <JoinClient />
    </>
  );
}
