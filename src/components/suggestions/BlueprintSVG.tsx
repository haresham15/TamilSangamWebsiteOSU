"use client";

import React, { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export interface BlueprintPin {
  id: string;
  id2?: string;
  x: number;
  y: number;
  labelEn: string;
  labelTa: string;
  questionEn: string;
  questionTa: string;
  category: string;
}

export const BLUEPRINT_PINS: BlueprintPin[] = [
  {
    id: "pin-events",
    x: 500,
    y: 350,
    labelEn: "The 50-Yard Line & Field",
    labelTa: "மத்திய ஆடுகளம் (50-Yard)",
    questionEn: "Wish for a massive Kuthu celebration, acoustic music jam, or collegiate sports gathering on the field? Pitch it here.",
    questionTa: "மேடை அதிரும் குத்து நடனங்கள், மெல்லிசைப் பாடல்கள், அல்லது விளையாட்டு நிகழ்வுகள் பற்றிப் பரிந்துரைக்கலாம்.",
    category: "Event idea",
  },
  {
    id: "pin-rotunda",
    id2: "pin-gallery",
    x: 500,
    y: 120,
    labelEn: "The Historic North Rotunda",
    labelTa: "வரலாற்றுச் சிறப்புமிக்க வடக்கு ரோட்டுண்டா",
    questionEn: "Have iconic photos, alumni memories, or architectural traditions you want documented under the rotunda? Tell us below.",
    questionTa: "புகைப்படங்கள், கல்லூரி நினைவுகள், அல்லது புதிய ஆவணப்படுத்தல் யோசனைகளைப் பகிரலாம்.",
    category: "Website feedback",
  },
  {
    id: "pin-pressbox",
    id2: "pin-union",
    x: 230,
    y: 340,
    labelEn: "West Tower & Press Suite",
    labelTa: "மேற்கு கோபுரம் & நிர்வாக அரங்கம்",
    questionEn: "Propose new executive partnerships, cultural symposia, mentorship circles, or academic collaborations.",
    questionTa: "மாணவர் வழிகாட்டுதல், கல்வி உதவிகள், அல்லது புதிய கூட்டு முன்னெடுப்புகள் பற்றிப் பகிரலாம்.",
    category: "New initiative",
  },
];

interface BlueprintSVGProps {
  progress?: number; // 0 to 1 scroll reveal
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export function BlueprintSVG({
  progress = 1,
  onSelectCategory,
  className = "",
}: BlueprintSVGProps) {
  const { locale } = useLocale();
  const [activePin, setActivePin] = useState<BlueprintPin | null>(null);

  // Dashoffset calculation for stroke drawing animation
  // When progress goes from 0.05 to 0.35, draw-on unfolds
  const drawProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.3));
  const dashOffset = (1 - drawProgress) * 1000;

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 1000 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          {/* Kolam Lattice Dot Grid Pattern for Blueprint Hatching */}
          <pattern
            id="kolam-grid-pattern"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="12" r="1.2" fill="#55CCA2" fillOpacity="0.25" />
            <path
              d="M12 4L20 12L12 20L4 12Z"
              stroke="#9bb0d8"
              strokeWidth="0.4"
              strokeDasharray="1 3"
              strokeOpacity="0.15"
            />
          </pattern>

          {/* Cyanotype Paper Texture Gradient */}
          <radialGradient
            id="cyanotype-bg"
            cx="50%"
            cy="45%"
            r="65%"
            fx="50%"
            fy="45%"
          >
            <stop offset="0%" stopColor="#1a2456" />
            <stop offset="60%" stopColor="#12183c" />
            <stop offset="100%" stopColor="#0b0f26" />
          </radialGradient>

          {/* Golden Zari Dimension Line Gradient */}
          <linearGradient id="zari-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFC526" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FFD875" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFC526" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* 1. Blueprint Deep Cyanotype Background */}
        <rect width="1000" height="700" fill="url(#cyanotype-bg)" />

        {/* 2. Kolam Dot-Grid Ground Matrix */}
        <rect
          x="30"
          y="30"
          width="940"
          height="640"
          fill="url(#kolam-grid-pattern)"
          stroke="#415682"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        {/* Inner Blueprint Border Frame */}
        <rect
          x="40"
          y="40"
          width="920"
          height="620"
          stroke="#f8f6f0"
          strokeWidth="0.75"
          strokeOpacity="0.4"
        />

        {/* 3. Ohio Stadium ("The Shoe") Architectural Horseshoe Schematic */}
        <g
          stroke="#f8f6f0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: dashOffset,
            transition: "stroke-dashoffset 0.1s linear",
          }}
        >
          {/* Football Field in Center */}
          <rect
            x="420"
            y="230"
            width="160"
            height="270"
            stroke="#55CCA2"
            strokeWidth="1.8"
            fill="#55CCA2"
            fillOpacity="0.06"
          />
          {/* Goal Lines and End Zones */}
          <line x1="420" y1="260" x2="580" y2="260" stroke="#55CCA2" strokeWidth="1.5" />
          <line x1="420" y1="470" x2="580" y2="470" stroke="#55CCA2" strokeWidth="1.5" />
          {/* 10-Yard Lines */}
          {[290, 320, 350, 380, 410, 440].map((yVal) => (
            <line key={yVal} x1="420" y1={yVal} x2="580" y2={yVal} stroke="#55CCA2" strokeWidth="0.75" strokeOpacity="0.7" />
          ))}
          {/* 50-Yard Center Marker */}
          <circle cx="500" cy="365" r="18" stroke="#55CCA2" strokeWidth="1.2" fill="none" />
          <circle cx="500" cy="365" r="3" fill="#FFC526" />

          {/* North Track Semicircle */}
          <path d="M420 260 A80 80 0 0 1 580 260" stroke="#55CCA2" strokeWidth="1" strokeDasharray="3 3" fill="none" />

          {/* Horseshoe Seating Decks (Lower Bowl & Upper C-Deck Tiers) */}
          {/* Tier 1 (Inner Lower Bowl) */}
          <path d="M380 500 L380 260 A120 120 0 0 1 620 260 L620 500" strokeWidth="1.8" fill="none" />
          {/* Tier 2 */}
          <path d="M350 510 L350 260 A150 150 0 0 1 650 260 L650 510" strokeWidth="1.4" fill="none" strokeOpacity="0.8" />
          {/* Tier 3 (Cross-Aisle vomitories) */}
          <path d="M320 520 L320 260 A180 180 0 0 1 680 260 L680 520" strokeWidth="1.2" fill="none" strokeDasharray="6 3" />
          {/* Tier 4 (Upper C-Deck Cantilever Nose) */}
          <path d="M290 530 L290 260 A210 210 0 0 1 710 260 L710 530" strokeWidth="2" fill="none" />
          {/* Tier 5 (C-Deck Upper Rows) */}
          <path d="M260 540 L260 260 A240 240 0 0 1 740 260 L740 540" strokeWidth="1.4" fill="none" strokeOpacity="0.7" />

          {/* Outer Wall with the 84 Roman Arcade Arches */}
          <path d="M230 550 L230 260 A270 270 0 0 1 770 260 L770 550" strokeWidth="2.2" fill="none" />
          {/* Arcade Arch bays along West wall */}
          {[270, 310, 350, 390, 430, 470, 510].map((yPos) => (
            <path key={yPos} d={`M230 ${yPos} Q215 ${yPos + 15} 230 ${yPos + 30}`} strokeWidth="1.2" stroke="#FFC526" fill="none" />
          ))}
          {/* Arcade Arch bays along East wall */}
          {[270, 310, 350, 390, 430, 470, 510].map((yPos) => (
            <path key={yPos} d={`M770 ${yPos} Q785 ${yPos + 15} 770 ${yPos + 30}`} strokeWidth="1.2" stroke="#FFC526" fill="none" />
          ))}

          {/* The Historic North Rotunda Entrance */}
          <g transform="translate(500, 70)">
            {/* Rotunda Semicircular Portico */}
            <path d="M-60 0 A60 60 0 0 1 60 0" stroke="#FFC526" strokeWidth="2.4" fill="#161e44" fillOpacity="0.8" />
            <path d="M-45 0 A45 45 0 0 1 45 0" stroke="#FFC526" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <path d="M-30 0 A30 30 0 0 1 30 0" stroke="#FFC526" strokeWidth="1.8" fill="none" />
            {/* Flanking Pylon Towers */}
            <rect x="-75" y="-15" width="20" height="30" stroke="#f8f6f0" strokeWidth="1.8" fill="#12183c" />
            <rect x="55" y="-15" width="20" height="30" stroke="#f8f6f0" strokeWidth="1.8" fill="#12183c" />
            {/* Cupola Finial */}
            <circle cx="0" cy="-60" r="4" fill="#FFC526" />
          </g>

          {/* West Press Box & Tower Structure */}
          <rect
            x="195"
            y="290"
            width="35"
            height="140"
            stroke="#38bdf8"
            strokeWidth="1.8"
            fill="#12183c"
            fillOpacity="0.85"
          />
          <line x1="212" y1="290" x2="212" y2="430" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" />

          {/* South Open Horseshoe Bleachers & Videoboard Tower */}
          <path d="M380 500 Q500 520 620 500" strokeWidth="1.6" fill="none" />
          <path d="M360 515 Q500 535 640 515" strokeWidth="1.4" fill="none" strokeDasharray="3 3" />
          {/* South Videoboard Steel Frame */}
          <rect x="440" y="540" width="120" height="28" stroke="#38bdf8" strokeWidth="2" fill="#161e44" />
          <line x1="440" y1="554" x2="560" y2="554" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
        </g>

        {/* 4. Golden Zari Dimension Lines and Metric Callouts (§2.1) */}
        <g stroke="url(#zari-gold)" strokeWidth="1">
          {/* Oval Width Dimension */}
          <line x1="270" y1="160" x2="690" y2="160" strokeDasharray="4 2" />
          <line x1="270" y1="152" x2="270" y2="168" strokeWidth="1.5" stroke="#FFC526" />
          <line x1="690" y1="152" x2="690" y2="168" strokeWidth="1.5" stroke="#FFC526" />
          <text
            x="480"
            y="152"
            fill="#FFC526"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            letterSpacing="1"
          >
            420.0 m · QUAD SPAN
          </text>

          {/* Vertical Central Walkway Dimension */}
          <line x1="880" y1="220" x2="880" y2="390" strokeDasharray="4 2" />
          <line x1="872" y1="220" x2="888" y2="220" strokeWidth="1.5" stroke="#FFC526" />
          <line x1="872" y1="390" x2="888" y2="390" strokeWidth="1.5" stroke="#FFC526" />
          <text
            x="896"
            y="310"
            fill="#FFC526"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="1"
            transform="rotate(90 896 310)"
            textAnchor="middle"
          >
            170.0 m · UNION SECTOR
          </text>
        </g>

        {/* 5. Kolam Pulli-Grid Technical Title Block (Bottom Right) */}
        <g transform="translate(620, 520)">
          {/* Box Container */}
          <rect
            x="0"
            y="0"
            width="320"
            height="120"
            fill="#12183c"
            stroke="#f8f6f0"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />
          {/* Header Row */}
          <rect x="0" y="0" width="320" height="28" fill="#1b244d" />
          <text
            x="12"
            y="18"
            fill="#55CCA2"
            fontFamily="monospace"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
          >
            OSU TAMIL SANGAM · ARCHITECTURAL SCHEMATIC
          </text>

          {/* Decorative Mini Kolam Grid Flourish */}
          <g transform="translate(285, 8)">
            <circle cx="0" cy="0" r="1.5" fill="#FFC526" />
            <circle cx="12" cy="0" r="1.5" fill="#FFC526" />
            <circle cx="6" cy="6" r="1.5" fill="#FFC526" />
            <path d="M0 0 L12 0 L6 12 Z" stroke="#FFC526" strokeWidth="0.6" fill="none" />
          </g>

          {/* Detail Metadata Grid */}
          <line x1="0" y1="58" x2="320" y2="58" stroke="#415682" strokeWidth="0.8" />
          <line x1="0" y1="88" x2="320" y2="88" stroke="#415682" strokeWidth="0.8" />
          <line x1="160" y1="28" x2="160" y2="88" stroke="#415682" strokeWidth="0.8" />

          {/* Left Column */}
          <text x="12" y="44" fill="#9bb0d8" fontFamily="monospace" fontSize="8">DWG NO:</text>
          <text x="65" y="44" fill="#f8f6f0" fontFamily="monospace" fontSize="9" fontWeight="bold">TS-2026-SUGG</text>

          <text x="12" y="74" fill="#9bb0d8" fontFamily="monospace" fontSize="8">SCALE:</text>
          <text x="65" y="74" fill="#f8f6f0" fontFamily="monospace" fontSize="9" fontWeight="bold">1:1000 / NTS</text>

          {/* Right Column */}
          <text x="172" y="44" fill="#9bb0d8" fontFamily="monospace" fontSize="8">DATE:</text>
          <text x="215" y="44" fill="#f8f6f0" fontFamily="monospace" fontSize="9" fontWeight="bold">SEP 2026</text>

          <text x="172" y="74" fill="#9bb0d8" fontFamily="monospace" fontSize="8">ENGINE:</text>
          <text x="225" y="74" fill="#55CCA2" fontFamily="monospace" fontSize="8" fontWeight="bold">EMBLEM V2</text>

          {/* Bottom Row Disclaimer & Approval */}
          <text
            x="12"
            y="106"
            fill="#a4b5d6"
            fontFamily="monospace"
            fontSize="8"
            letterSpacing="0.5"
          >
            NOT AN OFFICIAL UNIVERSITY ENTITY · RSO AT OSU
          </text>
        </g>

        {/* 6. Compass Rose Kolam Flourish (Top Left) */}
        <g transform="translate(90, 95)">
          <circle cx="0" cy="0" r="32" stroke="#415682" strokeWidth="0.8" strokeDasharray="2 3" />
          <circle cx="0" cy="0" r="22" stroke="#f8f6f0" strokeWidth="0.6" strokeOpacity="0.4" />
          {/* North needle */}
          <path d="M0 -28 L5 0 L0 5 L-5 0 Z" fill="#55CCA2" />
          <path d="M0 28 L4 0 L0 -4 L-4 0 Z" fill="#415682" />
          <text x="0" y="-33" fill="#55CCA2" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">N</text>
          <text x="0" y="3" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle">திசை</text>
        </g>

        {/* 7. Interactive Hover-Reveal Annotation Pins (§2.3) */}
        {BLUEPRINT_PINS.map((pin) => {
          const isActive = activePin?.id === pin.id;
          return (
            <g
              key={pin.id}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => {
                setActivePin(isActive ? null : pin);
                if (onSelectCategory) onSelectCategory(pin.category);
              }}
              onMouseEnter={() => setActivePin(pin)}
              onMouseLeave={() => setActivePin(null)}
            >
              {/* Pulsing Outer Radar Circle */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r="18"
                fill="#55CCA2"
                fillOpacity={isActive ? "0.3" : "0.12"}
                className={isActive ? "animate-ping" : ""}
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r="12"
                stroke="#FFC526"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              {/* Kolam Center Dot */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r="5"
                fill={isActive ? "#FFC526" : "#55CCA2"}
              />

              {/* Pin Tag Label */}
              <rect
                x={pin.x + 12}
                y={pin.y - 12}
                width="135"
                height="22"
                fill="#12183c"
                stroke="#55CCA2"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={pin.x + 18}
                y={pin.y + 2}
                fill="#f8f6f0"
                fontFamily="monospace"
                fontSize="8.5"
                fontWeight="bold"
              >
                {locale === "ta" ? pin.labelTa : pin.labelEn}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Roundel Hover Lens Callout Card (§2.3 Roundel Hover Lens pattern) */}
      {activePin && (
        <div
          className="absolute z-30 transition-all duration-300 pointer-events-auto max-w-xs"
          style={{
            left: `${(activePin.x / 1000) * 100}%`,
            top: `${(activePin.y / 700) * 100}%`,
            transform: "translate(-50%, -125%)",
          }}
        >
          <div className="relative p-4 bg-[#12183c]/95 border-2 border-[#55CCA2] shadow-[6px_6px_0px_#250d38] backdrop-blur-md rounded-lg text-white">
            <button
              onClick={() => setActivePin(null)}
              className="absolute top-2 right-2 text-purple-300 hover:text-white"
              aria-label="Close callout"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 text-[#FFC526] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{locale === "ta" ? activePin.labelTa : activePin.labelEn}</span>
            </div>

            <p className="text-xs font-body text-purple-100 leading-relaxed mb-3">
              {locale === "ta" ? activePin.questionTa : activePin.questionEn}
            </p>

            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(activePin.category);
                setActivePin(null);
                const formEl = document.getElementById("suggestion-form-box");
                if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full text-center py-1.5 px-3 bg-[#55CCA2] hover:bg-[#45b78f] text-[#12183c] text-[11px] font-mono font-bold uppercase tracking-wider transition-colors"
            >
              {locale === "ta" ? "யோசனையை எழுத" : "Suggest for this area →"}
            </button>

            {/* Circular Roundel Lens Accent Dot at bottom */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#12183c] border-b-2 border-r-2 border-[#55CCA2] rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
