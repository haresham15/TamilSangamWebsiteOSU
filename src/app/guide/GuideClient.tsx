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
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { useFaqSearch } from "@/components/faq/useFaqSearch";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Users,
  Compass,
  Film,
  Utensils,
  GraduationCap,
  HelpCircle,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

const DEFAULT_OPEN_FAQS = [FAQS[0].id];
const FAQ_TEASER_LIMIT = 5;

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

  // Filter FAQs (shared matcher with /faq)
  const showFaqs = selectedCategory === "All Directory" || selectedCategory === "Club FAQs";
  const showDirectory = selectedCategory !== "Club FAQs";
  const matchingFaqs = useFaqSearch(FAQS, searchQuery);
  const filteredFaqs = showFaqs ? matchingFaqs : [];
  // The teaser shows five; the dedicated "Sangam FAQs" filter shows every match.
  const faqLimit = selectedCategory === "Club FAQs" ? undefined : FAQ_TEASER_LIMIT;
  const shownFaqCount = faqLimit ? Math.min(faqLimit, filteredFaqs.length) : filteredFaqs.length;
  const activeQuery = searchQuery.trim();

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Directory");
  };

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
          CONTENT SHEET: glides up over the station hero runway.
          S header + filters → I directory → S FAQ teaser → P closer
          ========================================================================= */}
      <EditorialSheetHandoff
        id="guide-directory"
        badge="COLUMBUS TAMIL SURVIVAL DIRECTORY"
        sublabel="STUDENT DIRECTORY & FAQ"
        surface="sandstone"
        overlapHero={true}
        overflowClass="overflow-x-clip"
      >
        {/* 1. S — Header + category filters + search */}
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
          <Link
            href="/about"
            onClick={playClick}
            className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-full font-sans text-sm font-semibold text-brand-teal hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>Back to About</span>
          </Link>

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

          <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-8">
              <Eyebrow as="p" className="mb-3">Browse the directory</Eyebrow>
              <div role="group" aria-label="Directory categories" className="flex flex-wrap gap-2">
                {filterCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        playClick();
                        setSelectedCategory(cat.id);
                      }}
                      className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-4 font-sans text-sm transition-colors duration-200 motion-reduce:transition-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone ${
                        isSelected
                          ? "border-brand-purple bg-brand-purple font-semibold text-ink-alabaster shadow-[0_6px_18px_rgba(91,44,134,0.18)]"
                          : "border-border-warm bg-surface-card-light font-medium text-ink-earth hover:border-brand-purple/50 hover:text-brand-purple"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-4 opacity-80" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-4">
              <label
                htmlFor="directory-search"
                className="mb-3 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple"
              >
                Search spots and questions
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent-bronze"
                />
                <input
                  id="directory-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search theaters, dosas, CABS..."
                  className="min-h-12 w-full rounded-full border border-border-warm bg-surface-card-light pl-11 pr-4 font-sans text-sm text-ink-earth placeholder:text-ink-umber/70 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30"
                />
              </div>
            </div>
          </div>

          {activeQuery && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={`Clear search for “${activeQuery}”`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-teal-soft px-4 font-sans text-sm font-semibold text-brand-teal hover:bg-brand-teal-soft/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone"
              >
                <span>Search: “{activeQuery}”</span>
                <X aria-hidden="true" className="size-4" />
              </button>
              <p className="font-sans text-sm text-ink-umber" aria-live="polite">
                {showDirectory ? `${filteredSpots.length} spots` : null}
                {showDirectory && showFaqs ? " · " : null}
                {showFaqs ? `${filteredFaqs.length} questions` : null}
              </p>
            </div>
          )}
        </div>

        {/* 2. I — Columbus directory (recipe A: sticky header left, spot cards right) */}
        {showDirectory && (
          <CulturalSection variant="ivory" divider="korvai" aria-labelledby="guide-directory-title">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-10 sm:py-28 md:grid-cols-12">
              <div className="self-start md:col-span-4 md:sticky md:top-28">
                <Eyebrow as="p">Field Guide Recommendations</Eyebrow>
                <h2
                  id="guide-directory-title"
                  className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tight text-ink-earth"
                >
                  {filterCategories.find((c) => c.id === selectedCategory)?.label ?? "All Survival Spots"}
                </h2>
                <p className="mt-3 font-sans text-sm text-ink-umber">
                  <span className="font-serif text-lg tabular-nums text-brand-purple">{filteredSpots.length}</span>{" "}
                  {filteredSpots.length === 1 ? "location" : "locations"}
                </p>
                {selectedCategory !== "All Directory" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All Directory")}
                    className="mt-4 inline-flex min-h-12 items-center font-sans text-sm font-semibold text-brand-teal hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
                  >
                    View all categories
                  </button>
                )}
              </div>

              <div className="md:col-span-8">
                {filteredSpots.length > 0 ? (
                  <ul role="list" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {filteredSpots.map((spot) => (
                      <CulturalCard
                        key={spot.id}
                        as="li"
                        variant="light"
                        className="flex flex-col p-6 sm:p-7"
                      >
                        <article className="flex h-full flex-col">
                          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                              {spot.category}
                            </span>
                            <span className="font-sans text-xs text-ink-umber">{spot.distanceFromCampus}</span>
                          </div>

                          <h3 className="font-serif text-xl sm:text-2xl leading-snug text-ink-earth">{spot.name}</h3>
                          <p lang="ta" className="mt-1 font-tamil text-sm leading-[1.6] text-brand-purple">
                            {spot.tamilName}
                          </p>

                          <p className="mt-4 flex items-start gap-2 font-sans text-sm text-ink-umber">
                            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-bronze" />
                            <span>{spot.address}</span>
                          </p>

                          <p
                            lang={locale === "ta" ? "ta" : undefined}
                            className={`mt-4 text-base text-ink-umber ${
                              locale === "ta" ? "font-tamil leading-[1.8]" : "font-sans leading-relaxed"
                            }`}
                          >
                            {locale === "ta" ? spot.descriptionTa : spot.descriptionEn}
                          </p>

                          <div className="mt-5 rounded-xl bg-surface-card-parchment p-4">
                            <p className="flex items-center gap-2 font-sans text-sm font-semibold text-ink-earth">
                              <Sparkles aria-hidden="true" className="size-4 text-accent-bronze" />
                              <span>Sangam Insider Tip</span>
                            </p>
                            <p
                              lang={locale === "ta" ? "ta" : undefined}
                              className={`mt-1.5 text-sm text-ink-umber ${
                                locale === "ta" ? "font-tamil leading-[1.8]" : "font-sans leading-relaxed"
                              }`}
                            >
                              {locale === "ta" ? spot.recommendationTa : spot.recommendationEn}
                            </p>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                            {spot.mapsUrl && (
                              <a
                                href={spot.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open Google Maps pin for ${spot.name} (opens in a new tab)`}
                                className="inline-flex min-h-12 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal underline decoration-brand-teal/30 underline-offset-4 transition-colors hover:decoration-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
                              >
                                <MapPin aria-hidden="true" className="size-4" />
                                Open Google Maps pin
                              </a>
                            )}
                            {spot.actionUrl && (
                              <MuttramButton
                                href={spot.actionUrl}
                                external
                                variant="secondary"
                                icon={spot.isCarpoolAction ? <Users aria-hidden="true" className="size-4" /> : undefined}
                                ariaLabel={`${spot.actionLabel || "Visit Link"} (opens in a new tab)`}
                              >
                                {spot.actionLabel || "Visit Link"}
                              </MuttramButton>
                            )}
                          </div>
                        </article>
                      </CulturalCard>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8">
                    <p className="font-serif text-2xl text-ink-earth">No survival directory spots match your search.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 inline-flex min-h-12 items-center font-sans text-sm font-semibold text-brand-teal hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CulturalSection>
        )}

        {/* 3. S — FAQ teaser (recipe B ledger) */}
        {showFaqs && (
          <CulturalSection
            variant={showDirectory ? "sandstone" : "ivory"}
            divider="lotus"
            aria-labelledby="guide-faq-title"
          >
            <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
              <CourtyardHeader
                align="left"
                titleId="guide-faq-title"
                eyebrow="Campus Life & Club Knowledge"
                title={locale === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}
                tamilTitle={locale !== "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : undefined}
                action={
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-umber">
                      {shownFaqCount} of {filteredFaqs.length} Q&amp;As
                    </span>
                    <Link
                      href="/faq"
                      onClick={playClick}
                      className="inline-flex min-h-12 items-center gap-2 font-sans text-base font-semibold text-brand-teal hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone"
                    >
                      <span>All questions</span>
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                }
              />

              <div className="lg:ml-[calc(100%/12)] lg:max-w-[calc(100%*10/12)]">
                <FaqAccordion
                  items={filteredFaqs}
                  limit={faqLimit}
                  idPrefix="guide-faq"
                  tone="light"
                  defaultOpenIds={DEFAULT_OPEN_FAQS}
                  onInspect={handleInspectFaq}
                />

                {filteredFaqs.length === 0 && (
                  <div className="border-t border-border-warm py-10">
                    <p className="font-serif text-2xl text-ink-earth">No questions found matching your search.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 inline-flex min-h-12 items-center font-sans text-sm font-semibold text-brand-teal hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone"
                    >
                      Reset search filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CulturalSection>
        )}

        {/* 4. P — the one closer */}
        <OrganicRouteGateway
          className="pb-24 md:pb-0"
          primaryHref="/suggestions"
          primaryLabel="Step into Suggestions"
          eyebrow="Have a Spot or Question We Missed? · அடுத்த வாசல்"
          title="Transmit a Columbus Discovery or Question"
          tamilTitle="உங்கள் சிந்தனையை பகிருங்கள்"
          description="Know a great new South Indian eatery in Columbus or have a campus navigation tip? Transmit it directly to our executive team."
        />
      </EditorialSheetHandoff>
    </div>
  );
}
