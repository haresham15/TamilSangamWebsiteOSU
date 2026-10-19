"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Check, Copy, ExternalLink, CalendarPlus, ChevronDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";

interface SubscribePopoverProps {
  className?: string;
  subscribeUrl?: string;
  webcalUrl?: string;
}

export const SubscribePopover: React.FC<SubscribePopoverProps> = ({
  className = "",
  subscribeUrl = "#",
  webcalUrl = "#",
}) => {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyLink = () => {
    playWoodClick();
    const icsUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/calendars/almanac.ics`
        : "https://tamilsangamosu.org/calendars/almanac.ics";

    navigator.clipboard.writeText(icsUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`.trim()}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-[#F4EFE6] text-[#2A2825] border border-[#2A2825]/20 hover:border-[#B85C38] text-xs font-sans font-medium transition-all shadow-sm cursor-pointer min-h-[44px]"
      >
        <CalendarPlus className="w-4 h-4 text-[#B85C38]" />
        <span>
          {locale === "ta"
            ? "நாட்காட்டியைப் பின்தொடர்"
            : "Subscribe to the Sangam calendar"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#57524C] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 bg-[#FAF9F6] border border-[#2A2825]/15 rounded-2xl shadow-xl z-50 p-4 text-left space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-[#2A2825]/10 pb-2">
            <h4 className="font-serif text-sm font-semibold text-[#2A2825]">
              {locale === "ta" ? "நேரலை நாட்காட்டி சந்தா" : "Live Calendar Sync"}
            </h4>
            <p className="text-[11px] font-sans text-[#57524C] mt-0.5 leading-snug">
              {locale === "ta"
                ? "ஒருமுறை இணைந்தால் அனைத்து புதிய நிகழ்வுகளும் உங்கள் நாட்காட்டியில் தானாக வந்து சேரும்."
                : "Subscribe once and all new events and updates sync directly to your personal phone or laptop calendar."}
            </p>
          </div>

          <div className="space-y-1.5">
            {/* 1. Google Calendar */}
            <a
              href={subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playWoodClick();
                setIsOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4EFE6] text-[#2A2825] transition-colors group text-xs font-sans"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 font-semibold text-xs">
                  G
                </div>
                <div>
                  <span className="font-medium block">Google Calendar</span>
                  <span className="text-[10px] text-[#57524C]">One-tap web add</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#57524C] group-hover:text-[#B85C38]" />
            </a>

            {/* 2. Apple / Outlook (webcal) */}
            <a
              href={webcalUrl}
              onClick={() => {
                playWoodClick();
                setIsOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4EFE6] text-[#2A2825] transition-colors group text-xs font-sans"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-[#2A2825]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium block">Apple & Outlook</span>
                  <span className="text-[10px] text-[#57524C]">Direct webcal protocol</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#57524C] group-hover:text-[#B85C38]" />
            </a>

            {/* 3. Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4EFE6] text-[#2A2825] transition-colors group text-xs font-sans cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#2A2825]/20 flex items-center justify-center text-[#B85C38]">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-medium block">
                    {copied
                      ? locale === "ta"
                        ? "இணைப்பு நகலெடுக்கப்பட்டது!"
                        : "Link Copied!"
                      : locale === "ta"
                      ? "iCal இணைப்பை நகலெடு"
                      : "Copy iCal Link"}
                  </span>
                  <span className="text-[10px] text-[#57524C]">Standard RFC 5545 feed</span>
                </div>
              </div>
              {copied && <span className="text-[10px] font-mono text-emerald-600 font-semibold">COPIED</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
