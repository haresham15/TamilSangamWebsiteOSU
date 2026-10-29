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
    description: "Includes catered South Indian dinner, priority check-in & reserved seating.",
  },
  {
    id: "general",
    name: "General Admission",
    nameTa: "பொது அனுமதி",
    status: "Drop Pending",
    description: "Full entry to cultural performances, food tables, acoustic jams & dance floor.",
  },
  {
    id: "group-bundle",
    name: "Buckeye Crew Bundle (3+)",
    nameTa: "குழு அனுமதி (3+)",
    status: "Drop Pending",
    description: "Discounted admission for squads and friend groups of 3 or more Buckeyes.",
  },
];

interface LiveBoxOfficeTicketModuleProps {
  className?: string;
  compact?: boolean;
}

export function LiveBoxOfficeTicketModule({
  className = "",
  compact = false,
}: LiveBoxOfficeTicketModuleProps) {
  const { playClick } = useAudio();

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#1E1916] text-[#FAF6F0] border border-[#D4AF37]/30 shadow-2xl overflow-hidden p-6 sm:p-8 text-left ${className}`}
    >
      {/* Subtle Warm Brass Atmospheric Gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 font-bold uppercase tracking-wider">
            Next Ticket Drop · Coming Soon
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">Official Box Office</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Event In Planning</span>
        </div>
      </div>

      {/* Event Details Lockup */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">
            Next Flagship Celebration · The Ohio State University
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white">
          Next Flagship Ticket Drop
        </h3>
        <p className="text-xs sm:text-sm text-[#E8DEC8]/80 font-sans max-w-2xl leading-relaxed">
          Our previous gathering has concluded! The executive board is currently planning our next major campus festival and cultural feast. Ticket releases, Early Bird drops, and checkout options will open right here.
        </p>
      </div>

      {/* Tier Preview Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {UPCOMING_TIERS_PREVIEW.map((tier) => (
          <div
            key={tier.id}
            className="p-4 rounded-xl border border-white/10 bg-black/25 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {tier.status}
                </span>
                <span className="text-xs font-mono text-white/50">TBA</span>
              </div>
              <h4 className="text-sm font-serif font-medium text-white mb-1">
                {tier.name}
              </h4>
              <p className="text-[11px] font-sans text-white/70 leading-normal">
                {tier.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Strip & Action Links */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-sans text-white/80">
          <Bell className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>Get notified first when ticket drop opens:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all border border-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Join GroupMe</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#C85A32]/40 hover:bg-[#C85A32]/60 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all border border-[#C85A32]/50 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Instagram Updates</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
