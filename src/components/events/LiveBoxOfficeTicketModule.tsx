"use client";

import React from "react";
import { Ticket, Clock, Bell, Users, ExternalLink } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { SITE_CONFIG } from "@/data/siteConfig";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { Eyebrow } from "@/components/muttram/Eyebrow";

interface TicketTierPreview {
  id: string;
  name: string;
  nameTa: string;
  description: string;
}

const UPCOMING_TIERS_PREVIEW: TicketTierPreview[] = [
  {
    id: "early-bird",
    name: "Early Bird Admission",
    nameTa: "முன்பதிவு அனுமதி",
    description: "Catered South Indian dinner, priority check-in & reserved seating.",
  },
  {
    id: "general",
    name: "General Admission",
    nameTa: "பொது அனுமதி",
    description: "Full cultural performances, food tables, acoustic jams & dance floor.",
  },
  {
    id: "group-bundle",
    name: "Buckeye Crew Bundle (3+)",
    nameTa: "குழு அனுமதி (3+)",
    description: "Discounted admission for squads and friend groups of 3+ Buckeyes.",
  },
];

interface LiveBoxOfficeTicketModuleProps {
  className?: string;
  compact?: boolean;
}

/**
 * The /events ticket drop: one pathirikai card holding the TBA tiers and the
 * page's GroupMe + Instagram notification CTAs.
 */
export function LiveBoxOfficeTicketModule({ className = "" }: LiveBoxOfficeTicketModuleProps) {
  const { playClick } = useAudio();

  return (
    <CulturalCard
      variant="pathirikai"
      as="aside"
      aria-labelledby="ticket-drop-heading"
      className={`p-6 text-left sm:p-8 ${className}`.trim()}
    >
      {/* Status line */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-zari-muted pb-4">
        <div className="flex items-center gap-2.5">
          {/* The page's one kumkum accent: the festival drop indicator */}
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-kumkum-dark" />
          <Eyebrow tone="dark">Next ticket drop · Coming soon</Eyebrow>
        </div>
        <span className="inline-flex items-center gap-1.5 font-sans text-xs text-ink-sand">
          <Clock className="h-3.5 w-3.5 text-accent-zari" aria-hidden="true" />
          Event in planning
        </span>
      </div>

      {/* Title + context */}
      <div className="mt-5 space-y-2">
        <h2 id="ticket-drop-heading" className="flex items-center gap-2.5 font-serif text-2xl font-normal text-ink-alabaster sm:text-3xl">
          <Ticket className="h-5 w-5 shrink-0 text-accent-zari" aria-hidden="true" />
          Next Flagship Ticket Drop
        </h2>
        <p className="max-w-xl font-sans text-sm leading-relaxed text-ink-sand">
          The executive board is planning our next major campus festival and cultural feast. Ticket releases will open right here.
        </p>
      </div>

      {/* Tier ledger */}
      <ul className="mt-6 divide-y divide-border-zari-muted border-y border-border-zari-muted">
        {UPCOMING_TIERS_PREVIEW.map((tier) => (
          <li key={tier.id} className="flex items-start justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <p className="font-serif text-base text-ink-alabaster">{tier.name}</p>
              <p lang="ta" className="font-tamil text-sm leading-[1.6] text-brand-lavender">
                {tier.nameTa}
              </p>
              <p className="mt-0.5 font-sans text-xs leading-relaxed text-ink-sand">{tier.description}</p>
            </div>
            <span className="mt-1 shrink-0 rounded-full border border-accent-zari/50 bg-accent-zari/10 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-zari">
              TBA
            </span>
          </li>
        ))}
      </ul>

      {/* Notify CTAs */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-sans text-sm text-ink-sand">
          <Bell className="h-4 w-4 shrink-0 text-accent-zari" aria-hidden="true" />
          Get notified first when the drop opens
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <MuttramButton
            href={SITE_CONFIG.groupMeUrl}
            external
            onDark
            size="sm"
            onClick={playClick}
            icon={<Users className="h-4 w-4" aria-hidden="true" />}
            className="min-h-12"
          >
            Join GroupMe
          </MuttramButton>
          <MuttramButton
            href={SITE_CONFIG.instagramUrl}
            external
            onDark
            variant="secondary"
            size="sm"
            onClick={playClick}
            icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
            className="min-h-12"
          >
            Instagram updates
          </MuttramButton>
        </div>
      </div>
    </CulturalCard>
  );
}
