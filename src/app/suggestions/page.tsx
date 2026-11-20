import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, PlaylistJsonLd } from "@/components/seo/JsonLd";
import { SuggestionsClient } from "./SuggestionsClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.suggestions.title,
  description: ROUTE_METADATA.suggestions.description,
  path: "/suggestions",
  keywords: [
    "Suggest an event OSU Tamil Sangam",
    "All-OSU Tamil Spotify playlist",
    "OSU Tamil philanthropy service",
    "Student event proposals Ohio State",
    "Tamil Sangam campus ideas hearth",
    "OSU collaborative music playlist",
  ],
});

export default function SuggestionsPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Suggestions", url: "/suggestions" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PlaylistJsonLd />
      <SuggestionsClient />
    </>
  );
}
