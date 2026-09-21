"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTinai } from "@/context/TinaiContext";
import { useAudio } from "@/context/AudioContext";
import { GopuramAscentCanvas } from "@/components/3d/GopuramAscentCanvas";
import { YaliParticles } from "@/components/3d/YaliParticles";
import { GlowingKolamField } from "@/components/3d/GlowingKolamField";
import { DynamicKolamHero } from "@/components/culture/DynamicKolamHero";
import { KollywoodVectorHub } from "@/components/culture/KollywoodVectorHub";
import { EVENTS } from "@/data/events";
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Ticket, 
  Coffee, 
  Users 
} from "lucide-react";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { meta } = useTinai();
  const { playClick } = useAudio();

  // Highlight next flagship event
  const nextEvent = EVENTS[0];

  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. Interactive Background Glowing Kolam Lattice */}
      <GlowingKolamField />

      {/* 2. Expression Layer: Hero Section with Dynamic SVG Kolam & 3D Gopuram Ascent */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-28 sm:pt-32 pb-12 px-4 sm:px-6 z-10">
        {/* Background 3D Temple Tower (Procedural Three.js) */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-70">
          <GopuramAscentCanvas />
        </div>

        {/* Dynamically Drawn SVG Kolam Path Animation (Expression Layer) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
          <DynamicKolamHero />
        </div>

        {/* Foreground Content (Real Semantic HTML for SEO & Fast First Paint) */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center pointer-events-none">
          {/* Official Tamil Sangam Emblem */}
          <div className="pointer-events-auto mb-4 hover:scale-105 transition-transform duration-300">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-[#55CCA2] via-[#e9d5ff] to-[#4c2472] shadow-xl">
              <Image
                src="/emblem.svg"
                alt="Ohio State Tamil Sangam Official Circular Logo"
                width={112}
                height={112}
                priority
                className="rounded-full object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Top Pill Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border-2 border-purple-200 text-[11px] font-mono tracking-widest text-[#4c2472] font-semibold uppercase mb-4 pointer-events-auto shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55CCA2] animate-pulse" />
            <span>{locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn}</span>
          </div>

          {/* Classical Tamil Heading & Main English Title */}
          <div className="space-y-2 mb-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#250d38] font-display">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
            </h1>
            <div className="inline-block px-5 py-2 rounded-full bg-purple-100/90 border border-purple-300/80 shadow-sm mt-2">
              <p className="text-sm sm:text-lg md:text-xl font-bold text-[#4c2472] tracking-wide font-display">
                Start the Aatam, Paatam, and Kondatam! · ஆட்டம் · பாட்டம் · கொண்டாட்டம்
              </p>
            </div>
          </div>

          {/* Core Mission Statement */}
          <p className="max-w-2xl text-sm sm:text-base text-purple-950/85 mb-8 leading-relaxed font-body">
            {locale === "ta"
              ? "சங்க காலத்து ஐந்திணைப் பண்பாட்டையும், புத்துணர்ச்சியூட்டும் நடனம், இசை மற்றும் கொண்டாட்டங்களையும் ஓஹியோவில் இணைக்கும் அரங்கம்."
              : "Bridging classical Sangam heritage with high-octane dance, authentic South Indian cuisine, live concerts, and lifelong Buckeye camaraderie."}
          </p>

          {/* Primary Quick CTA Buttons (Safety Layer: Standard Predictable Patterns) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <Link
              href={`/events/${nextEvent.slug}`}
              onClick={playClick}
              className="px-6 py-3.5 rounded-full btn-sangam text-sm flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#55CCA2]" />
              <span>{locale === "ta" ? "பொங்கல் நுழைவுச்சீட்டு" : "Get Pongal Tickets"}</span>
            </Link>

            <Link
              href="/join"
              onClick={playClick}
              className="px-6 py-3.5 rounded-full btn-sangam-mint text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[#250d38]" />
              <span>{t("nav.join")}</span>
            </Link>

            <Link
              href="/culture-lab"
              onClick={playClick}
              className="px-6 py-3.5 rounded-full bg-white/95 border-2 border-purple-200 text-[#4c2472] font-bold text-sm hover:border-[#55CCA2] hover:bg-white active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#55CCA2]" />
              <span>{t("nav.cultureLab")}</span>
            </Link>
          </div>

          {/* Interactive Yali Particles Swarm */}
          <div className="w-full max-w-lg mt-6 pointer-events-auto">
            <YaliParticles />
          </div>
        </div>

        {/* Scroll Indicator at bottom */}
        <div className="relative z-10 flex flex-col items-center text-center text-xs font-mono text-purple-700/70 pointer-events-none">
          <span className="animate-bounce mb-1">↓</span>
          <span>Ascend the Gopuram (கீழே செல்லுங்கள்)</span>
        </div>
      </section>

      {/* 3. Next Flagship Event Spotlight */}
      <section className="relative py-20 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-1">
              Marutham (மருதம்) · Harvest & Celebration
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-display">
              {locale === "ta" ? "அடுத்த முக்கிய நிகழ்வு" : "Next Flagship Festival"}
            </h2>
          </div>
          <Link
            href="/events"
            onClick={playClick}
            className="text-xs font-mono text-[var(--accent-tint)] hover:underline flex items-center gap-1"
          >
            <span>{locale === "ta" ? "அனைத்து நிகழ்வுகள்" : "View Full Calendar"}</span>
            <span>→</span>
          </Link>
        </div>

        {/* Cinematic Event Card */}
        <div className="rounded-3xl glass-panel-elevated border border-[var(--border-strong)] p-6 sm:p-10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● {locale === "ta" ? nextEvent.statusBadgeTa : nextEvent.statusBadgeEn}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                {nextEvent.tamilDate}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-slate-400">
                {nextEvent.academicYear}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight">
              {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {locale === "ta" ? nextEvent.descriptionTa : nextEvent.descriptionEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-tint)]" />
                <span>{nextEvent.date} · {nextEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-tint)]" />
                <span>{nextEvent.location}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={`/events/${nextEvent.slug}`}
                onClick={playClick}
                className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-opacity shadow-lg flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>{locale === "ta" ? "நுழைவுச்சீட்டு முன்பதிவு" : `Get Tickets (${nextEvent.price})`}</span>
              </Link>

              <Link
                href={`/events/${nextEvent.slug}`}
                onClick={playClick}
                className="px-5 py-3 rounded-2xl glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <span>Full Event Details</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
            <Image
              src={nextEvent.posterImage}
              alt={nextEvent.titleEn}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      {/* 4. Phase 5 Cultural Engine: Kollywood Vector Embedding Search Hub */}
      <section className="relative py-12 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <KollywoodVectorHub />
      </section>

      {/* 5. The Five Classical Landscapes Grid */}
      <section className="relative py-20 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
            The Architectural Map · ஐந்திணை
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-display">
            {locale === "ta" ? "ஐந்திணை நிலங்களின் சங்கமம்" : "The Five Landscapes of Aintinai"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            {locale === "ta"
              ? "சங்கத் தமிழ்க் கவிதைகளில் உலகம் ஐந்து நிலங்களாக வகுக்கப்பட்டுள்ளது. ஒவ்வொன்றும் சங்கத்தின் ஒரு பகுதியைக் குறிக்கிறது."
              : "In classical Sangam literature, the world is mapped into five distinct landscapes, moods, and times of day. Our website is that living map."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* 1. Marutham */}
          <Link
            href="/events"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block"
          >
            <span className="text-xs font-mono text-[var(--color-temple-bronze)] tracking-widest uppercase">மருதம் · Marutham</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Events & Harvest</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Fertile farmland and dawn light. Home to our Pongal celebrations, harvest feasts, and semester festivals.
            </p>
            <span className="text-xs font-mono text-[var(--accent-tint)] flex items-center gap-1">
              <span>View Events</span>
              <span>→</span>
            </span>
          </Link>

          {/* 2. Neithal */}
          <Link
            href="/gallery"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block"
          >
            <span className="text-xs font-mono text-[var(--color-mayil-teal)] tracking-widest uppercase">நெய்தல் · Neithal</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Memories & Gallery</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Seashore and coral dusk. Photo albums, glyph-mosaic loaders, and our natural language Memory Vault.
            </p>
            <span className="text-xs font-mono text-[var(--color-mayil-teal)] flex items-center gap-1">
              <span>Explore Vault</span>
              <span>→</span>
            </span>
          </Link>

          {/* 3. Mullai */}
          <Link
            href="/board"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block"
          >
            <span className="text-xs font-mono text-[var(--color-olai-green)] tracking-widest uppercase">முல்லை · Mullai</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Board & Leadership</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Pasture and evening jasmine. Holographic officer trading cards, Liquid Roster, and student committees.
            </p>
            <span className="text-xs font-mono text-[var(--color-olai-green)] flex items-center gap-1">
              <span>Meet Officers</span>
              <span>→</span>
            </span>
          </Link>

          {/* 4. Paalai */}
          <Link
            href="/initiatives"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block"
          >
            <span className="text-xs font-mono text-[var(--color-terracotta)] tracking-widest uppercase">பாலை · Paalai</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Initiatives & Journeys</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Arid roads and midday sun. The three pillars: Aatam (Dance), Paatam (Music), and Kondatam (Celebration).
            </p>
            <span className="text-xs font-mono text-[var(--color-terracotta)] flex items-center gap-1">
              <span>Our Pillars</span>
              <span>→</span>
            </span>
          </Link>

          {/* 5. Kurinji */}
          <Link
            href="/join"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block"
          >
            <span className="text-xs font-mono text-[var(--accent-tint)] tracking-widest uppercase">குறிஞ்சி · Kurinji</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Community & Join</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Mountain peaks under midnight stars. GroupMe gateway, mailing lists, and open performer audition signups.
            </p>
            <span className="text-xs font-mono text-[var(--accent-tint)] flex items-center gap-1">
              <span>Join Family</span>
              <span>→</span>
            </span>
          </Link>

          {/* Culture Lab Special Feature */}
          <Link
            href="/culture-lab"
            onClick={playClick}
            className="glass-glow-card p-6 rounded-3xl block border-[var(--accent-tint)]/40 bg-gradient-to-br from-amber-500/10 to-transparent"
          >
            <span className="text-xs font-mono text-[var(--accent-tint)] tracking-widest uppercase">அரங்கம் · Culture Lab</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2 font-display">Interactive Toys</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Kolam Studio, Solkattu rhythm sequencer, 247-glyph Alphabet matrix, and Pongal boil-over game.
            </p>
            <span className="text-xs font-mono text-[var(--accent-tint)] flex items-center gap-1">
              <span>Play Now</span>
              <span>→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* 6. Signature Moment: INTERVAL Card */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[var(--surface-sunken)] via-[var(--surface-raised)] to-[var(--surface-sunken)] border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-[var(--color-kumkumam-crimson)]/20 text-[var(--color-sandhanam-silk)] border border-[var(--color-kumkumam-crimson)]/40 mb-4 uppercase">
            <Coffee className="w-3.5 h-3.5" />
            <span>{t("interval.title")}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
            {t("interval.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/join"
              onClick={playClick}
              className="px-6 py-3 rounded-full bg-[var(--accent-tint)] text-black font-bold text-xs hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              Join the GroupMe Community →
            </Link>
            <Link
              href="/links"
              onClick={playClick}
              className="px-6 py-3 rounded-full glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              Open Linktree Bio Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
