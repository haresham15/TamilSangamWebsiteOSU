"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar,
  Users,
  Compass,
  MessageSquare,
  Mail,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { SITE_CONFIG } from "@/data/siteConfig";
import { activeUpcomingEvent } from "@/config/upcomingEvent";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function LinksBioHubPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

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
        <div className="w-full flex items-center justify-center gap-6 mb-8 pb-6 border-b border-[#E5DDD0]">
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
        <div className="w-full space-y-3 text-left">
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

          {/* 3. Official Student GroupMe */}
          <a
            href={SITE_CONFIG.groupMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-xl bg-white border border-[#E5DDD0] hover:border-[#B85C38]/60 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#FAF4ED] text-[#B85C38] group-hover:bg-[#B85C38] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold block">
                    Community Chat
                  </span>
                  <h2 className="text-base font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                    Official Student GroupMe
                  </h2>
                  <p className="text-xs text-[#57524C] mt-0.5 truncate">
                    Event announcements, festival updates &amp; campus rideshares
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </a>

          {/* 4. New Student Guide & FAQ */}
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

          {/* 5. Games & Cultural Lab */}
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
