"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS, FaqItem } from "@/data/faq";
import { useGuideStore } from "@/components/guide-hero/store/guideStore";
import { GuideHero } from "@/components/guide-hero/GuideHero";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";
import { audioLayer } from "@/utils/audioLayer";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { Plus, Search } from "lucide-react";
import styles from "./guide.module.css";

export interface GuideClientProps {
  initialPopularRanking?: RankedFaq[];
}

export function GuideClient({ initialPopularRanking }: GuideClientProps) {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const pending = (window as unknown as { __pendingGuideCategory?: string }).__pendingGuideCategory;
      if (pending) {
        return pending;
      }
    }
    return "Overview";
  });
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Overview", "Membership", "Culture", "Governance"];
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(() => new Set([FAQS[0].id]));

  // Support early interaction prior to client hydration completion
  useEffect(() => {
    const onGuideClick = (e: Event) => {
      const cat = (e as CustomEvent).detail;
      if (cat) setSelectedCategory(cat);
    };
    window.addEventListener("guide-category-click", onGuideClick);
    return () => window.removeEventListener("guide-category-click", onGuideClick);
  }, []);

  // Keep the station board in sync with the inspected question.
  const handleInspectFaq = useCallback((faq: FaqItem) => {
    audioLayer.playTapeClack();
    useGuideStore.getState().selectFaq(faq, "accordion");
  }, []);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "Overview" || (selectedCategory === "Culture" ? ["Events", "Performances"].includes(faq.category) : faq.category === selectedCategory);
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
    <div className="w-full bg-transparent min-h-screen text-left overflow-x-clip">
      {/* =========================================================================
          CRITICAL / IMMUTABLE: 3D Split-Flap Departure Board Hero Scene
          HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES.
          ========================================================================= */}
      <div
        data-hero-container="true"
        className="relative z-10 w-full bg-transparent overflow-x-clip"
      >
        <GuideHero initialPopularRanking={initialPopularRanking} />
      </div>

      {/* =========================================================================
          THE OPEN BOOK: BREATHABLE Q&A MANUSCRIPT ON WARM IVORY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          Glides up over the station hero runway (p = 0.88 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        badge="STUDENT GUIDE"
        sublabel="FREQUENTLY ASKED QUESTIONS"
        className="text-hearth-espresso"
      >
        
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Header */}
          <CourtyardHeader
            align="left"
            eyebrow="The Open Book"
            title={locale === "ta" ? "ஓலைச்சுவடி · திறந்த வழிகாட்டி" : "Frequently Asked Questions"}
            tamilTitle={locale !== "ta" ? "வழிகாட்டி · வினா-விடை" : undefined}
          />

          <div className={styles.layout}>
            <nav className={styles.nav} aria-label="Guide categories">
              <p className="font-mono text-xs uppercase tracking-widest text-hearth-terracotta w-full">Find your answer</p>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  data-guide-category={category}
                  className={styles.category}
                  aria-pressed={selectedCategory === category}
                  onClick={() => { playClick(); setSelectedCategory(category); }}
                >
                  {category}
                </button>
              ))}
            </nav>
            <div className="min-w-0">
              <div className="relative mb-8">
                <label htmlFor="guide-search" className="sr-only">Search questions</label>
                <Search aria-hidden="true" className="size-5 absolute left-0 top-4 text-hearth-terracotta" />
                <input id="guide-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search questions by topic, language, or festival..."
                  className="w-full pl-8 pr-4 py-3.5 bg-transparent border-b border-hearth-espresso/30 text-base outline-none focus:border-hearth-terracotta focus-visible:outline-2 focus-visible:outline-offset-4" />
              </div>
              <p role="status" className="font-mono text-xs text-hearth-espresso/70 mb-6">{filteredFaqs.length} questions</p>
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaqs.has(faq.id);
                return (
                  <article key={faq.id} className={styles.faq} onMouseEnter={() => handleInspectFaq(faq)}>
                    <p className="font-mono text-xs uppercase tracking-widest text-hearth-terracotta mb-3">{faq.category}</p>
                    <h2>
                      <button type="button" id={faq.id + "-question"} aria-expanded={isOpen} aria-controls={faq.id + "-answer"}
                        className={styles.question} onClick={() => {
                          handleInspectFaq(faq);
                          setExpandedFaqs((current) => {
                            const next = new Set(current);
                            if (next.has(faq.id)) next.delete(faq.id); else next.add(faq.id);
                            return next;
                          });
                        }}>
                        <span>
                          <span lang={locale === "ta" ? "ta" : undefined} className="block text-2xl sm:text-3xl font-serif leading-snug">{locale === "ta" ? faq.questionTa : faq.questionEn}</span>
                          {locale !== "ta" && faq.questionTa && <span lang="ta" className="block font-tamil text-base leading-relaxed mt-3 text-hearth-espresso/70">{faq.questionTa}</span>}
                        </span>
                        <Plus aria-hidden="true" className={styles.plus} />
                      </button>
                    </h2>
                    <div id={faq.id + "-answer"} role="region" aria-labelledby={faq.id + "-question"} aria-hidden={!isOpen} inert={!isOpen} className={styles.answer} data-open={isOpen}>
                      <div className={styles.answerInner}>
                        <p lang={locale === "ta" ? "ta" : undefined} className="pt-6 pb-2 text-base sm:text-lg leading-loose text-hearth-espresso/80">{locale === "ta" ? faq.answerTa : faq.answerEn}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
              {filteredFaqs.length === 0 && (
                <div className="py-16 space-y-4">
                  <p className="text-xl font-serif">No questions found matching your search.</p>
                  <button type="button" className="min-h-12 underline text-hearth-terracotta" onClick={() => { setSearchQuery(""); setSelectedCategory("Overview"); }}>Reset search filters</button>
                </div>
              )}
            </div>
          </div>

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
      </EditorialSheetHandoff>
    </div>
  );
}
