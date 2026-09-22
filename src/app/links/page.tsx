"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENTS } from "@/data/events";
import { 
  MessageSquare, 
  Mail, 
  Check, 
  ChevronRight,
  Ticket,
  Users,
  Camera,
  Sparkles,
  Globe
} from "lucide-react";

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
      id: "tickets",
      index: "01",
      title: `${nextEvent.titleEn} Tickets`,
      subtitle: `${nextEvent.location} · Reserved student admission`,
      href: `/events/${nextEvent.slug}`,
      icon: Ticket,
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
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)] flex flex-col items-center justify-between py-12 px-4 select-none font-body">
      {/* Container restricted to mobile width for sleek bio-link feel */}
      <div className="w-full max-w-md mx-auto text-center">
        {/* Distilled Profile Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-4 p-1 border-2 border-[#55CCA2] bg-[#160d26] shadow-[4px_4px_0px_#4c2472]">
          <div className="w-full h-full bg-[#250d38] border border-white/10 flex items-center justify-center text-3xl font-display font-bold text-[#55CCA2]">
            ஐ
          </div>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-1">
          OSU Tamil Sangam
        </h1>
        <p className="text-[11px] text-[#55CCA2] font-mono uppercase tracking-widest mb-2 font-bold">
          @osutamilsangam · The Ohio State University
        </p>
        <p className="text-xs text-slate-300 mb-6 max-w-xs mx-auto leading-relaxed">
          Start the Aatam, Paatam, and Kondatam! · ஆட்டம் · பாட்டம் · கொண்டாட்டம்
        </p>

        {/* Quick Social Icon Row */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <a
            href="https://instagram.com/osutamilsangam"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border-2 border-white/20 bg-white/5 hover:border-[#55CCA2] hover:text-[#55CCA2] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href="https://groupme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border-2 border-white/20 bg-white/5 hover:border-[#55CCA2] hover:text-[#55CCA2] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center"
            title="GroupMe"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", "president.osutamilsangam@gmail.com")}
            className="w-10 h-10 border-2 border-white/20 bg-white/5 hover:border-[#55CCA2] hover:text-[#55CCA2] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center relative"
            title="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Distilled Action Link Cards */}
        <div className="space-y-3">
          {bioLinks.map((link) => {
            const IconComponent = link.icon;
            const content = (
              <div
                className={`w-full p-4 border-2 transition-all text-left flex items-center justify-between ${
                  link.isFeatured
                    ? "bg-[#250d38] border-[#55CCA2] shadow-[4px_4px_0px_#55CCA2]"
                    : "bg-[#160d26] border-white/15 hover:border-[#55CCA2] shadow-[3px_3px_0px_#4c2472] hover:shadow-[4px_4px_0px_#55CCA2]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-9 h-9 border-2 border-white/20 bg-black/40 flex items-center justify-center shrink-0 text-[#55CCA2]">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{link.index}</span>
                      <p className="text-sm font-bold text-white font-display truncate">{link.title}</p>
                      {link.badge && (
                        <span className="box-badge-dark text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{link.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            );

            return link.external ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            ) : (
              <Link key={link.id} href={link.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center text-xs font-mono text-slate-500 space-y-1">
        <p>The Ohio State University Tamil Sangam</p>
        <p className="text-[10px]">Project Aintinai (ஐந்திணை) · Distilled Bio Hub</p>
      </div>
    </div>
  );
}
