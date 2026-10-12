"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS, BoardMember } from "@/data/board";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Crown, Mail, ArrowUpRight } from "lucide-react";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";

// =========================================================================
// CRITICAL & IMMUTABLE: 3D Chola Darbar corridor hero scene
// HERO ANIMATIONS ARE NEVER TOUCHED OR MODIFIED UNDER ANY CIRCUMSTANCES
// =========================================================================
const BoardHeroCanvas = dynamic(
  () => import("@/components/board/BoardHeroCanvas").then((m) => m.BoardHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70dvh] bg-[#120A06] flex flex-col items-center justify-center text-[#E5A93C] font-sans text-sm gap-3 border-b border-[#3d2714]">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#E5A93C] animate-pulse" />
          <span className="tracking-widest">
            Loading student leadership colonnade...
          </span>
        </div>
      </div>
    ),
  }
);

export default function BoardPage() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const [hoveredMember, setHoveredMember] = useState<BoardMember>(CURRENT_BOARD[0]);

  return (
    <div className="w-full text-left bg-transparent">
      {/* 1. Cinematic 3D Chola Darbar Hero - IMMUTABLE */}
      <div
        id="board-hero-trigger"
        data-hero-container="true"
        className="w-full h-[100dvh] relative z-10 overflow-hidden bg-transparent"
      >
        <BoardHeroCanvas />
      </div>

      {/* Hero to Content Gradient Transition */}
      <HeroGradientTransition variant="board" className="-mt-32 relative z-20" />

      {/* =========================================================================
          THE WARM PORTRAITS: AIRY, SUNLIT LEADERSHIP GALLERY
          Warm Ivory (#FAF9F6), Sunbaked Sand (#F4EFE6), Charcoal Espresso (#2A2825)
          ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF9F6] text-[#2A2825] overflow-hidden">
        
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          
          {/* Centered Airy Section Header */}
          <CourtyardHeader
            align="center"
            eyebrow="Democratic Council · 2026–2027"
            title={locale === "ta" ? "நிர்வாகக் குழு & வழிகாட்டிகள்" : "The Executive Board"}
            tamilTitle={locale !== "ta" ? "ஆளுமை · மாணவர் தலைமை" : undefined}
            description="Democratic student governance serving 120+ Buckeye members. Meet the officers leading community festivals, language workshops, and student advocacy across Columbus."
          />

          {/* Main Layout: Sticky Warm Portrait + Airy Officer Names */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-16 sm:mt-24">
            
            {/* Left 5 Columns: The Warm, Sharp Photographic Portrait sitting naked on background */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              {/* Sharp Physical Photographic Print */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4EFE6] border border-[#E5DDD0]">
                <Image
                  src={hoveredMember.photoUrl}
                  alt={hoveredMember.nameEn}
                  fill
                  className="object-cover transition-all duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />
              </div>

              {/* Officer Bio & Info sitting directly on global background */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-2">
                  <span className="text-xs font-mono font-semibold text-[#B85C38] tracking-widest uppercase">
                    {hoveredMember.roleEn}
                  </span>
                  <span className="font-tamil text-sm text-[#8C827A]" lang="ta">
                    {hoveredMember.nameTa}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-serif text-[#2A2825]">
                  {hoveredMember.nameEn}
                </h3>

                <p className="text-base font-sans text-[#57524C] leading-relaxed">
                  {hoveredMember.bioEn}
                </p>

                {hoveredMember.quote && (
                  <blockquote className="text-sm font-serif italic text-[#2A2825] border-l-2 border-[#B85C38] pl-4 py-1">
                    &ldquo;{hoveredMember.quote}&rdquo;
                  </blockquote>
                )}

                <div className="pt-2">
                  <a
                    href={`mailto:${hoveredMember.email}`}
                    className="inline-flex items-center gap-2 text-xs font-sans font-medium text-[#B85C38] hover:text-[#2A2825] transition-colors border-b border-transparent hover:border-[#B85C38]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{hoveredMember.email}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Borderless Officer Rows Separated by 1px Hairlines */}
            <div className="lg:col-span-7 space-y-12 sm:space-y-16">
              {CURRENT_BOARD.map((member, idx) => {
                const isSelected = hoveredMember.id === member.id;

                return (
                  <div
                    key={member.id}
                    onMouseEnter={() => {
                      audioLayer.playTapeClack();
                      setHoveredMember(member);
                    }}
                    onClick={() => {
                      playClick();
                      setHoveredMember(member);
                    }}
                    className={`group cursor-pointer select-none transition-all duration-300 pb-12 sm:pb-16 border-b border-[#E5DDD0] ${
                      isSelected ? "border-l-2 border-l-[#B85C38] pl-6" : "pl-0 hover:border-l-2 hover:border-l-[#E5DDD0] hover:pl-6"
                    }`}
                  >
                    {/* Role Tag & Number */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs text-[#8C827A]">
                        0{idx + 1}
                      </span>
                      <span className="font-sans text-xs tracking-widest uppercase font-semibold text-[#B85C38]">
                        {member.roleEn}
                      </span>
                    </div>

                    {/* Massive Elegant Serif Name */}
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <h2 className={`text-3xl sm:text-5xl font-serif font-normal transition-colors leading-tight ${
                        isSelected ? "text-[#B85C38]" : "text-[#2A2825] group-hover:text-[#B85C38]"
                      }`}>
                        {member.nameEn}
                      </h2>
                      <span
                        lang="ta"
                        className="text-xl sm:text-2xl font-serif text-[#2A2825]/40 group-hover:text-[#2A2825]/70 transition-colors"
                      >
                        {member.nameTa}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="mt-3 text-sm sm:text-base font-sans text-[#57524C] leading-relaxed line-clamp-2">
                      {member.bioEn}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Working Subcommittee Councils: Borderless Typographic Grid */}
          <div className="mt-28 sm:mt-40 pt-16 border-t border-[#E5DDD0] space-y-16">
            <div className="text-center space-y-3">
              <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
                Working Groups · துணைக் குழுக்கள்
              </span>
              <h3 className="text-3xl sm:text-5xl font-serif font-normal text-[#2A2825]">
                Subcommittee Coordinators
              </h3>
              <p className="text-base text-[#57524C] font-sans max-w-xl mx-auto leading-relaxed">
                Dedicated student organizers leading choreography, social media trailers, campus catering, and community service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 text-left">
              {SUBCOMMITTEE_MEMBERS.map((sub, i) => (
                <div key={sub.id || i} className="pb-8 border-b border-[#E5DDD0] space-y-2">
                  <span className="font-mono text-xs text-[#B85C38] uppercase tracking-widest font-semibold block">
                    {sub.areaEn}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-[#2A2825]">{sub.nameEn}</h4>
                  <p className="text-sm font-sans text-[#57524C]" lang="ta">
                    {sub.nameTa} · {sub.areaTa}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Plain-Language Democratic Governance: Architectural Statement Naked on Background */}
          <div className="mt-28 pt-16 border-t border-[#E5DDD0] space-y-6 max-w-3xl">
            <span className="font-sans text-xs font-semibold text-[#B85C38] tracking-widest uppercase block">
              Democratic Governance · ஜனநாயக விதிகள்
            </span>
            <h4 className="text-3xl sm:text-4xl font-serif text-[#2A2825]">
              Constitution of Tamil Sangam at Ohio State
            </h4>
            <p className="text-base sm:text-lg font-sans text-[#57524C] leading-relaxed">
              Our organization is fully student-run and democratically governed under Ohio State University Student Activities guidelines. Executive officers are elected annually by general body vote, and all constitutional amendments are publicly accessible.
            </p>
            <div className="pt-2">
              <MuttramButton href="/guide" variant="secondary" size="md" onClick={playClick}>
                Read Organization FAQ & Guidelines →
              </MuttramButton>
            </div>
          </div>

          {/* Borderless Organic Transportation to Join */}
          <div className="mt-28 sm:mt-36">
            <OrganicRouteGateway
              primaryHref="/join"
              primaryLabel="Sign the Guestbook"
              eyebrow="Step Across the Threshold · அடுத்த வாசல்"
              title="Join the Sangam Fellowship"
              tamilTitle="எங்களுடன் இணையுங்கள்"
              description="Membership is open to every student, alumni, and community member in Columbus. Sign the digital guestbook and take your place at the hearth."
            />
          </div>

        </div>
      </div>
    </div>
  );
}
