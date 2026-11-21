import React from "react";
import { Film, Coffee, Gamepad2, ArrowUpRight, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/data/siteConfig";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { CulturalCard } from "@/components/ui/CulturalCard";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";

interface GroupMePulseGatewaysProps {
  className?: string;
  /** Kept for backward compatibility. The band always renders as a sangam-deep jewel band. */
  variant?: "dark" | "light";
}

const PULSE_CARDS = [
  {
    id: "fdfs-movies",
    icon: Film,
    badge: "FDFS Screenings",
    titleEn: "FDFS Kollywood Theater Meetups",
    titleTa: "முதல் நாள் முதல் காட்சி சினிமா சந்திப்புகள்",
    desc: "Whenever a major Tamil film drops, we pick a Columbus theater & showtime, coordinate carpools from the Ohio Union, and watch together as a meeting.",
    iconClass: "bg-accent-zari/15 text-accent-zari",
  },
  {
    id: "study-cricket",
    icon: Coffee,
    badge: "Chill Kickbacks",
    titleEn: "Study Tables & Cricket Watch-Alongs",
    titleTa: "படிப்பு சந்திப்பு & கிரிக்கெட் நேரலை",
    desc: "Low-maintenance bonding—Thompson Library study tables, IPL/India cricket watch-alongs, and late-night food runs with fellow Buckeyes.",
    iconClass: "bg-brand-teal-dark/15 text-brand-teal-dark",
  },
  {
    id: "game-lab",
    icon: Gamepad2,
    badge: "Small-Squad Lab",
    titleEn: "Small-Squad Game Lab (No Repeat Games)",
    titleTa: "புதிய குழு விளையாட்டு பட்டறை",
    desc: "Moving beyond standard Kahoot & musical chairs—designing small-group team games, Kollywood auctions, and social deduction rounds where everyone plays.",
    iconClass: "bg-brand-lavender/15 text-brand-lavender",
  },
] as const;

/**
 * GroupMePulseGateways — one full-bleed sangam-deep jewel band (recipe D) for the
 * GroupMe hangout pulse. Tiles are CulturalCard dark; the single CTA is a teal-dark MuttramButton.
 */
export function GroupMePulseGateways({ className = "" }: GroupMePulseGatewaysProps) {
  return (
    <CulturalSection
      variant="sangam-deep"
      divider="korvai"
      aria-labelledby="groupme-pulse-heading"
      className={className}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20 sm:py-28">
        {/* Header strip */}
        <div className="flex flex-col gap-8 border-b border-border-zari-muted pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <Eyebrow tone="dark">Pop-Up Hangouts</Eyebrow>
            <h2
              id="groupme-pulse-heading"
              className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-alabaster sm:text-4xl lg:text-5xl"
            >
              Between the Big Meetings: Live GroupMe Pulse
            </h2>
            <p className="max-w-2xl pt-1 font-sans text-base leading-relaxed text-ink-sand sm:text-lg">
              OSU Tamil Sangam isn&apos;t just 4 formal meetings a year. We are turning our GroupMe into an active, low-maintenance hub for spontaneous student hangouts across campus.
            </p>
          </div>

          <div className="shrink-0">
            <MuttramButton
              href={SITE_CONFIG.groupMeUrl}
              external
              onDark
              icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
              ariaLabel="Join Campus Chat on GroupMe (opens in a new tab)"
            >
              Join Campus Chat
            </MuttramButton>
          </div>
        </div>

        {/* Hangout tiles */}
        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PULSE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <CulturalCard key={card.id} as="li" variant="dark" className="flex flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-lg p-2.5 ${card.iconClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-sand">
                    {card.badge}
                  </span>
                </div>

                <div className="mt-6 space-y-1">
                  <h3 className="font-serif text-xl font-medium tracking-tight text-ink-alabaster">
                    {card.titleEn}
                  </h3>
                  <p lang="ta" className="font-tamil text-sm leading-[1.6] tracking-normal text-accent-zari">
                    {card.titleTa}
                  </p>
                </div>

                <p className="mb-6 mt-4 font-sans text-sm leading-relaxed text-ink-sand">{card.desc}</p>

                <div className="mt-auto border-t border-border-zari-muted pt-4">
                  <a
                    href={SITE_CONFIG.groupMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Vote on the ${card.titleEn} poll in GroupMe (opens in a new tab)`}
                    className="inline-flex min-h-12 items-center gap-1.5 rounded font-sans text-sm font-medium text-brand-teal-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
                  >
                    <span>Vote on poll in GroupMe</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </CulturalCard>
            );
          })}
        </ul>
      </div>
    </CulturalSection>
  );
}
