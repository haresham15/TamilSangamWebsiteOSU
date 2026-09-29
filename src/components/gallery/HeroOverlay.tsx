"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { Music } from "lucide-react";
import { galleryScrollState } from "./galleryStore";
import { getHeroTimelineValues } from "./heroTimeline";

export function HeroOverlay() {
  const { locale } = useLocale();
  const [titleOpacity, setTitleOpacity] = useState(1);

  useEffect(() => {
    let animId: number;
    const updateOverlay = () => {
      const p = galleryScrollState.progress;
      const timeline = getHeroTimelineValues(p);
      setTitleOpacity(timeline.overlayOpacity);
      animId = requestAnimationFrame(updateOverlay);
    };
    animId = requestAnimationFrame(updateOverlay);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* 1. Accessible Skip Link */}
      <a
        href="#gallery-vault-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-[#250d38] text-[#FAF6EE] px-4 py-2 font-mono text-xs border border-[#D4AF37] pointer-events-auto"
      >
        {locale === "ta" ? "ஆல்பங்களுக்குச் செல்" : "Skip to albums"}
      </a>

      {/* 2. Top-Left Identity & Cinematic Title in Sky */}
      <div
        className="flex flex-col gap-2 pt-20 sm:pt-16 max-w-xl transition-opacity duration-150"
        style={{ opacity: titleOpacity }}
      >
        <div className="flex items-center gap-2 px-3 py-1 w-fit bg-[#250d38]/70 backdrop-blur-md border border-[#D4AF37]/40 text-[#f6efe0] font-mono text-[10px] tracking-widest uppercase shadow-[2px_2px_0px_#250d38]">
          <Music className="w-3 h-3 text-[#ff9a3c] animate-pulse" />
          <span>ECR Acoustic Archive</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1"
        >
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#fff4d6] font-display tracking-tight leading-tight drop-shadow-[0_2px_14px_rgba(23,13,43,0.9)]"
            {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
          >
            {locale === "ta" ? "நினைவுகளின் கடற்கரைச் சங்கமம்" : "Memories on the East Coast Road"}
          </h1>
          <p
            className="text-xs sm:text-sm font-medium text-[#f6efe0]/90 mt-1.5 font-body leading-relaxed max-w-md drop-shadow-[0_1px_8px_rgba(23,13,43,0.85)]"
            {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
          >
            {locale === "ta"
              ? "பொன்மாலை வெயில் ஒளியில், நாதஸ்வர இசை அலைகளின் வழியே மலரும் சங்க நினைவுகள்."
              : "Driving the coastal highway at golden hour, watching collegiate memories drift out of the sunset haze."}
          </p>
        </motion.div>
      </div>

      <div /> {/* Spacer keeping layout balanced */}
    </div>
  );
}
