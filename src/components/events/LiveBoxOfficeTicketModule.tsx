"use client";

import React from "react";
import { 
  Ticket, 
  Clock, 
  ExternalLink, 
  Bell, 
  Users 
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { SITE_CONFIG } from "@/data/siteConfig";

interface TicketTierPreview {
  id: string;
  name: string;
  nameTa: string;
  status: string;
  description: string;
}

const UPCOMING_TIERS_PREVIEW: TicketTierPreview[] = [
  {
    id: "early-bird",
    name: "Early Bird Admission",
    nameTa: "முன்பதிவு அனுமதி",
    status: "Drop Pending",
    description: "Catered South Indian dinner, priority check-in & reserved seating.",
  },
  {
    id: "general",
    name: "General Admission",
    nameTa: "பொது அனுமதி",
    status: "Drop Pending",
    description: "Full cultural performances, food tables, acoustic jams & dance floor.",
  },
  {
    id: "group-bundle",
    name: "Buckeye Crew Bundle (3+)",
    nameTa: "குழு அனுமதி (3+)",
    status: "Drop Pending",
    description: "Discounted admission for squads and friend groups of 3+ Buckeyes.",
  },
];

interface LiveBoxOfficeTicketModuleProps {
  className?: string;
  compact?: boolean;
}

export function LiveBoxOfficeTicketModule({
  className = "",
}: LiveBoxOfficeTicketModuleProps) {
  const { playClick } = useAudio();

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#1E1916] text-[#FAF6F0] border border-[#D4AF37]/30 shadow-xl overflow-hidden p-4 sm:p-5 text-left ${className}`}
    >
      {/* Subtle Warm Brass Atmospheric Glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            Next Ticket Drop · Coming Soon
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="text-white/60 text-[11px] hidden sm:inline">Official Box Office</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Event In Planning</span>
        </div>
      </div>

      {/* Compact Event Title & Context */}
      <div className="mt-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
          <h3 className="text-lg sm:text-xl font-serif font-normal text-white">
            Next Flagship Ticket Drop
          </h3>
        </div>
        <p className="text-xs text-[#E8DEC8]/80 font-sans max-w-2xl leading-relaxed">
          The executive board is planning our next major campus festival and cultural feast. Ticket releases and checkout drops will open right here.
        </p>
      </div>

      {/* Compact Tier Capsules */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {UPCOMING_TIERS_PREVIEW.map((tier) => (
          <div
            key={tier.id}
            className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-2.5 hover:border-[#D4AF37]/30 transition-colors"
          >
            <div className="min-w-0">
              <h4 className="text-xs font-serif font-medium text-white truncate">
                {tier.name}
              </h4>
              <p className="text-[10px] font-sans text-white/50 truncate">
                {tier.description}
              </p>
            </div>
            <span className="shrink-0 text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
              TBA
            </span>
          </div>
        ))}
      </div>

      {/* Compact Notification Bar & Action Links */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-sans text-white/70">
          <Bell className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span>Get notified first when ticket drop opens:</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all border border-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Join GroupMe</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#C85A32]/40 hover:bg-[#C85A32]/60 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all border border-[#C85A32]/50 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Instagram Updates</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
