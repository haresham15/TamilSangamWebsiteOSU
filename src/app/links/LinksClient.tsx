"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FileText,
  Music2
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

export function LinksClient() {
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
    <div className="relative min-h-screen bg-[#F0E6D6] text-[#261A14] flex flex-col justify-between pt-10 pb-28 px-4 font-sans select-none overflow-x-hidden">
      {/* Warm Sunlit Ambient Glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_600px_400px_at_15%_10%,rgba(199,147,71,0.08),transparent_60%),radial-gradient(ellipse_700px_450px_at_85%_65%,rgba(91,44,134,0.05),transparent_65%),radial-gradient(ellipse_500px_350px_at_50%_90%,rgba(154,107,62,0.08),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Structural Watermark */}
      <WatermarkGlyph text="இணைப்பு" position="center" theme="bronze" opacity={0.1} />

      {/* Top Persistent Return Bar */}
      <header className="w-full max-w-md mx-auto mb-6 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#5E4C40] hover:text-[#5B2C86] transition-colors py-1 focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Website</span>
        </Link>
        <span className="text-[#5B2C86] bg-[#5B2C86]/10 border border-[#5B2C86]/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold">
          Bio Hub
        </span>
      </header>

      {/* Centered Editorial Column */}
      <main className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col items-center text-center">
        {/* Prominent 'Explore Full Website' Top Banner */}
        <Link
          href="/"
          className="group w-full mb-8 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/40 hover:bg-[#FAF6F0] transition-all flex items-center justify-between shadow-xs hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
        >
          <div className="flex items-center gap-2.5 text-left pl-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B2C86] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#261A14] group-hover:text-[#5B2C86] transition-colors">
              Explore Full Website
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#5B2C86] font-semibold group-hover:translate-x-1 transition-transform">
            <span>Enter Site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Official Collegiate Crest & Verified Organization Badge */}
        <div className="relative w-24 h-24 mb-4 rounded-full p-1 bg-gradient-to-tr from-[#C79347] via-[#D4A36A] to-[#5B2C86] shadow-md">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF6F0] flex items-center justify-center">
            <Image
              src="/emblem.svg"
              alt="The Ohio State University Tamil Sangam Official Seal"
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          {/* Official Verification Badge */}
          <div 
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5B2C86] border-2 border-[#FAF6F0] flex items-center justify-center shadow-md"
            title="Recognized Student Organization · The Ohio State University"
          >
            <Check className="w-3.5 h-3.5 text-[#FAF5ED] stroke-[3]" />
          </div>
        </div>

        {/* Club Handle & Institutional Badge */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#261A14]">
            {SITE_CONFIG.brandNameEn}
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#5B2C86]/10 text-[#5B2C86] border border-[#5B2C86]/30">
            Official RSO
          </span>
        </div>
        <p className="text-xs text-[#9A6B3E] font-mono uppercase tracking-widest mb-1.5 font-bold">
          @tamilsangam.osu · The Ohio State University
        </p>
        <p className="text-xs text-[#5E4C40] mb-6 max-w-sm leading-relaxed font-sans">
          Office of Student Life · Recognized Student Organization · Columbus, OH
        </p>

        {/* Quick Social Actions Row */}
        <div className="w-full flex items-center justify-center gap-5 sm:gap-6 mb-8 pb-6 border-b border-[#DFD1BE]">
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#5E4C40] hover:text-[#B84A39] transition-colors"
            aria-label="Instagram profile"
          >
            <InstagramIcon className="w-4 h-4 text-[#B84A39]" />
            <span>Instagram</span>
          </a>
          <a
            href={SITE_CONFIG.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#5E4C40] hover:text-[#0F766E] transition-colors"
            aria-label="TikTok profile"
          >
            <TikTokIcon className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>TikTok</span>
          </a>
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#5E4C40] hover:text-[#0F766E] transition-colors"
            aria-label="GroupMe chat"
          >
            <MessageSquare className="w-4 h-4 text-[#0F766E]" />
            <span>GroupMe</span>
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", SITE_CONFIG.contactEmail)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#5E4C40] hover:text-[#5B2C86] transition-colors cursor-pointer"
            aria-label="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <>
                <Check className="w-4 h-4 text-[#0F766E]" />
                <span className="text-[#0F766E] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-[#5E4C40]" />
                <span>Email</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Link Stack */}
        <div className="w-full space-y-3.5 text-left">
          
          {/* Section: Core Gatherings & Community */}
          <div className="space-y-2.5">
            {/* FEATURED: Diwali 2026 Sign-Up Form (TS × MS × KS) */}
            <div className="relative rounded-xl border border-[#C79347]/50 bg-[#1C122B] shadow-xl p-4 sm:p-5 card-pathirikai">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C79347] animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C79347] font-bold">
                    UPCOMING EVENT · DIWALI 2026
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-xs bg-[#C79347] text-[#1C122B] font-bold">
                  SIGN-UPS OPEN
                </span>
              </div>

              <div className="mb-2">
                <h2 className="text-lg font-serif font-bold text-[#FAF5ED] leading-tight">
                  Diwali 2026: TS × MS × KS
                </h2>
                <p className="font-tamil text-xs text-[#C79347] mt-0.5" lang="ta">
                  நம்ம தீபாவளி · நிகழ்ச்சி &amp; நடனப் பதிவு
                </p>
                <p className="text-xs text-[#CBBBA8] mt-1.5 leading-relaxed font-sans">
                  Tamil Sangam, Kannada Sangam, and Mallu Society are hosting Diwali on Nov 15th! Sign up for dance performances, cultural acts, or attend.
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0F766E] text-[#FAF5ED] hover:bg-[#0B5C56] transition-all text-xs font-mono font-bold uppercase tracking-wider shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FAF5ED]" />
                  <span>Open Sign-Up Form</span>
                  <ExternalLink className="w-3 h-3 text-[#FAF5ED]" />
                </a>

                <Link
                  href="/dance"
                  className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-[#271A3C] border border-[#C79347]/40 text-[#FAF5ED] hover:border-[#C79347] transition-colors text-xs font-mono font-semibold"
                >
                  <Music2 className="w-3.5 h-3.5 text-[#C79347]" />
                  <span>Dance Hub</span>
                </Link>

                <Link
                  href="/events/namma-deepavali-2026"
                  className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-[#271A3C] border border-[rgba(212,163,106,0.24)] text-[#FAF5ED]/80 hover:text-[#FAF5ED] hover:border-[#C79347]/40 transition-colors text-xs font-mono"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Dance Performance Sign-Ups */}
            <Link
              href="/dance"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/40 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#B84A39] group-hover:border-[#B84A39]/60 transition-colors shrink-0 mt-0.5">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#B84A39] font-bold block">
                        Stage Sign-Ups · ஆடல் அரங்கம்
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#B84A39]/10 text-[#B84A39] font-bold">
                        Form Live Now
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#5B2C86] transition-colors truncate">
                      Dance Performance Registration
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Diwali 2026 dance troupes · Kuthu, Gaana, and cinematic fusion
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#5B2C86] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Event Schedule & Gatherings */}
            <Link
              href="/events"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/40 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#5B2C86] group-hover:border-[#5B2C86]/60 transition-colors shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B2C86] font-bold block">
                      Events &amp; Calendar · All Welcome
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#5B2C86] transition-colors truncate">
                      Event Schedule &amp; Gatherings
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Celebrations, festivals, dates, and campus event dossiers
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#5B2C86] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* 2. Join the Sangam / Membership */}
            <Link
              href="/join"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/40 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#5B2C86] group-hover:border-[#5B2C86]/60 transition-colors shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B2C86] font-bold block">
                        Join the Family
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-[#5B2C86]/10 text-[#5B2C86] font-bold">
                        100% Free · $0 Dues
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#5B2C86] transition-colors truncate">
                      Membership &amp; Community Guestbook
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Sign the guestbook, performer signups &amp; freshman mentorship
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#5B2C86] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>
          </div>

          {/* Section: Photos Archive Button with Expandable Previous Events Menu */}
          <div className="pt-2">
            <div className="rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] overflow-hidden transition-all shadow-xs hover:border-[#9A6B3E]/60">
              <button
                type="button"
                onClick={() => setIsPhotosMenuOpen((prev) => !prev)}
                aria-expanded={isPhotosMenuOpen}
                aria-controls="photos-menu-content"
                className="w-full p-4 flex items-start justify-between gap-3 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#9A6B3E] shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A6B3E] font-bold block">
                        Photo Archive
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0E6D6] text-[#9A6B3E] border border-[#DFD1BE] font-semibold">
                        {PREVIOUS_EVENT_ALBUMS.length} Albums
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-medium text-[#261A14]">
                      Previous Event Photo Vaults
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 font-sans">
                      {isPhotosMenuOpen ? "Tap to close album list" : "Tap to open all high-resolution Google Photos links"}
                    </p>
                  </div>
                </div>
                <div className="p-1 rounded-full text-[#9A6B3E] shrink-0 mt-1">
                  <motion.div animate={{ rotate: isPhotosMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[#9A6B3E]" />
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
                    className="overflow-hidden border-t border-[#DFD1BE] bg-[#FAF6F0]"
                  >
                    <div className="p-3.5 space-y-2">
                      <p className="text-[11px] font-mono text-[#9A6B3E] px-1 uppercase tracking-wider font-bold">
                        Official Google Photos Albums:
                      </p>
                      {PREVIOUS_EVENT_ALBUMS.map((album) => (
                        <a
                          key={album.id}
                          href={album.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/album block p-3 rounded-lg bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/40 hover:bg-[#F7EFE2] transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#9A6B3E] font-bold">
                                  {album.num}
                                </span>
                                <h3 className="text-xs font-serif font-medium text-[#261A14] group-hover/album:text-[#5B2C86] transition-colors truncate">
                                  {album.title}
                                </h3>
                              </div>
                              <p className="text-[11px] text-[#5E4C40] mt-0.5 truncate font-sans">
                                {album.season} · {album.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-[#5B2C86] shrink-0 font-medium">
                              <span className="hidden sm:inline">Open</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </a>
                      ))}

                      {/* Link to Website Living Photo Gallery */}
                      <Link
                        href="/gallery"
                        className="w-full mt-2 py-2.5 px-3 rounded-lg bg-[#F0E6D6] border border-[#DFD1BE] hover:border-[#5B2C86]/40 text-[#261A14] flex items-center justify-between text-xs font-mono font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Images className="w-4 h-4 text-[#5B2C86]" />
                          <span>View 35mm Campus Gallery on Website</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5B2C86]" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section: Community Channels */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#5B2C86] uppercase tracking-wider block px-1 font-bold">
              Official Community &amp; Chats
            </span>

            {/* GroupMe Section */}
            <a
              href={SITE_CONFIG.groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#0F766E]/70 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#0F766E]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#0F766E] group-hover:border-[#0F766E] transition-colors shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-bold block">
                      Student Chat · GroupMe
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#0F766E] transition-colors truncate">
                      Official Student GroupMe
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      120+ Buckeyes · rideshares, meetups, food spots &amp; active chat
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#0F766E] transition-all shrink-0 mt-2" />
              </div>
            </a>

            {/* Instagram Section */}
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#B84A39]/70 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B84A39]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#B84A39] group-hover:border-[#B84A39] transition-colors shrink-0 mt-0.5">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B84A39] font-bold block">
                      Instagram · @tamilsangam.osu
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#B84A39] transition-colors truncate">
                      Official Instagram Page
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Stories, live event announcements &amp; photo reels
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#B84A39] transition-all shrink-0 mt-2" />
              </div>
            </a>

            {/* TikTok Section */}
            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#0F766E]/70 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#0F766E]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#0F766E] group-hover:border-[#0F766E] transition-colors shrink-0 mt-0.5">
                    <TikTokIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-bold block">
                      TikTok · @osutamilsangam
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#0F766E] transition-colors truncate">
                      Official TikTok Channel
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Campus POV clips, dance routines &amp; event highlights
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#0F766E] transition-all shrink-0 mt-2" />
              </div>
            </a>
          </div>

          {/* Section: Campus Exploration & Student Resources */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-mono text-[#5B2C86] uppercase tracking-wider block px-1 font-bold">
              Student Resources &amp; Discovery
            </span>

            {/* New Student Guide & FAQ */}
            <Link
              href="/guide"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#0F766E]/60 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#0F766E]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#0F766E] group-hover:border-[#0F766E]/60 transition-colors shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-bold block">
                      Freshmen &amp; Transfer Handbook
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#0F766E] transition-colors truncate">
                      Student Survival Guide &amp; FAQ
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Columbus South Asian dining, grocery markets, transit &amp; housing
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#0F766E] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Executive Board Leadership */}
            <Link
              href="/board"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#5B2C86]/60 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#5B2C86]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#5B2C86] group-hover:border-[#5B2C86]/60 transition-colors shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B2C86] font-bold block">
                      2026–2027 Leadership
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#5B2C86] transition-colors truncate">
                      Executive Board Officers
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Meet the team leading Tamil Sangam at Ohio State
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#5B2C86] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Ideas Hearth */}
            <Link
              href="/ideas"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#C79347]/60 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#C79347]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#C79347] group-hover:border-[#C79347]/60 transition-colors shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C79347] font-bold block">
                      Propose Events &amp; Feedback
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#C79347] transition-colors truncate">
                      The Ideas Hearth
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Submit anonymous suggestions, workshop ideas &amp; event requests
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#C79347] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Games & Cultural Lab */}
            <Link
              href="/games"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#0F766E]/60 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#0F766E]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#0F766E] group-hover:border-[#0F766E]/60 transition-colors shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-bold block">
                      Interactive Cultural Lab
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#0F766E] transition-colors truncate">
                      Wordle, Connections &amp; Kolam
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Play biweekly Tamil-English word puzzles (Sollu) and pattern games
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#0F766E] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>
            </Link>

            {/* Constitution Document */}
            <a
              href={SITE_CONFIG.constitutionPdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 rounded-xl bg-[#FFFFFF] border border-[#DFD1BE] hover:border-[#9A6B3E]/60 hover:bg-[#FAF6F0] hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#9A6B3E]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#F7EFE2] border border-[#DFD1BE] text-[#9A6B3E] group-hover:border-[#9A6B3E]/60 transition-colors shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A6B3E] font-bold block">
                      Official Governance
                    </span>
                    <h2 className="text-base font-serif font-medium text-[#261A14] group-hover:text-[#9A6B3E] transition-colors truncate">
                      Constitution (2026–2027)
                    </h2>
                    <p className="text-xs text-[#5E4C40] mt-0.5 truncate font-sans">
                      Official student organization bylaws registered at Ohio State
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A6B3E] group-hover:text-[#5B2C86] transition-all shrink-0 mt-2" />
              </div>
            </a>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-xs text-[#5E4C40] space-y-1">
        <p className="font-medium text-[#261A14]">{SITE_CONFIG.universityAffiliationEn}</p>
        <p className="text-[11px] text-[#5E4C40]">
          {SITE_CONFIG.officialNameTa} · Project Aintinai (ஐந்திணை)
        </p>
      </footer>
    </div>
  );
}
