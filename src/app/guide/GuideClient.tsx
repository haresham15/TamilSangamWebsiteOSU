"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS, FaqItem } from "@/data/faq";
import { useGuideStore } from "@/components/guide-hero/store/guideStore";
import { GuideHero } from "@/components/guide-hero/GuideHero";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";
import { audioLayer } from "@/utils/audioLayer";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { Search } from "lucide-react";

export interface GuideClientProps {
  initialPopularRanking?: RankedFaq[];
}

export function GuideClient({ initialPopularRanking }: GuideClientProps) {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "General", "Membership", "Events", "Performances", "Governance"];

  // Broadcast to 3D Split-Flap Board without collapsing or hiding DOM text
  const handleInspectFaq = useCallback((faq: FaqItem) => {
    audioLayer.playTapeClack();
    useGuideStore.getState().selectFaq(faq, "accordion");
  }, []);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    return (
      matchesCategory &&
      (faq.questionEn.toLowerCase().includes(q) ||
        faq.answerEn.toLowerCase().includes(q) ||
        faq.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="w-full bg-transparent min-h-screen text-left">
      {/* =========================================================================
          CRITICAL / IMMUTABLE: 3D Split-Flap Departure Board Hero Scene
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES.
          ========================================================================= */}
      <div
        id="guide-station-hero"
        data-hero-container="true"
        className="relative z-10 w-full overflow-hidden bg-transparent"
      >
        <GuideHero />
      </div>

      {/* Hero to Content Gradient Transition */}
      <HeroGradientTransition variant="guide" className="-mt-32 relative z-20" />

      {/* =========================================================================
          THE OPEN BOOK: BREATHABLE Q&A MANUSCRIPT ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825] overflow-hidden">
        
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="center"
            eyebrow="The Open Book · Student Guide"
            title={locale === "ta" ? "ஓலைச்சுவடி · திறந்த வழிகாட்டி" : "Frequently Asked Questions"}
            tamilTitle={locale !== "ta" ? "வழிகாட்டி · கேள்வி & பதில்கள்" : undefined}
            description="Everything you need to know about joining Tamil Sangam, attending our festivals, performing on campus, and democratic student membership. Completely open, honest, and free."
          />

          {/* Search Bar & Category Filter Links: Grounded Underline & Typographic Links */}
          <div className="space-y-8 mb-20 sm:mb-28">
            <div className="relative max-w-2xl mx-auto">
              <Search className="w-5 h-5 text-[#8C827A] absolute left-0 top-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by topic, language, or festival..."
                className="w-full pl-8 pr-4 py-3.5 bg-transparent border-b border-[#E5DDD0] text-[#2A2825] placeholder:text-[#8C827A] text-base font-sans outline-none focus:border-[#B85C38] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`pb-1 text-xs sm:text-sm font-sans uppercase tracking-widest font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "text-[#B85C38] border-b-2 border-[#B85C38]"
                        : "text-[#8C827A] hover:text-[#2A2825] border-b-2 border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Open Book Flowing Questions: 1px Full-Width Grounding Line Between Pairs */}
          <div className="space-y-16 sm:space-y-24">
            {filteredFaqs.map((faq, idx) => (
              <article
                key={faq.id || idx}
                onMouseEnter={() => handleInspectFaq(faq)}
                className="group relative select-none border-b border-[#E5DDD0] pb-16 sm:pb-20"
              >
                {/* Category Typographic Tag */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#B85C38] font-semibold">
                    {faq.category}
                  </span>
                </div>

                {/* Question in Soft Terracotta Color (Conversational & Inviting) */}
                <h2 className="text-2xl sm:text-4xl font-serif font-normal text-[#B85C38] group-hover:text-[#a04a27] transition-colors leading-snug">
                  {locale === "ta" ? faq.questionTa : faq.questionEn}
                </h2>

                {/* Tamil Question Subscript */}
                {locale !== "ta" && faq.questionTa && (
                  <p className="mt-2 font-tamil text-base sm:text-lg text-[#2A2825]/50" lang="ta">
                    {faq.questionTa}
                  </p>
                )}

                {/* Answer in Deep Charcoal Espresso with Loose Leading */}
                <div className="mt-6 pt-2">
                  <p className="text-lg sm:text-xl font-sans text-[#57524C] leading-loose">
                    {locale === "ta" ? faq.answerTa : faq.answerEn}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="py-24 text-center space-y-3 font-sans text-[#57524C]">
              <p className="text-lg font-serif">No questions found matching your search.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-sm font-medium text-[#B85C38] underline cursor-pointer"
              >
                Reset search filters
              </button>
            </div>
          )}

          {/* Borderless Organic Transportation to Suggestions */}
          <div className="mt-24 sm:mt-32">
            <OrganicRouteGateway
              primaryHref="/suggestions"
              primaryLabel="Step into Suggestions"
              eyebrow="Have a Question We Missed? · அடுத்த வாசல்"
              title="Transmit an Idea or Question"
              tamilTitle="உங்கள் சிந்தனையை பகிருங்கள்"
              description="Our executive board reviews community suggestions weekly. Share an event idea, request a song, or ask for guidance."
            />
          </div>

        </div>
      </div>
    </div>
  );
}
