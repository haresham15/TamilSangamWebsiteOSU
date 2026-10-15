"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { HeroScrollStage } from "@/components/canvas/HeroScrollStage";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";

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

const PhotoTunnel = dynamic(() => import("./PhotoTunnel"), {
  ssr: false,
  loading: () => <StaticGalleryHero />
});

export function GalleryHero() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const progress = useRef(0);
  const title = useRef<HTMLDivElement>(null);
  const isStatic = mounted ? (isLiteMode || tier === "C" || Boolean(reducedMotion)) : false;

  return (
    <HeroScrollStage id="gallery-hero" progressRef={progress} static={isStatic} tone="indigo">
      {isStatic ? (
        <StaticGalleryHero />
      ) : (
        <PhotoTunnel photos={PHOTOS} progressRef={progress} titleRef={title} />
      )}
      <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center text-sangam-cream">
        <div key={String(isStatic)} ref={title} className="w-full max-w-3xl py-12" style={{ background: "radial-gradient(ellipse, var(--color-hero-indigo) 0%, transparent 72%)" }}>
          <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.25em] text-sangam-gold sm:text-xs">Vaaranam Aayiram · Memory Archive</p>
          <h1 className="font-display text-[clamp(3.75rem,11vw,10rem)] leading-[1.05] tracking-tight">
            {locale === "ta" ? <span lang="ta" className="font-tamil leading-relaxed tracking-normal">நினைவுகள்</span> : "The Canvas"}
          </h1>
          {locale !== "ta" && <p lang="ta" className="mt-4 font-tamil text-2xl leading-relaxed tracking-normal text-sangam-lilac sm:text-4xl">நினைவுகள்</p>}
          <p className="mx-auto mt-6 max-w-sm font-body text-sm leading-relaxed text-sangam-cream/85 sm:text-base">Campus afternoons. Shared tables. Stories we keep.</p>
        </div>
        <a
          href="#gallery-vault-content"
          className="pointer-events-auto absolute bottom-10 inline-flex min-h-12 items-center gap-4 border-b border-sangam-cream/40 px-4 font-mono text-xs uppercase tracking-widest text-sangam-cream transition-colors hover:text-sangam-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sangam-mint"
        >
          Explore the archive <span aria-hidden="true">↓</span>
        </a>
      </div>
    </HeroScrollStage>
  );
}
