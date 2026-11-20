import React from "react";
import Link from "next/link";
import { Music, Radio, Disc3, MessageSquarePlus, Send, Sparkles } from "lucide-react";

interface OsuTamilPlaylistGatewayProps {
  className?: string;
  variant?: "dark" | "light";
}

export function OsuTamilPlaylistGateway({
  className = "",
  variant = "light",
}: OsuTamilPlaylistGatewayProps) {
  const isDark = variant === "dark";

  return (
    <section
      aria-labelledby="playlist-gateway-heading"
      className={`relative w-full overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 border transition-all ${
        isDark
          ? "bg-[#1C122B] border-[#C79347]/30 text-[#FAF5ED] shadow-xl"
          : "bg-[#102830] border-[#2BB5A8]/30 text-[#FAF5ED] shadow-xl"
      } ${className}`}
    >
      {/* Background Decorative Vinyl Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-15 bg-gradient-to-br from-[#2BB5A8] via-[#C79347] to-transparent blur-3xl"
      />

      <div className="relative max-w-4xl mx-auto space-y-8">
        {/* Editorial Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-white/10 text-xs font-mono tracking-wider uppercase">
          <div className="flex items-center gap-2 text-[#2BB5A8]">
            <Radio className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Community Curated</span>
          </div>

          <div className="flex items-center gap-2 text-[#CBBBA8]">
            <Disc3 className="w-3.5 h-3.5 text-[#2BB5A8]" aria-hidden="true" />
            <span>Olentangy FM · Only Tamil Tracks</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2
              id="playlist-gateway-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-tight text-[#FAF5ED]"
            >
              The All-OSU Collaborative Tamil Playlist
            </h2>

            <p lang="ta" className="text-base sm:text-lg font-tamil text-[#2BB5A8] tracking-normal">
              ஓஹியோ ஸ்டேட் தமிழ் மாணவர்களின் கூட்டுப் பாடல்தொகுப்பு
            </p>

            <p className="text-sm sm:text-base leading-relaxed font-sans text-[#CBBBA8]">
              We&apos;re building a massive, multi-year OSU collaborative playlist—strictly Tamil tracks added by Buckeyes across every cohort, from 80s Ilaiyaraaja &amp; A.R. Rahman to Anirudh and underground Chennai indie.
            </p>

            {/* Soundscapes Line */}
            <p className="text-xs font-mono tracking-wide text-[#2BB5A8]/90 pt-1">
              Soundscapes: 80s/90s Raja &amp; Rahman · 2000s Yuvan/Harris · Anirudh / Modern Kuthu · Chennai Indie &amp; Street Folk
            </p>
          </div>

          {/* Action Ledger Box */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div
              className={`p-5 rounded-xl border space-y-4 shadow-md ${
                isDark ? "bg-[#271A3C] border-[#C79347]/30" : "bg-[#173640] border-[#2BB5A8]/30"
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#2BB5A8] font-bold block">
                  Join the Sound Ledger
                </span>
                <p className="text-xs text-[#CBBBA8]">
                  Spotify &amp; Apple Music collaborative link incubating for 2026–2027. Drop your favorite tracks right now!
                </p>
              </div>

              {/* Action 1: GroupMe */}
              <a
                href="https://web.groupme.com/join_group/83424812/BeBIRg7f"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all bg-[#2BB5A8] text-[#102830] hover:bg-[#3ED0C2] focus:outline-none focus:ring-2 focus:ring-[#2BB5A8]"
              >
                <span>Drop a Song in GroupMe</span>
                <Send className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
              </a>

              {/* Action 2: Ideas Terminal Route */}
              <Link
                href="/ideas?category=NEW+INITIATIVE&prompt=Playlist+Track+Submission"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border border-[#2BB5A8]/40 text-[#FAF5ED] hover:bg-[#102830] transition-all focus:outline-none focus:ring-2 focus:ring-[#2BB5A8]"
              >
                <span>Submit a Track Title</span>
                <MessageSquarePlus className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
