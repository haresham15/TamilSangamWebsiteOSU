"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENTS } from "@/data/events";
import { 
  MessageSquare, 
  Mail, 
  Check, 
  ChevronRight,
  Calendar,
  Users,
  Camera,
  Sparkles,
  Globe
} from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function BioHubPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const nextEvent = EVENTS[0];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const bioLinks = [
    {
      id: "event",
      title: `${nextEvent.titleEn} RSVP & Schedule`,
      subtitle: `${nextEvent.location} · Free student admission`,
      href: `/events/${nextEvent.slug}`,
      icon: Calendar,
      isFeatured: true,
    },
    {
      id: "groupme",
      index: "02",
      title: "Official Student GroupMe",
      subtitle: "General announcements, festival updates & rideshares",
      href: "https://groupme.com/join_group/osutamilsangam",
      icon: MessageSquare,
      external: true,
      badge: "Active",
    },
    {
      id: "performer",
      index: "03",
      title: "Performer & Committee Auditions",
      subtitle: "Dance (Aatam), Music (Paatam), Emcee & Stage Crew",
      href: "/join#performer",
      icon: Users,
    },
    {
      id: "photos",
      index: "04",
      title: "Photo & Celebration Archives",
      subtitle: "High-resolution campus event photo vaults",
      href: "/gallery",
      icon: Camera,
    },
    {
      id: "culture",
      index: "05",
      title: "Interactive Culture Lab",
      subtitle: "Kolam canvas, Solkattu rhythm pads & games",
      href: "/culture-lab",
      icon: Sparkles,
    },
    {
      id: "website",
      index: "06",
      title: "OSU Tamil Sangam Homepage",
      subtitle: "Official website, festivals, and campus leadership",
      href: "/",
      icon: Globe,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#2A2825] flex flex-col items-center justify-between py-14 px-4 select-none font-sans overflow-hidden">
      {/* Structural Watermark */}
      <WatermarkGlyph text="இணைப்பு" position="center" theme="light" opacity={0.03} />

      {/* Container restricted to mobile width for sleek bio-link feel */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Distilled Profile Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-4 border-b border-[#E5DDD0] flex items-center justify-center">
          <span className="text-4xl font-serif font-bold text-[#B85C38]">
            ஐ
          </span>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825] mb-1">
          OSU Tamil Sangam
        </h1>
        <p className="text-xs text-[#B85C38] font-mono uppercase tracking-widest mb-2 font-semibold">
          @tamilsangam.osu · The Ohio State University
        </p>
        <p className="text-xs text-[#57524C] mb-6 max-w-xs mx-auto leading-relaxed font-sans">
          Start the Aatam, Paatam, and Kondatam! · ஆட்டம் · பாட்டம் · கொண்டாட்டம்
        </p>

        {/* Quick Social Links: Borderless Minimal Text/Icon Actions */}
        <div className="flex items-center justify-center gap-6 mb-10 pb-6 border-b border-[#E5DDD0]">
          <a
            href="https://www.instagram.com/tamilsangam.osu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#57524C] hover:text-[#B85C38] transition-colors"
            aria-label="Instagram profile"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Instagram</span>
          </a>
          <a
            href="https://web.groupme.com/join_group/83424812/BeBIRg7f"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#57524C] hover:text-[#B85C38] transition-colors"
            aria-label="GroupMe chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span>GroupMe</span>
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", "president.osutamilsangam@gmail.com")}
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#57524C] hover:text-[#B85C38] transition-colors cursor-pointer"
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

        {/* Distilled Action Links: Borderless Rows Separated by 1px Hairlines */}
        <div className="space-y-0 text-left">
          {bioLinks.map((link) => {
            const IconComponent = link.icon;
            const content = (
              <div
                className="group relative w-full py-4 border-b border-[#E5DDD0] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0 pr-2">
                  <span className="text-xs font-mono text-[#8C827A] group-hover:text-[#B85C38] transition-colors">
                    {link.index || "01"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors truncate">
                      {link.title}
                    </p>
                    <p className="text-xs text-[#8C827A] truncate mt-0.5 font-sans">
                      {link.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C827A] group-hover:text-[#B85C38] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            );

            return link.external ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-none"
              >
                {content}
              </a>
            ) : (
              <Link key={link.id} href={link.href} className="block focus-visible:outline-none">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center text-xs font-sans text-[#57524C] space-y-1">
        <p className="text-[#2A2825] font-medium">The Ohio State University Tamil Sangam</p>
        <p className="text-[11px] text-[#57524C]/80">Project Aintinai (ஐந்திணை) · Distilled Bio Hub</p>
      </div>
    </div>
  );
}
