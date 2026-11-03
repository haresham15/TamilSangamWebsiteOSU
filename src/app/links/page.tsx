"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,
  Users,
  Compass,
  MessageSquare,
  Mail,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Camera,
  ExternalLink,
  Images,
  Lightbulb,
  Award,
  FileText
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { SITE_CONFIG } from "@/data/siteConfig";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.6a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.86-4.47V8.71a8.18 8.18 0 0 0 4.91 1.63v-3.45a4.85 4.85 0 0 1-1-.2z" />
  </svg>
);

interface PreviousEventAlbum {
  id: string;
  num: string;
  title: string;
  season: string;
  location: string;
  url: string;
}

const PREVIOUS_EVENT_ALBUMS: PreviousEventAlbum[] = [
  {
    id: "yaar-andha-killer",
    num: "01",
    title: 'TS "Yaar Andha Killer?" Mystery',
    season: "Fall 2026 · Murder Mystery Night",
    location: "Houston Grove Room, Ohio Union",
    url: SITE_CONFIG.googlePhotosAlbums.album1,
  },
  {
    id: "berry-cute-picnic",
    num: "02",
    title: 'TS "A Berry Cute Picnic"',
    season: "Fall 2025 · Welcome Kickback",
    location: "South Oval Lawn",
    url: SITE_CONFIG.googlePhotosAlbums.album2,
  },
  {
    id: "streetside-sapad",
    num: "03",
    title: "TS Streetside Sapad & Game Night",
    season: "Spring 2026 · General Body Gathering",
    location: "Campus Hall / Ohio Union",
    url: SITE_CONFIG.googlePhotosAlbums.album3,
  },
  {
    id: "namma-jathara",
    num: "04",
    title: "TS x TT: Namma Jathara Carnival",
    season: "Spring 2026 · Joint Spring Carnival",
    location: "RPAC Plaza / South Oval",
    url: SITE_CONFIG.googlePhotosAlbums.album4,
  },
  {
    id: "autumn-gathering",
    num: "05",
    title: "TS x TT Autumn Gathering",
    season: "Fall 2025 · Inter-Club Fellowship",
    location: "Ohio State Campus Spaces",
    url: SITE_CONFIG.googlePhotosAlbums.album5,
  },
];

export default function LinksBioHubPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isPhotosMenuOpen, setIsPhotosMenuOpen] = useState(false);

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#140C20] text-[#F4F0FA] flex flex-col justify-between py-10 px-4 font-sans select-none overflow-x-hidden">
      {/* Ambient Mint Radiant Blooms */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_600px_400px_at_15%_10%,rgba(166,240,207,0.12),transparent_60%),radial-gradient(ellipse_700px_450px_at_85%_65%,rgba(166,240,207,0.09),transparent_65%),radial-gradient(ellipse_500px_350px_at_50%_90%,rgba(79,214,224,0.08),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Structural Watermark */}
      <WatermarkGlyph text="இணைப்பு" position="center" theme="mint" opacity={0.07} />

      {/* Top Persistent Return Bar */}
      <header className="w-full max-w-md mx-auto mb-6 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Website</span>
        </Link>
        <span className="text-[#A6F0CF] bg-[#A6F0CF]/10 border border-[#A6F0CF]/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold">
          Bio Hub
        </span>
      </header>

      {/* Centered Editorial Column */}
      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col items-center text-center">
        {/* Prominent 'Explore Full Website' Top Banner */}
        <Link
          href="/"
          className="group w-full mb-8 p-3.5 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] transition-all flex items-center justify-between shadow-md focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
        >
          <div className="flex items-center gap-2.5 text-left pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A6F0CF] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
              Explore Full Website
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#A6F0CF] font-semibold group-hover:translate-x-1 transition-transform">
            <span>Enter Site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Club Crest / Avatar */}
        <div className="relative w-20 h-20 mb-4 rounded-full border-2 border-[#A6F0CF]/40 bg-[#25173B] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <span className="text-4xl font-serif font-bold text-[#A6F0CF]" lang="ta">
            ஐ
          </span>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#F4F0FA] mb-1">
          {SITE_CONFIG.brandNameEn}
        </h1>
        <p className="text-xs text-[#A6F0CF] font-mono uppercase tracking-widest mb-2 font-bold">
          @tamilsangam.osu · The Ohio State University
        </p>
        <p className="text-xs text-[#C4B7D7] mb-6 max-w-xs leading-relaxed font-sans">
          Open student hearth · ஆட்டம் · பாட்டம் · கொண்டாட்டம் · Columbus, OH
        </p>

        {/* Quick Social Actions Row */}
        <div className="w-full flex items-center justify-center gap-5 sm:gap-6 mb-8 pb-6 border-b border-[rgba(125,96,166,0.3)]">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            aria-label="Instagram profile"
          >
            <InstagramIcon className="w-4 h-4 text-[#F26BB5]" />
            <span>Instagram</span>
          </a>
          <a
            href={SITE_CONFIG.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            aria-label="TikTok profile"
          >
            <TikTokIcon className="w-3.5 h-3.5 text-[#4FD6E0]" />
            <span>TikTok</span>
          </a>
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            aria-label="GroupMe chat"
          >
            <MessageSquare className="w-4 h-4 text-[#A6F0CF]" />
            <span>GroupMe</span>
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", SITE_CONFIG.contactEmail)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors cursor-pointer"
            aria-label="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <>
                <Check className="w-4 h-4 text-[#A6F0CF]" />
                <span className="text-[#A6F0CF] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-[#C4B7D7]" />
                <span>Email</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Link Stack */}
        <div className="w-full space-y-3.5 text-left">
          
          {/* Section: Core Gatherings & Community */}
          <div className="space-y-2.5">
            {/* 1. Next Upcoming Event / Schedule */}
            <Link
              href="/events"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] group-hover:border-[#A6F0CF]/60 transition-colors shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block">
                      Events &amp; Calendar · All Welcome
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors truncate">
                      Event Schedule &amp; Gatherings
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Celebrations, festivals, dates, and campus event dossiers
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#A6F0CF] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* 2. Join the Sangam / Membership */}
            <Link
              href="/join"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#F26BB5] group-hover:border-[#F26BB5]/60 transition-colors shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F26BB5] font-bold block">
                        Join the Family
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#A6F0CF]/15 text-[#A6F0CF] font-bold">
                        100% Free · $0 Dues
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#F26BB5] transition-colors truncate">
                      Membership &amp; Community Guestbook
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Sign the guestbook, performer signups &amp; freshman mentorship
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#F26BB5] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>
          </div>

          {/* Section: Photos Archive Button with Expandable Previous Events Menu */}
          <div className="pt-2">
            <div className="rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] overflow-hidden transition-all shadow-md hover:border-[#A6F0CF]/60">
              <button
                type="button"
                onClick={() => setIsPhotosMenuOpen((prev) => !prev)}
                aria-expanded={isPhotosMenuOpen}
                aria-controls="photos-menu-content"
                className="w-full p-4 flex items-start justify-between gap-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#4FD6E0] shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#4FD6E0] font-bold block">
                        Photo Archive
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#140C20] text-[#A6F0CF] border border-[#A6F0CF]/30 font-semibold">
                        {PREVIOUS_EVENT_ALBUMS.length} Albums
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA]">
                      Previous Event Photo Vaults
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 font-sans">
                      {isPhotosMenuOpen ? "Tap to close album list" : "Tap to open all high-resolution Google Photos links"}
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-full text-[#C4B7D7] shrink-0 mt-1">
                  <motion.div animate={{ rotate: isPhotosMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[#A6F0CF]" />
                  </motion.div>
                </div>
              </button>

              {/* Expandable Menu of Previous Event Album Links */}
              <AnimatePresence initial={false}>
                {isPhotosMenuOpen && (
                  <motion.div
                    id="photos-menu-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-[rgba(125,96,166,0.3)] bg-[#1c112e]"
                  >
                    <div className="p-3.5 space-y-2">
                      <p className="text-[11px] font-mono text-[#A6F0CF] px-1 uppercase tracking-wider font-bold">
                        Official Google Photos Albums:
                      </p>
                      {PREVIOUS_EVENT_ALBUMS.map((album) => (
                        <a
                          key={album.id}
                          href={album.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/album block p-3 rounded-lg bg-[#25173B] border border-[rgba(125,96,166,0.3)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#A6F0CF] font-bold">
                                  {album.num}
                                </span>
                                <h3 className="text-xs font-serif font-medium text-[#F4F0FA] group-hover/album:text-[#A6F0CF] transition-colors truncate">
                                  {album.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-[#C4B7D7] mt-0.5 truncate font-sans">
                                {album.season} · {album.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-[#A6F0CF] shrink-0 font-medium">
                              <span className="hidden sm:inline">Open</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </a>
                      ))}

                      {/* Link to Website Living Photo Gallery */}
                      <Link
                        href="/gallery"
                        className="w-full mt-2 py-2.5 px-3 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.3)] hover:border-[#A6F0CF]/60 text-[#F4F0FA] flex items-center justify-between text-xs font-mono font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Images className="w-4 h-4 text-[#A6F0CF]" />
                          <span>View 35mm Campus Gallery on Website</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A6F0CF]" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section: Community Channels */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#A6F0CF] uppercase tracking-wider block px-1 font-bold">
              Official Community &amp; Chats
            </span>

            {/* GroupMe Section */}
            <a
              href={SITE_CONFIG.groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#00AFF0]/70 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(0,175,240,0.08)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[#00AFF0]/40 text-[#00AFF0] group-hover:border-[#00AFF0] transition-colors shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00AFF0] font-bold block">
                      Student Chat · GroupMe
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#00AFF0] transition-colors truncate">
                      Official Student GroupMe
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      120+ Buckeyes · rideshares, meetups, food spots &amp; active chat
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#00AFF0] transition-all shrink-0 mt-2" />
              </div>
            </a>

            {/* Instagram Section */}
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#E1306C]/70 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(225,48,108,0.08)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[#E1306C]/40 text-[#E1306C] group-hover:border-[#E1306C] transition-colors shrink-0 mt-0.5">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E1306C] font-bold block">
                      Instagram · @tamilsangam.osu
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#E1306C] transition-colors truncate">
                      Official Instagram Page
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Stories, live event announcements &amp; photo reels
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#E1306C] transition-all shrink-0 mt-2" />
              </div>
            </a>

            {/* TikTok Section */}
            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#4FD6E0]/70 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(79,214,224,0.08)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[#4FD6E0]/40 text-[#4FD6E0] group-hover:border-[#4FD6E0] transition-colors shrink-0 mt-0.5">
                    <TikTokIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4FD6E0] font-bold block">
                      TikTok · @osutamilsangam
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#4FD6E0] transition-colors truncate">
                      Official TikTok Channel
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Campus POV clips, dance routines &amp; event highlights
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#4FD6E0] transition-all shrink-0 mt-2" />
              </div>
            </a>
          </div>

          {/* Section: Campus Exploration & Student Resources */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#A6F0CF] uppercase tracking-wider block px-1 font-bold">
              Student Resources &amp; Discovery
            </span>

            {/* New Student Guide & FAQ */}
            <Link
              href="/guide"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] group-hover:border-[#A6F0CF]/60 transition-colors shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block">
                      Freshmen &amp; Transfer Handbook
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors truncate">
                      Student Survival Guide &amp; FAQ
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Columbus South Asian dining, grocery markets, transit &amp; housing
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#A6F0CF] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Executive Board Leadership */}
            <Link
              href="/board"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] group-hover:border-[#A6F0CF]/60 transition-colors shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block">
                      2026–2027 Leadership
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors truncate">
                      Executive Board Officers
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Meet the team leading Tamil Sangam at Ohio State
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#A6F0CF] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Ideas Hearth */}
            <Link
              href="/ideas"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#F26BB5] group-hover:border-[#F26BB5]/60 transition-colors shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F26BB5] font-bold block">
                      Propose Events &amp; Feedback
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#F26BB5] transition-colors truncate">
                      The Ideas Hearth
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Submit anonymous suggestions, workshop ideas &amp; event requests
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#F26BB5] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Games & Cultural Lab */}
            <Link
              href="/games"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#4FD6E0]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(79,214,224,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#4FD6E0] group-hover:border-[#4FD6E0]/60 transition-colors shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4FD6E0] font-bold block">
                      Interactive Cultural Lab
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#4FD6E0] transition-colors truncate">
                      Wordle, Connections &amp; Kolam
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Play daily Tamil-English word puzzles (Sollu) and pattern games
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#4FD6E0] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Constitution Document */}
            <a
              href={SITE_CONFIG.constitutionPdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all focus-visible:outline-2 focus-visible:outline-[#4FD6E0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#C4B7D7] group-hover:border-[#A6F0CF]/60 group-hover:text-[#A6F0CF] transition-colors shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4B7D7] font-bold block">
                      Official Governance
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors truncate">
                      Constitution (2026–2027)
                    </h2>
                    <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
                      Official student organization bylaws registered at Ohio State
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#A6F0CF] transition-all shrink-0 mt-2" />
              </div>
            </a>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-xs text-[#C4B7D7] space-y-1">
        <p className="font-medium text-[#F4F0FA]">{SITE_CONFIG.universityAffiliationEn}</p>
        <p className="text-[11px] text-[#C4B7D7]">
          {SITE_CONFIG.officialNameTa} · Project Aintinai (ஐந்திணை)
        </p>
      </footer>
    </div>
  );
}
