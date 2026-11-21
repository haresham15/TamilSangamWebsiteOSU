import React from "react";
import type { Metadata } from "next";
import { DancePerformanceSpace, DEFAULT_DIWALI_FORM_EMBED_URL } from "@/components/dance/DancePerformanceSpace";
import { BreadcrumbJsonLd, DanceJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.dance.title,
  description: ROUTE_METADATA.dance.description,
  path: "/dance",
  keywords: [
    "OSU Indian dance auditions",
    "Kuthu and Gaana dance troupe Ohio State",
    "Diwali dance sign-ups OSU",
    "South Asian choreography Columbus",
    "Bharatanatyam collegiate dance Ohio State",
    "Free dance workshops OSU",
  ],
});

export default function DancePage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Dance", url: "/dance" },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-bg-peacock-deep text-ink-earth selection:bg-brand-teal/20">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <DanceJsonLd />

      {/* Header (sangam-deep) → categories (ivory) → form (sandstone) → dancer FAQ (peacock-deep).
          The ambient EditorialBackgroundCanvas now lives on the header band only. */}
      <DancePerformanceSpace googleFormEmbedUrl={DEFAULT_DIWALI_FORM_EMBED_URL} />
    </div>
  );
}
