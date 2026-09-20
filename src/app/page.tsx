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

      {/* 2. Hero Section with 3D Gopuram Ascent */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-28 sm:pt-32 pb-12 px-4 sm:px-6 z-10">
        {/* Background 3D Temple Tower (Procedural Three.js) */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-75">
          <GopuramAscentCanvas />
        </div>

        {/* Foreground Content (Real HTML for SEO & Instant First Paint) */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center pointer-events-none">
          {/* Top Pill Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-[var(--border-strong)] text-[11px] font-mono tracking-widest text-[var(--accent-tint)] uppercase mb-6 pointer-events-auto shadow-lg">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: meta.accentColor }} />
            <span>{locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn}</span>
          </div>

          {/* Classical Tamil Calligraphy Heading & Main English Title */}
          <div className="space-y-2 mb-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg font-serif">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-[var(--accent-tint)] tracking-wide">
              {t("brand.tagline")}
            </p>
          </div>

          {/* Core Mission Statement */}
          <p className="max-w-2xl text-sm sm:text-base text-slate-200 mb-8 leading-relaxed drop-shadow-md">
            {locale === "ta"
              ? "சங்க காலத்து ஐந்திணைப் பண்பாட்டையும், புத்துணர்ச்சியூட்டும் நடனம், இசை மற்றும் கொண்டாட்டங்களையும் ஓஹியோவில் இணைக்கும் அரங்கம்."
              : "Bridging classical Sangam heritage with high-octane dance, authentic South Indian cuisine, live concerts, and lifelong Buckeye camaraderie."}
          </p>

          {/* Primary Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <Link
              href={`/events/${nextEvent.slug}`}
              onClick={playClick}
              className="px-6 py-3.5 rounded-full bg-[var(--accent-tint)] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent-glow)] flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{locale === "ta" ? "பொங்கல் நுழைவுச்சீட்டு" : "Get Pongal Tickets"}</span>
            </Link>

            <Link
              href="/join"
              onClick={playClick}
              className="px-6 py-3.5 rounded-full glass-panel border border-white/20 text-white font-semibold text-sm hover:border-[var(--accent-tint)] hover:bg-white/10 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[var(--accent-tint)]" />
              <span>{t("nav.join")}</span>
            </Link>

            <Link
              href="/culture-lab"
              onClick={playClick}
              className="px-6 py-3.5 rounded-full glass-panel border border-purple-400/30 text-purple-200 font-semibold text-sm hover:border-purple-400 hover:bg-white/10 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{t("nav.cultureLab")}</span>
            </Link>
          </div>

          {/* Signature Moment 3: Interactive Yali Particles Swarm */}
          <div className="w-full max-w-lg mt-6 pointer-events-auto">
            <YaliParticles />
          </div>
        </div>

        {/* Scroll Indicator at bottom */}
        <div className="relative z-10 flex flex-col items-center text-center text-xs font-mono text-slate-400 pointer-events-none">
          <span className="animate-bounce mb-1">↓</span>
          <span>Ascend the Gopuram (கீழே செல்லுங்கள்)</span>
        </div>
      </section>

      {/* 3. Next Flagship Event Spotlight ("Now Showing" Poster Frame) */}
      <section className="relative py-20 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-1">
              Marutham (மருதம்) · Harvest & Celebration
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
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
                ● Selling Fast (382 / 450 Tickets)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                {nextEvent.tamilDate}
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {locale === "ta" ? nextEvent.descriptionTa : nextEvent.descriptionEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300 font-mono">
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
                className="px-6 py-3 rounded-2xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-95 transition-all shadow-lg flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Reserve Ticket ({nextEvent.price})</span>
              </Link>
              <Link
                href={`/events/${nextEvent.slug}#details`}
                onClick={playClick}
                className="px-5 py-3 rounded-2xl glass-panel text-white text-xs font-medium hover:bg-white/10 transition-all"
              >
                Event Schedule & Menu →
              </Link>
            </div>
          </div>

          {/* Poster Imagery */}
          <div className="lg:col-span-5 relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
            <Image
              src={nextEvent.posterImage}
              alt={nextEvent.titleEn}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
                The Ohio State University · Archie Griffin Ballroom
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 5 Landscapes of Sangam (Aintinai Grid) */}
      <section className="relative py-20 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
            The Architectural Map · ஐந்திணை
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
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
            <span className="text-xs font-mono text-[#f2b705] tracking-widest uppercase">மருதம் · Marutham</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Events & Harvest</h3>
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
            <span className="text-xs font-mono text-[#0b7a75] tracking-widest uppercase">நெய்தல் · Neithal</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Memories & Gallery</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Seashore and coral dusk. Photo albums, glyph-mosaic loaders, and our natural language Memory Vault.
            </p>
            <span className="text-xs font-mono text-[#0b7a75] flex items-center gap-1">
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
            <span className="text-xs font-mono text-[#6b8e4e] tracking-widest uppercase">முல்லை · Mullai</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Board & Alumni</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Pasture and evening jasmine. Holographic officer trading cards, Liquid Roster, and magazine alumni issues.
            </p>
            <span className="text-xs font-mono text-[#6b8e4e] flex items-center gap-1">
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
            <span className="text-xs font-mono text-[#b5573a] tracking-widest uppercase">பாலை · Paalai</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Initiatives & Journeys</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Arid roads and midday sun. The three pillars: Aatam (Dance), Paatam (Music), and Kondatam (Celebration).
            </p>
            <span className="text-xs font-mono text-[#b5573a] flex items-center gap-1">
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
            <span className="text-xs font-mono text-[#8b5cf6] tracking-widest uppercase">குறிஞ்சி · Kurinji</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Community & Join</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Mountain peaks under midnight stars. GroupMe gateway, mailing lists, and open performer audition signups.
            </p>
            <span className="text-xs font-mono text-[#8b5cf6] flex items-center gap-1">
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
            <h3 className="text-xl font-bold text-white mt-1 mb-2">Interactive Toys</h3>
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

      {/* 5. Signature Moment: INTERVAL Card (Nod to Tamil Cinema Intermission) */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#19152b] via-[#090b14] to-[#1f1214] border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Film Grain & Red Carpet Accent */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-red-600/30 text-red-400 border border-red-500/40 mb-4 uppercase">
            <Coffee className="w-3.5 h-3.5" />
            <span>{t("interval.title")}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
            {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
            {t("interval.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/join"
              onClick={playClick}
              className="px-6 py-3 rounded-full bg-[var(--accent-tint)] text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Join the GroupMe Community →
            </Link>
            <Link
              href="/links"
              onClick={playClick}
              className="px-6 py-3 rounded-full glass-panel text-white text-xs font-semibold hover:bg-white/10 transition-all"
            >
              Open Linktree Bio Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
