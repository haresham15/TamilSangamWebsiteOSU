import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
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
    <main className="relative min-h-screen bg-[#F0E6D6] text-[#261A14] pt-28 pb-28 selection:bg-[#0F766E]/20 overflow-x-hidden">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <DanceJsonLd />

      {/* Ambient Canvas with warm Kolam geometry */}
      <EditorialBackgroundCanvas />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#0F766E] hover:text-[#261A14] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>RETURN TO HEARTH</span>
          </Link>
        </nav>
      </div>

      {/* Main Performance Registration Space */}
      <div className="relative z-10">
        <DancePerformanceSpace googleFormEmbedUrl={DEFAULT_DIWALI_FORM_EMBED_URL} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <KolamSectionRule tone="sandstone" />
      </div>
    </main>
  );
}
