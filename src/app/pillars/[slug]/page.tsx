// src/app/pillars/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PILLARS_DATA, ALL_PILLARS, PillarSlug } from "@/data/pillars";
import { PillarDetailView } from "@/components/pillars/PillarDetailView";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { constructCanonical, constructAlternates, SITE_URL } from "@/lib/seo";

interface PillarPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const legacySlugs = ["aatam", "paatam", "kondatam", "santhippum", "katral"];
  const all = [...ALL_PILLARS.map((p) => p.slug), ...legacySlugs];
  return all.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PillarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pillar = PILLARS_DATA[slug as PillarSlug];

  if (!pillar) {
    return {
      title: "Pillar Not Found | OSU Tamil Sangam",
    };
  }

  const title = `${pillar.titleEn} (${pillar.titleTa}) · Pillar ${pillar.number} | OSU Tamil Sangam`;
  const description = `${pillar.heroTagline}. ${pillar.manifestoLead.slice(0, 160)}... Join student initiatives at Ohio State University.`;
  const canonical = constructCanonical(`/pillars/${pillar.slug}`);

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      pillar.titleEn,
      pillar.titleTa,
      pillar.categoryLabel,
      "The Three Pillars",
      "OSU Tamil Sangam Pillars",
      "Tamil student initiatives OSU",
      "Ohio State University Tamil culture",
    ],
    alternates: constructAlternates(`/pillars/${pillar.slug}`),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "OSU Tamil Sangam",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${pillar.titleEn} (${pillar.titleTa}) — OSU Tamil Sangam`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function PillarPage({ params }: PillarPageProps) {
  const { slug } = await params;

  // Seamlessly redirect legacy 5-pillar slugs to the 3 consolidated pillars
  if (["aatam", "paatam", "katral"].includes(slug)) {
    redirect("/pillars/culture-arts");
  }
  if (["kondatam", "santhippum"].includes(slug)) {
    redirect("/pillars/community-brotherhood");
  }

  const pillar = PILLARS_DATA[slug as PillarSlug];

  if (!pillar) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "The Three Pillars", url: "/#three-pillars" },
    { name: `${pillar.titleEn} (${pillar.titleTa})`, url: `/pillars/${pillar.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <PillarDetailView pillar={pillar} />
    </>
  );
}
