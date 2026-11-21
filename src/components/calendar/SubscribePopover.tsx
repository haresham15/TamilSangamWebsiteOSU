"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Check, Copy, ExternalLink, CalendarPlus, ChevronDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { SITE_URL } from "@/lib/seo";

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
        : `${SITE_URL}/calendars/almanac.ics`;

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
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-card-light hover:bg-brand-purple-soft text-brand-purple border border-brand-purple/40 hover:border-brand-purple text-sm font-sans font-medium transition-colors cursor-pointer min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
      >
        <CalendarPlus className="w-4 h-4 text-brand-teal" aria-hidden="true" />
        <span lang={locale === "ta" ? "ta" : undefined}>
          {locale === "ta"
            ? "நாட்காட்டியைப் பின்தொடர்"
            : "Subscribe to the Sangam calendar"}
        </span>
        <ChevronDown aria-hidden="true" className={`w-3.5 h-3.5 text-ink-umber transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={locale === "ta" ? "நேரலை நாட்காட்டி சந்தா" : "Live Calendar Sync"}
          className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface-card-light border border-border-warm rounded-2xl shadow-[0_16px_40px_rgba(91,44,134,0.14)] z-50 p-4 text-left space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="border-b border-border-warm pb-2">
            <h4 lang={locale === "ta" ? "ta" : undefined} className="font-serif text-base font-semibold text-ink-earth">
              {locale === "ta" ? "நேரலை நாட்காட்டி சந்தா" : "Live Calendar Sync"}
            </h4>
            <p lang={locale === "ta" ? "ta" : undefined} className="text-xs font-sans text-ink-umber mt-0.5 leading-[1.6]">
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
              className="flex min-h-12 items-center justify-between p-2.5 rounded-xl hover:bg-brand-purple-soft text-ink-earth transition-colors group text-sm font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <div className="flex items-center gap-2.5">
                <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-brand-purple-soft border border-border-warm flex items-center justify-center text-brand-purple font-semibold text-xs">
                  G
                </div>
                <div>
                  <span className="font-medium block">Google Calendar</span>
                  <span className="text-[11px] text-ink-umber">One-tap web add</span>
                </div>
              </div>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-ink-umber group-hover:text-brand-teal" />
            </a>

            {/* 2. Apple / Outlook (webcal) */}
            <a
              href={webcalUrl}
              onClick={() => {
                playWoodClick();
                setIsOpen(false);
              }}
              className="flex min-h-12 items-center justify-between p-2.5 rounded-xl hover:bg-brand-purple-soft text-ink-earth transition-colors group text-sm font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <div className="flex items-center gap-2.5">
                <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-bg-sandstone border border-border-warm flex items-center justify-center text-ink-earth">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium block">Apple & Outlook</span>
                  <span className="text-[11px] text-ink-umber">Direct webcal protocol</span>
                </div>
              </div>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-ink-umber group-hover:text-brand-teal" />
            </a>

            {/* 3. Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full min-h-12 flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-purple-soft text-ink-earth transition-colors group text-sm font-sans cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <div className="flex items-center gap-2.5">
                <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-brand-teal-soft border border-border-warm flex items-center justify-center text-brand-teal">
                  {copied ? <Check className="w-3.5 h-3.5 text-brand-teal" /> : <Copy className="w-3.5 h-3.5" />}
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
                  <span className="text-[11px] text-ink-umber">Standard RFC 5545 feed</span>
                </div>
              </div>
              {copied && <span className="text-[11px] font-sans uppercase tracking-[0.14em] text-brand-teal font-semibold">Copied</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
