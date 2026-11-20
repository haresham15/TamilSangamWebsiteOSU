import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, EventJsonLd } from "@/components/seo/JsonLd";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.home.title,
  description: ROUTE_METADATA.home.description,
  path: "/",
  keywords: [
    "OSU Tamil Sangam",
    "Tamil Sangam at Ohio State",
    "Ohio State Tamil Sangam",
    "The Ohio State University Tamil Sangam",
    "OSU TS",
    "Tamil student organization OSU",
    "Ohio State Indian student organization",
    "South Asian student orgs OSU",
    "Columbus Tamil community",
    "Diwali Ohio State",
    "Pongal OSU",
    "Tamil Wordle Solla",
    "Tamil Connections Thodarpu",
    "Aatam Paatam Kondatam",
  ],
});

export default function HomePage() {
  const breadcrumbs = [{ name: "Home", url: "/" }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <EventJsonLd />
      {/* Semantic SSR H1 for immediate crawlability by Googlebot & AI answer engines */}
      <h1 className="sr-only">
        OSU Tamil Sangam | Official Tamil Student Organization at The Ohio State University in Columbus, Ohio
      </h1>
      <HomeClient />
    </>
  );
}
