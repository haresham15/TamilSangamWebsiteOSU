import React from "react";
import { Disc3, MessageSquarePlus, Radio, Send } from "lucide-react";
import { SITE_CONFIG } from "@/data/siteConfig";
import { CulturalSection } from "@/components/ui/CulturalSection";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";

interface OsuTamilPlaylistGatewayProps {
  className?: string;
  /** "light" = peacock-deep surface (default), "dark" = sangam-deep surface. */
  variant?: "dark" | "light";
  /** Render as a full-bleed jewel band (CulturalSection) instead of a rounded module. */
  bleed?: boolean;
}

export function OsuTamilPlaylistGateway({
  className = "",
  variant = "light",
  bleed = false,
}: OsuTamilPlaylistGatewayProps) {
  const isDark = variant === "dark";
  const tone = isDark ? "dark" : "peacock";

  const body = (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-5 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Eyebrow tone={tone}>
            <span className="inline-flex items-center gap-2">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              Community curated
            </span>
          </Eyebrow>
          <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-sand">
            <Disc3 className="h-3.5 w-3.5 text-accent-zari" aria-hidden="true" />
            Olentangy FM · Only Tamil tracks
          </span>
        </div>

        <h2
          id="playlist-gateway-heading"
          className="font-serif text-3xl font-normal leading-[1.12] tracking-tight text-ink-alabaster sm:text-4xl lg:text-5xl"
        >
          The All-OSU Collaborative Tamil Playlist
        </h2>

        <p lang="ta" className="font-tamil text-lg leading-[1.6] text-brand-lavender sm:text-xl">
          ஓஹியோ ஸ்டேட் தமிழ் மாணவர்களின் கூட்டுப் பாடல்தொகுப்பு
        </p>

        <p className="max-w-2xl font-sans text-base leading-relaxed text-ink-sand">
          We&apos;re building a massive, multi-year OSU collaborative playlist—strictly Tamil tracks added by Buckeyes across every cohort, from 80s Ilaiyaraaja &amp; A.R. Rahman to Anirudh and underground Chennai indie.
        </p>

        <p className="border-t border-border-zari-muted pt-4 font-sans text-sm leading-relaxed text-accent-zari">
          Soundscapes: 80s/90s Raja &amp; Rahman · 2000s Yuvan/Harris · Anirudh / Modern Kuthu · Chennai Indie &amp; Street Folk
        </p>
      </div>

      {/* Action rail: zari hairline instead of a nested box */}
      <div className="flex flex-col justify-center gap-5 border-l border-accent-zari/40 pl-6 lg:col-span-5 lg:pl-10">
        <div className="space-y-2">
          <Eyebrow tone={tone}>Join the sound ledger</Eyebrow>
          <p className="font-sans text-sm leading-relaxed text-ink-sand">
            Spotify &amp; Apple Music collaborative link incubating for 2026–2027. Drop your favorite tracks right now!
          </p>
        </div>

        <div className="flex flex-col items-start gap-3">
          <MuttramButton
            href={SITE_CONFIG.groupMeUrl}
            external
            onDark
            variant="primary"
            icon={<Send className="h-4 w-4" aria-hidden="true" />}
          >
            Drop a song in GroupMe
          </MuttramButton>
          <MuttramButton
            href="/ideas?category=NEW+INITIATIVE&prompt=Playlist+Track+Submission"
            onDark
            variant="secondary"
            icon={<MessageSquarePlus className="h-4 w-4" aria-hidden="true" />}
          >
            Submit a track title
          </MuttramButton>
        </div>
      </div>
    </div>
  );

  if (bleed) {
    return (
      <CulturalSection
        variant={isDark ? "sangam-deep" : "peacock-deep"}
        aria-labelledby="playlist-gateway-heading"
        className={`py-20 sm:py-28 ${className}`.trim()}
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10">{body}</div>
      </CulturalSection>
    );
  }

  return (
    <section
      aria-labelledby="playlist-gateway-heading"
      className={`relative w-full overflow-hidden rounded-2xl border border-accent-zari/30 p-6 text-ink-alabaster shadow-[0_16px_48px_rgba(28,18,43,0.25)] sm:p-8 md:p-10 ${
        isDark ? "bg-bg-sangam-deep" : "bg-bg-peacock-deep"
      } ${className}`.trim()}
    >
      {body}
    </section>
  );
}
