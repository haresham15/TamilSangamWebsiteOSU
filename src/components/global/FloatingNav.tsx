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
    { href: "/initiatives", labelKey: "nav.initiatives" },
    { href: "/gallery", labelKey: "nav.gallery" },
    { href: "/board", labelKey: "nav.board" },
    { href: "/culture-lab", labelKey: "nav.cultureLab" },
    { href: "/about", labelKey: "nav.about" },
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
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Logo & Brand Title */}
          <Link
            href="/"
            onClick={playClick}
            className="group flex items-center gap-3 px-3.5 py-2 rounded-full glass-panel border border-purple-200/80 shadow-md transition-all duration-200 hover:border-[#55CCA2] hover:shadow-[0_0_16px_rgba(85,204,162,0.3)] bg-white/90"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-sm shrink-0 border border-[#55CCA2]/60">
              <Image
                src="/emblem.svg"
                alt="Official OSU Tamil Sangam Logo"
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold tracking-tight text-[#250d38] group-hover:text-[#4c2472] transition-colors font-display">
                {t("brand.name")}
              </span>
              <span className="text-[10px] text-[#6b478d] tracking-wider uppercase font-mono">
                {t("brand.classicalTitle")} · {locale === "ta" ? meta.nameTa : meta.nameEn}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Center Bar */}
          <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full glass-panel border border-purple-200/70 shadow-md bg-white/90">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={playClick}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#4c2472] text-white shadow-sm border border-[#55CCA2]/50"
                      : "text-[#3c1959] hover:text-[#250d38] hover:bg-purple-100/70"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Search, Language, Landscape, Sound, Lite */}
          <div className="flex items-center gap-2">
            {/* Search ⌘K Trigger */}
            <button
              onClick={() => {
                playClick();
                onOpenSearch();
              }}
              title={t("control.search")}
              className="p-2.5 rounded-full glass-panel border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-tint)] hover:border-[var(--accent-tint)] transition-all shadow-md"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Toggle (EN / தமிழ்) */}
            <button
              onClick={() => {
                playClick();
                toggleLocale();
              }}
              title="Switch Language / மொழியை மாற்ற"
              className="px-3 py-1.5 text-xs font-semibold rounded-full glass-panel border border-[var(--border-subtle)] text-[var(--accent-tint)] hover:border-[var(--accent-tint)] transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="font-mono text-[10px]">🌐</span>
              <span>{locale === "en" ? "தமிழ்" : "English"}</span>
            </button>

            {/* Tinai & Time-of-Day Chip */}
            <div className="relative">
              <button
                onClick={() => {
                  playClick();
                  setIsTinaiMenuOpen(!isTinaiMenuOpen);
                }}
                title={locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full glass-panel border border-[var(--border-subtle)] hover:border-[var(--accent-tint)] transition-all shadow-md"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: meta.accentColor }}
                />
                <span className="text-[var(--text-primary)]">
                  {locale === "ta" ? meta.nameTa : meta.nameEn}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {isManualPin ? "📌" : "⏱️"}
                </span>
              </button>

              {/* Tinai Dropdown Menu */}
              {isTinaiMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-50 text-left border border-[var(--border-strong)]">
                  <div className="p-2 border-b border-white/10 mb-1">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">
                      {locale === "ta" ? "ஐந்திணை நிலங்கள் & பொழுது" : "5 Landscapes & Time of Day"}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                            isSelected
                              ? "bg-white/15 text-white font-medium shadow-inner"
                              : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tMeta.accentColor }}
                            />
                            <div>
                              <span className="font-medium">
                                {locale === "ta" ? tMeta.nameTa : tMeta.nameEn}
                              </span>
                              <span className="block text-[10px] text-[var(--text-muted)]">
                                {locale === "ta" ? tMeta.landscapeTa : tMeta.landscapeEn}
                              </span>
                            </div>
                          </div>
                          {isSelected && <span className="text-[var(--accent-tint)] text-xs">✓</span>}
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
                      className="w-full mt-2 py-1.5 text-center text-[11px] text-[var(--accent-tint)] hover:underline border-t border-white/10 pt-2"
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
              className={`p-2.5 rounded-full glass-panel border transition-all shadow-md ${
                isSoundEnabled
                  ? "border-[var(--accent-tint)] text-[var(--accent-tint)] bg-[var(--accent-glow)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white"
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
              className="lg:hidden p-2.5 rounded-full glass-panel border border-[var(--border-subtle)] text-white shadow-md"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl lg:hidden flex flex-col pt-24 px-6 pb-10 justify-between overflow-y-auto border-b border-purple-200 shadow-2xl">
          <div className="space-y-3">
            <p className="text-xs uppercase font-mono tracking-widest text-[#6b478d] px-3">
              {t("brand.classicalTitle")} · Navigation
            </p>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                      isActive
                        ? "bg-[#4c2472] text-white shadow-md border border-[#55CCA2]"
                        : "bg-purple-50/70 border border-purple-100 text-[#250d38] hover:bg-purple-100"
                    }`}
                  >
                    <span>{t(item.labelKey)}</span>
                    <span className="text-xs opacity-60">→</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/links"
                onClick={handleLinkClick}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-[var(--accent-tint)] font-semibold"
              >
                <span>{t("nav.links")} (Linktree Mode)</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <button
              onClick={toggleLiteMode}
              className="px-3 py-2 rounded-xl glass-panel text-white flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[var(--accent-tint)]" />
              <span>{isLiteMode ? "Lite Mode (Active)" : "3D Mode"}</span>
            </button>

            <Link
              href="/ask"
              onClick={handleLinkClick}
              className="hover:text-[var(--accent-tint)]"
            >
              {locale === "ta" ? "உதவி அரங்கம்" : "Help & FAQ"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
