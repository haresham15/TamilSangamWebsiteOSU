"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Search } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { StarBorder } from "@/components/ui/react-bits";
import { NanbaAvatar } from "@/components/chat/NanbaAvatar";

interface UnifiedFloatingDockProps {
  onOpenSearch: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const UnifiedFloatingDock: React.FC<UnifiedFloatingDockProps> = ({
  onOpenSearch,
  onToggleChat,
  isChatOpen,
}) => {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound, playClick } = useAudio();
  const { locale } = useLocale();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const darkHeroRoutes = ["/", "/events", "/about", "/board", "/gallery", "/games", "/guide", "/suggestions", "/join"];
  const isHeroRoute = darkHeroRoutes.includes(normalizedPath);
  const [isInHeroZone, setIsInHeroZone] = useState(() => isHeroRoute);
  const inHeroZoneRef = useRef(isHeroRoute);

  useEffect(() => {
    let ticking = false;
    let cachedSheet: HTMLElement | null = null;
    let sheetCheckTime = 0;

    const evaluateScroll = () => {
      if (!isHeroRoute) {
        if (inHeroZoneRef.current) {
          inHeroZoneRef.current = false;
          setIsInHeroZone(false);
        }
        return;
      }

      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        const now = performance.now();
        if (!cachedSheet || !cachedSheet.isConnected || now - sheetCheckTime > 1500) {
          cachedSheet = document.querySelector<HTMLElement>("[data-editorial-sheet]");
          sheetCheckTime = now;
        }

        let pastHero = false;
        if (cachedSheet) {
          pastHero = cachedSheet.getBoundingClientRect().top <= 80;
        } else {
          const heroEl = document.querySelector<HTMLElement>(
            "[data-hero-pinned], [data-hero-stage], [data-hero-container], .hero-scroll-stage"
          );
          if (heroEl) {
            pastHero = heroEl.getBoundingClientRect().bottom <= 80;
          } else {
            const vh = window.innerHeight || 800;
            const threshold = pathname === "/" ? vh * 3.8 : vh * 2.0;
            pastHero = scrollY >= threshold;
          }
        }

        const nextInHero = !pastHero;
        if (inHeroZoneRef.current !== nextInHero) {
          inHeroZoneRef.current = nextInHero;
          setIsInHeroZone(nextInHero);
        }
      });
    };

    evaluateScroll();
    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [pathname, isHeroRoute]);

  const shouldHideDock = isHeroRoute && isInHeroZone && !isChatOpen;

  return (
    <aside
      aria-label="Quick tools dock"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shouldHideDock ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
      }`}>
      <StarBorder className="rounded-xl shadow-[0_10px_28px_rgba(28,18,43,0.55)]" color="#C79347" trailColor="#2BB5A8" thickness={1}>
        <div className="bg-bg-sangam-deep text-ink-alabaster border border-accent-zari/40 backdrop-blur-md rounded-xl h-12 px-1.5 sm:px-2 flex items-center gap-1 transition-[background-color,border-color] duration-200">
        {/* 1. Ask Nanba Trigger */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onToggleChat();
          }}
          aria-label="Ask Nanba - OSU Tamil Sangam AI Assistant"
          aria-expanded={isChatOpen}
          className="group flex h-11 min-w-11 items-center gap-2 rounded-lg px-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-alabaster hover:text-accent-zari transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
        >
          <NanbaAvatar size={18} className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-115" />
          <span {...(locale === "ta" ? { lang: "ta", className: "font-tamil normal-case tracking-normal" } : {})}>
            {locale === "ta" ? "நண்பா" : "Ask Nanba"}
          </span>
        </button>

        {/* Vertical Divider */}
        <span className="w-px h-5 bg-accent-zari/25 shrink-0" aria-hidden="true" />

        {/* 2. Audio Wave / Hearth Synth Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isSoundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
          title={isSoundEnabled ? "Mute sound" : "Unmute sound"}
          className={`flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark ${
            isSoundEnabled ? "text-brand-teal-dark" : "text-ink-sand hover:text-ink-alabaster"
          }`}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Vertical Divider */}
        <span className="w-px h-5 bg-accent-zari/25 shrink-0" aria-hidden="true" />

        {/* 3. ⌘K Command Palette Search Badge */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onOpenSearch();
          }}
          aria-label="Open command search"
          title="Search (⌘K)"
          className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 font-sans text-[11px] text-ink-sand hover:text-ink-alabaster transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
        >
          <Search className="w-4 h-4 text-brand-lavender" aria-hidden="true" />
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-white/10 text-[10px] tracking-wide font-semibold text-brand-lavender">
            ⌘K
          </span>
        </button>
      </div>
      </StarBorder>
    </aside>
  );
};
