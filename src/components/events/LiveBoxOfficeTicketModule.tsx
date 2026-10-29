"use client";

import React, { useState } from "react";
import { 
  Ticket, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Users, 
  QrCode 
} from "lucide-react";
import { activeUpcomingEvent } from "@/config/upcomingEvent";
import { useAudio } from "@/context/AudioContext";
import { SITE_CONFIG } from "@/data/siteConfig";

interface TicketTier {
  id: string;
  name: string;
  nameTa: string;
  price: string;
  badge: string;
  badgeTone: "gold" | "green" | "terracotta";
  description: string;
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: "early-bird",
    name: "Early Bird Admission",
    nameTa: "முன்பதிவு அனுமதி",
    price: "$5.00",
    badge: "Limited Drop",
    badgeTone: "terracotta",
    description: "Includes catered South Indian dinner, sparklers & reserved seating.",
  },
  {
    id: "general",
    name: "General Admission",
    nameTa: "பொது அனுமதி",
    price: "$8.00",
    badge: "Available",
    badgeTone: "green",
    description: "Full entry to cultural performances, food tables & dance floor.",
  },
  {
    id: "group-bundle",
    name: "Buckeye Crew Bundle (3+)",
    nameTa: "குழு கட்டணம் (3+)",
    price: "$6.00 / ea",
    badge: "Best Value",
    badgeTone: "gold",
    description: "Discounted admission for groups of 3 or more Buckeyes.",
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
  const { playClick, playWoodClick } = useAudio();
  const [selectedTier, setSelectedTier] = useState<string>("early-bird");
  const [osuNameDotNumber, setOsuNameDotNumber] = useState<string>("");
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  const eventTitle = activeUpcomingEvent.title;
  const eventDate = activeUpcomingEvent.telemetry.date;
  const eventLocation = activeUpcomingEvent.telemetry.location;

  // Format exact memo string: TS-[EVENT] [name.#@osu.edu]
  const formattedMemo = osuNameDotNumber.trim()
    ? `TS-${eventTitle.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)} [${osuNameDotNumber.trim().toLowerCase()}${osuNameDotNumber.includes("@") ? "" : "@osu.edu"}]`
    : `TS-${eventTitle.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)} [buckeye.#@osu.edu]`;

  const handleCopyMemo = () => {
    playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(formattedMemo).then(() => {
        setCopiedMemo(true);
        setTimeout(() => setCopiedMemo(false), 2400);
      });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#1E1916] text-[#FAF6F0] border border-[#D4AF37]/30 shadow-2xl overflow-hidden p-6 sm:p-8 text-left ${className}`}
    >
      {/* Subtle Warm Brass Atmospheric Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider">
            Live Box Office &amp; Ticket Drop
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">Verified Checkout</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#55CCA2]" />
          <span>Zero Ticketmaster Fees</span>
        </div>
      </div>

      {/* Event Details Lockup */}
      <div className="mt-5 space-y-1.5">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">
            {eventDate} · {eventLocation}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white">
          {eventTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#E8DEC8]/80 font-sans max-w-2xl leading-relaxed">
          {activeUpcomingEvent.teaserQuote}
        </p>
      </div>

      {/* Tier Selection Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TICKET_TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => {
                playWoodClick();
                setSelectedTier(tier.id);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-[#D4AF37] bg-white/10 shadow-md ring-1 ring-[#D4AF37]"
                  : "border-white/10 hover:border-white/25 bg-black/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      tier.badgeTone === "terracotta"
                        ? "bg-[#C85A32]/30 text-[#FF9575] border border-[#C85A32]/40"
                        : tier.badgeTone === "green"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-[#D4AF37]/20 text-[#F5C842] border border-[#D4AF37]/40"
                    }`}
                  >
                    {tier.badge}
                  </span>
                  <span className="text-base sm:text-lg font-serif font-semibold text-white">
                    {tier.price}
                  </span>
                </div>
                <h4 className="text-sm font-serif font-medium text-white mb-1">
                  {tier.name}
                </h4>
                <p className="text-[11px] font-sans text-white/70 leading-normal">
                  {tier.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Venmo Note & Checkout Helper */}
      <div className="mt-6 p-4 sm:p-5 rounded-xl bg-black/30 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-[#D4AF37] uppercase tracking-wider font-semibold block">
              Venmo Checkout Memo Generator
            </span>
            <p className="text-xs text-white/70 font-sans mt-0.5">
              Enter your OSU <code className="text-[#55CCA2]">name.#</code> to format your payment memo correctly:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={osuNameDotNumber}
              onChange={(e) => setOsuNameDotNumber(e.target.value)}
              placeholder="e.g. buckeye.1"
              className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] w-36"
            />
          </div>
        </div>

        {/* Formatted Memo Box */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-black/50 border border-white/15">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-white/50 uppercase block">Venmo Payment Memo:</span>
            <span className="text-xs font-mono text-[#55CCA2] truncate block font-semibold select-all">
              {formattedMemo}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyMemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all bg-[#D4AF37] hover:bg-[#F39C12] text-black shrink-0 cursor-pointer shadow-sm"
          >
            {copiedMemo ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Memo Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Venmo Note</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* One-Click Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Venmo Deep Link */}
        <a
          href="https://venmo.com/u/osutamilsangam"
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#008CFF] hover:bg-[#0070CC] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md focus-visible:outline-2 focus-visible:outline-white"
        >
          <span>Pay via Venmo (@osutamilsangam)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* DoorList / Eventbrite Alternative */}
        <a
          href="https://doorlist.app"
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all border border-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <span>DoorList / Card Pass</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/60" />
        </a>
      </div>
    </div>
  );
}

