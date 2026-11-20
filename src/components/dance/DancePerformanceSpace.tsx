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
import { PathirikaiFormFrame } from "@/components/ui/PathirikaiFormFrame";

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
      badgeColor: "text-[#B84A39] bg-[#B84A39]/10 border-[#B84A39]/30",
      iconColor: "text-[#B84A39]",
    },
    {
      title: "Cinematic & Hip-Hop Fusion",
      tamilTitle: "திரைப்பட இசை நடனம்",
      desc: "Modern Kollywood tracks blending Tamil melodies with contemporary hip-hop, dynamic formations, and visual storytelling.",
      tone: "Contemporary · Collaborative",
      badgeColor: "text-[#0F766E] bg-[#E1F3F1] border-[#0F766E]/30",
      iconColor: "text-[#0F766E]",
    },
    {
      title: "Semi-Classical & Folk Fusion",
      tamilTitle: "பாரம்பரிய & கிராமிய நடனம்",
      desc: "Graceful Bharatanatyam elements, Karagattam, and expressive storytelling fused with soul-stirring acoustic and classical arrangements.",
      tone: "Traditional · Expressive",
      badgeColor: "text-[#5B2C86] bg-[#EFE8F7] border-[#5B2C86]/30",
      iconColor: "text-[#5B2C86]",
    },
    {
      title: "Solo, Duet & Feature Acts",
      tamilTitle: "தனிநபர் & இணை நடனம்",
      desc: "Have a unique routine, duet, or specialized stage performance? Sign up for a dedicated spotlight feature.",
      tone: "Spotlight · Open Format",
      badgeColor: "text-[#9A6B3E] bg-[#F7EFE2] border-[#C79347]/30",
      iconColor: "text-[#C79347]",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
      {/* Top Header Track */}
      <div className="mb-10 sm:mb-14 border-b border-[#DFD1BE] pb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/30 shadow-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#0F766E]" />
            <span>OPEN AUDITIONS &amp; REGISTRATION</span>
          </span>
          <span className="text-xs font-mono text-[#5E4C40]">
            OSU TAMIL SANGAM · 2026-2027
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#261A14] tracking-tight leading-tight">
          Dance Performance Sign-Ups
        </h1>
        <p className="font-tamil text-lg sm:text-xl text-[#0F766E] mt-1 font-medium" lang="ta">
          ஆடல் அரங்கம் · நடனக் குழு பதிவு
        </p>

        <p className="mt-4 text-sm sm:text-base text-[#5E4C40] font-sans max-w-3xl leading-relaxed">
          Take the stage with OSU Tamil Sangam, Kannada Sangam, and Mallu Society for Diwali 2026 on November 15th! We are organizing collegiate dance troupes and stage showcases at The Ohio State University. Whether you have danced for years or want to try Kuthu for the very first time, all students and friends are welcome — zero dues, zero audition fees, and 100% good energy.
        </p>
      </div>

      {/* Grid of Styles */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F766E] font-semibold">
            Featured Performance Categories · பிரிவுகள்
          </h2>
          <span className="text-xs font-mono text-[#5E4C40] hidden sm:inline-block">
            Select one or multiple in the form below ↓
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceTracks.map((track, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DFD1BE] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${track.badgeColor}`}>
                    {track.tone}
                  </span>
                  <Music2 className={`w-4 h-4 ${track.iconColor}`} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#261A14]">
                  {track.title}
                </h3>
                <p className="font-tamil text-xs text-[#5E4C40] mb-2.5" lang="ta">
                  {track.tamilTitle}
                </p>
                <p className="text-xs text-[#5E4C40] leading-relaxed font-sans">
                  {track.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE GOOGLE FORM EMBED SPACE (PathirikaiFormFrame Primitive)               */}
      {/* ========================================================================= */}
      <div id="google-form-slot" className="mb-14">
        <PathirikaiFormFrame
          titleEn="Diwali 2026: TS × MS × KS — Official Sign-Up & Performance Form"
          titleTa="நடனக் குழு பதிவுப் படிவம்"
          formUrl={openTabUrl}
          embedSrc={googleFormEmbedUrl}
          minHeight="820px"
        />
      </div>

      {/* Frequently Asked Questions / Rehearsal Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#DFD1BE] shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#DFD1BE] pb-4">
          <HelpCircle className="w-4 h-4 text-[#0F766E]" />
          <h3 className="font-serif text-lg font-semibold text-[#261A14]">
            Dancer FAQ &amp; Rehearsal Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#0F766E] block">
              1. Experience Needed?
            </span>
            <p className="text-[#5E4C40] leading-relaxed">
              None! We have beginner-friendly routines alongside advanced segments. If you have rhythm and enthusiasm, we will teach you every step.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#5B2C86] block">
              2. Rehearsal Locations
            </span>
            <p className="text-[#5E4C40] leading-relaxed">
              Practices take place at RPAC dance studios and the Ohio Union campus rooms, scheduled primarily on weekday evenings and weekends to accommodate classes.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#B84A39] block">
              3. Costumes &amp; Music
            </span>
            <p className="text-[#5E4C40] leading-relaxed">
              Costume styling, themed props, and high-fidelity audio tracks are coordinated by the Tamil Sangam creative team with zero charges to performers.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DFD1BE] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <span className="text-[#5E4C40]">
            Questions about routines? Reach out anytime:
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-[#0F766E] hover:underline cursor-pointer"
            >
              {copiedContact ? "Email Copied ✓" : SITE_CONFIG.contactEmail}
            </button>
            <Link
              href="/join"
              className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0B5C56] transition-colors"
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
