"use client";

import React, { useState, useEffect } from "react";
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
  const darkHeroRoutes = ["/", "/events", "/about", "/board", "/gallery", "/guide", "/suggestions", "/join"];
  const isHeroRoute = darkHeroRoutes.includes(normalizedPath);
  const [isInHeroZone, setIsInHeroZone] = useState(() => isHeroRoute);

  useEffect(() => {
    const evaluateScroll = () => {
      if (!isHeroRoute) {
        setIsInHeroZone(false);
        return;
      }
      const scrollY = window.scrollY;
      const sheet = document.querySelector<HTMLElement>("[data-editorial-sheet]");
      let pastHero = false;
      if (sheet) {
        const top = sheet.getBoundingClientRect().top;
        pastHero = top <= 80;
      } else {
        pastHero = scrollY >= 800;
      }
      // Retract/fade out dock during hero animation until user makes it through the animation
      setIsInHeroZone(!pastHero);
    };

    evaluateScroll();
    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [pathname]);

  return (
    <aside
      aria-label="Quick tools dock"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isInHeroZone
          ? "opacity-0 pointer-events-none translate-y-4"
          : "opacity-100 pointer-events-auto translate-y-0"
      }`}
    >
      <StarBorder className="rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)]" color="#D4AF37" trailColor="#C85A32" thickness={1}>
        <div className="bg-[#161210] text-[#FAF7F2] border border-[#FAF7F2]/15 backdrop-blur-md rounded-full h-10 px-3.5 sm:px-4 flex items-center gap-2.5 sm:gap-3 transition-all duration-200">
        {/* 1. Ask Nanba Trigger */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onToggleChat();
          }}
          aria-label="Ask Nanba - OSU Tamil Sangam AI Assistant"
          aria-expanded={isChatOpen}
          className="group flex items-center gap-2 text-xs font-mono font-medium tracking-wide text-[#FAF7F2] hover:text-[#E5A93C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] rounded-full py-1 pr-1"
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
          onClick={() => {
            playClick();
            toggleSound();
          }}
          aria-label={isSoundEnabled ? "Mute interactive audio" : "Enable interactive audio"}
          title={isSoundEnabled ? "Mute sound" : "Unmute sound"}
          className={`flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] ${
            isSoundEnabled ? "text-[#E5A93C]" : "text-[#FAF7F2]/50 hover:text-[#FAF7F2]"
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
          className="flex items-center gap-1.5 text-[11px] font-mono text-[#FAF7F2]/75 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] rounded-full py-1 pl-1"
        >
          <Search className="w-3 h-3 text-[#FAF7F2]/60" />
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-white/10 text-[10px] tracking-wide font-semibold text-[#FAF7F2]/90">
            ⌘K
          </span>
        </button>
      </div>
      </StarBorder>
    </aside>
  );
};
