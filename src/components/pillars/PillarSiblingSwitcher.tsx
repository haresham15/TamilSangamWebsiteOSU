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
      className="w-full bg-[#1C122B] border-t border-[#C79347]/30 py-10 px-4 sm:px-6 lg:px-8 text-[#FAF5ED]"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top return link & strip label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C79347]/30 pb-4">
          <Link
            href="/#five-pillars"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#C79347] hover:text-[#FAF5ED] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to The Five Pillars Overview (Home)</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#CBBBA8]">
            <Compass className="w-3.5 h-3.5 text-[#C79347]" />
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
                className={`group relative p-4 rounded-xl border transition-[border-color,background-color,box-shadow] duration-200 flex flex-col justify-between ${
                  isActive
                    ? "bg-[#271A3C] border-[#C79347]/60 ring-1 ring-[#C79347]/40 shadow-lg"
                    : "bg-[#1C122B] border-[#C79347]/20 hover:border-[#C79347]/40 hover:bg-[#271A3C]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-serif text-sm font-semibold ${
                        isActive ? "text-[#C79347]" : "text-[#CBBBA8] group-hover:text-[#FAF5ED]"
                      }`}
                    >
                      {pillar.number}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C79347]/20 text-[#C79347] border border-[#C79347]/40 font-bold">
                        Current
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#CBBBA8] group-hover:text-[#FAF5ED] transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>

                  <div>
                    <h5
                      className={`font-serif text-base font-medium leading-snug ${
                        isActive ? "text-[#FAF5ED]" : "text-[#CBBBA8] group-hover:text-[#FAF5ED]"
                      }`}
                    >
                      {pillar.titleEn}
                    </h5>
                    <p
                      lang="ta"
                      className="font-serif text-xs text-[#CBBBA8] tracking-normal"
                      style={{ letterSpacing: 0 }}
                    >
                      {pillar.titleTa}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#C79347]/20 text-[10px] font-mono text-[#CBBBA8] truncate">
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
