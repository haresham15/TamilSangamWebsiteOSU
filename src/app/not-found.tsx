"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Home, Calendar, BookOpen, Bot, ArrowRight } from "lucide-react";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

export default function NotFound() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const handleOpenNanba = () => {
    playWoodClick();
    const btn = document.querySelector('button[aria-label*="Ask Nanba"]') as HTMLButtonElement | null;
    if (btn) {
      btn.click();
    }
  };

  return (
    <div className="relative w-full min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-32 pb-20 text-left font-body overflow-hidden">
      {/* Structural Watermark */}
      <WatermarkGlyph text="பிழை" position="center" theme="dark" opacity={0.035} />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Main Content Box */}
        <div className="relative p-8 sm:p-12 rounded-2xl bg-[#1A1028]/95 backdrop-blur-md border border-[rgba(125,96,166,0.35)] shadow-2xl overflow-hidden">

          {/* Subtle Courtyard Radial Bloom */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_top_right,rgba(199,147,71,0.08),transparent_70%)] pointer-events-none" />

          <div className="space-y-4 max-w-xl">
            <span className="text-4xl sm:text-5xl font-bold font-mono text-[#C79347] block">
              404
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal text-[#FAF5ED] font-serif tracking-tight leading-tight" {...(locale === "ta" ? { lang: "ta" } : {})}>
              {locale === "ta" ? "பக்கம் காணப்படவில்லை" : "Page Not Found"}
            </h1>
            <p className="text-sm sm:text-base text-[#CBBBA8] leading-relaxed font-body" {...(locale === "ta" ? { lang: "ta" } : {})}>
              {locale === "ta"
                ? "நீங்கள் தேடும் பக்கம் நகர்த்தப்பட்டிருக்கலாம் அல்லது அதன் முகவரி மாறியிருக்கலாம். கீழே உள்ள முக்கிய இணைப்புகள் வழியாக சங்கத்தின் நிகழ்வுகள் மற்றும் தகவல்களைக் கண்டறியலாம்."
                : "The link you followed may have changed, or the page might have moved. Explore our core sections below, or ask our friendly assistant Nanba to help you locate what you need."}
            </p>
          </div>

          {/* Quick Action Destinations */}
          <div className="mt-8 pt-8 border-t border-[#C79347]/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              onClick={playClick}
              className="p-4 rounded-xl border border-[#C79347]/20 bg-[#1C122B] hover:bg-[#271A3C] hover:border-[#2BB5A8]/50 transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#271A3C] border border-[#C79347]/30 text-[#C79347] group-hover:border-[#2BB5A8]/50 transition-colors">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold font-sans text-[#FAF5ED] group-hover:text-[#2BB5A8] transition-colors" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? "முகப்பு" : "Return to Home"}
                  </div>
                  <div className="text-[11px] font-mono text-[#CBBBA8]/70">osutamilsangam.org</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#CBBBA8] group-hover:translate-x-1 group-hover:text-[#2BB5A8] transition-transform" />
            </Link>

            <Link
              href="/events"
              onClick={playClick}
              className="p-4 rounded-xl border border-[#C79347]/20 bg-[#1C122B] hover:bg-[#271A3C] hover:border-[#2BB5A8]/50 transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#271A3C] border border-[#C79347]/30 text-[#C79347] group-hover:border-[#2BB5A8]/50 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold font-sans text-[#FAF5ED] group-hover:text-[#2BB5A8] transition-colors" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? "நிகழ்வுகள்" : "Browse Events"}
                  </div>
                  <div className="text-[11px] font-mono text-[#CBBBA8]/70">Upcoming campus gatherings</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#CBBBA8] group-hover:translate-x-1 group-hover:text-[#2BB5A8] transition-transform" />
            </Link>

            <Link
              href="/guide"
              onClick={playClick}
              className="p-4 rounded-xl border border-[#C79347]/20 bg-[#1C122B] hover:bg-[#271A3C] hover:border-[#2BB5A8]/50 transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#271A3C] border border-[#C79347]/30 text-[#C79347] group-hover:border-[#2BB5A8]/50 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold font-sans text-[#FAF5ED] group-hover:text-[#2BB5A8] transition-colors" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? "வழிகாட்டி & FAQ" : "User Guide & FAQ"}
                  </div>
                  <div className="text-[11px] font-mono text-[#CBBBA8]/70">Handbook and answers</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#CBBBA8] group-hover:translate-x-1 group-hover:text-[#2BB5A8] transition-transform" />
            </Link>

            <button
              type="button"
              onClick={handleOpenNanba}
              className="p-4 rounded-xl border border-[#2BB5A8]/30 bg-[#271A3C] hover:bg-[#1C122B] hover:border-[#2BB5A8] transition-colors flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1C122B] border border-[#2BB5A8]/40 text-[#2BB5A8] group-hover:border-[#2BB5A8] transition-colors">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold font-sans text-[#FAF5ED] group-hover:text-[#2BB5A8] transition-colors" {...(locale === "ta" ? { lang: "ta" } : {})}>
                    {locale === "ta" ? "நண்பாவிடம் கேளுங்கள்" : "Ask Nanba (AI Guide)"}
                  </div>
                  <div className="text-[11px] font-mono text-[#2BB5A8]">Instant club assistance</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#2BB5A8] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
