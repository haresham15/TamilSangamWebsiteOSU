"use client";

import React, { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export interface PathirikaiFormFrameProps {
  titleEn: string;
  titleTa?: string;
  formUrl: string;
  embedSrc: string;
  minHeight?: string;
  className?: string;
}

/**
 * PathirikaiFormFrame Primitive (PRD §6.3)
 * Elegant, culturally grounded frame for embedded Google Forms:
 * - Sits cleanly inside a crisp #FFFFFF card on warm Sandstone surfaces.
 * - Topped with a Royal Sangam Deep header bar with Zari Gold title and external link.
 * - Shows an animated sandstone shimmer skeleton (#E7DAC6) until the iframe loads,
 *   completely eradicating jarring empty dark voids.
 */
export function PathirikaiFormFrame({
  titleEn,
  titleTa,
  formUrl,
  embedSrc,
  minHeight = "680px",
  className = "",
}: PathirikaiFormFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      data-pathirikai-form-frame="true"
      className={`w-full rounded-2xl bg-white border border-[#DFD1BE] shadow-[0_16px_48px_rgba(38,26,20,0.08)] overflow-hidden ${className}`.trim()}
    >
      {/* Header Bar in Royal Sangam Deep with Zari Gold Accents */}
      <div className="bg-[#1C122B] px-5 py-4 border-b border-[#C79347]/30 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#271A3C] text-[#C79347] border border-[#C79347]/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-medium text-[#FAF5ED] tracking-wide flex items-center gap-2">
              <span>{titleEn}</span>
              {titleTa && (
                <span lang="ta" style={{ letterSpacing: 0 }} className="text-xs text-[#C79347] font-normal font-serif">
                  ({titleTa})
                </span>
              )}
            </h3>
            <span className="text-[10px] font-mono tracking-wider text-[#CBBBA8] uppercase">
              Official Buckeye Registration Portal
            </span>
          </div>
        </div>

        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0B5C56] text-[#FAF5ED] text-xs font-mono font-medium tracking-wider transition-colors shadow-sm"
        >
          <span>Open in Tab</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Frame Container with Shimmer Loading State */}
      <div className="relative w-full overflow-hidden bg-[#FAF6F0]" style={{ minHeight }}>
        {!isLoaded && (
          <div
            className="absolute inset-0 w-full h-full shimmer-sandstone flex flex-col items-center justify-center p-8 text-center"
            aria-live="polite"
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#9A6B3E] border-t-transparent animate-spin mb-3" />
            <p className="font-serif text-sm text-[#5E4C40]">
              Loading Official Registration Form...
            </p>
            <span className="text-[11px] font-mono text-[#9A6B3E] mt-1">
              Connects directly to secure Google Forms
            </span>
          </div>
        )}

        <iframe
          src={embedSrc}
          title={titleEn}
          className="w-full h-full border-0 transition-opacity duration-300"
          style={{ minHeight, opacity: isLoaded ? 1 : 0 }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        >
          Loading registration form...
        </iframe>
      </div>
    </div>
  );
}
