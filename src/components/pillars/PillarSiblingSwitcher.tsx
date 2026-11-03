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
      className="w-full bg-[#140C20] border-t border-[rgba(125,96,166,0.25)] py-10 px-4 sm:px-6 lg:px-8 text-[#F4F0FA]"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top return link & strip label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(125,96,166,0.25)] pb-4">
          <Link
            href="/#five-pillars"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A6F0CF] hover:text-[#F4F0FA] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to The Five Pillars Overview (Home)</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#C4B7D7]">
            <Compass className="w-3.5 h-3.5 text-[#A6F0CF]" />
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
                    ? "bg-[#140C20]/10 border-[#A6F0CF]/35 ring-1 ring-[#A6F0CF]/50 shadow-lg"
                    : "bg-[#140C20]/80 border-[rgba(125,96,166,0.25)] hover:border-[rgba(125,96,166,0.25)] hover:bg-[#25173B]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-serif text-sm font-semibold ${
                        isActive ? "text-[#A6F0CF]" : "text-[#C4B7D7] group-hover:text-[#F4F0FA]"
                      }`}
                    >
                      {pillar.number}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#A6F0CF]/20 text-[#A6F0CF] border border-[#A6F0CF]/35">
                        Current
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#C4B7D7] group-hover:text-[#F4F0FA] transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>

                  <div>
                    <h5
                      className={`font-serif text-base font-medium leading-snug ${
                        isActive ? "text-[#F4F0FA]" : "text-[#C4B7D7] group-hover:text-[#F4F0FA]"
                      }`}
                    >
                      {pillar.titleEn}
                    </h5>
                    <p
                      lang="ta"
                      className="font-serif text-xs text-[#C4B7D7] tracking-normal"
                      style={{ letterSpacing: 0 }}
                    >
                      {pillar.titleTa}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[rgba(125,96,166,0.25)] text-[10px] font-mono text-[#C4B7D7] truncate">
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
