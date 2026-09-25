"use client";

import React, { useRef, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Sparkles, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { PalagaiButton } from "@/components/ui/PalagaiButton";

interface PillarItem {
  id: string;
  pillarNum: string;
  pillarNumTa: string;
  titleEn: string;
  titleTa: string;
  tamilScript: string;
  descEn: string;
  descTa: string;
  ctaEn: string;
  ctaTa: string;
  href: string;
  videoSrc?: string;
  posterSrc: string;
  accentColor: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "aatam",
    pillarNum: "Pillar 01",
    pillarNumTa: "தூண் 01",
    titleEn: "Aatam · Dance & Movement",
    titleTa: "ஆட்டம் · நடனம்",
    tamilScript: "ஆடல்",
    descEn:
      "From high-energy cinematic Kuthu to collaborative fusion dance and open celebration circles. Open to all skill levels — no prior experience required!",
    descTa:
      "சினிமா குத்து, ஃப்யூஷன் மற்றும் கொண்டாட்ட நடனங்கள்! மேடையை அதிரவைக்க விரும்பும் அனைவரும் பங்கேற்கலாம்.",
    ctaEn: "Dance With Us",
    ctaTa: "நடனத்தில் இணைக",
    href: "/join",
    posterSrc:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#55CCA2",
  },
  {
    id: "paatam",
    pillarNum: "Pillar 02",
    pillarNumTa: "தூண் 02",
    titleEn: "Paatam · Music & Jams",
    titleTa: "பாட்டம் · இசை",
    tamilScript: "இசை",
    descEn:
      "Casual acoustic jams, singing along to beloved Tamil cinema soundtracks, indie tracks, and live student band sets. Pull up a chair and vibe!",
    descTa:
      "அக்யூஸ்டிக் கல்லூரிப் பாடல்கள், இளையராஜா மற்றும் ரஹ்மான் ஹிட்ஸ், மற்றும் நட்பு நிறைந்த இசை மாலைகள்.",
    ctaEn: "Jam With Us",
    ctaTa: "இசையில் இணைக",
    href: "/join",
    posterSrc:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#FFC526",
  },
  {
    id: "kondatam",
    pillarNum: "Pillar 03",
    pillarNumTa: "தூண் 03",
    titleEn: "Kondatam · Celebration",
    titleTa: "கொண்டாட்டம் · திருவிழா",
    tamilScript: "மகிழ்",
    descEn:
      "Relaxed South Oval lawn picnics, street food banquets, Diwali sparkler nights, and campus family memories for all Buckeyes.",
    descTa:
      "ஓவல் புல்வெளி பிக்னிக், தெருவோரச் சாப்பாடு, தீபாவளி மத்தாப்பு கொண்டாட்டங்கள், மற்றும் வாழ்நாள் நட்பு.",
    ctaEn: "Celebrate Together",
    ctaTa: "ஒன்றாகக் கொண்டாடுவோம்",
    href: "/events",
    posterSrc:
      "https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no",
    accentColor: "#f472b6",
  },
  {
    id: "santhippum",
    pillarNum: "Pillar 04",
    pillarNumTa: "தூண் 04",
    titleEn: "Santhippum · Community",
    titleTa: "சந்திப்பும் · சமூகம்",
    tamilScript: "சமூகம்",
    descEn:
      "A home away from home. Bridging freshman with seniors, hosting casual dinners, and uniting students of all backgrounds at Ohio State.",
    descTa:
      "ஓஹியோ பல்கலைக்கழகத்தில் அனைத்து மாணவர்களையும் அன்போடு ஒன்றிணைக்கும் நட்புப் பாலம்.",
    ctaEn: "Join The Family",
    ctaTa: "சங்கத்தில் இணைக",
    href: "/join",
    posterSrc:
      "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
    accentColor: "#38bdf8",
  },
];

const subscribeTouch = (callback: () => void) => {
  const mql = window.matchMedia("(hover: none)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
};

const getIsTouchSnapshot = () => {
  return window.matchMedia("(hover: none)").matches;
};

function SilkPillarCard({ pillar }: { pillar: PillarItem }) {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [touchToggled, setTouchToggled] = useState(false);
  const isTouchDevice = useSyncExternalStore(
    subscribeTouch,
    getIsTouchSnapshot,
    () => false
  );
  const [inViewMobile, setInViewMobile] = useState(false);

  useEffect(() => {
    if (isTouchDevice && cardRef.current) {
      // Mobile fallback: IntersectionObserver automatically fades in media as pillar scrolls into center
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setInViewMobile(entry.isIntersecting);
          });
        },
        { threshold: 0.55 }
      );
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [isTouchDevice]);

  // Desktop cursor tracking math via GSAP quickTo
  useEffect(() => {
    if (isTouchDevice || isLiteMode || !cardRef.current || !mediaRef.current) return;

    const card = cardRef.current;
    const media = mediaRef.current;

    // 3D card tilt quickTo setters with buttery spring-like damping
    const setRotX = gsap.quickTo(card, "rotationX", { duration: 0.35, ease: "power2.out" });
    const setRotY = gsap.quickTo(card, "rotationY", { duration: 0.35, ease: "power2.out" });

    let cachedRect: DOMRect | null = null;
    let rafPending = false;
    let pendingX = 0;
    let pendingY = 0;

    const refreshRect = () => {
      if (card) {
        cachedRect = card.getBoundingClientRect();
      }
    };

    const updateTilt = () => {
      if (!cachedRect) return;
      const x = pendingX - cachedRect.left;
      const y = pendingY - cachedRect.top;

      const normX = Math.max(0, Math.min(100, (x / cachedRect.width) * 100));
      const normY = Math.max(0, Math.min(100, (y / cachedRect.height) * 100));

      media.style.setProperty("--mask-x", `${normX.toFixed(1)}%`);
      media.style.setProperty("--mask-y", `${normY.toFixed(1)}%`);

      // 3D Perspective Tilt Math based on mouse position
      const tiltX = (y / cachedRect.height - 0.5) * -10;
      const tiltY = (x / cachedRect.width - 0.5) * 10;

      setRotX(tiltX);
      setRotY(tiltY);

      rafPending = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateTilt);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      refreshRect();
      if (cachedRect) {
        const x = e.clientX - cachedRect.left;
        const y = e.clientY - cachedRect.top;
        const normX = Math.max(0, Math.min(100, (x / cachedRect.width) * 100));
        const normY = Math.max(0, Math.min(100, (y / cachedRect.height) * 100));
        media.style.setProperty("--mask-x", `${normX.toFixed(1)}%`);
        media.style.setProperty("--mask-y", `${normY.toFixed(1)}%`);
      }
      setIsHovered(true);
      window.addEventListener("scroll", refreshRect, { passive: true });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setRotX(0);
      setRotY(0);
      cachedRect = null;
      window.removeEventListener("scroll", refreshRect);
    };

    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", refreshRect);
    };
  }, [isTouchDevice, isLiteMode]);

  // Smoothly expand or collapse the circular unmasking radius via GSAP
  useEffect(() => {
    if (isTouchDevice || isLiteMode || !mediaRef.current) return;
    gsap.to(mediaRef.current, {
      "--mask-radius": isHovered ? "44%" : "0%",
      duration: isHovered ? 0.42 : 0.32,
      ease: isHovered ? "power3.out" : "power3.in",
    });
  }, [isHovered, isTouchDevice, isLiteMode]);

  const activeMedia = isTouchDevice ? (inViewMobile || touchToggled) : isHovered;

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (isTouchDevice) {
          setTouchToggled((prev) => !prev);
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={pillar.titleEn}
      style={{ perspective: 1000, transformStyle: "preserve-3d", willChange: "transform" }}
      className="relative w-full rounded-none border-2 border-[#250d38] bg-[#1a0b2e] text-white p-6 sm:p-10 overflow-hidden shadow-[4px_4px_0px_#4c2472] sm:shadow-[6px_6px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[8px_8px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[border-color,box-shadow] duration-300 ease-out flex flex-col justify-between min-h-[320px] sm:min-h-[360px] group select-none cursor-pointer sm:cursor-default transform-gpu"
    >
      {/* 1. Iridescent Kanchipuram Silk Sheen Underlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${pillar.accentColor}22 0%, transparent 70%), linear-gradient(135deg, rgba(85,204,162,0.08) 0%, rgba(255,197,38,0.08) 50%, rgba(147,83,211,0.12) 100%)`,
        }}
      />

      {/* 2. Unmasking Media Layer (Cursor Following on Desktop, InView on Touch) */}
      <div
        ref={mediaRef}
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden transform-gpu"
        style={{
          opacity: activeMedia ? 1 : 0,
          clipPath: isTouchDevice
            ? "circle(100% at 50% 50%)"
            : `circle(var(--mask-radius, 0%) at var(--mask-x, 50%) var(--mask-y, 50%))`,
          transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "clip-path, opacity",
        }}
      >
        <Image
          src={pillar.posterSrc}
          alt={pillar.titleEn}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full object-cover scale-105 filter brightness-90 contrast-110"
        />
        {/* Iridescent Silk Color Wash Overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-50"
          style={{ backgroundColor: pillar.accentColor }}
        />
      </div>

      {/* 3. Massive Giant Tamil Watermark Script */}
      <div
        lang="ta"
        style={{ letterSpacing: 0 }}
        className="absolute right-4 bottom-2 text-7xl sm:text-9xl font-bold font-tamil text-white/15 group-hover:text-white/25 select-none pointer-events-none transition-colors duration-500 z-10"
      >
        {pillar.tamilScript}
      </div>

      {/* 4. Foreground Kinetic Typography Content */}
      <div className="relative z-20 space-y-4">
        <div className="flex items-center justify-end">
          <div
            className="w-3 h-3 rounded-full border border-white/40"
            style={{ backgroundColor: pillar.accentColor }}
          />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white group-hover:text-[#55CCA2] transition-colors leading-tight">
            {locale === "ta" ? pillar.titleTa : pillar.titleEn}
          </h3>
          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-base sm:text-lg font-bold text-amber-200/90 font-tamil mt-1"
          >
            {pillar.titleTa}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-purple-100 font-body leading-relaxed max-w-md">
          {locale === "ta" ? pillar.descTa : pillar.descEn}
        </p>
      </div>

      {/* 5. Action Link Button with Kinetic Bilingual Roll & Artisanal Depth */}
      <div className="relative z-20 pt-6">
        <PalagaiButton
          href={pillar.href}
          primaryText={locale === "ta" ? pillar.ctaTa : pillar.ctaEn}
          secondaryText={locale === "ta" ? pillar.ctaEn : pillar.ctaTa}
          variant="mint"
          size="sm"
          icon={<ArrowUpRight className="w-4 h-4 text-[#240e36]" />}
        />
      </div>
    </div>
  );
}

export function SilkHoverPillars() {
  const { locale } = useLocale();

  return (
    <section className="relative py-24 px-4 sm:px-8 z-10 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
        <div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#250d38] tracking-tight font-display" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
            {locale === "ta" ? "சங்கத்தின் நான்கு தூண்கள்" : "The Four Pillars of Sangam"}
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-[#250d38] font-medium max-w-xs text-left sm:text-right" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
          {locale === "ta"
            ? "கலை, இசை, கொண்டாட்டம் மற்றும் சமூகம் வழியே மாணவர்களை இணைக்கிறோம்."
            : "Connecting Buckeyes through performing arts, music, celebratory gatherings, and community."}
        </p>
      </div>

      {/* 2x2 High-Impact Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {PILLARS.map((pillar) => (
          <SilkPillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}
