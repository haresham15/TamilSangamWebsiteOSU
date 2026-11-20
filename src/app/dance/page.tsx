import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import { DancePerformanceSpace, DEFAULT_DIWALI_FORM_EMBED_URL } from "@/components/dance/DancePerformanceSpace";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dance Performance Sign-Ups | OSU Tamil Sangam",
  description:
    "Register for OSU Tamil Sangam collegiate dance troupes. Kuthu, Gaana, cinematic fusion, and classical performances for upcoming campus galas and cultural festivals at The Ohio State University.",
  alternates: {
    canonical: `${SITE_URL}/dance`,
  },
  openGraph: {
    title: "Dance Performance Sign-Ups | OSU Tamil Sangam",
    description:
      "Join our dance troupes for upcoming Ohio State showcases. Open to all students, zero audition fees, all skill levels welcome.",
    url: `${SITE_URL}/dance`,
    siteName: "OSU Tamil Sangam",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Dance Performance Sign-Ups - OSU Tamil Sangam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dance Performance Sign-Ups | OSU Tamil Sangam",
    description:
      "Join our collegiate dance troupes at The Ohio State University. Open to all students, zero experience required.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function DancePage() {
  return (
    <main className="relative min-h-screen bg-[#F0E6D6] text-[#261A14] pt-28 pb-28 selection:bg-[#0F766E]/20 overflow-x-hidden">
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

