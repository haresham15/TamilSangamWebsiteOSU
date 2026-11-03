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
            data-lenis-prevent
            className="mb-3 w-72 max-h-[min(80dvh,500px)] overflow-y-auto overscroll-contain bg-[#140C20]/95 backdrop-blur-md border border-[rgba(125,96,166,0.25)] shadow-[0_12px_36px_rgba(0,0,0,0.4)] p-3 text-[#F4F0FA] font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(125,96,166,0.25)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C4B7D7] font-semibold">
                {locale === "ta" ? "கருவிகள் & சூழல்" : "Sangam Utilities"}
              </span>
              <button
                onClick={() => {
                  playClick();
                  setIsOpen(false);
                  setIsTinaiSubmenuOpen(false);
                }}
                aria-label="Close utility drawer"
                className="w-5 h-5 flex items-center justify-center text-[#C4B7D7] hover:text-[#F4F0FA] transition-colors"
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
                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#25173B] transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#A6F0CF]" />
                      <span className="font-medium">{t("control.search")}</span>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-[#25173B]/5 border border-[rgba(125,96,166,0.25)] text-[#C4B7D7]">
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
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#25173B] transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#A6F0CF]" />
                    <span className="font-medium">
                      {locale === "en" ? "தமிழ் பதிப்பு" : "English Version"}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#A6F0CF]">
                    {locale === "en" ? "TA" : "EN"}
                  </span>
                </button>

                {/* 3. Audio / Ambience Toggle */}
                <button
                  onClick={() => {
                    toggleSound();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#25173B] transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    {isSoundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#A6F0CF]" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-[#C4B7D7]" />
                    )}
                    <span className="font-medium">
                      {isSoundEnabled ? "Interactive Audio (On)" : "Interactive Audio (Muted)"}
                    </span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSoundEnabled ? "bg-[#A6F0CF]" : "bg-[#25173B]/20"
                    }`}
                  />
                </button>

                {/* 4. Tinai Landscape */}
                <button
                  onClick={() => {
                    playClick();
                    setIsTinaiSubmenuOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#25173B] transition-colors text-left"
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
                  <ChevronRight className="w-3.5 h-3.5 text-[#C4B7D7]" />
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
                  className="w-full text-left text-[11px] font-mono text-[#C4B7D7] hover:text-[#F4F0FA] pb-1.5 mb-1 border-b border-[rgba(125,96,166,0.25)] flex items-center gap-1"
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 transition-colors text-left ${
                        isSelected ? "bg-[#25173B] font-semibold text-[#F4F0FA]" : "hover:bg-[#25173B]/60 text-[#C4B7D7]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 border border-black/20 shrink-0"
                          style={{ backgroundColor: tMeta.accentColor }}
                        />
                        <span>{locale === "ta" ? tMeta.nameTa : tMeta.nameEn}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#A6F0CF]" />}
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
                    className="w-full mt-2 pt-2 border-t border-[rgba(125,96,166,0.25)] text-center text-[10px] font-mono text-[#A6F0CF] hover:underline"
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
        className="group relative flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-[#140C20] border border-[rgba(125,96,166,0.25)] shadow-[0_4px_16px_rgba(0,0,0,0.35)] text-[#F4F0FA] hover:text-[#A6F0CF] hover:border-[#A6F0CF]/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
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
