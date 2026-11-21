import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FAQS } from "@/data/faq";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { FaqAccordion, FaqCategoryNav } from "@/components/faq/FaqAccordion";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.faq.title,
  description: ROUTE_METADATA.faq.description,
  path: "/faq",
  keywords: [
    "OSU Tamil Sangam FAQ",
    "How to join Tamil Sangam at Ohio State",
    "Do I need to speak Tamil to join OSU Tamil Sangam",
    "OSU Tamil club membership dues",
    "Ohio State South Asian student orgs FAQ",
    "Columbus Tamil student questions",
  ],
});

const LINK_FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const QUICK_LINKS = [
  { eyebrow: "Membership", href: "/join", label: "Sign Guestbook" },
  { eyebrow: "Columbus", href: "/guide", label: "Columbus Guide" },
] as const;

const categorySlug = (category: string) => `faq-cat-${category.toLowerCase()}`;

export default function FaqPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  const categories = Array.from(new Set(FAQS.map((f) => f.category))).map((category) => ({
    id: categorySlug(category),
    label: category,
    items: FAQS.filter((f) => f.category === category),
  }));

  return (
    <main className="min-h-screen bg-bg-sangam-deep pb-24">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd />

      {/* 1. S — header */}
      <CulturalSection variant="sandstone" aria-labelledby="faq-title">
        <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 sm:px-10 sm:pt-36 sm:pb-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/"
              className={`inline-flex min-h-12 items-center gap-2 rounded-full font-sans text-sm font-semibold text-brand-teal hover:underline underline-offset-4 focus-visible:ring-brand-teal focus-visible:ring-offset-bg-sandstone ${LINK_FOCUS}`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span>Return to Hearth</span>
            </Link>
          </nav>

          <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-7">
              <Eyebrow as="p" tamil="வினா-விடை">Questions &amp; Answers</Eyebrow>
              <h1
                id="faq-title"
                className="mt-4 font-serif text-4xl sm:text-6xl font-normal leading-[1.08] tracking-tight text-ink-earth"
              >
                Frequently Asked Questions
              </h1>
            </div>
            <p className="font-sans text-base sm:text-lg leading-relaxed text-ink-umber md:col-span-5">
              Everything you need to know about membership, dues, language prerequisites, rehearsals, and upcoming campus gatherings at The Ohio State University.
            </p>
          </div>
        </div>
      </CulturalSection>

      {/* 2. I — categories (recipe A: sticky category nav left, ledgers right) */}
      <CulturalSection variant="ivory" divider="korvai" aria-labelledby="faq-categories-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-10 sm:py-28 md:grid-cols-12">
          <div className="self-start md:col-span-5 md:sticky md:top-28">
            <Eyebrow as="p">{FAQS.length} questions</Eyebrow>
            <h2
              id="faq-categories-title"
              className="mt-3 mb-6 font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tight text-ink-earth"
            >
              Browse by category
            </h2>
            <FaqCategoryNav
              ariaLabel="FAQ categories"
              categories={categories.map(({ id, label, items }) => ({ id, label, count: items.length }))}
            />
          </div>

          <div className="space-y-16 md:col-span-7">
            {categories.map(({ id, label, items }) => (
              <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
                <h3
                  id={`${id}-title`}
                  className="flex items-baseline gap-3 border-b border-border-warm pb-3 font-serif text-2xl sm:text-3xl text-ink-earth"
                >
                  <span>{label}</span>
                  <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                    {items.length} {items.length === 1 ? "question" : "questions"}
                  </span>
                </h3>
                <FaqAccordion items={items} idPrefix="faq" tone="light" headingLevel={4} />
              </section>
            ))}
          </div>
        </div>
      </CulturalSection>

      {/* 3. D — quick links (inline, unboxed) */}
      <CulturalSection variant="sangam-deep" divider="korvai" aria-labelledby="faq-next-title">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
          <h2
            id="faq-next-title"
            className="max-w-3xl font-serif text-3xl sm:text-5xl leading-[1.12] tracking-tight text-ink-alabaster"
          >
            Ready to join our Buckeye family?
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-base sm:text-lg leading-relaxed text-ink-sand">
            Membership is 100% free with zero dues. Open to all students regardless of language or background.
          </p>

          <ul role="list" className="mt-10 flex flex-col gap-8 border-t border-border-zari-muted pt-8 sm:flex-row sm:gap-16">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Eyebrow as="p" tone="dark">{link.eyebrow}</Eyebrow>
                <Link
                  href={link.href}
                  className={`group mt-2 inline-flex min-h-12 items-center gap-3 rounded-sm font-serif text-2xl sm:text-3xl text-brand-teal-dark hover:underline underline-offset-[6px] focus-visible:ring-brand-teal-dark focus-visible:ring-offset-bg-sangam-deep ${LINK_FOCUS}`}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-6 text-brand-lavender transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </CulturalSection>
    </main>
  );
}
