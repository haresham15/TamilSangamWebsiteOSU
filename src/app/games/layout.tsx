import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.games.title,
  description: ROUTE_METADATA.games.description,
  path: ROUTE_METADATA.games.path,
  keywords: [
    "The Sangam Arcade",
    "Tamil Wordle Sollu",
    "Tamil Connections Thodarpu",
    "Ohio State Tamil games",
    "Tanglish word puzzle",
    "Kollywood wordle",
    "Tamil Sangam OSU arcade",
    "Akshara Tamil puzzle",
  ],
});

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
