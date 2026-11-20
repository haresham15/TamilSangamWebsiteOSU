import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, BoardJsonLd } from "@/components/seo/JsonLd";
import { BoardClient } from "./BoardClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.board.title,
  description: ROUTE_METADATA.board.description,
  path: "/board",
  keywords: [
    "OSU Tamil Sangam executive board",
    "Tamil Sangam executive board 2026-2027",
    "Tamil Sangam officers Ohio State",
    "Student leadership OSU",
    "South Asian student leaders Columbus",
    "Tamil student association Ohio State officers",
  ],
});

export default function BoardPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Board", url: "/board" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BoardJsonLd />
      {/* Semantic SSR H1 for immediate crawlability */}
      <h1 className="sr-only">
        Executive Board &amp; Student Leadership 2026-2027 — OSU Tamil Sangam at The Ohio State University
      </h1>
      <BoardClient />
    </>
  );
}
