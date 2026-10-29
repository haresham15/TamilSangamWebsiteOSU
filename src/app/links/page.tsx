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
  Images
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { SITE_CONFIG } from "@/data/siteConfig";
import { activeUpcomingEvent } from "@/config/upcomingEvent";
import { LiveBoxOfficeTicketModule } from "@/components/events/LiveBoxOfficeTicketModule";

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
    season: "Fall 2026 · Murder Mystery",
    location: "Houston Grove Room, Ohio Union",
    url: SITE_CONFIG.googlePhotosAlbums.album1,
  },
  {
    id: "berry-cute-picnic",
    num: "02",
    title: 'TS "A Berry Cute Picnic"',
    season: "Fall 2025 · Welcome Social",
    location: "South Oval Lawn",
    url: SITE_CONFIG.googlePhotosAlbums.album2,
  },
  {
    id: "streetside-sapad",
    num: "03",
    title: "TS Streetside Sapad & Game Night",
    season: "Spring 2026 · General Body",
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
    season: "Fall 2025 · Joint Social",
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
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#2A2825] flex flex-col justify-between py-12 px-4 font-sans select-none overflow-x-hidden">
      {/* Structural Watermark */}
      <WatermarkGlyph text="இணைப்பு" position="center" theme="light" opacity={0.03} />

      {/* Top Persistent Return Bar */}
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#57524C] hover:text-[#B85C38] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[#B85C38]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to OSU Tamil Sangam</span>
        </Link>
        <span className="text-[#8C827A] uppercase tracking-wider">Bio Hub</span>
      </div>

      {/* Centered Editorial Column */}
      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col items-center text-center">
        {/* Prominent 'Explore Full Website' Top Banner */}
        <Link
          href="/"
          className="group w-full mb-8 p-3.5 rounded-lg bg-[#2A2825] text-[#FAF7F2] hover:bg-[#161210] transition-all flex items-center justify-between shadow-sm focus-visible:outline-2 focus-visible:outline-[#B85C38]"
        >
          <div className="flex items-center gap-2.5 text-left pl-1">
            <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">
              Explore Full Website
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-[#E5A93C] group-hover:translate-x-1 transition-transform">
            <span>Enter Main Site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Club Crest / Avatar */}
        <div className="relative w-20 h-20 mb-4 rounded-full border border-[#E5DDD0] bg-[#F4EFE6] flex items-center justify-center shadow-[0_2px_8px_rgba(42,40,37,0.04)]">
          <span className="text-4xl font-serif font-bold text-[#B85C38]" lang="ta">
            ஐ
          </span>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825] mb-1">
          {SITE_CONFIG.brandNameEn}
        </h1>
        <p className="text-xs text-[#B85C38] font-mono uppercase tracking-widest mb-2 font-semibold">
          @tamilsangam.osu · The Ohio State University
        </p>
        <p className="text-xs text-[#57524C] mb-6 max-w-xs leading-relaxed">
          Open student hearth · ஆட்டம் · பாட்டம் · கொண்டாட்டம் · Columbus, OH
        </p>

        {/* Quick Social Actions Row */}
        <div className="w-full flex items-center justify-center gap-5 sm:gap-6 mb-8 pb-6 border-b border-[#E5DDD0]">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#57524C] hover:text-[#B85C38] transition-colors"
            aria-label="Instagram profile"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Instagram</span>
          </a>
          <a
            href={SITE_CONFIG.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#57524C] hover:text-[#B85C38] transition-colors"
            aria-label="TikTok profile"
          >
            <TikTokIcon className="w-3.5 h-3.5" />
            <span>TikTok</span>
          </a>
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#57524C] hover:text-[#B85C38] transition-colors"
            aria-label="GroupMe chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span>GroupMe</span>
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", SITE_CONFIG.contactEmail)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#57524C] hover:text-[#B85C38] transition-colors cursor-pointer"
            aria-label="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <>
                <Check className="w-4 h-4 text-[#B85C38]" />
                <span className="text-[#B85C38]">Copied</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Link Stack */}
        <div className="w-full space-y-3.5 text-left">
          {/* Pinned Live Box Office & Ticket Drop Module */}
          <LiveBoxOfficeTicketModule className="mb-4" />
          {/* Section: Priority Actions */}
          <div className="space-y-2.5">
            {/* 1. Next Upcoming Event / RSVP */}
            <Link
              href="/events"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] group-hover:bg-[#B85C38] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                      Upcoming Gathering · RSVP
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                      {activeUpcomingEvent.title}
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      {activeUpcomingEvent.telemetry.date} · {activeUpcomingEvent.telemetry.location}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>

            {/* 2. Join the Sangam / Membership & Fireside Coffee Chats */}
            <Link
              href="/join"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] group-hover:bg-[#B85C38] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                      Join the Family · Free
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                      Membership &amp; Fireside Coffee Chats
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      Sign our guestbook, performer signups &amp; tech mentorship
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>
          </div>

          {/* Section: Photos Archive Button with Expandable Previous Events Menu */}
          <div className="pt-2">
            <div className="rounded-xl bg-white border border-[#E5DDD0] overflow-hidden transition-all shadow-xs hover:border-[#B85C38]/50">
              <button
                type="button"
                onClick={() => setIsPhotosMenuOpen((prev) => !prev)}
                aria-expanded={isPhotosMenuOpen}
                aria-controls="photos-menu-content"
                className="w-full p-4 flex items-start justify-between gap-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B85C38]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                        Photo Archive
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F4EFE6] text-[#57524C]">
                        {PREVIOUS_EVENT_ALBUMS.length} Albums
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-normal text-[#2A2825]">
                      Previous Events Photo Vaults
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5">
                      {isPhotosMenuOpen ? "Tap to close album list" : "Tap to open all previous event photo links"}
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-full text-[#8C827A] shrink-0 mt-1">
                  <motion.div animate={{ rotate: isPhotosMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[#B85C38]" />
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
                    className="overflow-hidden border-t border-[#E5DDD0] bg-[#FAF8F5]"
                  >
                    <div className="p-3.5 space-y-2">
                      <p className="text-[11px] font-mono text-[#8C827A] px-1 uppercase tracking-wider font-semibold">
                        Official Google Photos Albums:
                      </p>
                      {PREVIOUS_EVENT_ALBUMS.map((album) => (
                        <a
                          key={album.id}
                          href={album.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/album block p-3 rounded-lg bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:bg-[#FAF6F0] transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#B85C38] font-bold">
                                  {album.num}
                                </span>
                                <h3 className="text-xs font-serif font-medium text-[#2A2825] group-hover/album:text-[#B85C38] transition-colors truncate">
                                  {album.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-[#57524C] mt-0.5 truncate font-sans">
                                {album.season} · {album.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-[#B85C38] shrink-0">
                              <span className="hidden sm:inline">Photos</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </a>
                      ))}

                      {/* Link to Events Page Living Photo Carousel */}
                      <Link
                        href="/events"
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-[#F2EAE0] hover:bg-[#EAE0D2] text-[#2A2825] flex items-center justify-between text-xs font-mono font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Images className="w-3.5 h-3.5 text-[#B85C38]" />
                          <span>View Interactive Carousel on Events Page</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#B85C38]" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section: Social Communities */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block px-1 font-semibold">
              Official Social Channels
            </span>

            {/* TikTok Section */}
            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#000000]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#F0F0F0] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <TikTokIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#111111] font-bold block">
                      TikTok · @osutamilsangam
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#111111] transition-colors truncate">
                      Official TikTok
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      Event highlights, POV campus reels &amp; dance clips
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8C827A] group-hover:text-[#111111] transition-all shrink-0 mt-1" />
              </div>
            </a>

            {/* Instagram Section */}
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#E1306C]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF0F3] text-[#E1306C] group-hover:bg-[#E1306C] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E1306C] font-bold block">
                      Instagram · @tamilsangam.osu
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#E1306C] transition-colors truncate">
                      Official Instagram
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      Stories, live announcements &amp; community photo drops
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8C827A] group-hover:text-[#E1306C] transition-all shrink-0 mt-1" />
              </div>
            </a>

            {/* GroupMe Section */}
            <a
              href={SITE_CONFIG.groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#00AFF0]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#F0F8FA] text-[#00AFF0] group-hover:bg-[#00AFF0] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00AFF0] font-bold block">
                      Community Chat · GroupMe
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#00AFF0] transition-colors truncate">
                      Official Student GroupMe
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      120+ Buckeyes · rideshares, meetups &amp; general chat
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8C827A] group-hover:text-[#00AFF0] transition-all shrink-0 mt-1" />
              </div>
            </a>
          </div>

          {/* Section: Campus Exploration */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#8C827A] uppercase tracking-wider block px-1 font-semibold">
              Explore &amp; Discover
            </span>

            {/* New Student Guide & FAQ */}
            <Link
              href="/guide"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] group-hover:bg-[#B85C38] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                      Freshmen &amp; Transfer Guide
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                      Student Guide &amp; FAQ
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      Columbus grocers, dining, housing &amp; club constitution
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>

            {/* Games & Cultural Lab */}
            <Link
              href="/games"
              className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] group-hover:bg-[#B85C38] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                      Interactive Lab
                    </span>
                    <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                      Kolam, Solkattu &amp; Word Games
                    </h2>
                    <p className="text-xs text-[#57524C] mt-0.5 truncate">
                      Play daily campus word games and trace digital kolams
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-xs text-[#57524C] space-y-1">
        <p className="font-medium text-[#2A2825]">{SITE_CONFIG.universityAffiliationEn}</p>
        <p className="text-[11px] text-[#8C827A]">
          {SITE_CONFIG.officialNameTa} · Project Aintinai (ஐந்திணை)
        </p>
      </footer>
    </div>
  );
}
