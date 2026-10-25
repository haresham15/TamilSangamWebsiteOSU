"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { HeroScrollStage } from "@/components/canvas/HeroScrollStage";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";
import {
  subscribeEasterEgg,
  subscribePluckedStrings,
  triggerEasterEgg,
} from "./state";

const STATIC_PHOTOS = [
  "/events/berry-cute-picnic/picnic-01.jpg",
  "/events/streetside-sapad/picnic-01.jpg",
  "/events/berry-cute-picnic/picnic-07.jpg",
  "/events/namma-jathara/picnic-01.jpg",
];

function StaticGalleryHero() {
  return (
    <div
      data-gallery-static
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 gap-4 p-5 opacity-45 sm:grid-cols-4 sm:gap-7 sm:p-12"
    >
      {STATIC_PHOTOS.map((src, index) => (
        <div
          key={src}
          className={`relative self-center aspect-[3/4] ${
            index % 2 ? "translate-y-16 rotate-3" : "-translate-y-16 -rotate-3"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover rounded-sm shadow-lg border border-[#D4AF37]/30"
          />
        </div>
      ))}
    </div>
  );
}

const GuitarScene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <StaticGalleryHero />,
});

export function GalleryHero() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [easterEgg, setEasterEgg] = useState(false);
  const [activeStrings, setActiveStrings] = useState<number[]>([]);
  const progress = useRef(0);
  const title = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const isStatic = mounted ? (isLiteMode || tier === "C" || Boolean(reducedMotion)) : false;

  useEffect(() => {
    const unsubEaster = subscribeEasterEgg((active) => {
      setEasterEgg(active);
    });
    const unsubStrings = subscribePluckedStrings((strings) => {
      setActiveStrings(strings);
    });
    return () => {
      unsubEaster();
      unsubStrings();
    };
  }, []);

  useEffect(() => {
    if (isStatic) return;
    let rafId: number;
    const updateTitleOpacity = () => {
      const p = progress.current || 0;
      if (title.current) {
        // Smoothly fade hero title out (p = 0.18 -> 0.28)
        title.current.style.opacity = String(Math.max(0, 1.0 - p * 3.4));
      }
      if (cta.current) {
        const exit = Math.max(0, Math.min(1, (p - 0.65) / 0.12));
        cta.current.style.opacity = String(1 - exit);
        cta.current.style.transform = `translateY(${-18 * exit}px)`;
        cta.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
      }
      rafId = requestAnimationFrame(updateTitleOpacity);
    };
    rafId = requestAnimationFrame(updateTitleOpacity);
    return () => cancelAnimationFrame(rafId);
  }, [isStatic]);

  return (
    <>
      {/* Vaaranam Aayiram Golden Chord Reverie Toast Notification */}
      {easterEgg && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full border border-[#D4AF37]/80 bg-[#120B16]/95 px-6 py-2.5 shadow-[0_0_45px_rgba(212,175,55,0.65)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFB84D] animate-ping" />
          <p className="font-mono text-xs text-[#FAF6F0] tracking-wide flex items-center">
            <span lang="ta" className="font-tamil text-sm text-[#D4AF37] font-medium mr-2 tracking-normal">
              நெஞ்சுக்குள் பெய்திடும்
            </span>
            <span className="text-[#FAF6F0]/50">·</span>
            <span className="ml-2 text-[#FAF6F0] font-semibold">Acoustic Reverie Unlocked</span>
          </p>
        </div>
      )}

      <HeroScrollStage id="gallery-hero" progressRef={progress} static={isStatic} tone="indigo">
        {isStatic ? (
          <StaticGalleryHero />
        ) : (
          <GuitarScene progressRef={progress} />
        )}

        {/* Hero Typography Overlay (Act I) */}
        <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center text-[#FAF6F0]">
          <div key={String(isStatic)} ref={title} className="w-full max-w-3xl py-12 select-none">
            <h1 className="font-display text-[clamp(3.75rem,11vw,9.5rem)] leading-[1.02] tracking-tight text-[#FAF6F0] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
              {locale === "ta" ? (
                <span lang="ta" className="font-tamil leading-relaxed tracking-normal text-[#FAF6F0]">
                  நினைவுகள்
                </span>
              ) : (
                "The Canvas"
              )}
              <span className="sr-only">
                {" "}— Photo Gallery &amp; 35mm Campus Archive | OSU Tamil Sangam at The Ohio State University
              </span>
            </h1>

            {locale !== "ta" && (
              <p
                lang="ta"
                className="mt-3 font-tamil text-2xl sm:text-4xl leading-relaxed tracking-normal text-[#D4AF37] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]"
              >
                நினைவுகள்
              </p>
            )}

            <p className="mx-auto mt-6 max-w-md font-body text-sm sm:text-base leading-relaxed text-[#FAF6F0]/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Campus afternoons, shared biryani tables, and stories we keep.
            </p>
          </div>

          {/* Clean Bottom Explore Link (Guaranteed ZERO Fret Bar Obstruction) */}
          <a
            ref={cta}
            href="#gallery-vault-content"
            className="pointer-events-auto absolute bottom-14 inline-flex min-h-12 items-center gap-3 border-b border-[#FAF6F0]/40 px-4 font-mono text-xs uppercase tracking-widest text-[#FAF6F0] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
          >
            Explore the archive <span aria-hidden="true">↓</span>
          </a>

          {/* 6-String Kolam Indicator & "♪ Strum Chord" Interactive Pill */}
          {!isStatic && (
            <div className="pointer-events-auto absolute bottom-6 left-6 sm:bottom-8 sm:left-10 flex items-center gap-3 rounded-full border border-[#D4AF37]/35 bg-[#120B16]/85 px-4 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
              {/* 6-Dot Kolam String Indicator */}
              <div className="flex items-center gap-1.5 pr-2 border-r border-[#FAF6F0]/15" title="Pluck all 6 strings to unlock the acoustic reverie">
                {[0, 1, 2, 3, 4, 5].map((strIdx) => {
                  const isPlucked = activeStrings.includes(strIdx);
                  return (
                    <span
                      key={strIdx}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        isPlucked
                          ? "bg-[#D4AF37] scale-125 shadow-[0_0_8px_#D4AF37]"
                          : "bg-[#FAF6F0]/25"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Strum Chord Trigger Button */}
              <button
                type="button"
                onClick={() => triggerEasterEgg()}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#FAF6F0]/90 transition-colors hover:text-[#D4AF37] cursor-pointer focus-visible:outline-none"
                title="Strum all 6 strings or click to trigger the Vaaranam Aayiram acoustic reverie"
              >
                <span className="text-[#D4AF37]">♪</span>
                <span>Strum Chord</span>
              </button>
            </div>
          )}
        </div>
      </HeroScrollStage>
    </>
  );
}

export default GalleryHero;
