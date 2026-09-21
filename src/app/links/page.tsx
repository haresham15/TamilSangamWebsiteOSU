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
      title: "Powerhouse Pongal 2027 Tickets",
      subtitle: "Ohio Union Performance Hall · Reserved student seating",
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
      subtitle: "Diwali and Pongal high-resolution photo vaults",
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
      title: "Explore Project Aintinai",
      subtitle: "The Five Classical Landscapes of Tamil Sangam",
      href: "/",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)] flex flex-col items-center justify-between py-12 px-4 select-none font-body">
      {/* Container restricted to mobile width for sleek bio-link feel */}
      <div className="w-full max-w-md mx-auto text-center">
        {/* Distilled Profile Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-4 rounded-full p-1 border border-[var(--color-temple-bronze)]/40 bg-[var(--surface-raised)] shadow-2xl">
          <div className="w-full h-full rounded-full bg-[var(--surface-sunken)] flex items-center justify-center text-3xl font-display font-bold text-[var(--accent-tint)]">
            ஐ
          </div>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-1">
          OSU Tamil Sangam
        </h1>
        <p className="text-[11px] text-[var(--accent-tint)] font-mono uppercase tracking-widest mb-2">
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
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[var(--accent-tint)] hover:text-[var(--accent-tint)] transition-colors"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href="https://groupme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[var(--accent-tint)] hover:text-[var(--accent-tint)] transition-colors"
            title="GroupMe"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => handleCopy("email", "president.osutamilsangam@gmail.com")}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[var(--accent-tint)] hover:text-[var(--accent-tint)] transition-colors relative"
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
                className={`w-full p-4 rounded-2xl border transition-colors text-left flex items-center justify-between shadow-lg ${
                  link.isFeatured
                    ? "bg-gradient-to-r from-[var(--color-terracotta)]/25 to-[var(--color-temple-bronze)]/20 border-[var(--color-temple-bronze)]/50 hover:border-[var(--color-temple-bronze)]"
                    : "bg-[var(--surface-raised)] border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[var(--accent-tint)]">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{link.index}</span>
                      <p className="text-sm font-bold text-white font-display truncate">{link.title}</p>
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
