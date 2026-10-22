// src/components/pillars/SanthippumThinnaiNetwork.tsx
"use client";

import React, { useState } from "react";
import { SpotlightCard } from "@/components/ui/react-bits";
import { audioLayer } from "@/utils/audioLayer";
import { Coffee, Compass, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface KinshipBranch {
  id: string;
  titleEn: string;
  titleTa: string;
  role: string;
  icon: typeof Coffee;
  focusAreas: string[];
  blueprintGoal: string;
  prompt: string;
}

const KINSHIP_BRANCHES: KinshipBranch[] = [
  {
    id: "welcome",
    titleEn: "Freshman & Newcomer Transition",
    titleTa: "புதிய மாணவர் நல்வரவு",
    role: "Campus Transition Guide",
    icon: Compass,
    focusAreas: [
      "COTA Campus Bus & Airport Transit Guides",
      "Columbus Winter Coat & Boots Preparation",
      "Dublin / Sawmill Road Indian Grocery Carpools",
      "Dorm Move-In Advice & Campus Navigation",
    ],
    blueprintGoal:
      "Ensuring no incoming student spends their first autumn semester feeling lost or homesick in the Midwest.",
    prompt: "I want to volunteer as a campus buddy or help coordinate transition resources for incoming Buckeyes...",
  },
  {
    id: "mentorship",
    titleEn: "Academic & Career Mentorship",
    titleTa: "படிப்பு & தொழில் வழிகாட்டல்",
    role: "Upperclassman Peer Mentor",
    icon: GraduationCap,
    focusAreas: [
      "CSE, Data Analytics & Engineering Cohorts",
      "Fisher College of Business & Finance Networks",
      "Pre-Med, Public Health & Biology Advice",
      "Undergraduate Research & Resume Critiques",
    ],
    blueprintGoal:
      "Connecting 1st and 2nd-year students with juniors, seniors, and alumni who have walked the same academic path.",
    prompt: "I want to host an informal peer career & resume critique table for underclassmen in my department...",
  },
  {
    id: "hangouts",
    titleEn: "Tea & Thinnai Fellowship Circles",
    titleTa: "தேநீர் & திண்ணைச் சந்திப்புகள்",
    role: "Circle Facilitator",
    icon: Coffee,
    focusAreas: [
      "Thompson Library Midterms Chai & Filter Kaapi",
      "Sunday Evening Campus Strolls & Casual Dinners",
      "Low-Key Game Nights (Carrom, Uno, Chess)",
      "Open Diaspora Identity & Cultural Roundtables",
    ],
    blueprintGoal:
      "Creating recurring, informal micro-gatherings between major galas where lasting campus friendships are forged.",
    prompt: "I'd like to host a casual evening Chai & Conversation circle exploring diaspora student life and heritage in Columbus...",
  },
];

export function SanthippumThinnaiNetwork() {
  const [activeBranch, setActiveBranch] = useState<string>("welcome");

  return (
    <div className="w-full space-y-12">
      {/* =========================================================================
          THE ARCHITECTURAL CONCEPT OF THE THINNAI
          ========================================================================= */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#161210] border border-[#55CCA2]/30 text-[#FAF6F0] space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(85,204,162,0.12),transparent_70%)] pointer-events-none" />

        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#55CCA2]">
            <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-ping" />
            <span>The Architectural Ethos · திண்ணை மரபு</span>
          </div>
          <h3 className="font-serif text-3xl sm:text-5xl text-[#FAF6F0] font-normal leading-tight">
            The Porch That Never Locks Its Door
          </h3>
          <p className="font-sans text-sm sm:text-base text-[#FAF6F0]/80 leading-relaxed">
            In classic Tamil domestic architecture, the <strong className="text-[#55CCA2]">Thinnai (திண்ணை)</strong> is an elevated covered veranda protruding from the front of the house toward the street. It was designed with deep moral intent: so that anyone passing by—a tired traveler, a neighbor in need of water, or a student walking home in the rain—could sit, find shelter, and be treated with sacred hospitality (*Virundhombal*).
          </p>
        </div>

        {/* Blueprint Architectural Grid Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#55CCA2]/20 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-[#55CCA2]/20 space-y-1">
            <span className="text-[#55CCA2] font-bold block">01 · ZERO DUES ENTRY</span>
            <p className="text-[11px] text-[#FAF6F0]/70 font-sans">
              No financial barrier, no membership dues, no exclusionary screening. The porch is unconditionally free for all.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-[#55CCA2]/20 space-y-1">
            <span className="text-[#55CCA2] font-bold block">02 · ALL DIASPORA WELCOME</span>
            <p className="text-[11px] text-[#FAF6F0]/70 font-sans">
              Tamil speakers, friends from across South Asia, and Buckeyes of all cultural backgrounds belong here equally.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-[#55CCA2]/20 space-y-1">
            <span className="text-[#55CCA2] font-bold block">03 · RECIPROCAL KINSHIP</span>
            <p className="text-[11px] text-[#FAF6F0]/70 font-sans">
              Mentorship flows naturally: as upperclassmen graduate, underclassmen step up to guide the next incoming class.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THE THREE KINSHIP BRANCHES
          ========================================================================= */}
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <h4 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal leading-tight">
            The Three Kinship Branches
          </h4>
          <p className="font-sans text-sm sm:text-base text-[#57524C] max-w-2xl">
            Explore how we build continuous peer support into campus life, and volunteer to lead a mentorship or fellowship initiative.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {KINSHIP_BRANCHES.map((branch) => {
            const isSelected = activeBranch === branch.id;
            const Icon = branch.icon;

            return (
              <SpotlightCard
                key={branch.id}
                spotlightColor="rgba(85, 204, 162, 0.15)"
                goldColor="rgba(212, 175, 55, 0.08)"
                radius={360}
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF7F2] border-[#55CCA2] shadow-xl shadow-[#55CCA2]/10"
                    : "bg-[#FAF8F5] border-[#161210]/10 hover:border-[#55CCA2]/40"
                }`}
                onClick={() => {
                  setActiveBranch(branch.id);
                  audioLayer.playTapeClack();
                }}
              >
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-[#55CCA2]/15 flex items-center justify-center text-[#2A7B5E]">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C827A] font-semibold block">
                      {branch.role}
                    </span>
                    <h5 className="font-serif text-2xl text-[#161210] font-normal">
                      {branch.titleEn}
                    </h5>
                    <p lang="ta" className="font-tamil text-sm text-[#2A7B5E] font-medium leading-relaxed">
                      {branch.titleTa}
                    </p>
                  </div>

                  {/* Focus Areas List */}
                  <div className="space-y-2 pt-2 border-t border-[#161210]/10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C827A] block">
                      Key Fellowship Initiatives:
                    </span>
                    <ul className="space-y-1.5">
                      {branch.focusAreas.map((area, i) => (
                        <li key={i} className="text-xs font-sans text-[#57524C] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#55CCA2] shrink-0 mt-1.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blueprint Goal */}
                  <div className="p-3.5 rounded-xl bg-[#F4EFE6]/70 border border-[#161210]/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#161210] block">
                      Living Blueprint Vision:
                    </span>
                    <p className="text-xs font-sans text-[#57524C] leading-relaxed">
                      {branch.blueprintGoal}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#161210]/10">
                  <Link
                    href={`/ideas?category=NEW+INITIATIVE&pillar=santhippum&prompt=${encodeURIComponent(branch.prompt)}`}
                    onClick={() => audioLayer.playTapeClack()}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-[#2A7B5E] hover:text-[#161210] transition-colors"
                  >
                    <span>Volunteer or Propose</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
