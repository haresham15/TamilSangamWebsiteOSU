"use client";

import React from "react";
import { useLocale } from "@/context/LocaleContext";

export function HeroOverlay() {
  const { locale } = useLocale();

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* 1. Accessible Skip Link */}
      <a
        href="#gallery-vault-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-[#250d38] text-[#FAF6EE] px-4 py-2 font-mono text-xs border border-[#D4AF37] pointer-events-auto"
      >
        {locale === "ta" ? "ஆல்பங்களுக்குச் செல்" : "Skip to albums"}
      </a>
    </div>
  );
}
