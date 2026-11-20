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
      className={`relative w-full rounded-2xl bg-[#1C122B] text-[#FAF5ED] border border-[#C79347]/40 shadow-xl overflow-hidden p-4 sm:p-5 text-left card-pathirikai ${className}`}
    >
      {/* Subtle Warm Brass Atmospheric Glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-[radial-gradient(circle_at_top_right,rgba(199,147,71,0.12),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(212,163,106,0.2)] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C79347]" />
          <span className="text-[#C79347] font-bold uppercase tracking-wider text-[11px]">
            Next Ticket Drop · Coming Soon
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="text-[#CBBBA8] text-[11px] hidden sm:inline">Official Box Office</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#CBBBA8] text-[10px]">
          <Clock className="w-3 h-3 text-[#C79347]" />
          <span>Event In Planning</span>
        </div>
      </div>

      {/* Compact Event Title & Context */}
      <div className="mt-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <Ticket className="w-3.5 h-3.5 text-[#C79347]" />
          <h3 className="text-lg sm:text-xl font-serif font-normal text-[#FAF5ED]">
            Next Flagship Ticket Drop
          </h3>
        </div>
        <p className="text-xs text-[#CBBBA8] font-sans max-w-2xl leading-relaxed">
          The executive board is planning our next major campus festival and cultural feast. Ticket releases and checkout drops will open right here.
        </p>
      </div>

      {/* Compact Tier Capsules */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {UPCOMING_TIERS_PREVIEW.map((tier) => (
          <div
            key={tier.id}
            className="px-3 py-2 rounded-xl border border-[rgba(212,163,106,0.2)] bg-[#271A3C] flex items-center justify-between gap-2.5 hover:border-[#C79347]/50 transition-colors"
          >
            <div className="min-w-0">
              <h4 className="text-xs font-serif font-medium text-[#FAF5ED] truncate">
                {tier.name}
              </h4>
              <p className="text-[10px] font-sans text-[#CBBBA8] truncate">
                {tier.description}
              </p>
            </div>
            <span className="shrink-0 text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#C79347]/15 text-[#C79347] border border-[#C79347]/30">
              TBA
            </span>
          </div>
        ))}
      </div>

      {/* Compact Notification Bar & Action Links */}
      <div className="mt-3.5 pt-3 border-t border-[rgba(212,163,106,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-sans text-[#CBBBA8]">
          <Bell className="w-3.5 h-3.5 text-[#C79347] shrink-0" />
          <span>Get notified first when ticket drop opens:</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0F766E] hover:bg-[#0B5C56] text-[#FAF5ED] font-mono text-xs font-semibold uppercase tracking-wider transition-colors border border-[#0F766E]/40 shadow-xs focus-visible:outline-2 focus-visible:outline-[#0F766E]"
          >
            <Users className="w-3 h-3 text-[#FAF5ED]" />
            <span>Join GroupMe</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#271A3C] hover:bg-[#B84A39]/20 text-[#E06D58] hover:text-[#FAF5ED] font-mono text-xs font-semibold uppercase tracking-wider transition-colors border border-[#B84A39]/40 focus-visible:outline-2 focus-visible:outline-[#E06D58]"
          >
            <span>Instagram Updates</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
