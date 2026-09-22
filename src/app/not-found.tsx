"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Home, Calendar, BookOpen, Bot, ArrowRight, Compass } from "lucide-react";

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
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-32 pb-20 text-left font-body">
      <div className="w-full max-w-3xl">
        {/* Decorative Kolam-Inspired Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#250d38] border-2 border-[#55CCA2] text-[#55CCA2] font-mono text-xs uppercase font-bold tracking-wider mb-6 shadow-[2px_2px_0px_#55CCA2]">
          <Compass className="w-3.5 h-3.5" />
          <span>Error 404 · Navigation Deviation</span>
        </div>

        {/* Main Content Box */}
        <div className="p-8 sm:p-12 bg-white border-2 border-[#250d38] shadow-[8px_8px_0px_#250d38] relative overflow-hidden">
          {/* Subtle Corner Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent pointer-events-none" />

          <div className="space-y-4 max-w-xl">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#55CCA2] block">
              404
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight leading-tight">
              {locale === "ta" ? "பக்கம் காணப்படவில்லை" : "Page Not Found"}
            </h1>
            <p className="text-sm sm:text-base text-purple-950/80 leading-relaxed font-body">
              {locale === "ta"
                ? "நீங்கள் தேடும் பக்கம் நகர்த்தப்பட்டிருக்கலாம் அல்லது அதன் முகவரி மாறியிருக்கலாம். கீழே உள்ள முக்கிய இணைப்புகள் வழியாக சங்கத்தின் நிகழ்வுகள் மற்றும் தகவல்களைக் கண்டறியலாம்."
                : "The link you followed may have changed, or the page might have moved. Explore our core sections below, or ask our friendly bot Nanba to help you locate what you need."}
            </p>
          </div>

          {/* Quick Action Destinations */}
          <div className="mt-8 pt-8 border-t-2 border-purple-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              onClick={playClick}
              className="p-3.5 border-2 border-[#250d38] bg-[#faf8f5] hover:bg-emerald-50 hover:border-[#55CCA2] transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#250d38] group-hover:text-[#55CCA2] transition-colors" />
                <div>
                  <div className="text-xs font-bold font-display text-[#250d38]">
                    {locale === "ta" ? "முகப்பு" : "Return to Home"}
                  </div>
                  <div className="text-[11px] font-mono text-purple-900/60">osutamilsangam.org</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 group-hover:text-[#55CCA2] transition-all" />
            </Link>

            <Link
              href="/events"
              onClick={playClick}
              className="p-3.5 border-2 border-[#250d38] bg-[#faf8f5] hover:bg-emerald-50 hover:border-[#55CCA2] transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#250d38] group-hover:text-[#55CCA2] transition-colors" />
                <div>
                  <div className="text-xs font-bold font-display text-[#250d38]">
                    {locale === "ta" ? "நிகழ்வுகள்" : "Browse Events"}
                  </div>
                  <div className="text-[11px] font-mono text-purple-900/60">Upcoming campus gatherings</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 group-hover:text-[#55CCA2] transition-all" />
            </Link>

            <Link
              href="/guide"
              onClick={playClick}
              className="p-3.5 border-2 border-[#250d38] bg-[#faf8f5] hover:bg-emerald-50 hover:border-[#55CCA2] transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#250d38] group-hover:text-[#55CCA2] transition-colors" />
                <div>
                  <div className="text-xs font-bold font-display text-[#250d38]">
                    {locale === "ta" ? "வழிகாட்டி & FAQ" : "User Guide & FAQ"}
                  </div>
                  <div className="text-[11px] font-mono text-purple-900/60">Handbook and answers</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 group-hover:text-[#55CCA2] transition-all" />
            </Link>

            <button
              type="button"
              onClick={handleOpenNanba}
              className="p-3.5 border-2 border-[#250d38] bg-[#250d38] text-white hover:bg-[#361352] hover:border-[#55CCA2] transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-[#55CCA2]" />
                <div>
                  <div className="text-xs font-bold font-display text-white">
                    {locale === "ta" ? "நண்பாவிடம் கேளுங்கள்" : "Ask Nanba (AI Bot)"}
                  </div>
                  <div className="text-[11px] font-mono text-[#55CCA2]">Instant club assistance</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#55CCA2] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
