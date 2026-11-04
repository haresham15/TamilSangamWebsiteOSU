"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Music2, 
  Sparkles, 
  Calendar, 
  Users, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  Radio, 
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { SITE_CONFIG } from "@/data/siteConfig";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface DancePerformanceSpaceProps {
  /** Optional custom Google Form embed URL or iframe source */
  googleFormEmbedUrl?: string;
  /** Optional raw HTML embed snippet for the Google Form */
  googleFormEmbedHtml?: string;
}

export const DEFAULT_DIWALI_FORM_EMBED_URL = 
  "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform?embedded=true";
export const DEFAULT_DIWALI_FORM_DIRECT_URL = 
  "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform";

export function DancePerformanceSpace({
  googleFormEmbedUrl = DEFAULT_DIWALI_FORM_EMBED_URL,
  googleFormEmbedHtml,
}: DancePerformanceSpaceProps) {
  const [copiedContact, setCopiedContact] = useState(false);

  const openTabUrl = googleFormEmbedUrl
    ? googleFormEmbedUrl.replace(/[?&]embedded=true/, "")
    : DEFAULT_DIWALI_FORM_DIRECT_URL;

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SITE_CONFIG.contactEmail);
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2500);
    }
  };

  const performanceTracks = [
    {
      title: "Gaana & Kuthu Troupe",
      tamilTitle: "குத்து & கானா நடனம்",
      desc: "Fast-paced, high-energy street-style choreography with raw folk rhythms, whistle breaks, and synchronized steps.",
      tone: "High Energy · Group",
      badgeColor: "text-[#A6F0CF] bg-[#A6F0CF]/10 border-[#A6F0CF]/30",
    },
    {
      title: "Cinematic & Hip-Hop Fusion",
      tamilTitle: "திரைப்பட இசை நடனம்",
      desc: "Modern Kollywood tracks blending Tamil melodies with contemporary hip-hop, dynamic formations, and visual storytelling.",
      tone: "Contemporary · Collaborative",
      badgeColor: "text-[#4FD6E0] bg-[#4FD6E0]/10 border-[#4FD6E0]/30",
    },
    {
      title: "Semi-Classical & Folk Fusion",
      tamilTitle: "பாரம்பரிய & கிராமிய நடனம்",
      desc: "Graceful Bharatanatyam elements, Karagattam, and expressive storytelling fused with soul-stirring acoustic and classical arrangements.",
      tone: "Traditional · Expressive",
      badgeColor: "text-[#F26BB5] bg-[#F26BB5]/10 border-[#F26BB5]/30",
    },
    {
      title: "Solo, Duet & Feature Acts",
      tamilTitle: "தனிநபர் & இணை நடனம்",
      desc: "Have a unique routine, duet, or specialized stage performance? Sign up for a dedicated spotlight feature.",
      tone: "Spotlight · Open Format",
      badgeColor: "text-[#FFD666] bg-[#FFD666]/10 border-[#FFD666]/30",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
      {/* Top Header Track */}
      <div className="mb-10 sm:mb-14 border-b border-[rgba(125,96,166,0.25)] pb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#A6F0CF]/15 text-[#A6F0CF] border border-[#A6F0CF]/30 shadow-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#A6F0CF]" />
            <span>OPEN AUDITIONS &amp; REGISTRATION</span>
          </span>
          <span className="text-xs font-mono text-[#C4B7D7]/70">
            OSU TAMIL SANGAM · 2026-2027
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F4F0FA] tracking-tight leading-tight">
          Dance Performance Sign-Ups
        </h1>
        <p className="font-tamil text-lg sm:text-xl text-[#A6F0CF] mt-1 font-medium" lang="ta">
          ஆடல் அரங்கம் · நடனக் குழு பதிவு
        </p>

        <p className="mt-4 text-sm sm:text-base text-[#C4B7D7] font-sans max-w-3xl leading-relaxed">
          Take the stage with OSU Tamil Sangam, Kannada Sangam, and Mallu Society for Diwali 2026 on November 15th! We are organizing collegiate dance troupes and stage showcases at The Ohio State University. Whether you have danced for years or want to try Kuthu for the very first time, all students and friends are welcome — zero dues, zero audition fees, and 100% good energy.
        </p>
      </div>

      {/* Grid of Styles */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#A6F0CF] font-semibold">
            Featured Performance Categories · பிரிவுகள்
          </h2>
          <span className="text-xs font-mono text-[#C4B7D7]/60 hidden sm:inline-block">
            Select one or multiple in the form below ↓
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceTracks.map((track, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#25173B]/70 border border-[rgba(125,96,166,0.3)] hover:border-[#A6F0CF]/40 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${track.badgeColor}`}>
                    {track.tone}
                  </span>
                  <Music2 className="w-4 h-4 text-[#A6F0CF]/70" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#F4F0FA]">
                  {track.title}
                </h3>
                <p className="font-tamil text-xs text-[#A6F0CF]/80 mb-2.5" lang="ta">
                  {track.tamilTitle}
                </p>
                <p className="text-xs text-[#C4B7D7] leading-relaxed font-sans">
                  {track.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE GOOGLE FORM EMBED SPACE CONTAINER                                     */}
      {/* ========================================================================= */}
      <div id="google-form-slot" className="relative w-full rounded-2xl bg-[#140C20] border-2 border-[#A6F0CF]/30 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] mb-14">
        {/* Frame Top Navigation Banner */}
        <div className="w-full bg-[#25173B] border-b border-[rgba(125,96,166,0.3)] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A6F0CF] animate-ping" />
            <span className="font-bold uppercase tracking-wider text-[#F4F0FA]">
              Diwali 2026: TS × MS × KS — Official Sign-Up &amp; Performance Form
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#A6F0CF] bg-[#A6F0CF]/10 border border-[#A6F0CF]/20 px-2 py-0.5 rounded-md font-semibold">
              Live Embed Frame
            </span>
            <a
              href={openTabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#F4F0FA] hover:text-[#A6F0CF] transition-colors"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Dynamic Slot: Real Embed IF available, otherwise Designed Placeholder Frame */}
        <div className={`w-full flex flex-col items-center justify-center relative ${
          googleFormEmbedHtml || googleFormEmbedUrl ? "p-0 min-h-[640px] sm:min-h-[820px]" : "p-6 sm:p-10 min-h-[560px] sm:min-h-[680px] text-center"
        }`}>
          {googleFormEmbedHtml ? (
            <div 
              className="w-full h-full min-h-[640px] sm:min-h-[820px] flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[640px] sm:[&>iframe]:min-h-[820px] [&>iframe]:border-0"
              dangerouslySetInnerHTML={{ __html: googleFormEmbedHtml }} 
            />
          ) : googleFormEmbedUrl ? (
            <iframe
              src={googleFormEmbedUrl}
              title="Diwali 2026 - TS X MS X KS Sign-Up & Performance Registration"
              className="w-full min-h-[640px] sm:min-h-[820px] border-0 rounded-b-xl"
              loading="lazy"
            >
              Loading registration form...
            </iframe>
          ) : (
            /* Elegant Placeholder Space while Google Form is Being Created */
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-12 px-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#25173B] border-2 border-[#A6F0CF]/50 flex items-center justify-center shadow-[0_0_24px_rgba(166,240,207,0.25)]">
                <Music2 className="w-8 h-8 text-[#A6F0CF] animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A6F0CF] bg-[#A6F0CF]/10 px-3 py-1 rounded-full border border-[#A6F0CF]/30">
                  Google Form Ready for Embed
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F0FA]">
                  Registration Form Linking Soon
                </h3>
                <p className="font-tamil text-sm text-[#A6F0CF]" lang="ta">
                  பதிவுப் படிவம் விரைவில் இணைக்கப்படும்
                </p>
              </div>

              <p className="text-sm text-[#C4B7D7] font-sans leading-relaxed max-w-md">
                Our cultural coordinators are currently finalizing the Google Form for song preferences, availability, and troupe placement. As soon as the form embed code is ready, it will render automatically in this dedicated frame.
              </p>

              {/* Instant Action Fallbacks */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                <a
                  href={SITE_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25173B] border border-[#A6F0CF]/40 text-[#F4F0FA] hover:text-[#A6F0CF] hover:border-[#A6F0CF] transition-all shadow-xs"
                >
                  <InstagramIcon className="w-4 h-4 text-[#F26BB5]" />
                  <span>DM Us on Instagram</span>
                </a>

                <a
                  href={SITE_CONFIG.groupMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25173B] border border-[#4FD6E0]/40 text-[#F4F0FA] hover:text-[#4FD6E0] hover:border-[#4FD6E0] transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#4FD6E0]" />
                  <span>Join Dancers GroupMe</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions / Rehearsal Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#25173B]/50 border border-[rgba(125,96,166,0.25)] space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[rgba(125,96,166,0.25)] pb-4">
          <HelpCircle className="w-4 h-4 text-[#A6F0CF]" />
          <h3 className="font-serif text-lg font-semibold text-[#F4F0FA]">
            Dancer FAQ &amp; Rehearsal Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#A6F0CF] block">
              1. Experience Needed?
            </span>
            <p className="text-[#C4B7D7] leading-relaxed">
              None! We have beginner-friendly routines alongside advanced segments. If you have rhythm and enthusiasm, we will teach you every step.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#4FD6E0] block">
              2. Rehearsal Locations
            </span>
            <p className="text-[#C4B7D7] leading-relaxed">
              Practices take place at RPAC dance studios and the Ohio Union campus rooms, scheduled primarily on weekday evenings and weekends to accommodate classes.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#F26BB5] block">
              3. Costumes &amp; Music
            </span>
            <p className="text-[#C4B7D7] leading-relaxed">
              Costume styling, themed props, and high-fidelity audio tracks are coordinated by the Tamil Sangam creative team with zero charges to performers.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[rgba(125,96,166,0.2)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <span className="text-[#C4B7D7]">
            Questions about routines? Reach out anytime:
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-[#A6F0CF] hover:underline cursor-pointer"
            >
              {copiedContact ? "Email Copied ✓" : SITE_CONFIG.contactEmail}
            </button>
            <Link
              href="/join"
              className="inline-flex items-center gap-1 text-[#F4F0FA] hover:text-[#A6F0CF] transition-colors"
            >
              <span>General Membership Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DancePerformanceSpace;
