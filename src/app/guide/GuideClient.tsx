"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS, FaqItem } from "@/data/faq";
import { COLUMBUS_GUIDE, GuideSpot } from "@/data/columbus-guide";
import { useGuideStore } from "@/components/guide-hero/store/guideStore";
import { GuideHero } from "@/components/guide-hero/GuideHero";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";
import { audioLayer } from "@/utils/audioLayer";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import { KolamSectionRule } from "@/components/ui/KolamSectionRule";
import {
  Plus,
  Search,
  ArrowLeft,
  MapPin,
  ExternalLink,
  Users,
  Compass,
  Film,
  Utensils,
  GraduationCap,
  HelpCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import styles from "./guide.module.css";

export interface GuideClientProps {
  initialPopularRanking?: RankedFaq[];
}

type GuideFilterCategory =
  | "All Directory"
  | "Theaters & Kollywood"
  | "Food & Groceries"
  | "Campus Shortcuts"
  | "Club FAQs";

export function GuideClient({ initialPopularRanking }: GuideClientProps) {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState<GuideFilterCategory>("All Directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(() => new Set([FAQS[0].id]));

  const filterCategories: { id: GuideFilterCategory; label: string; icon: LucideIcon }[] = [
    { id: "All Directory", label: "All Survival Spots", icon: Compass },
    { id: "Theaters & Kollywood", label: "Kollywood Theaters", icon: Film },
    { id: "Food & Groceries", label: "Food & Groceries", icon: Utensils },
    { id: "Campus Shortcuts", label: "Campus Shortcuts", icon: GraduationCap },
    { id: "Club FAQs", label: "Sangam FAQs", icon: HelpCircle },
  ];

  // Support early interaction prior to client hydration completion
  useEffect(() => {
    const onGuideClick = (e: Event) => {
      const cat = (e as CustomEvent).detail;
      if (cat) {
        if (cat === "Culture" || cat === "Overview") setSelectedCategory("All Directory");
        else if (cat === "Theaters") setSelectedCategory("Theaters & Kollywood");
        else if (cat === "Food") setSelectedCategory("Food & Groceries");
        else if (cat === "Campus") setSelectedCategory("Campus Shortcuts");
        else setSelectedCategory("Club FAQs");
      }
    };
    window.addEventListener("guide-category-click", onGuideClick);
    return () => window.removeEventListener("guide-category-click", onGuideClick);
  }, []);

  // Keep the station board in sync with the inspected question.
  const handleInspectFaq = useCallback((faq: FaqItem) => {
    audioLayer.playTapeClack();
    useGuideStore.getState().selectFaq(faq, "accordion");
  }, []);

  // Filter Directory Spots
  const filteredSpots = COLUMBUS_GUIDE.filter((spot: GuideSpot) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesCategory =
      selectedCategory === "All Directory" ||
      (selectedCategory === "Theaters & Kollywood" && spot.category === "Theaters & Kollywood") ||
      (selectedCategory === "Food & Groceries" && spot.category === "Food & Groceries") ||
      (selectedCategory === "Campus Shortcuts" && spot.category === "Campus Shortcuts & Resources");

    if (selectedCategory === "Club FAQs") return false;

    if (!q) return matchesCategory;

    return (
      matchesCategory &&
      (spot.name.toLowerCase().includes(q) ||
        spot.tamilName.toLowerCase().includes(q) ||
        spot.address.toLowerCase().includes(q) ||
        spot.descriptionEn.toLowerCase().includes(q) ||
        spot.recommendationEn.toLowerCase().includes(q))
    );
  });

  // Filter FAQs
  const showFaqs = selectedCategory === "All Directory" || selectedCategory === "Club FAQs";
  const filteredFaqs = FAQS.filter((faq) => {
    if (!showFaqs) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      faq.questionEn.toLowerCase().includes(q) ||
      faq.answerEn.toLowerCase().includes(q) ||
      faq.tags.some((t) => t.toLowerCase().includes(q))
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
        className="relative w-full bg-transparent overflow-x-clip"
      >
        <GuideHero initialPopularRanking={initialPopularRanking} />
      </div>

      {/* =========================================================================
          THE COLUMBUS TAMIL SURVIVAL DIRECTORY & OPEN BOOK
          Royal Violet (#140C20), Raised Surface (#25173B), Off-White (#F4F0FA)
          Glides up over the station hero runway (p = 0.88 -> 1.00)
          ========================================================================= */}
      <EditorialSheetHandoff
        badge="COLUMBUS TAMIL SURVIVAL DIRECTORY"
        sublabel="STUDENT DIRECTORY & FAQ"
        surface="sandstone"
        className="text-[#261A14]"
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-28 pb-28">
          
          {/* Top Breadcrumb: Bidirectional Link to About */}
          <div className="mb-8">
            <Link
              href="/about"
              onClick={playClick}
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#5B2C86] hover:text-[#261A14] transition-colors py-1.5 px-3.5 rounded-lg bg-[#FFFFFF] border border-[#DFD1BE] hover:bg-[#FAF6F0] focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to About</span>
            </Link>
          </div>

          {/* Centered Airy Header */}
          <CourtyardHeader
            align="left"
            eyebrow="The Columbus Survival Directory"
            title={
              locale === "ta"
                ? "கொலம்பஸ் தமிழ் மாணவர் வழிகாட்டி"
                : "The Columbus Tamil Survival Directory"
            }
            tamilTitle={
              locale !== "ta"
                ? "திரையரங்குகள் · உணவகங்கள் · வளாக உதவிக்குறிப்புகள்"
                : undefined
            }
            description="A curated field guide for incoming freshmen, transfer students, and out-of-state Buckeyes. Find FDFS Tamil movie theaters, authentic South Indian filter coffee & dosas, campus study sanctuaries, and 24/7 student resources."
          />

          {/* Navigation Bar & Category Filter Pills */}
          <div className="mt-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Directory categories">
              {filterCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#5B2C86] text-[#FAF5ED] shadow-xs font-semibold"
                        : "bg-[#FFFFFF] text-[#261A14] hover:bg-[#FAF6F0] border border-[#DFD1BE]"
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <label htmlFor="directory-search" className="sr-only">
                Search spots and questions
              </label>
              <Search
                aria-hidden="true"
                className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A6B3E]"
              />
              <input
                id="directory-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search theaters, dosas, CABS..."
                className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#DFD1BE] rounded-xl text-xs sm:text-sm text-[#261A14] outline-none focus:border-[#5B2C86] focus:ring-1 focus:ring-[#5B2C86] placeholder:text-[#5E4C40]/60 shadow-xs"
              />
            </div>
          </div>

          {/* =========================================================================
              1. COLUMBUS SURVIVAL DIRECTORY CARDS GRID
              ========================================================================= */}
          {selectedCategory !== "Club FAQs" && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#9A6B3E] font-semibold">
                  Field Guide Recommendations ({filteredSpots.length} locations)
                </span>
                {selectedCategory !== "All Directory" && (
                  <button
                    onClick={() => setSelectedCategory("All Directory")}
                    className="font-mono text-xs text-[#5B2C86] hover:text-[#261A14] underline"
                  >
                    View All Categories
                  </button>
                )}
              </div>

              {filteredSpots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpots.map((spot) => (
                    <article
                      key={spot.id}
                      className="bg-[#FFFFFF] border border-[#DFD1BE] rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#9A6B3E]/40 transition-all hover:-translate-y-0.5 group text-[#261A14]"
                    >
                      <div>
                        {/* Category & Campus Distance Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#F0E6D6] text-[#5B2C86] border border-[#DFD1BE]">
                            {spot.category}
                          </span>
                          <span className="font-mono text-[11px] text-[#5E4C40]">
                            {spot.distanceFromCampus}
                          </span>
                        </div>

                        {/* Title & Tamil Translation */}
                        <h3 className="text-xl font-serif font-bold text-[#261A14] mb-0.5 group-hover:text-[#5B2C86] transition-colors">
                          {spot.name}
                        </h3>
                        <p lang="ta" className="font-tamil text-sm text-[#5E4C40] mb-3">
                          {spot.tamilName}
                        </p>

                        {/* Address */}
                        <div className="flex items-start gap-1.5 text-xs text-[#5E4C40] font-sans mb-4">
                          <MapPin className="w-3.5 h-3.5 text-[#9A6B3E] shrink-0 mt-0.5" />
                          <span>{spot.address}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm font-sans text-[#261A14] leading-relaxed mb-4">
                          {locale === "ta" ? spot.descriptionTa : spot.descriptionEn}
                        </p>

                        {/* Pro-Tip Box */}
                        <div className="p-3 rounded-xl bg-[#F7EFE2] border border-[#DFD1BE] mb-5 text-xs font-sans text-[#261A14]">
                          <span className="font-semibold text-[#9A6B3E] inline-flex items-center gap-1.5 mb-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#9A6B3E]" />
                            <span>Sangam Insider Tip:</span>
                          </span>
                          <p className="text-[#5E4C40]">{locale === "ta" ? spot.recommendationTa : spot.recommendationEn}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-[#DFD1BE] flex flex-wrap items-center gap-2">
                        {spot.actionUrl && (
                          <a
                            href={spot.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              spot.isCarpoolAction
                                ? "bg-[#0F766E] hover:bg-[#0B5C56] text-[#FAF5ED] shadow-xs"
                                : "bg-[#FFFFFF] hover:bg-[#FAF6F0] text-[#261A14] border border-[#DFD1BE]"
                            }`}
                          >
                            {spot.isCarpoolAction && <Users className="w-3.5 h-3.5 text-[#FAF5ED]" />}
                            <span>{spot.actionLabel || "Visit Link"}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        )}

                        {spot.mapsUrl && (
                          <a
                            href={spot.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-[#5E4C40] hover:text-[#0F766E] transition-colors"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#DFD1BE] p-8 shadow-xs">
                  <p className="text-base font-serif mb-2 text-[#261A14]">No survival directory spots match your search query.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All Directory");
                    }}
                    className="font-mono text-xs underline text-[#5B2C86]"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section Divider */}
          {selectedCategory === "All Directory" && (
            <div className="my-16">
              <KolamSectionRule tone="sandstone" />
            </div>
          )}

          {/* =========================================================================
              2. SANGAM FAQ ACCORDION (THE OPEN BOOK)
              ========================================================================= */}
          {showFaqs && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#9A6B3E] font-semibold block">
                    Campus Life & Club Knowledge
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#261A14] mt-1">
                    {locale === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5E4C40]">
                  {filteredFaqs.length} Q&As
                </span>
              </div>

              <div className="min-w-0 bg-[#FFFFFF] border border-[#DFD1BE] shadow-xs rounded-2xl p-6 sm:p-10 text-[#261A14]">
                {filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqs.has(faq.id);
                  return (
                    <article
                      key={faq.id}
                      className={styles.faq}
                      onMouseEnter={() => handleInspectFaq(faq)}
                    >
                      <p className="font-mono text-xs uppercase tracking-widest text-[#9A6B3E] mb-3">
                        {faq.category}
                      </p>
                      <h3>
                        <button
                          type="button"
                          id={faq.id + "-question"}
                          aria-expanded={isOpen}
                          aria-controls={faq.id + "-answer"}
                          className={styles.question}
                          onClick={() => {
                            handleInspectFaq(faq);
                            setExpandedFaqs((current) => {
                              const next = new Set(current);
                              if (next.has(faq.id)) next.delete(faq.id);
                              else next.add(faq.id);
                              return next;
                            });
                          }}
                        >
                          <span>
                            <span
                              lang={locale === "ta" ? "ta" : undefined}
                              className="block text-xl sm:text-2xl font-serif leading-snug text-[#261A14]"
                            >
                              {locale === "ta" ? faq.questionTa : faq.questionEn}
                            </span>
                            {locale !== "ta" && faq.questionTa && (
                              <span
                                lang="ta"
                                className="block font-tamil text-sm leading-relaxed mt-2 text-[#5E4C40]"
                              >
                                {faq.questionTa}
                              </span>
                            )}
                          </span>
                          <Plus aria-hidden="true" className={styles.plus} />
                        </button>
                      </h3>
                      <div
                        id={faq.id + "-answer"}
                        role="region"
                        aria-labelledby={faq.id + "-question"}
                        aria-hidden={!isOpen}
                        inert={!isOpen}
                        className={styles.answer}
                        data-open={isOpen}
                      >
                        <div className={styles.answerInner}>
                          <p
                            lang={locale === "ta" ? "ta" : undefined}
                            className="pt-4 pb-2 text-base sm:text-lg leading-loose text-[#5E4C40]"
                          >
                            {locale === "ta" ? faq.answerTa : faq.answerEn}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="py-12 space-y-4 text-center">
                    <p className="text-xl font-serif text-[#261A14]">No questions found matching your search.</p>
                    <button
                      type="button"
                      className="min-h-12 underline text-[#5B2C86]"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All Directory");
                      }}
                    >
                      Reset search filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-20 sm:mt-28">
            <KolamSectionRule tone="sandstone" />
          </div>

          {/* Borderless Organic Transportation to Suggestions */}
          <div className="mt-16 sm:mt-24">
            <OrganicRouteGateway
              primaryHref="/suggestions"
              primaryLabel="Step into Suggestions"
              eyebrow="Have a Spot or Question We Missed? · அடுத்த வாசல்"
              title="Transmit a Columbus Discovery or Question"
              tamilTitle="உங்கள் சிந்தனையை பகிருங்கள்"
              description="Know a great new South Indian eatery in Columbus or have a campus navigation tip? Transmit it directly to our executive team."
            />
          </div>
        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
