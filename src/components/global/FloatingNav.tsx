"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTinai, TINAIS, Tinai } from "@/context/TinaiContext";
import { useAudio } from "@/context/AudioContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { 
  Volume2, 
  VolumeX, 
  Search, 
  Layers, 
  Menu, 
  X,
  ExternalLink 
} from "lucide-react";

interface FloatingNavProps {
  onOpenSearch: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLocale();
  const { currentTinai, isManualPin, setTinai, resetToLiveTime, meta } = useTinai();
  const { isSoundEnabled, toggleSound, playClick, playBell } = useAudio();
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  const [isTinaiMenuOpen, setIsTinaiMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/events", labelKey: "nav.events" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/board", labelKey: "nav.board" },
    { href: "/gallery", labelKey: "nav.gallery" },
    { href: "/guide", labelKey: "nav.guide" },
    { href: "/suggestions", labelKey: "nav.suggestions" },
    { href: "/join", labelKey: "nav.join" },
  ];

  const handleLinkClick = () => {
    playClick();
    setIsMobileMenuOpen(false);
  };

  const handleTinaiSelect = (id: Tinai) => {
    playBell(660);
    setTinai(id, true);
    setIsTinaiMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Logo & Brand Title */}
          {/* Brand Logo Module: Architectural Stone Inscription Box */}
          <Link
            href="/"
            onClick={playClick}
            className="group flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-2 border-[#250d38] bg-white shadow-[2px_2px_0px_#4c2472] sm:shadow-[3px_3px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[box-shadow,border-color,transform] duration-150"
          >
            <div className="relative w-8 h-8 border-2 border-[#55CCA2] bg-[#4c2472] overflow-hidden shrink-0 shadow-sm">
              <Image
                src="/emblem.svg"
                alt="Official OSU Tamil Sangam Logo"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-[#250d38] group-hover:text-[#4c2472] transition-colors font-display">
              {t("brand.name")}
            </span>
          </Link>

          {/* Desktop Navigation Console: Segmented Ledger Bar */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-white border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472]">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={playClick}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-[background-color,color,border-color] duration-150 ${
                    isActive
                      ? "bg-[#250d38] text-[#55CCA2] border-b-2 border-b-[#55CCA2] shadow-sm"
                      : "text-[#3c1959] hover:text-[#250d38] hover:bg-purple-100/70"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Architectural Box Controls */}
          <div className="flex items-center gap-2">
            {/* Search ⌘K Trigger */}
            <button
              onClick={() => {
                playClick();
                onOpenSearch();
              }}
              title={t("control.search")}
              aria-label="Open search command palette (⌘K)"
              className="w-10 h-10 min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] border-2 border-[#250d38] bg-white text-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[box-shadow,border-color,transform,background-color] duration-150 flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Toggle (EN / தமிழ்) - Box Switch */}
            <button
              onClick={() => {
                playClick();
                toggleLocale();
              }}
              title="Switch Language / மொழியை மாற்ற"
              aria-label={locale === "en" ? "Switch language to Tamil" : "Switch language to English"}
              className="px-2.5 sm:px-3 py-1.5 min-h-[42px] sm:min-h-[44px] text-xs font-mono font-bold border-2 border-[#250d38] bg-white text-[#4c2472] shadow-[2px_2px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[box-shadow,border-color,transform,background-color] duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="px-1 py-0.5 text-[10px] font-mono bg-[#250d38] text-[#55CCA2] font-bold">
                {locale === "en" ? "TA" : "EN"}
              </span>
              <span className="font-tamil font-bold" lang={locale === "en" ? "ta" : "en"} style={{ letterSpacing: 0 }}>
                {locale === "en" ? "தமிழ்" : "English"}
              </span>
            </button>

            {/* Tinai & Time-of-Day Chip - Box Chip */}
            <div className="relative">
              <button
                onClick={() => {
                  playClick();
                  setIsTinaiMenuOpen(!isTinaiMenuOpen);
                }}
                title={locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn}
                aria-label="Select Tamil landscape (Tinai) and time of day"
                aria-expanded={isTinaiMenuOpen}
                aria-haspopup="true"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 min-h-[42px] sm:min-h-[44px] text-xs font-mono font-bold border-2 border-[#250d38] bg-white text-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[box-shadow,border-color,transform] duration-150 cursor-pointer"
              >
                <span
                  className="w-2 h-2 border border-black/40 animate-pulse"
                  style={{ backgroundColor: meta.accentColor }}
                />
                <span className="text-[#250d38] font-bold">
                  {locale === "ta" ? meta.nameTa : meta.nameEn}
                </span>
                <span className="text-[10px] text-[#4c2472] font-mono font-medium">
                  {isManualPin ? "Pinned" : "Live"}
                </span>
              </button>

              {/* Tinai Dropdown Menu: Architectural Ledger Panel */}
              {isTinaiMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white p-3 shadow-[6px_6px_0px_#250d38] z-50 text-left border-2 border-[#250d38]">
                  <div className="p-2 border-b-2 border-purple-200 mb-2 bg-purple-50/60">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#6b478d] font-bold">
                      {locale === "ta" ? "ஐந்திணை நிலங்கள் & பொழுது" : "5 Landscapes & Time of Day"}
                    </p>
                    <p className="text-xs text-purple-950/80 mt-0.5 font-mono">
                      {isManualPin
                        ? (locale === "ta" ? "நிலம் தேர்வு செய்யப்பட்டுள்ளது" : "Manual landscape pinned")
                        : (locale === "ta" ? "நேரத்துடன் ஒத்திசைக்கப்பட்டது" : "Syncing with your local clock")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {(Object.keys(TINAIS) as Tinai[]).map((key) => {
                      const tMeta = TINAIS[key];
                      const isSelected = currentTinai === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleTinaiSelect(key)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono text-left border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-[#250d38] text-white font-bold border-[#55CCA2] shadow-[2px_2px_0px_#55CCA2]"
                              : "border-transparent text-[#250d38] hover:bg-purple-50 hover:border-purple-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 border border-black/30 shrink-0"
                              style={{ backgroundColor: tMeta.accentColor }}
                            />
                            <div>
                              <span className="font-bold">
                                {locale === "ta" ? tMeta.nameTa : tMeta.nameEn}
                              </span>
                              <span className={`block text-[10px] ${isSelected ? "text-purple-200" : "text-purple-900/60"}`}>
                                {locale === "ta" ? tMeta.landscapeTa : tMeta.landscapeEn}
                              </span>
                            </div>
                          </div>
                          {isSelected && <span className="text-[#55CCA2] font-bold text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  {isManualPin && (
                    <button
                      onClick={() => {
                        playClick();
                        resetToLiveTime();
                        setIsTinaiMenuOpen(false);
                      }}
                      className="w-full mt-2 py-1.5 text-center text-[11px] font-mono font-bold text-[#4c2472] hover:text-[#11694c] border-t-2 border-purple-200 pt-2 transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2]"
                    >
                      {locale === "ta" ? "நேரடி நேரத்திற்கு மீட்டமை" : "Reset to Live Clock"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isSoundEnabled ? t("control.soundOff") : t("control.soundOn")}
              aria-label={isSoundEnabled ? "Mute interactive audio effects" : "Enable interactive audio effects"}
              className={`w-10 h-10 min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] border-2 border-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 flex items-center justify-center transition-[box-shadow,border-color,transform,background-color] duration-150 cursor-pointer ${
                isSoundEnabled
                  ? "border-[#250d38] text-[#11694c] bg-[#55CCA2]"
                  : "bg-white text-[#4c2472] hover:border-[#55CCA2]"
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                playClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden w-10 h-10 min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] border-2 border-[#250d38] bg-white text-[#250d38] shadow-[2px_2px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 flex items-center justify-center transition-[box-shadow,border-color,transform] duration-150 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation: Architectural Ledger Panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl lg:hidden flex flex-col pt-24 px-5 sm:px-6 pb-28 justify-between overflow-y-auto border-b-4 border-[#250d38] shadow-2xl">
          <div className="space-y-3">
            <p className="text-xs uppercase font-mono tracking-widest text-[#250d38] px-1 font-bold border-l-4 border-[#55CCA2] pl-2">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"} · Navigation Index
            </p>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-4 py-3 min-h-[48px] border-2 border-[#250d38] text-sm font-mono font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] active:translate-x-[2px] transition-[background-color,box-shadow,transform] duration-150 ${
                      isActive
                        ? "bg-[#250d38] text-[#55CCA2] shadow-[3px_3px_0px_#55CCA2]"
                        : "bg-purple-50/70 text-[#250d38] hover:bg-purple-100 shadow-[2px_2px_0px_#4c2472]"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                    <span className="text-xs opacity-60">→</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t-2 border-purple-200">
              <Link
                href="/links"
                onClick={handleLinkClick}
                className="flex items-center justify-between px-4 py-3 border-2 border-[#250d38] bg-purple-100 text-sm font-mono font-bold text-[#4c2472] hover:bg-purple-200 shadow-[2px_2px_0px_#4c2472] transition-colors"
              >
                <span>{t("nav.links")} (Linktree Bio Mode)</span>
                <ExternalLink className="w-4 h-4 text-[#55CCA2]" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-purple-200 flex items-center justify-between text-xs text-[#6b478d]">
            <button
              onClick={toggleLiteMode}
              className="px-3.5 py-2 border-2 border-[#250d38] bg-purple-100 text-[#4c2472] font-mono font-bold flex items-center gap-2 hover:bg-purple-200 shadow-[2px_2px_0px_#4c2472] transition-colors"
            >
              <Layers className="w-4 h-4 text-[#11694c]" />
              <span>{isLiteMode ? "Lite Mode (Active)" : "3D Mode"}</span>
            </button>

            <Link
              href="/about#faq"
              onClick={handleLinkClick}
              className="font-mono font-bold text-[#4c2472] hover:text-[#11694c] transition-colors"
            >
              {locale === "ta" ? "உதவி அரங்கம்" : "Help & FAQ"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
