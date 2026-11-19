"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { HeroScrollStage, useHeroStageVisibility } from "@/components/canvas/HeroScrollStage";
import { registerSystem } from "@/engine/masterTick";
import { PronounceableQuote } from "@/components/ui/PronounceableQuote";

// The 3D ascent is code-split: static mode (Tier C, Lite, reduced motion) never loads it.
const GopuramCanvas = dynamic(() => import("./GopuramCanvas"), { ssr: false, loading: () => null });

interface TierItem {
  id: string;
  talaIndex: number;
  subtitleEn: string;
  subtitleTa: string;
  titleEn: string;
  titleTa: string;
  kuralQuote?: string;
  descEn: string;
  descTa: string;
}

const TIERS: TierItem[] = [
  {
    id: "tier-1",
    talaIndex: 0,
    subtitleEn: "Foundational Sangam Philosophy",
    subtitleTa: "சங்கத்தின் மூலக்கோட்பாடு",
    titleEn: "To Us All Towns Are Home, Everyone Our Kin",
    titleTa: "யாதும் ஊரே யாவரும் கேளீர்",
    kuralQuote: "புறநானூறு 192 (கணியன் பூங்குன்றனார்)",
    descEn:
      "A classical Tamil principle written over two millennia ago that defines our ethos: whoever you are, wherever you come from, you belong here.",
    descTa:
      "இரண்டாயிரம் ஆண்டுகளுக்கு முன்பே முழங்கிய சமத்துவக் குரல் — ஓஹியோ வளாகத்தில் அனைவரையும் அரவணைக்கும் பண்பாட்டுப் பார்வை.",
  },
  {
    id: "tier-2",
    talaIndex: 1,
    subtitleEn: "Pillar of Belonging",
    subtitleTa: "நட்பின் அடையாளம்",
    titleEn: "A Campus Family Open to All Languages",
    titleTa: "மொழி பேதமின்றி அனைவருக்குமான இல்லம்",
    descEn:
      "You don't need to speak Tamil to be part of Tamil Sangam. We celebrate food, friendship, cultural exchange, and Buckeye solidarity.",
    descTa:
      "தமிழ் பேசத் தெரியாவிட்டாலும் பரவாயில்லை — நட்பு, சுவையான உணவு, மற்றும் கலாச்சாரப் பகிர்வில் அனைவரும் இணையலாம்.",
  },
  {
    id: "tier-3",
    talaIndex: 2,
    subtitleEn: "The Rhythm of Joy",
    subtitleTa: "உற்சாகத்தின் நடனம்",
    titleEn: "Aatam, Paatam, Kondatam",
    titleTa: "ஆட்டம் · பாட்டம் · கொண்டாட்டம்",
    descEn:
      "From electric cinematic Kuthu rehearsals to soulful acoustic jams and South Oval picnics, joy is our primary language.",
    descTa:
      "மேடை அதிரும் நடனங்கள், மெல்லிசைப் பாடல்கள், மற்றும் புல்வெளி பிக்னிக்குகளுடன் கூடிய உற்சாக மாலைகள்.",
  },
  {
    id: "tier-4",
    talaIndex: 3,
    subtitleEn: "Collegiate Fellowship",
    subtitleTa: "தோழமை & ஆதரவு",
    titleEn: "Lifelong Buckeye Community in Columbus",
    titleTa: "வளாகத்தில் வாழ்நாள் நட்பு",
    descEn:
      "Mentorship, career guidance, shared rides, home-cooked food nights, and memories that outlast graduation.",
    descTa:
      "வழிகாட்டுதல், உணவு பகிர்வு, கல்வி உதவி, மற்றும் வாழ்நாள் முழுவதும் தொடரும் கல்லூரி நட்பு.",
  },
  {
    id: "tier-5",
    talaIndex: 4,
    subtitleEn: "Living Heritage",
    subtitleTa: "செம்மொழிச் செழுமை",
    titleEn: "Rooted in 2,500 Years of Classical Literature",
    titleTa: "செம்மொழி மரபுடன் நவீன பார்வை",
    descEn:
      "Honoring one of the world's longest-surviving classical languages through contemporary collegiate celebration.",
    descTa:
      "தொன்மைமிகு தமிழ் மொழியின் மாண்பைப் போற்றி, நவீன மாணவர் சமூகத்தில் அதனை உயிர்ப்புடன் நிலைநிறுத்துகிறோம்.",
  },
];

const STAGE_RANGES = [
  { start: 0.00, end: 0.16 },
  { start: 0.16, end: 0.32 },
  { start: 0.32, end: 0.48 },
  { start: 0.48, end: 0.64 },
  { start: 0.64, end: 0.80 },
];

const COPY_GAP = 0.006;
const COPY_FADE = 0.016;

/**
 * Chapter copy cross-fade: the outgoing chapter is fully gone COPY_GAP before the boundary
 * and the incoming one starts COPY_GAP after it, so two chapters never share the screen.
 */
export function chapterCopyState(p: number, index: number) {
  const range = STAGE_RANGES[index];
  if (!range || p < range.start || p > range.end) return { opacity: 0, y: p < (range?.start ?? 0) ? 16 : -16 };
  const enter = index === 0 ? 1 : Math.min(1, Math.max(0, (p - range.start - COPY_GAP) / COPY_FADE));
  const exit = Math.min(1, Math.max(0, (range.end - COPY_GAP - p) / COPY_FADE));
  const opacity = Math.min(enter, exit);
  const y = enter < 1 ? 16 * (1 - enter) : exit < 1 ? -16 * (1 - exit) : 0;
  return { opacity, y };
}

// Seamless Floating Titles for Each Passing Bronze Kolam Ring
function RingModalCard({
  tier,
  index,
  totalTiers: _totalTiers,
  scrollProgressRef,
  locale,
}: {
  tier: TierItem;
  index: number;
  totalTiers?: number;
  scrollProgressRef: React.RefObject<number>;
  locale: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Write styles only when they change: per-frame writes dirty layout, and the View's
    // per-frame getBoundingClientRect then forces a full-page relayout (mobile CPU).
    let lastOpacity = -1;
    let lastY = Number.NaN;
    return registerSystem({
      order: 51,
      step: () => {
        const element = cardRef.current;
        if (!element) return;
        const { opacity, y } = chapterCopyState(scrollProgressRef.current ?? 0, index);
        const o = Math.round(opacity * 200) / 200;
        const yy = Math.round(y * 2) / 2;
        if (o === lastOpacity && yy === lastY) return;
        if (o !== lastOpacity) {
          element.style.opacity = String(o);
          element.style.visibility = o > 0 ? "visible" : "hidden";
        }
        if (yy !== lastY) element.style.transform = `translateY(${yy}px)`;
        lastOpacity = o;
        lastY = yy;
      },
    });
  }, [index, scrollProgressRef]);

  // The page owns the h1 (sr-only); each tala title is a section heading.
  const Heading = "h2";

  return (
    <div
      ref={cardRef}
      className="absolute inset-y-0 left-0 z-20 flex w-full flex-col justify-end pb-28 px-6 sm:px-12 lg:justify-center lg:pb-0 lg:px-20 lg:w-7/12 xl:w-6/12 pointer-events-none"
      style={{
        opacity: index === 0 ? 1 : 0,
        visibility: index === 0 ? "visible" : "hidden",
        transform: "translateY(0px)",
      }}
    >
      {/* Floating Organic Titles: Seamlessly Integrated into the 3D Scene */}
      <div className="max-w-xl text-left select-none space-y-3 pointer-events-auto">
        {/* Understated Category Subtitle */}
        <span className="font-mono text-xs uppercase tracking-widest text-sangam-mint/80 block drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          {locale === "ta" ? tier.subtitleTa : tier.subtitleEn}
        </span>

        {/* Primary Title */}
        <Heading
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-3xl sm:text-4xl lg:text-5xl text-sangam-cream font-normal drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] ${
            locale === "ta" ? "font-tamil leading-relaxed tracking-normal" : "font-serif leading-[1.12] tracking-tight"
          }`}
        >
          {locale === "ta" ? tier.titleTa : tier.titleEn}
        </Heading>

        {/* Tamil Calligraphic Inscription (Click to Pronounce) */}
        {locale !== "ta" && (
          <PronounceableQuote
            tamilText={tier.titleTa}
            label={`Chapter ${index + 1}: ${tier.titleTa}. Click to hear pronunciation.`}
            tone="gold"
            badgePosition="beside"
            className="inline-block"
          >
            <p
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="text-lg sm:text-2xl font-medium text-sangam-mint font-tamil leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
            >
              {tier.titleTa}
            </p>
          </PronounceableQuote>
        )}

        {/* Narrative Description */}
        <p
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-sm sm:text-base text-sangam-lilac leading-relaxed font-sans max-w-lg pt-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] ${
            locale === "ta" ? "font-tamil" : ""
          }`}
        >
          {locale === "ta" ? tier.descTa : tier.descEn}
        </p>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => {};

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { mode: liveMode, qualityLevel: liveLevel } = useRenderMode();
  // Quality only ever steps down within a mount. The governor can flip A <-> B under load;
  // following it both ways rebuilt materials and geometry on every flip (shader compiles that
  // caused the next flip), which pinned throttled phones at ~20 ms of script per frame.
  const [latched, setLatched] = useState<{ mode: "A" | "B"; qualityLevel: number } | null>(null);
  if (liveMode !== "static") {
    const nextMode = latched?.mode === "B" || liveMode === "B" ? "B" : "A";
    const nextLevel = Math.max(latched?.qualityLevel ?? 0, liveLevel);
    if (!latched || latched.mode !== nextMode || latched.qualityLevel !== nextLevel) {
      setLatched({ mode: nextMode, qualityLevel: nextLevel });
    }
  }
  const mode = liveMode === "static" ? "static" : (latched?.mode ?? liveMode);
  const qualityLevel = latched?.qualityLevel ?? liveLevel;
  const isStatic = mode === "static";
  const scrollProgressRef = useRef(0);

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 1024,
    () => false
  );

  return (
    <HeroScrollStage
      id="gopuram-hero-wrapper"
      runway={360}
      progressRef={scrollProgressRef}
      static={isStatic}
      className="text-sangam-cream"
    >
      {mounted && !isStatic ? (
        <GopuramScene
          scrollProgressRef={scrollProgressRef}
          isMobile={isMobile}
          locale={locale}
          mode={mode}
          qualityLevel={qualityLevel}
        />
      ) : (
        <StaticSpread locale={locale} />
      )}
    </HeroScrollStage>
  );
}

function GopuramScene({
  scrollProgressRef,
  isMobile,
  locale,
  mode,
  qualityLevel,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  locale: string;
  mode: "A" | "B";
  qualityLevel: number;
}) {
  const visible = useHeroStageVisibility();

  return (
    <>
      <GopuramCanvas
        scrollProgressRef={scrollProgressRef}
        isMobile={isMobile}
        visible={visible}
        mode={mode}
        qualityLevel={qualityLevel}
      />

      {/* Reading scrim: copy sits over the left pier on desktop and the terrace on mobile. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-sangam-purple-dark/85 via-sangam-purple-dark/35 to-transparent lg:bg-gradient-to-r lg:from-sangam-purple-dark/90 lg:via-sangam-purple-dark/60 lg:via-40% lg:to-transparent lg:to-70%"
      />

      {/* 5 Sacred Ring Floating Titles */}
      {TIERS.map((tierItem, index) => (
        <RingModalCard
          key={tierItem.id}
          tier={tierItem}
          index={index}
          totalTiers={TIERS.length}
          scrollProgressRef={scrollProgressRef}
          locale={locale}
        />
      ))}
    </>
  );
}

/**
 * Static / Lite / reduced-motion hero: all five talas as one typographic spread that fits a
 * desktop viewport (the opening verse large, the four pillars in a ruled two-by-two grid).
 */
function StaticSpread({ locale }: { locale: string }) {
  const ta = locale === "ta";
  const lang = ta ? "ta" : "en";
  const label = (idx: number, item: TierItem) => (
    <span
      lang={lang}
      className={`block text-xs text-sangam-mint ${ta ? "font-tamil leading-relaxed" : "font-mono uppercase tracking-widest"}`}
    >
      {`0${idx + 1} · ${ta ? item.subtitleTa : item.subtitleEn}`}
    </span>
  );
  const [first, ...rest] = TIERS;
  return (
    <div className="relative z-10 mx-auto grid min-h-dvh max-w-6xl content-center gap-10 px-6 pb-10 pt-28 sm:px-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:pb-8 lg:pt-24">
      <div className="space-y-4 self-center">
        {label(0, first)}
        <h2 lang={lang} className={`text-3xl text-sangam-cream sm:text-5xl ${ta ? "font-tamil leading-relaxed" : "font-display leading-tight"}`}>
          {ta ? first.titleTa : first.titleEn}
        </h2>
        {!ta && <p lang="ta" className="font-tamil text-xl leading-relaxed text-sangam-mint sm:text-2xl">{first.titleTa}</p>}
        <p lang={lang} className={`max-w-md text-base leading-relaxed text-sangam-lilac ${ta ? "font-tamil" : ""}`}>{ta ? first.descTa : first.descEn}</p>
        {first.kuralQuote && <p lang="ta" className="font-tamil text-sm leading-relaxed text-sangam-lilac/80">{first.kuralQuote}</p>}
      </div>
      <ol className="grid gap-x-8 gap-y-6 self-center sm:grid-cols-2">
        {rest.map((item, i) => (
          <li key={item.id} className="space-y-1.5 border-t border-sangam-lilac/20 pt-4">
            {label(i + 1, item)}
            <h3 lang={lang} className={`text-lg text-sangam-cream sm:text-xl ${ta ? "font-tamil leading-relaxed" : "font-display leading-snug"}`}>
              {ta ? item.titleTa : item.titleEn}
            </h3>
            {!ta && <p lang="ta" className="font-tamil text-base leading-relaxed text-sangam-mint">{item.titleTa}</p>}
            <p lang={lang} className={`text-sm leading-relaxed text-sangam-lilac ${ta ? "font-tamil" : ""}`}>{ta ? item.descTa : item.descEn}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
