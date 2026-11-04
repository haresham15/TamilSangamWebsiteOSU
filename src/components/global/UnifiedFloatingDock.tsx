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

  return (
    <aside
      aria-label="Quick tools dock"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none pointer-events-auto transition-all duration-300"
    >
      <StarBorder className="rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]" color="#A6F0CF" trailColor="#4FD6E0" thickness={1}>
        <div className="bg-[#140C20] text-[#F4F0FA] border border-[rgba(125,96,166,0.25)] backdrop-blur-md rounded-xl h-10 px-3 sm:px-4 flex items-center gap-2.5 sm:gap-3 transition-all duration-200">
        {/* 1. Ask Nanba Trigger */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onToggleChat();
          }}
          aria-label="Ask Nanba - OSU Tamil Sangam AI Assistant"
          aria-expanded={isChatOpen}
          className="group flex items-center gap-2 text-xs font-mono font-medium tracking-wide text-[#F4F0FA] hover:text-[#A6F0CF] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4FD6E0] rounded-md py-1 pr-1"
        >
          <NanbaAvatar size={18} className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-115" />
          <span className="text-[11px] sm:text-xs">
            {locale === "ta" ? "நண்பா" : "Ask Nanba"}
          </span>
        </button>

        {/* Vertical Divider */}
        <span className="w-px h-3.5 bg-white/15 shrink-0" aria-hidden="true" />

        {/* 2. Audio Wave / Hearth Synth Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isSoundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
          title={isSoundEnabled ? "Mute sound" : "Unmute sound"}
          className={`flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4FD6E0] ${
            isSoundEnabled ? "text-[#A6F0CF]" : "text-[#C4B7D7] hover:text-[#F4F0FA]"
          }`}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Vertical Divider */}
        <span className="w-px h-3.5 bg-white/15 shrink-0" aria-hidden="true" />

        {/* 3. ⌘K Command Palette Search Badge */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onOpenSearch();
          }}
          aria-label="Open command search"
          title="Search (⌘K)"
          className="flex items-center gap-1.5 text-[11px] font-mono text-[#C4B7D7] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4FD6E0] rounded-full py-1 pl-1"
        >
          <Search className="w-3 h-3 text-[#C4B7D7]" />
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-white/10 text-[10px] tracking-wide font-semibold text-[#C4B7D7]">
            ⌘K
          </span>
        </button>
      </div>
      </StarBorder>
    </aside>
  );
};
