"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export interface OrganicRouteGatewayProps {
  eyebrow?: string;
  tamilEyebrow?: string;
  title: string;
  tamilTitle?: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export const OrganicRouteGateway: React.FC<OrganicRouteGatewayProps> = ({
  eyebrow = "Next Threshold",
  tamilEyebrow,
  title,
  tamilTitle,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = "",
}) => {
  const { playClick, playWoodClick } = useAudio();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={`relative w-full py-28 sm:py-36 px-6 sm:px-12 select-none overflow-hidden ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        playWoodClick();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle Ambient Terracotta Light Gradient on Section Hover (No Bounding Box) */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(184, 92, 56, 0.07) 0%, rgba(229, 169, 60, 0.03) 50%, transparent 80%)",
        }}
      />

      {/* Razor-thin 1px Top Grounding Line */}
      <div className="max-w-[1400px] mx-auto border-t border-[#E5DDD0] pt-20 sm:pt-28 text-center relative z-10">
        
        {/* Eyebrow lockup */}
        <div className="inline-flex items-center justify-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B85C38]" />
          <span className="font-sans text-xs sm:text-sm font-semibold text-[#B85C38] tracking-widest uppercase">
            {eyebrow}
          </span>
          {tamilEyebrow && (
            <>
              <span className="text-[#2A2825]/30">·</span>
              <span lang="ta" className="font-tamil text-xs text-[#E5A93C] font-medium tracking-wide">
                {tamilEyebrow}
              </span>
            </>
          )}
        </div>

        {/* Massive Screen-Spanning Serif Title (Color shifts smoothly to Terracotta on hover) */}
        <Link
          href={primaryHref}
          onClick={playClick}
          className="group block max-w-5xl mx-auto focus:outline-none"
        >
          <h2
            className={`font-serif font-normal tracking-tight leading-[1.05] transition-colors duration-500 ${
              isHovered ? "text-[#B85C38]" : "text-[#2A2825]"
            }`}
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 5.5rem)" }}
          >
            {title}
          </h2>

          {tamilTitle && (
            <p
              lang="ta"
              className="mt-3 font-tamil text-xl sm:text-2xl text-[#2A2825]/45 group-hover:text-[#B85C38]/70 transition-colors duration-500"
            >
              {tamilTitle}
            </p>
          )}
        </Link>

        {/* Conversational Narrative */}
        <p className="mt-8 max-w-2xl mx-auto font-sans text-base sm:text-lg text-[#57524C] leading-relaxed">
          {description}
        </p>

        {/* Typographic Actions (No Pill Buttons) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-sans">
          <Link
            href={primaryHref}
            onClick={playClick}
            className="group inline-flex items-center gap-2 font-semibold text-[#B85C38] border-b-2 border-[#B85C38] pb-1 hover:border-[#E5A93C] hover:text-[#E5A93C] transition-colors cursor-pointer"
          >
            <span>{primaryLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              onClick={playClick}
              className="inline-flex items-center gap-1.5 font-medium text-[#57524C] hover:text-[#2A2825] border-b border-[#2A2825]/20 pb-1 hover:border-[#2A2825] transition-colors cursor-pointer"
            >
              <span>{secondaryLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#2A2825]/60" />
            </Link>
          )}
        </div>

      </div>
    </section>
  );
};
