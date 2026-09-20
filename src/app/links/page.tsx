"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENTS } from "@/data/events";
import { 
  MessageCircle, 
  Mail, 
  Check, 
  ChevronRight
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
      title: "🎟️ Powerhouse Pongal 2027 Tickets",
      subtitle: "Ohio Union Performance Hall · Selling fast!",
      href: `/events/${nextEvent.slug}`,
      isFeatured: true,
    },
    {
      id: "groupme",
      title: "💬 Join our Official GroupMe",
      subtitle: "General chats, event updates & rideshares",
      href: "https://groupme.com/join_group/osutamilsangam",
      external: true,
      badge: "Active",
    },
    {
      id: "performer",
      title: "💃 Performer Auditions & Interest Form",
      subtitle: "Dance (Aatam), Music (Paatam), Emcee & backstage",
      href: "/join#performer",
    },
    {
      id: "photos",
      title: "📸 Diwali 2025/2026 Photo Vault",
      subtitle: "Pattas Tappas albums, high-res downloads",
      href: "/gallery",
    },
    {
      id: "culture",
      title: "🎨 Interactive Culture Lab",
      subtitle: "Draw kolams, play Solkattu rhythm pads & games",
      href: "/culture-lab",
    },
    {
      id: "website",
      title: "🌐 Full 3D Gopuram Website",
      subtitle: "Explore the 5 classical landscapes of Aintinai",
      href: "/",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col items-center justify-between py-12 px-4 select-none">
      {/* Container restricted to mobile width for sleek bio-link feel */}
      <div className="w-full max-w-md mx-auto text-center">
        {/* Profile Avatar with Rangoli / Kolam Ring */}
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-[#f2b705] via-[#d6452f] to-[#1e2a78] shadow-2xl">
          <div className="w-full h-full rounded-full bg-[#0c0f1f] flex items-center justify-center text-3xl font-serif font-bold text-[#f2b705]">
            ஐ
          </div>
        </div>

        {/* Club Handle & Tagline */}
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          OSU Tamil Sangam
        </h1>
        <p className="text-xs text-[var(--accent-tint)] font-mono uppercase tracking-widest mb-1">
          @osutamilsangam · Columbus, OH
        </p>
        <p className="text-xs text-slate-300 mb-6">
          Start the Aatam, Paatam, and Kondatam! · ஆட்டம் · பாட்டம் · கொண்டாட்டம்
        </p>

        {/* Quick Social Icon Row */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <a
            href="https://instagram.com/osutamilsangam"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#f2b705] hover:text-[#f2b705] transition-all"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href="https://groupme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#f2b705] hover:text-[#f2b705] transition-all"
            title="GroupMe"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            onClick={() => handleCopy("email", "president.osutamilsangam@gmail.com")}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#f2b705] hover:text-[#f2b705] transition-all relative"
            title="Copy Contact Email"
          >
            {copiedItem === "email" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action Link Cards */}
        <div className="space-y-3">
          {bioLinks.map((link) => {
            const content = (
              <div
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between shadow-lg ${
                  link.isFeatured
                    ? "bg-gradient-to-r from-amber-500/20 via-red-500/20 to-purple-500/20 border-amber-500/50 hover:scale-[1.02] shadow-amber-500/10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{link.title}</p>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{link.subtitle}</p>
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
        <p className="text-[10px]">Project Aintinai (ஐந்திணை) · Ultra-Light Bio Hub</p>
      </div>
    </div>
  );
}
