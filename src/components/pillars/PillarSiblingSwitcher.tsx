// src/components/pillars/PillarSiblingSwitcher.tsx
"use client";

import React from "react";
import Link from "next/link";
import { soundEngine } from "@/lib/soundEngine";
import { ALL_PILLARS, PillarSlug } from "@/data/pillars";
import { ArrowLeft, ChevronRight, Compass } from "lucide-react";

interface PillarSiblingSwitcherProps {
  currentSlug: PillarSlug;
}

export function PillarSiblingSwitcher({ currentSlug }: PillarSiblingSwitcherProps) {
  return (
    <nav
      aria-label="Pillar Navigation Strip"
      className="w-full bg-[#161210] border-t border-[#FAF6F0]/10 py-10 px-4 sm:px-6 lg:px-8 text-[#FAF6F0]"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top return link & strip label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF6F0]/10 pb-4">
          <Link
            href="/#five-pillars"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#D4AF37] hover:text-[#FAF6F0] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to The Five Pillars Overview (Home)</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#FAF6F0]/60">
            <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>THE LIVING ARCHITECTURAL PILLARS · 01–05</span>
          </div>
        </div>

        {/* 5-Column Switcher Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_PILLARS.map((pillar, idx) => {
            const isActive = pillar.slug === currentSlug;

            return (
              <Link
                key={pillar.slug}
                href={`/pillars/${pillar.slug}`}
                onMouseEnter={() => {
                  if (!isActive) soundEngine.playPillarHover(idx);
                }}
                className={`group relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "bg-[#FAF6F0]/10 border-[#D4AF37]/80 ring-1 ring-[#D4AF37]/50 shadow-lg"
                    : "bg-[#1E1916]/80 border-[#FAF6F0]/10 hover:border-[#FAF6F0]/30 hover:bg-[#25201C]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-serif text-sm font-semibold ${
                        isActive ? "text-[#D4AF37]" : "text-[#FAF6F0]/60 group-hover:text-[#FAF6F0]"
                      }`}
                    >
                      {pillar.number}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        Current
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#FAF6F0]/30 group-hover:text-[#FAF6F0] transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>

                  <div>
                    <h5
                      className={`font-serif text-base font-medium leading-snug ${
                        isActive ? "text-[#FAF6F0]" : "text-[#FAF6F0]/80 group-hover:text-[#FAF6F0]"
                      }`}
                    >
                      {pillar.titleEn}
                    </h5>
                    <p
                      lang="ta"
                      className="font-serif text-xs text-[#FAF6F0]/60 tracking-normal"
                      style={{ letterSpacing: 0 }}
                    >
                      {pillar.titleTa}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#FAF6F0]/5 text-[10px] font-mono text-[#FAF6F0]/50 truncate">
                  {pillar.categoryLabel}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
