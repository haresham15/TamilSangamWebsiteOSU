// src/components/pillars/PillarDetailView.tsx
"use client";

import React from "react";
import Link from "next/link";
import { PillarData, ALL_PILLARS } from "@/data/pillars";
import { soundEngine } from "@/lib/soundEngine";
import { SplitText, BlurText, SpotlightCard, StarBorder, Magnet } from "@/components/ui/react-bits";
import { AatamMovementStudio } from "@/components/pillars/AatamMovementStudio";
import { PaatamSonicJamDeck } from "@/components/pillars/PaatamSonicJamDeck";
import { KondatamSeasonAlmanac } from "@/components/pillars/KondatamSeasonAlmanac";
import { SanthippumThinnaiNetwork } from "@/components/pillars/SanthippumThinnaiNetwork";
import { KatralLivingAtelier } from "@/components/pillars/KatralLivingAtelier";
import { PillarSiblingSwitcher } from "@/components/pillars/PillarSiblingSwitcher";
import { OsuTamilPlaylistGateway } from "@/components/gateways/OsuTamilPlaylistGateway";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  Calendar,
  Compass,
  ArrowRight,
  Flame,
} from "lucide-react";

interface PillarDetailViewProps {
  pillar: PillarData;
}

export function PillarDetailView({ pillar }: PillarDetailViewProps) {
  const currentIndex = ALL_PILLARS.findIndex((p) => p.slug === pillar.slug);
  const prevPillar = ALL_PILLARS[(currentIndex - 1 + ALL_PILLARS.length) % ALL_PILLARS.length];
  const nextPillar = ALL_PILLARS[(currentIndex + 1) % ALL_PILLARS.length];

  const handlePlayRaga = () => {
    soundEngine.playPillarHover(pillar.ragaIndex);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF6F0] text-[#161210] selection:bg-[#C85A32] selection:text-[#FAF6F0]">
      {/* 1. TOP SUBPAGE ARCHITECTURAL BREADCRUMB BAR (Below Navbar) */}
      <section
        aria-label="Breadcrumb Bar"
        className="w-full bg-[#161210] text-[#FAF6F0] border-b border-[#FAF6F0]/10 pt-28 pb-4 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <Link
            href="/#five-pillars"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#FAF6F0] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to The Five Pillars</span>
          </Link>

          <div className="flex items-center gap-4 text-[#FAF6F0]/60">
            <Link
              href={`/pillars/${prevPillar.slug}`}
              className="hover:text-[#FAF6F0] inline-flex items-center gap-1 transition-colors"
              title={`Previous: ${prevPillar.titleEn}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{prevPillar.number}</span>
            </Link>

            <span className="text-[#FAF6F0]/30">|</span>

            <span className="text-[#FAF6F0] font-semibold">
              PILLAR {pillar.number} OF 05
            </span>

            <span className="text-[#FAF6F0]/30">|</span>

            <Link
              href={`/pillars/${nextPillar.slug}`}
              className="hover:text-[#FAF6F0] inline-flex items-center gap-1 transition-colors"
              title={`Next: ${nextPillar.titleEn}`}
            >
              <span>{nextPillar.number}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH EDITORIAL HERO (Deep Espresso #161210) */}
      <header className="relative w-full bg-[#161210] text-[#FAF6F0] overflow-hidden pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#FAF6F0]/10">
        {/* Giant Architectural Background Numeral */}
        <div
          aria-hidden="true"
          className="absolute -right-8 -bottom-10 sm:-bottom-16 font-serif text-[180px] sm:text-[280px] lg:text-[380px] font-bold text-[#FAF6F0]/[0.03] select-none pointer-events-none leading-none"
        >
          {pillar.number}
        </div>

        {/* Ambient Radial Hearth Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ backgroundColor: pillar.accentColor }}
        />

        <div className="relative max-w-6xl mx-auto space-y-8 sm:space-y-10">
          {/* Eyebrow & Harmonic Note Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3">
              <span className="font-serif text-lg font-bold text-[#D4AF37]">
                {pillar.number}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#FAF6F0]/80">
                {pillar.categoryLabel}
              </span>
              <span className="hidden sm:inline text-xs text-[#FAF6F0]/40 font-serif">
                · {pillar.categoryLabelTa}
              </span>
            </div>

            {/* Harmonic Sound Trigger */}
            <button
              type="button"
              onClick={handlePlayRaga}
              className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 border border-[#FAF6F0]/20 text-[#D4AF37] transition-all hover:scale-105 active:scale-95"
              title={`Play ${pillar.ragaNote} frequency`}
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Raga Mohanam: {pillar.ragaNote}</span>
            </button>
          </div>

          {/* Bilingual Monumental Titles */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#FAF6F0]">
                <SplitText text={pillar.titleEn} stagger={0.06} />
              </h1>
              <p
                lang="ta"
                className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#D4AF37] font-semibold leading-relaxed tracking-normal"
                style={{ letterSpacing: 0 }}
              >
                <BlurText text={pillar.titleTa} animateBy="words" delay={0.1} />
              </p>
            </div>

            <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#FAF6F0]/90 max-w-3xl leading-snug font-light">
              {pillar.heroTagline}
            </p>
          </div>

          {/* Manifesto Lead & Bilingual Context */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-[#FAF6F0]/10">
            <div className="lg:col-span-7 space-y-4">
              <p className="font-sans text-base sm:text-lg text-[#FAF6F0]/85 leading-relaxed font-light">
                {pillar.manifestoLead}
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#1E1916]/80 p-5 rounded-2xl border border-[#FAF6F0]/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>திண்ணை மரபு · Courtyard Ethos</span>
              </div>
              <p
                lang="ta"
                className="font-serif text-sm sm:text-base text-[#FAF6F0]/80 leading-relaxed tracking-normal"
                style={{ letterSpacing: 0 }}
              >
                {pillar.manifestoLeadTa}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FUTURE EVENTS INITIATIVE CALLOUT BANNER (Warm Sandstone & Terracotta) */}
      <section className="w-full bg-[#F2EAE0] border-b border-[#EADCC9] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-8 border border-[#EADCC9] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#C85A32]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Founding Cultural Blueprint · 2026–2027 Academic Year</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#161210] font-normal leading-snug">
                {pillar.openCallTitle}
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
                {pillar.futureEventVision}
              </p>
            </div>

            <Link
              href={`/ideas?category=NEW+INITIATIVE&pillar=${pillar.slug}`}
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold px-5 py-3 rounded-xl bg-[#C85A32] text-[#FAF6F0] hover:bg-[#b04a25] transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
            >
              <span>Submit a Proposal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. UNIQUE INTERACTIVE EXPERIENCE MODULE PER PILLAR */}
      <main className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {pillar.slug === "aatam" && <AatamMovementStudio />}
          {pillar.slug === "paatam" && <PaatamSonicJamDeck />}
          {pillar.slug === "kondatam" && <KondatamSeasonAlmanac />}
          {pillar.slug === "santhippum" && <SanthippumThinnaiNetwork />}
          {pillar.slug === "katral" && <KatralLivingAtelier />}
          {pillar.slug === "paatam" && (
            <div className="mt-14 sm:mt-20">
              <OsuTamilPlaylistGateway variant="light" />
            </div>
          )}
        </div>
      </main>

      {/* 5. EVENT INTEGRATION BLUEPRINTS ("Bring This Pillar to Our Next Event") */}
      <section className="w-full bg-[#F2EAE0]/70 border-t border-b border-[#EADCC9] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#C85A32]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Action Roster · பங்கேற்பு வாய்ப்புகள்</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
              Three Ways to Bring {pillar.titleEn} to Our Next Gathering
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
              Every initiative at Ohio State Tamil Sangam is created by students. Here are three concrete blueprints you can propose, lead, or help coordinate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillar.eventIntegrationBlueprints.map((blueprint, index) => (
              <div
                key={index}
                className="bg-[#FAF6F0] p-6 sm:p-7 rounded-2xl border border-[#EADCC9] flex flex-col justify-between hover:shadow-md transition-shadow space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#C85A32] px-2 py-0.5 rounded bg-[#C85A32]/10 border border-[#C85A32]/20">
                      {blueprint.timeframe}
                    </span>
                    <span className="text-xs font-mono text-[#57524C]">
                      Role: {blueprint.role}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl text-[#161210] font-medium leading-snug">
                    {blueprint.title}
                  </h4>

                  <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
                    {blueprint.description}
                  </p>
                </div>

                <Link
                  href={`/ideas?category=EVENT+IDEA&pillar=${pillar.slug}&prompt=${encodeURIComponent(
                    blueprint.proposalPrompt
                  )}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#C85A32] hover:text-[#161210] transition-colors pt-3 border-t border-[#EADCC9]"
                >
                  <span>Pitch this for an upcoming event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BESPOKE BOTTOM CONVERSION & ROUTING PORTAL */}
      <section className="w-full bg-[#161210] text-[#FAF6F0] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#FAF6F0]/10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
              <Compass className="w-3.5 h-3.5" />
              <span>Next Steps & Community Portal · தொடரவும்</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF6F0] font-normal leading-tight">
              Ready to Step Into {pillar.titleEn}?
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#FAF6F0]/70 leading-relaxed">
              Connect with fellow Buckeyes, register your interest in our rosters, or contribute your vision for the year ahead.
            </p>
          </div>

          {/* Primary Destination Card (Full-Width Espresso/Terracotta Curtain with StarBorder + Magnet) */}
          <div className="relative">
            <StarBorder color="#D4AF37" speed="7s">
              <div className="bg-[#1E1916] p-8 sm:p-12 rounded-2xl border border-[#D4AF37]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    Primary Community Track
                  </span>
                  <h4 className="font-serif text-2xl sm:text-3xl text-[#FAF6F0] font-normal leading-snug">
                    {pillar.primaryDestination.title}
                  </h4>
                  <p
                    lang="ta"
                    className="font-serif text-sm sm:text-base text-[#D4AF37] leading-relaxed tracking-normal"
                    style={{ letterSpacing: 0 }}
                  >
                    {pillar.primaryDestination.titleTa}
                  </p>
                  <p className="font-sans text-sm sm:text-base text-[#FAF6F0]/70 leading-relaxed">
                    {pillar.primaryDestination.subtitle}
                  </p>
                </div>

                <Magnet padding={50} magnetStrength={4}>
                  <Link
                    href={pillar.primaryDestination.href}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C85A32] hover:bg-[#d6653c] text-[#FAF6F0] font-mono text-sm font-semibold tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span>{pillar.primaryDestination.buttonLabel}</span>
                  </Link>
                </Magnet>
              </div>
            </StarBorder>
          </div>

          {/* Secondary Destination Cards (2-Column Split) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {pillar.secondaryDestinations.map((dest, idx) => (
              <SpotlightCard
                key={idx}
                className="bg-[#1E1916]/80 p-7 sm:p-8 rounded-2xl border border-[#FAF6F0]/10 flex flex-col justify-between hover:border-[#FAF6F0]/30 transition-all space-y-4"
                spotlightColor="rgba(212, 175, 55, 0.12)"
              >
                <div className="space-y-2">
                  <h5 className="font-serif text-xl text-[#FAF6F0] font-normal">
                    {dest.title}
                  </h5>
                  <p className="font-sans text-xs sm:text-sm text-[#FAF6F0]/70 leading-relaxed">
                    {dest.subtitle}
                  </p>
                </div>

                <Link
                  href={dest.href}
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#D4AF37] hover:text-[#FAF6F0] transition-colors pt-3 border-t border-[#FAF6F0]/10"
                >
                  <span>{dest.actionText}</span>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM SIBLING PILLAR SWITCHER STRIP */}
      <PillarSiblingSwitcher currentSlug={pillar.slug} />
    </div>
  );
}
