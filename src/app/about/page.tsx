import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, AboutPageJsonLd } from "@/components/seo/JsonLd";
import { AboutClient } from "./AboutClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.about.title,
  description: ROUTE_METADATA.about.description,
  path: "/about",
  keywords: [
    "About OSU Tamil Sangam",
    "History of Tamil Sangam at Ohio State",
    "Purananuru 192",
    "Ohio State Tamil heritage",
    "Tamil cultural student organization OSU",
    "Columbus Tamil student history",
    "The Five Pillars OSU",
  ],
});

export default function AboutPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <AboutPageJsonLd />
      {/* Semantic SSR H1 for immediate crawlability */}
      <h1 className="sr-only">
        About OSU Tamil Sangam — History, Heritage &amp; The Five Pillars at The Ohio State University
      </h1>
      <AboutClient />
    </>
  );
}
