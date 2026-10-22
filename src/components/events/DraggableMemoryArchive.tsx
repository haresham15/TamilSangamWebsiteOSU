// src/components/events/DraggableMemoryArchive.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { audioLayer } from "@/utils/audioLayer";
import { RotateCcw, Move, Sparkles } from "lucide-react";

interface PolaroidArtifact {
  id: string;
  titleTa: string;
  titleEn: string;
  date: string;
  location: string;
  imageUrl: string;
  initialX: number; // Percentage or px
  initialY: number;
  initialRot: number;
}

const ARCHIVE_ITEMS: PolaroidArtifact[] = [
  {
    id: "polaroid-01",
    titleTa: "ஓவல் புல்வெளி பிக்னிக்",
    titleEn: "South Oval Berry Picnic",
    date: "SEP 18, 2025",
    location: "SOUTH OVAL",
    imageUrl: "/events/berry-cute-picnic/picnic-01.jpg",
    initialX: 8,
    initialY: 10,
    initialRot: -8,
  },
  {
    id: "polaroid-02",
    titleTa: "தெருவோரச் சாப்பாடு & தோசை",
    titleEn: "Streetside Sapad Tawa",
    date: "FEB 24, 2026",
    location: "CAMPUS KITCHEN",
    imageUrl: "/events/streetside-sapad/picnic-02.jpg",
    initialX: 38,
    initialY: 6,
    initialRot: 7,
  },
  {
    id: "polaroid-03",
    titleTa: "நம்ம ஜாதரா வசந்த நடனம்",
    titleEn: "Namma Jathara Plaza Dance",
    date: "MAR 26, 2026",
    location: "RPAC PLAZA",
    imageUrl: "/events/namma-jathara/picnic-01.jpg",
    initialX: 68,
    initialY: 14,
    initialRot: -12,
  },
  {
    id: "polaroid-04",
    titleTa: "பாரம்பரிய பில்டர் காபி",
    titleEn: "Degree Filter Kaapi Savor",
    date: "AUTUMN 2025",
    location: "UNION HEARTH",
    imageUrl: "/events/streetside-sapad/picnic-04.jpg",
    initialX: 18,
    initialY: 48,
    initialRot: 11,
  },
  {
    id: "polaroid-05",
    titleTa: "சங்க நண்பர்கள் குடும்பம்",
    titleEn: "Spring Family Kickback",
    date: "APR 2026",
    location: "OHIO STADIUM",
    imageUrl: "/events/berry-cute-picnic/picnic-05.jpg",
    initialX: 48,
    initialY: 44,
    initialRot: -5,
  },
  {
    id: "polaroid-06",
    titleTa: "இசை & நடன ஒத்திகை",
    titleEn: "Carnival Rehearsal Moments",
    date: "MAR 2026",
    location: "DRAKE CENTER",
    imageUrl: "/events/namma-jathara/picnic-02.jpg",
    initialX: 74,
    initialY: 46,
    initialRot: 9,
  },
];

export function DraggableMemoryArchive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const maxZIndexRef = useRef(10);
  const draggablesRef = useRef<Draggable[]>([]);
  const [hasDealt, setHasDealt] = useState(false);

  const dealCards = () => {
    if (!containerRef.current) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    audioLayer.playCinematicWhoosh(0.55);

    // Animate the cards being dealt onto the table
    gsap.killTweensOf(cards);
    cards.forEach((card, i) => {
      const item = ARCHIVE_ITEMS[i];
      const targetRot = item ? item.initialRot + gsap.utils.random(-3, 3) : gsap.utils.random(-15, 15);

      gsap.fromTo(
        card,
        {
          scale: 0.6,
          y: -120,
          opacity: 0,
          rotation: gsap.utils.random(-30, 30),
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          rotation: targetRot,
          duration: 0.65,
          delay: i * 0.08,
          ease: "power3.out",
          onStart: () => {
            audioLayer.playTapeClack(0.3);
          },
        }
      );
    });

    setHasDealt(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger, Draggable);

    const container = containerRef.current;
    if (!container) return;

    // Create Draggables
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    draggablesRef.current = Draggable.create(cards, {
      bounds: container,
      edgeResistance: 0.75,
      type: "x,y",
      cursor: "grab",
      activeCursor: "grabbing",
      onDragStart: function () {
        audioLayer.playSilkSwish(0.4);
        maxZIndexRef.current += 1;
        this.target.style.zIndex = maxZIndexRef.current.toString();
        gsap.to(this.target, {
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
          duration: 0.15,
          ease: "power2.out",
        });
      },
      onDragEnd: function () {
        audioLayer.playTapeClack(0.35);
        gsap.to(this.target, {
          scale: 1,
          boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          duration: 0.25,
          ease: "power2.out",
        });
      },
    });

    // Deal on ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 75%",
      once: true,
      onEnter: () => {
        dealCards();
      },
    });

    return () => {
      trigger.kill();
      draggablesRef.current.forEach((d) => d.kill());
    };
  }, []);

  return (
    <div className="w-full text-left font-mono">
      {/* Console Metadata Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#250d38]/20 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#87500e]">
            <span className="w-2 h-2 bg-[#55CCA2] inline-block animate-pulse" />
            <span>CAMPUS MEMORY DESK · புகைப்பட நினைவுகள்</span>
          </div>
          <p className="text-[11px] text-[#250d38]/70 font-sans">
            Rifle through, move, and explore polaroids from our outdoor lawn picnics and cultural celebrations.
          </p>
        </div>

        <button
          type="button"
          onClick={dealCards}
          onMouseEnter={() => audioLayer.playTapeClack(0.4)}
          data-cursor="bracket"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#250d38]/40 bg-[#FAF6EE] hover:bg-[#250d38] hover:text-white text-[#250d38] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer select-none"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Desk</span>
        </button>
      </div>

      {/* Physics Workspace Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[580px] sm:h-[660px] lg:h-[720px] bg-[#1a110a] border border-[#B5A642]/30 overflow-hidden select-none"
        style={{
          backgroundImage:
            "radial-gradient(#3a2717 1px, transparent 1px), radial-gradient(#2c1c0f 1px, #140d07 1px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      >
        {/* Workspace Telemetry Markings */}
        <div className="absolute top-3 left-4 text-[9px] text-[#FFB84D]/60 tracking-widest uppercase pointer-events-none select-none">
          COLUMBUS CAMPUS MEMORIES // SOUTH OVAL & UNION
        </div>
        <div className="absolute top-3 right-4 text-[9px] text-white/50 tracking-widest uppercase pointer-events-none select-none flex items-center gap-1">
          <Move className="w-3 h-3 text-[#55CCA2]" />
          <span>DRAGGABLE POLAROIDS</span>
        </div>
        <div className="absolute bottom-3 left-4 text-[9px] text-white/30 tracking-widest uppercase pointer-events-none select-none">
          LAT 40.0067° N · LON 83.0305° W
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] text-white/30 tracking-widest uppercase pointer-events-none select-none">
          OSU TAMIL SANGAM ARCHIVE
        </div>

        {/* 6 Draggable Polaroid Frames */}
        {ARCHIVE_ITEMS.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            data-cursor="bracket"
            style={{
              left: `${item.initialX}%`,
              top: `${item.initialY}%`,
              zIndex: index + 1,
            }}
            className="absolute w-56 sm:w-64 bg-[#FAF6EE] p-3 pb-5 border border-black/30 shadow-[0_12px_24px_rgba(0,0,0,0.35)] cursor-grab active:cursor-grabbing transform-gpu transition-shadow"
          >
            {/* Top Tape Strip */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/75 border border-amber-300/40 rotate-1 shadow-sm pointer-events-none" />

            {/* Polaroid Photo Box */}
            <div className="relative w-full h-44 sm:h-52 bg-black/80 border border-black/10 overflow-hidden mb-3">
              <Image
                src={item.imageUrl}
                alt={`${item.titleEn} — OSU Tamil Sangam campus memories at The Ohio State University`}
                fill
                sizes="(max-width: 768px) 250px, 300px"
                className="object-cover pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 bg-black/75 text-[8px] font-mono text-[#FFB84D] tracking-wider uppercase pointer-events-none">
                {item.date}
              </div>
            </div>

            {/* Handwritten / Monospace Tamil Caption */}
            <div className="space-y-0.5 text-left pointer-events-none select-none">
              <p
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="text-xs font-noto-serif-tamil text-[#2a1205] font-bold leading-tight line-clamp-1"
              >
                {item.titleTa}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#6b4728] font-mono pt-0.5 border-t border-[#6b4728]/20">
                <span className="truncate pr-1">{item.titleEn}</span>
                <span className="shrink-0 text-[8px] text-[#87500e] font-bold">{item.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
