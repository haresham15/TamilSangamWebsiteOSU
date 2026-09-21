"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTinai } from "@/context/TinaiContext";
import { useAudio } from "@/context/AudioContext";
import { GlowingKolamField } from "@/components/3d/GlowingKolamField";
import { DynamicKolamHero } from "@/components/culture/DynamicKolamHero";
import { InteractiveEmblemMedallion } from "@/components/culture/InteractiveEmblemMedallion";
import { EVENTS } from "@/data/events";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Coffee, 
  Users,
  Sparkles,
  Music,
  Heart,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { meta } = useTinai();
  const { playClick } = useAudio();

  // Highlight next flagship event
  const nextEvent = EVENTS[0];

  return (
    <div className="relative w-full overflow-hidden bg-tamil-watermark-subtle">
      {/* 1. Subtle Ambient Background Kolam Lattice */}
      <GlowingKolamField />

      {/* 2. Hero Section: Official Emblem Medallion & 3D Mint Extrusion Typography */}
      <section className="relative min-h-[85vh] lg:min-h-screen flex flex-col justify-between pt-28 sm:pt-32 pb-14 px-4 sm:px-6 z-10">
        {/* Dynamically Drawn SVG Kolam Path Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <DynamicKolamHero />
        </div>

        {/* Foreground Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
          {/* Official Tamil Sangam Interactive 3D Medallion */}
          <div className="mb-6">
            <InteractiveEmblemMedallion size="lg" showAura={true} />
          </div>

          {/* Time & Tinai Landscape Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border-2 border-purple-200/90 text-[11px] font-mono tracking-widest text-[#4c2472] font-semibold uppercase mb-4 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55CCA2] animate-pulse" />
            <span>{locale === "ta" ? meta.timeLabelTa : meta.timeLabelEn}</span>
          </div>

          {/* Headline with Signature 3D Mint Extrusion Typography */}
          <div className="space-y-3 mb-5">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-logo-extrusion-dark">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU TAMIL SANGAM"}
            </h1>
            
            {/* Collegiate Spirit Motto Banner */}
            <div className="inline-block px-5 py-2 rounded-full bg-white/95 border-2 border-[#55CCA2]/70 shadow-sm mt-1">
              <p className="text-xs sm:text-base md:text-lg font-bold text-[#4c2472] tracking-wide font-display">
                Start the Aatam, Paatam, and Kondatam! · ஆட்டம் · பாட்டம் · கொண்டாட்டம்
              </p>
            </div>
          </div>

          {/* Core Mission Statement */}
          <p className="max-w-2xl text-sm sm:text-base text-purple-950/85 mb-8 leading-relaxed font-body font-medium">
            {locale === "ta"
              ? "சங்க காலத்து ஐந்திணைப் பண்பாட்டையும், புத்துணர்ச்சியூட்டும் நடனம், இசை மற்றும் கொண்டாட்டங்களையும் ஓஹியோவில் இணைக்கும் அரங்கம்."
              : "Bridging classical Sangam heritage with high-octane dance, authentic South Indian feasts, live concerts, and lifelong Buckeye camaraderie."}
          </p>

          {/* Primary Quick CTA Buttons with Official Logo 3D Drop Shadows */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/events/${nextEvent.slug}`}
              onClick={playClick}
              className="px-7 py-3.5 rounded-full btn-sangam text-sm flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#55CCA2]" />
              <span>{locale === "ta" ? "பொங்கல் நுழைவுச்சீட்டு" : "Get Pongal Tickets"}</span>
            </Link>

            <Link
              href="/join"
              onClick={playClick}
              className="px-7 py-3.5 rounded-full btn-sangam-mint text-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[#240e36]" />
              <span>{t("nav.join")}</span>
            </Link>

            <Link
              href="/board"
              onClick={playClick}
              className="px-7 py-3.5 rounded-full bg-white/95 border-2 border-purple-200 text-[#4c2472] font-bold text-sm hover:border-[#55CCA2] hover:bg-white active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#55CCA2]" />
              <span>{locale === "ta" ? "நிர்வாகக் குழு" : "Meet The Board"}</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 flex flex-col items-center text-center text-xs font-mono text-purple-800/80 pointer-events-none mt-6">
          <span className="animate-bounce mb-1 font-bold text-base">↓</span>
          <span>Explore Upcoming Events & Our Three Pillars</span>
        </div>
      </section>

      {/* 3. Next Flagship Festival Spotlight (Powerhouse Pongal) */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-1">
              Marutham (மருதம்) · Harvest & Celebration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] tracking-tight font-display">
              {locale === "ta" ? "அடுத்த முக்கிய நிகழ்வு" : "Next Flagship Festival"}
            </h2>
          </div>
          <Link
            href="/events"
            onClick={playClick}
            className="text-xs font-mono text-[#4c2472] hover:text-[#16835f] font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>{locale === "ta" ? "அனைத்து நிகழ்வுகள்" : "View Full Calendar"}</span>
            <span>→</span>
          </Link>
        </div>

        {/* Cinematic Event Card with High Contrast & Logo Mint Drop Shadow */}
        <div className="rounded-3xl bg-white border-2 border-purple-200/90 p-6 sm:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#55CCA2]/25 text-[#11694c] border border-[#55CCA2]/50">
                ● {locale === "ta" ? nextEvent.statusBadgeTa : nextEvent.statusBadgeEn}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-100 text-[#4c2472] font-semibold border border-purple-200">
                {nextEvent.tamilDate}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-700">
                {nextEvent.academicYear}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-[#250d38] font-display tracking-tight">
              {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
            </h3>

            <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed font-body">
              {locale === "ta" ? nextEvent.descriptionTa : nextEvent.descriptionEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-purple-900 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4c2472]" />
                <span>{nextEvent.date} · {nextEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4c2472]" />
                <span>{nextEvent.location}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={`/events/${nextEvent.slug}`}
                onClick={playClick}
                className="px-7 py-3 rounded-2xl btn-sangam text-xs font-bold flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-[#55CCA2]" />
                <span>{locale === "ta" ? "நுழைவுச்சீட்டு முன்பதிவு" : `Get Tickets (${nextEvent.price})`}</span>
              </Link>

              <Link
                href={`/events/${nextEvent.slug}`}
                onClick={playClick}
                className="px-5 py-3 rounded-2xl bg-purple-50/80 border-2 border-purple-200 text-[#4c2472] text-xs font-bold hover:bg-purple-100 hover:border-[#55CCA2] transition-colors"
              >
                <span>Full Event Details</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-purple-200/80 shadow-lg group">
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

      {/* 4. The Three Pillars of OSU Tamil Sangam */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-purple-200 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-semibold mb-2 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-[#55CCA2]" />
            <span>Our Foundation · முப்பெரும் தூண்கள்</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] tracking-tight font-display">
            {locale === "ta" ? "ஆட்டம் · பாட்டம் · கொண்டாட்டம்" : "The Three Pillars of Sangam"}
          </h2>
          <p className="text-xs sm:text-sm text-purple-950/80 mt-2 font-body leading-relaxed">
            {locale === "ta"
              ? "நடனம், இசை, மற்றும் கொண்டாட்டங்களின் வழியே தமிழ் கலாச்சாரத்தை ஓஹியோவில் உயிர்ப்புடன் வைத்திருக்கும் மூன்று தூண்கள்."
              : "Our club is anchored by three vibrant pillars that empower students to express their cultural heritage on campus."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Pillar 1: Aatam */}
          <div className="bg-white border-2 border-purple-100 hover:border-[#55CCA2] p-7 rounded-3xl block transition-all hover:shadow-[4px_4px_0px_#55CCA2,0_16px_32px_-8px_rgba(76,36,114,0.12)] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-4 border border-purple-200">
              💃
            </div>
            <span className="text-xs font-mono text-[#4c2472] font-bold tracking-widest uppercase">
              தூண் 1 · Pillar One
            </span>
            <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-2 font-display">
              {locale === "ta" ? "ஆட்டம் · Dance" : "Aatam · Dance & Motion"}
            </h3>
            <p className="text-xs sm:text-sm text-purple-950/75 leading-relaxed mb-6 font-body">
              {locale === "ta"
                ? "பாரம்பரிய பரதநாட்டியம் முதல் சினிமா குத்து மற்றும் ஃப்யூஷன் நடனங்கள் வரை மேடைகளை அதிரவைக்கும் நடனக் குழுக்கள்."
                : "From classical Bharatanatyam to explosive cinematic Kuthu and contemporary collegiate fusion, our dance teams electrify campus showcases."}
            </p>
            <Link
              href="/join"
              onClick={playClick}
              className="text-xs font-mono font-bold text-[#4c2472] hover:text-[#16835f] flex items-center gap-1.5 transition-colors"
            >
              <span>Join Dance Troupe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Paatam */}
          <div className="bg-white border-2 border-purple-100 hover:border-[#55CCA2] p-7 rounded-3xl block transition-all hover:shadow-[4px_4px_0px_#55CCA2,0_16px_32px_-8px_rgba(76,36,114,0.12)] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#55CCA2]/20 flex items-center justify-center text-2xl mb-4 border border-[#55CCA2]/40">
              🎵
            </div>
            <span className="text-xs font-mono text-[#11694c] font-bold tracking-widest uppercase">
              தூண் 2 · Pillar Two
            </span>
            <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-2 font-display">
              {locale === "ta" ? "பாட்டம் · Music" : "Paatam · Music & Melody"}
            </h3>
            <p className="text-xs sm:text-sm text-purple-950/75 leading-relaxed mb-6 font-body">
              {locale === "ta"
                ? "இளையராஜா மற்றும் ரஹ்மானின் இன்னிசைகள், நேரடி இசைக்குழுக்கள் மற்றும் அக்யூஸ்டிக் கல்லூரிப் பாடல்கள்."
                : "Live acoustic jam sessions, Carnatic instrumental medleys, Rahman & Ilaiyaraaja tributes, and vocalists uniting through rhythm."}
            </p>
            <Link
              href="/join"
              onClick={playClick}
              className="text-xs font-mono font-bold text-[#11694c] hover:text-[#4c2472] flex items-center gap-1.5 transition-colors"
            >
              <span>Join Music Group</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Kondatam */}
          <div className="bg-white border-2 border-purple-100 hover:border-[#55CCA2] p-7 rounded-3xl block transition-all hover:shadow-[4px_4px_0px_#55CCA2,0_16px_32px_-8px_rgba(76,36,114,0.12)] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-4 border border-amber-200">
              🎉
            </div>
            <span className="text-xs font-mono text-[#b45309] font-bold tracking-widest uppercase">
              தூண் 3 · Pillar Three
            </span>
            <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-2 font-display">
              {locale === "ta" ? "கொண்டாட்டம் · Fellowship" : "Kondatam · Celebration"}
            </h3>
            <p className="text-xs sm:text-sm text-purple-950/75 leading-relaxed mb-6 font-body">
              {locale === "ta"
                ? "வாழை இலை பொங்கல் விருந்து, தீபாவளி கொண்டாட்டங்கள், விளையாட்டுப் போட்டிகள் மற்றும் வாழ்நாள் நட்பு."
                : "Banana-leaf Pongal harvest feasts, Diwali galas, game nights, campus tailgates, and creating a home away from home in Columbus."}
            </p>
            <Link
              href="/join"
              onClick={playClick}
              className="text-xs font-mono font-bold text-[#b45309] hover:text-[#4c2472] flex items-center gap-1.5 transition-colors"
            >
              <span>Join The Family</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Signature Moment: Filter Coffee Intermission Card */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#250d38] border-2 border-[#55CCA2]/50 shadow-2xl relative overflow-hidden bg-tamil-watermark-regal text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-[#55CCA2]/20 text-[#55CCA2] border border-[#55CCA2]/40 mb-4 uppercase font-bold">
            <Coffee className="w-3.5 h-3.5" />
            <span>{t("interval.title")}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
          </h3>

          <p className="text-xs sm:text-sm text-purple-200/90 max-w-md mx-auto mb-6 leading-relaxed font-body">
            {t("interval.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/join"
              onClick={playClick}
              className="px-6 py-3 rounded-full btn-sangam-mint text-xs font-bold"
            >
              Join the GroupMe Community →
            </Link>
            <Link
              href="/links"
              onClick={playClick}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-purple-300/30 text-white text-xs font-semibold transition-colors"
            >
              Open Linktree Bio Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
