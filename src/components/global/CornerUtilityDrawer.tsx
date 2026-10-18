"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Volume2, VolumeX, Globe, SlidersHorizontal, X, ChevronRight, Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useTinai, TINAIS, Tinai } from "@/context/TinaiContext";

interface CornerUtilityDrawerProps {
  onOpenSearch?: () => void;
}

export const CornerUtilityDrawer: React.FC<CornerUtilityDrawerProps> = ({ onOpenSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTinaiSubmenuOpen, setIsTinaiSubmenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { locale, toggleLocale, t } = useLocale();
  const { isSoundEnabled, toggleSound, playClick, playBell } = useAudio();
  const { currentTinai, isManualPin, setTinai, resetToLiveTime, meta } = useTinai();

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsTinaiSubmenuOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsTinaiSubmenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleTinaiSelect = (id: Tinai) => {
    playBell(432);
    setTinai(id, true);
    setIsTinaiSubmenuOpen(false);
  };

  return (
    <aside
      ref={drawerRef}
      aria-label="Environmental controls and quick tools"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Expanded Minimalist Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-72 bg-[#FAF9F6]/95 backdrop-blur-md border border-[#2A2825]/15 shadow-[0_12px_36px_rgba(42,40,37,0.12)] p-3 text-[#2A2825] font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A2825]/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#57524C] font-semibold">
                {locale === "ta" ? "கருவிகள் & சூழல்" : "Sangam Utilities"}
              </span>
              <button
                onClick={() => {
                  playClick();
                  setIsOpen(false);
                  setIsTinaiSubmenuOpen(false);
                }}
                aria-label="Close utility drawer"
                className="w-5 h-5 flex items-center justify-center text-[#57524C] hover:text-[#2A2825] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Utilities List */}
            {!isTinaiSubmenuOpen ? (
              <div className="space-y-1 text-xs">
                {/* 1. Search Trigger */}
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      playClick();
                      onOpenSearch();
                      setIsOpen(false);
                    }}
                    aria-label={t("control.search")}
                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#F4EFE6] transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#B85C38]" />
                      <span className="font-medium">{t("control.search")}</span>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-[#2A2825]/5 border border-[#2A2825]/10 text-[#57524C]">
                      ⌘K
                    </kbd>
                  </button>
                )}

                {/* 2. Language Switcher */}
                <button
                  onClick={() => {
                    playClick();
                    toggleLocale();
                  }}
                  aria-label={locale === "en" ? "தமிழ் பதிப்பு" : "English Version"}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#F4EFE6] transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#B85C38]" />
                    <span className="font-medium">
                      {locale === "en" ? "தமிழ் பதிப்பு" : "English Version"}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#B85C38]">
                    {locale === "en" ? "TA" : "EN"}
                  </span>
                </button>

                {/* 3. Audio / Ambience Toggle */}
                <button
                  onClick={() => {
                    toggleSound();
                  }}
                  aria-label={isSoundEnabled ? "Interactive Audio (On)" : "Interactive Audio (Muted)"}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#F4EFE6] transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    {isSoundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#B85C38]" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-[#57524C]" />
                    )}
                    <span className="font-medium">
                      {isSoundEnabled ? "Interactive Audio (On)" : "Interactive Audio (Muted)"}
                    </span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSoundEnabled ? "bg-[#B85C38]" : "bg-[#2A2825]/20"
                    }`}
                  />
                </button>

                {/* 4. Tinai Landscape */}
                <button
                  onClick={() => {
                    playClick();
                    setIsTinaiSubmenuOpen(true);
                  }}
                  aria-label={locale === "ta" ? meta.nameTa : meta.nameEn}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#F4EFE6] transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-black/20 shrink-0"
                      style={{ backgroundColor: meta.accentColor }}
                    />
                    <span className="font-medium">
                      {locale === "ta" ? meta.nameTa : meta.nameEn}
                    </span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#57524C]" />
                </button>
              </div>
            ) : (
              /* Tinai Selection Submenu */
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    playClick();
                    setIsTinaiSubmenuOpen(false);
                  }}
                  aria-label={locale === "ta" ? "பின்செல்" : "Back to Utilities"}
                  className="w-full text-left text-[11px] font-mono text-[#57524C] hover:text-[#2A2825] pb-1.5 mb-1 border-b border-[#2A2825]/10 flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{locale === "ta" ? "பின்செல்" : "Back to Utilities"}</span>
                </button>

                {(Object.keys(TINAIS) as Tinai[]).map((key) => {
                  const tMeta = TINAIS[key];
                  const isSelected = currentTinai === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTinaiSelect(key)}
                      aria-label={locale === "ta" ? tMeta.nameTa : tMeta.nameEn}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 transition-colors text-left ${
                        isSelected ? "bg-[#F4EFE6] font-semibold text-[#2A2825]" : "hover:bg-[#F4EFE6]/60 text-[#57524C]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 border border-black/20 shrink-0"
                          style={{ backgroundColor: tMeta.accentColor }}
                        />
                        <span>{locale === "ta" ? tMeta.nameTa : tMeta.nameEn}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B85C38]" />}
                    </button>
                  );
                })}

                {isManualPin && (
                  <button
                    onClick={() => {
                      playClick();
                      resetToLiveTime();
                      setIsTinaiSubmenuOpen(false);
                    }}
                    aria-label={locale === "ta" ? "நேரடி நேரத்திற்கு மீட்டமை" : "Reset to Live Clock"}
                    className="w-full mt-2 pt-2 border-t border-[#2A2825]/10 text-center text-[10px] font-mono text-[#B85C38] hover:underline"
                  >
                    {locale === "ta" ? "நேரடி நேரத்திற்கு மீட்டமை" : "Reset to Live Clock"}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        aria-label="Toggle Sangam Utilities Drawer"
        aria-expanded={isOpen}
        className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#2A2825]/20 shadow-[0_4px_16px_rgba(42,40,37,0.12)] text-[#2A2825] hover:text-[#B85C38] hover:border-[#B85C38]/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <SlidersHorizontal className="w-4 h-4 transition-transform group-hover:rotate-45" />
        {/* Active tint dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white"
          style={{ backgroundColor: meta.accentColor }}
          title={`Active Tinai: ${meta.nameEn}`}
        />
      </button>
    </aside>
  );
};
