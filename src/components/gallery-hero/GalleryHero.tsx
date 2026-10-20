"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { HeroScrollStage } from "@/components/canvas/HeroScrollStage";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";
import { subscribeEasterEgg, triggerEasterEgg } from "./state";

const PHOTOS = [
  "/events/berry-cute-picnic/picnic-01.jpg",
  "/events/berry-cute-picnic/picnic-02.jpg",
  "/events/berry-cute-picnic/picnic-03.jpg",
  "/events/berry-cute-picnic/picnic-04.jpg",
  "/events/berry-cute-picnic/picnic-05.jpg",
  "/events/berry-cute-picnic/picnic-06.jpg",
  "/events/berry-cute-picnic/picnic-07.jpg",
  "/events/berry-cute-picnic/picnic-08.jpg",
];

function StaticGalleryHero() {
  return (
    <div data-gallery-static aria-hidden="true" className="absolute inset-0 grid grid-cols-2 gap-4 p-5 opacity-45 sm:grid-cols-4 sm:gap-7 sm:p-12">
      {PHOTOS.slice(0, 4).map((src, index) => (
        <div key={src} className={`relative self-center aspect-[3/4] ${index % 2 ? "translate-y-20 rotate-6" : "-translate-y-20 -rotate-6"}`}>
          <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

const GuitarScene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <StaticGalleryHero />
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
  const progress = useRef(0);
  const title = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const isStatic = mounted ? (isLiteMode || tier === "C" || Boolean(reducedMotion)) : false;

  useEffect(() => {
    return subscribeEasterEgg((active) => {
      setEasterEgg(active);
    });
  }, []);

  useEffect(() => {
    if (isStatic) return;
    let rafId: number;
    const updateTitleOpacity = () => {
      const p = progress.current || 0;
      if (title.current) {
        title.current.style.opacity = String(Math.max(0, 1.0 - p * 3.5));
      }
      if (cta.current) {
        const exit = Math.max(0, Math.min(1, (p - 0.70) / 0.10));
        cta.current.style.opacity = String(1 - exit);
        cta.current.style.transform = `translateY(${-20 * exit}px)`;
        cta.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
      }
      rafId = requestAnimationFrame(updateTitleOpacity);
    };
    rafId = requestAnimationFrame(updateTitleOpacity);
    return () => cancelAnimationFrame(rafId);
  }, [isStatic]);

  return (
    <>
      {/* Vaaranam Aayiram Golden Chord Easter Egg Toast Notification */}
      {easterEgg && (
        <div
          role="status"
          className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full border border-[#E8984A]/70 bg-[#1A101C]/95 px-6 py-2.5 shadow-[0_0_40px_rgba(232,152,74,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8984A] animate-ping" />
          <p className="font-mono text-xs text-sangam-cream tracking-wide flex items-center">
            <span lang="ta" className="font-tamil text-sm text-[#FFB84D] font-medium mr-2">
              நெஞ்சுக்குள் பெய்திடும்
            </span>
            <span className="text-sangam-cream/60">·</span>
            <span className="ml-2 text-[#FAF7F2] font-semibold">Acoustic Reverie Unlocked</span>
          </p>
        </div>
      )}

      <HeroScrollStage id="gallery-hero" progressRef={progress} static={isStatic} tone="indigo">
        {isStatic ? (
          <StaticGalleryHero />
        ) : (
          <GuitarScene progressRef={progress} />
        )}

        <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center text-sangam-cream">
          <div key={String(isStatic)} ref={title} className="w-full max-w-3xl py-12">
          <h1 className="font-display text-[clamp(3.75rem,11vw,10rem)] leading-[1.05] tracking-tight">
            {locale === "ta" ? <span lang="ta" className="font-tamil leading-relaxed tracking-normal">நினைவுகள்</span> : "The Canvas"}
          </h1>
          {locale !== "ta" && <p lang="ta" className="mt-4 font-tamil text-2xl leading-relaxed tracking-normal text-[#D4AF37] sm:text-4xl">நினைவுகள்</p>}
          <p className="mx-auto mt-6 max-w-sm font-body text-sm leading-relaxed text-sangam-cream/85 sm:text-base">Campus afternoons. Shared tables. Stories we keep.</p>
        </div>
        <a
          ref={cta}
          href="#gallery-vault-content"
          className="pointer-events-auto absolute bottom-16 inline-flex min-h-12 items-center gap-4 border-b border-sangam-cream/40 px-4 font-mono text-xs uppercase tracking-widest text-sangam-cream transition-colors hover:text-sangam-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sangam-mint"
        >
          Explore the archive <span aria-hidden="true">↓</span>
        </a>

        {/* Vaaranam Aayiram Rosette Strum Easter Egg Trigger Pill */}
        {!isStatic && (
          <button
            type="button"
            onClick={() => triggerEasterEgg()}
            className="pointer-events-auto absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-[#E8984A]/30 bg-[#140D18]/80 px-3.5 py-1.5 backdrop-blur-md transition-all hover:border-[#E8984A]/80 hover:bg-[#1E1224]/90 hover:shadow-[0_0_20px_rgba(232,152,74,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8984A]"
            title="Strum all 6 strings or click to trigger the Vaaranam Aayiram acoustic reverie"
          >
            <span className="text-[12px] text-[#FFB84D] transition-transform">♪</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-sangam-cream/80 hover:text-sangam-gold">
              Strum Chord
            </span>
          </button>
        )}
      </div>
    </HeroScrollStage>
    </>
  );
}
