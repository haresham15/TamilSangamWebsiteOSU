import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ArrowRight } from "lucide-react";
import { FAQS } from "@/data/faq";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";

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

export default function FaqPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  const categories = Array.from(new Set(FAQS.map((f) => f.category)));

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#261A14] pt-28 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#0F766E]/20">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd />

      <div className="max-w-4xl mx-auto">
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

        {/* Header */}
        <div className="border-l-2 border-[#0F766E] pl-6 sm:pl-8 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#0F766E] font-semibold block mb-2">
            QUESTIONS &amp; ANSWERS · வினா-விடை
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#261A14] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#5E4C40] leading-relaxed font-sans max-w-2xl">
            Everything you need to know about membership, dues, language prerequisites, rehearsals, and upcoming campus gatherings at The Ohio State University.
          </p>
        </div>

        {/* FAQ Categories & Questions */}
        <div className="space-y-12">
          {categories.map((category) => {
            const items = FAQS.filter((f) => f.category === category);
            return (
              <section key={category} className="space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[#9A6B3E] font-bold flex items-center gap-2 border-b border-[#DFD1BE] pb-2">
                  <HelpCircle className="w-4 h-4 text-[#0F766E]" />
                  <span>{category} FAQs</span>
                </h2>

                <div className="space-y-3">
                  {items.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-xl bg-white border border-[#DFD1BE] p-5 shadow-sm transition-all open:border-[#0F766E]/60 open:shadow-md"
                    >
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-serif text-lg font-medium text-[#261A14] group-hover:text-[#0F766E] transition-colors">
                        <span>{faq.questionEn}</span>
                        <span className="font-mono text-xs text-[#0F766E] shrink-0 mt-1">
                          +
                        </span>
                      </summary>

                      <div className="mt-4 pt-4 border-t border-[#DFD1BE]/60 text-sm leading-relaxed text-[#5E4C40] space-y-3 font-sans">
                        <p>{faq.answerEn}</p>
                        {faq.questionTa && (
                          <div className="pt-2 border-t border-[#DFD1BE]/40 text-xs text-[#9A6B3E] font-tamil" lang="ta">
                            <p className="font-medium">{faq.questionTa}</p>
                            <p className="mt-1 leading-relaxed opacity-90">{faq.answerTa}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Quick Links Card */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-white border border-[#DFD1BE] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-serif font-semibold text-[#261A14]">
              Ready to join our Buckeye family?
            </h3>
            <p className="text-sm text-[#5E4C40] mt-1">
              Membership is 100% free with zero dues. Open to all students regardless of language or background.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/join"
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0B5C56] text-[#FAF5ED] font-mono text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>Sign Guestbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/guide"
              className="px-5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#DFD1BE]/40 text-[#261A14] border border-[#DFD1BE] font-mono text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>Columbus Guide</span>
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <KolamSectionRule tone="sandstone" />
        </div>
      </div>
    </main>
  );
}
