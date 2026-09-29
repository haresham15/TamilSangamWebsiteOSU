"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ExternalLink,
  ChevronDown
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ordered strictly by importance: Home -> Events -> Join -> About -> Board -> Gallery -> Guide -> Feedback
  const navLinks = [
    { href: "/", en: "Home", ta: "முகப்பு", labelKey: "nav.home" },
    { href: "/events", en: "Events", ta: "நிகழ்வுகள்", labelKey: "nav.events" },
    { href: "/about", en: "About", ta: "அறிமுகம்", labelKey: "nav.about" },
    { href: "/board", en: "Board", ta: "அவை", labelKey: "nav.board" },
    { href: "/gallery", en: "Gallery", ta: "நினைவுகள்", labelKey: "nav.gallery" },
    { href: "/guide", en: "Guide", ta: "வழிகாட்டி", labelKey: "nav.guide" },
    { href: "/suggestions", en: "Ideas", ta: "கருத்து", labelKey: "nav.suggestions" },
    { href: "/join", en: "Join", ta: "இணையுங்கள்", labelKey: "nav.join", isCta: true },
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#120820]/97 backdrop-blur-md border-b border-[#D4AF37]/15 shadow-xl"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center h-16 px-4 sm:px-6">

          {/* ========================================================================= */}
          {/* 1. BRAND LOCKUP — flush left, no pill, no border                           */}
          {/* ========================================================================= */}
          <Link
            href="/"
            onClick={playClick}
            aria-label="OSU Tamil Sangam Home"
            className="group flex items-center gap-2.5 shrink-0 mr-6 xl:mr-8"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-none border border-[#D4AF37]/60 bg-[#250d38] overflow-hidden shrink-0 flex items-center justify-center p-0.5 group-hover:border-[#D4AF37] transition-colors duration-200">
              <Image
                src="/emblem.svg"
                alt="Official OSU Tamil Sangam Emblem"
                fill
                className="object-cover"
                sizes="32px"
                priority
              />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[12.5px] sm:text-[13px] font-bold text-[#faf5ed] group-hover:text-[#e0b968] transition-colors font-display tracking-tight">
                {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="text-[9px] sm:text-[9.5px] font-tamil font-medium text-[#D4AF37]/75 group-hover:text-[#D4AF37] transition-colors"
              >
                {locale === "ta" ? "The Ohio State University" : "ஓஹியோ மாநிலப் பல்கலைக்கழகம்"}
              </span>
            </div>
          </Link>

          {/* ========================================================================= */}
          {/* 2. DESKTOP NAV LINKS — inline, no pill wrapper, bottom-border active state */}
          {/* ========================================================================= */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-0 flex-1"
          >
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const isJoin = item.isCta;

              if (isJoin) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={playClick}
                    className={`ml-3 flex items-center gap-1.5 px-4 py-1.5 text-xs font-display font-bold transition-all duration-200 border rounded-none ${
                      isActive
                        ? "bg-[#D4AF37] text-[#120a06] border-[#D4AF37]"
                        : "bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] active:scale-[0.97]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-none bg-[#55CCA2] animate-pulse" />
                    <span>{locale === "ta" ? item.ta : item.en}</span>
                    <span
                      lang="ta"
                      style={{ letterSpacing: 0 }}
                      className="text-[10px] opacity-70 font-tamil font-normal hidden xl:inline"
                    >
                      {locale === "ta" ? item.en : item.ta}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={playClick}
                  className={`group relative flex flex-col items-center justify-center px-3 xl:px-3.5 h-12 sm:h-14 transition-colors duration-150 ${
                    isActive
                      ? "text-[#faf5ed]"
                      : "text-[#b8a0cc] hover:text-[#faf5ed]"
                  }`}
                >
                  <span className="text-[12px] xl:text-[12.5px] font-display font-semibold tracking-normal leading-tight">
                    {locale === "ta" ? item.ta : item.en}
                  </span>
                  <span
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className={`text-[8.5px] xl:text-[9px] font-tamil leading-none transition-colors ${
                      isActive ? "text-[#D4AF37]" : "text-[#8a6fa5] group-hover:text-[#e0b968]"
                    }`}
                  >
                    {locale === "ta" ? item.en : item.ta}
                  </span>

                  {/* Active indicator: bottom gold stroke, not a background pill */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#D4AF37] shadow-[0_0_6px_oklch(0.82_0.18_85/0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ========================================================================= */}
          {/* 3. CONTROLS — right-aligned, no pill wrapper, thin vertical divider        */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto pl-3 sm:pl-4 border-l border-[#D4AF37]/15">
            {/* Search ⌘K Trigger */}
            <button
              onClick={() => {
                playClick();
                onOpenSearch();
              }}
              title={t("control.search")}
              aria-label="Open search command palette (⌘K)"
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#b8a0cc] hover:text-[#faf5ed] hover:bg-[#250d38]/60 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                playClick();
                toggleLocale();
              }}
              title="Switch Language / மொழியை மாற்ற"
              aria-label={locale === "en" ? "Switch language to Tamil" : "Switch language to English"}
              className="px-2.5 sm:px-3 py-1 text-xs font-display font-bold border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 bg-[#250d38]/40 hover:bg-[#250d38]/70 text-[#faf5ed] flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              <span className="text-[9px] font-mono px-1 py-0.5 bg-[#D4AF37] text-[#120a06] font-extrabold leading-none">
                {locale === "en" ? "TA" : "EN"}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="font-tamil text-[11px] text-[#e0b968] font-bold"
              >
                {locale === "en" ? "தமிழ்" : "English"}
              </span>
            </button>

            {/* Tinai & Time-of-Day Chip */}
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
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-display border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 bg-[#250d38]/30 hover:bg-[#250d38]/60 text-[#faf5ed] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <span
                  className="w-2 h-2 rounded-none border border-black/40 animate-pulse shrink-0"
                  style={{ backgroundColor: meta.accentColor }}
                />
                <span className="text-[#faf5ed] font-medium text-[11px]">
                  {locale === "ta" ? meta.nameTa : meta.nameEn}
                </span>
                <ChevronDown className="w-3 h-3 text-[#D4AF37] opacity-75" />
              </button>

              {/* Tinai Dropdown Menu */}
              <AnimatePresence>
                {isTinaiMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-64 bg-[#180d24]/97 backdrop-blur-xl p-3 border border-[#D4AF37]/40 shadow-2xl z-50 text-left"
                  >
                    <div className="p-2 border-b border-[#D4AF37]/20 mb-2 bg-[#250d38]/60">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold">
                        {locale === "ta" ? "ஐந்திணை நிலங்கள் & பொழுது" : "5 Landscapes & Time of Day"}
                      </p>
                      <p className="text-xs text-[#d1b8e6] mt-0.5 font-body">
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
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-[#2e1644] text-[#faf5ed] font-bold border border-[#D4AF37]/60 shadow-sm"
                                : "text-[#d1b8e6] hover:bg-[#250d38]/50 hover:text-[#faf5ed]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-none border border-black/30 shrink-0"
                                style={{ backgroundColor: tMeta.accentColor }}
                              />
                              <div>
                                <span className="font-display font-semibold">
                                  {locale === "ta" ? tMeta.nameTa : tMeta.nameEn}
                                </span>
                                <span
                                  lang="ta"
                                  style={{ letterSpacing: 0 }}
                                  className={`block text-[10px] font-tamil ${
                                    isSelected ? "text-[#e0b968]" : "text-[#a88bbd]"
                                  }`}
                                >
                                  {locale === "ta" ? tMeta.landscapeTa : tMeta.landscapeEn}
                                </span>
                              </div>
                            </div>
                            {isSelected && <span className="text-[#D4AF37] font-bold text-xs">✓</span>}
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
                        className="w-full mt-2 py-1.5 text-center text-[10.5px] font-display font-bold text-[#D4AF37] hover:text-[#faf5ed] border-t border-[#D4AF37]/20 pt-2 transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        {locale === "ta" ? "நேரடி நேரத்திற்கு மீட்டமை" : "Reset to Live Clock"}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isSoundEnabled ? t("control.soundOff") : t("control.soundOn")}
              aria-label={isSoundEnabled ? "Mute interactive audio effects" : "Enable interactive audio effects"}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                isSoundEnabled
                  ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40"
                  : "text-[#b8a0cc] hover:text-[#faf5ed] hover:bg-[#250d38]/60"
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                playClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 text-[#b8a0cc] hover:text-[#faf5ed] hover:bg-[#250d38]/60 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MOBILE DRAWER NAVIGATION: ELEGANT TAMIL ARCHITECTURAL PANEL             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#12071a]/95 backdrop-blur-2xl lg:hidden flex flex-col pt-24 px-5 sm:px-6 pb-12 justify-between overflow-y-auto border-b border-[#D4AF37]/30 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-[#faf5ed] font-display">
                    {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
                  </span>
                  <span
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="text-[11px] font-tamil text-[#D4AF37]"
                  >
                    வழிகாட்டி & பக்க அட்டவணை
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-[#250d38] text-[#D4AF37] border border-[#D4AF37]/30">
                  Navigation
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const isJoin = item.isCta;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-4 py-3 min-h-[48px] rounded-none text-sm font-display transition-all duration-150 ${
                        isActive
                          ? "bg-[#29143d] text-[#faf5ed] border border-[#D4AF37] shadow-[2px_2px_0px_#D4AF37]"
                          : isJoin
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#e6a239] text-[#120a06] font-bold shadow-[2px_2px_0px_#250d38]"
                          : "bg-[#1c0f2a]/70 text-[#d1b8e6] hover:bg-[#250d38] hover:text-[#faf5ed] border border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold text-base ${
                            isJoin && !isActive ? "text-[#120a06]" : ""
                          }`}
                        >
                          {locale === "ta" ? item.ta : item.en}
                        </span>
                        <span
                          lang="ta"
                          style={{ letterSpacing: 0 }}
                          className={`text-xs font-tamil ${
                            isJoin && !isActive
                              ? "text-[#120a06]/80 font-medium"
                              : isActive
                              ? "text-[#D4AF37] font-medium"
                              : "text-[#a88bbd]"
                          }`}
                        >
                          {locale === "ta" ? item.en : item.ta}
                        </span>
                      </div>
                      <span className={`text-sm ${isJoin && !isActive ? "text-[#120a06]" : "text-[#D4AF37]"}`}>
                        {isJoin ? "★ →" : "→"}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/20">
                <Link
                  href="/links"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-4 py-3 rounded-none border border-[#D4AF37]/30 bg-[#250d38]/50 text-sm font-display font-semibold text-[#faf5ed] hover:bg-[#250d38] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{t("nav.links")}</span>
                    <span className="text-[11px] font-normal text-[#a88bbd]">(Linktree Bio Mode)</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-[#a88bbd]">
              <button
                onClick={toggleLiteMode}
                className="px-3.5 py-2 rounded-none border border-[#D4AF37]/30 bg-[#250d38]/50 text-[#faf5ed] font-display font-medium flex items-center gap-2 hover:bg-[#250d38] transition-colors"
              >
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>{isLiteMode ? "Lite Mode (Active)" : "3D Mode"}</span>
              </button>

              <Link
                href="/about#faq"
                onClick={handleLinkClick}
                className="font-display font-semibold text-[#D4AF37] hover:text-[#faf5ed] transition-colors"
              >
                {locale === "ta" ? "உதவி அரங்கம்" : "Help & FAQ"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
