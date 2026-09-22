"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { GlowingKolamField } from "@/components/3d/GlowingKolamField";
import { DynamicKolamHero } from "@/components/culture/DynamicKolamHero";
import { InteractiveEmblemMedallion } from "@/components/culture/InteractiveEmblemMedallion";
import { WovenBorderMarquee } from "@/components/ui/WovenBorderMarquee";
import {
  AatamDanceGlyph,
  PaatamMusicGlyph,
  KondatamFestGlyph,
  FilterKaapiGlyph,
} from "@/components/ui/KolamIcons";
import { EVENTS } from "@/data/events";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { playClick } = useAudio();

  // Highlight next flagship event
  const nextEvent = EVENTS[0];
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fffdfa] font-body text-left">
      {/* 1. Subtle Ambient Background Kolam Lattice */}
      <GlowingKolamField />

      {/* 2. Hero Section: Asymmetric Edge-to-Edge Emblem Engine */}
      <section className="relative min-h-[88vh] lg:min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-8 px-4 sm:px-8 z-10">
        {/* Dynamically Drawn SVG Kolam Path Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
          <DynamicKolamHero />
        </div>

        {/* Foreground Content: Asymmetric Layout */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Typography & Intent */}
            <div className="lg:col-span-8 space-y-6">
              {/* Collegiate Affiliation Badge: Inscription Block */}
              <div className="box-badge shadow-[2px_2px_0px_#4c2472]">
                <span className="w-2 h-2 bg-[#55CCA2] animate-pulse" />
                <span>The Ohio State University · Student Organization</span>
              </div>

              {/* Massive Full-Width Wordmark with Signature Mint 3D Extrusion */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight font-display text-logo-extrusion-dark leading-[0.98]">
                  {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "TAMIL SANGAM"}
                </h1>
                <p className="text-lg sm:text-2xl font-bold text-[#4c2472] font-display pt-1">
                  Start the Aatam, Paatam, and Kondatam!
                </p>
                <p
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="text-base sm:text-xl font-bold text-[#11694c] font-tamil"
                >
                  ஆட்டம் · பாட்டம் · கொண்டாட்டம்
                </p>
              </div>

              {/* Concrete, Non-Generic Copy Grounded in Real Campus Life */}
              <p className="max-w-2xl text-base sm:text-lg text-purple-950/85 leading-relaxed font-body font-medium">
                {locale === "ta"
                  ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மொழியையும், கலைகளையும், பண்பாட்டையும் பேணிப் பாதுகாக்கும் முதன்மை மாணவர் அமைப்பு. மண்பானைப் பொங்கல் விருந்து முதல் வளாக நடனம், இசை மற்றும் தோழமை வரை அனைவரையும் அன்போடு வரவேற்கிறோம்."
                  : "We bring together students, language, and the living arts of Tamilakam at Ohio State — from authentic earthen pot Pongal feasts and live Parai drumming to collegiate dance teams and lifelong campus friendships in Columbus."}
              </p>

              {/* Primary Action Buttons: Architectural Blocks with Real Physical Depth */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/events/${nextEvent.slug}`}
                  onClick={playClick}
                  className="px-7 py-3.5 btn-sangam text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5"
                >
                  <Ticket className="w-4 h-4 text-[#55CCA2]" />
                  <span>{locale === "ta" ? "பொங்கல் நுழைவுச்சீட்டு வாங்குக" : "Buy Pongal Tickets"}</span>
                </Link>

                <Link
                  href="/join"
                  onClick={playClick}
                  className="px-7 py-3.5 btn-sangam-mint text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-[#240e36]" />
                  <span>{locale === "ta" ? "சங்கத்தில் இணைக" : "Join The Club"}</span>
                </Link>

                <Link
                  href="/board"
                  onClick={playClick}
                  className="px-6 py-3.5 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>{locale === "ta" ? "நிர்வாகக் குழு" : "Meet The Board"}</span>
                  <ArrowRight className="w-4 h-4 text-[#55CCA2]" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Interactive Emblem Medallion */}
            <div className="lg:col-span-4 flex justify-center items-center">
              <div className="relative p-2">
                <InteractiveEmblemMedallion size="lg" showAura={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Next Event Architectural Ticker Strip */}
        <div className="relative z-10 max-w-6xl mx-auto w-full pt-10">
          <Link
            href={`/events/${nextEvent.slug}`}
            onClick={playClick}
            className="block group"
          >
            <div className="border-2 border-[#250d38] bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0px_#4c2472] hover:border-[#55CCA2] hover:shadow-[4px_4px_0px_#55CCA2] transition-all">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-[#250d38] text-[#55CCA2] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#55CCA2]">
                  [NEXT EVENT]
                </span>
                <span className="text-sm font-bold text-[#250d38] font-display group-hover:text-[#4c2472] transition-colors">
                  {nextEvent.titleEn} · {nextEvent.date}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#11694c] group-hover:underline">
                {nextEvent.location} · Reserve Tickets →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Woven Temple Border Marquee Divider */}
      <WovenBorderMarquee
        text="ஆட்டம் · பாட்டம் · கொண்டாட்டம் · AATAM · PAATAM · KONDATAM · OHIO STATE TAMIL SANGAM"
        speedSeconds={28}
        variant="mint"
      />

      {/* 4. Flagship Festival Spotlight (Powerhouse Pongal) */}
      <section className="relative py-20 px-4 sm:px-8 z-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-1">
              Annual Cultural Milestone
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#250d38] tracking-tight font-display">
              {locale === "ta" ? "அடுத்த முக்கிய நிகழ்வு" : "Next Flagship Festival"}
            </h2>
          </div>
          <Link
            href="/events"
            onClick={playClick}
            className="text-xs font-mono text-[#4c2472] hover:text-[#11694c] font-bold transition-colors"
          >
            <span>{locale === "ta" ? "அனைத்து நிகழ்வுகளையும் காண்க" : "See Every Event"}</span>
          </Link>
        </div>

        {/* Poster & Ticket Presentation Box Structure */}
        <div className="box-ticket border-2 border-[#250d38] bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#250d38] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Subtle Perforated Die-Cut Ticket Notch Details for Large Screens */}
          <div className="hidden lg:block absolute left-[58.33%] top-0 bottom-0 w-0 border-r-2 border-dashed border-[#250d38]/50 pointer-events-none" />
          <div className="hidden lg:block absolute left-[58.33%] -top-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border-2 border-[#250d38] rotate-45 z-20 pointer-events-none" />
          <div className="hidden lg:block absolute left-[58.33%] -bottom-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border-2 border-[#250d38] rotate-45 z-20 pointer-events-none" />

          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="box-badge text-[#11694c] border-l-[#55CCA2]">
                ● {locale === "ta" ? nextEvent.statusBadgeTa : nextEvent.statusBadgeEn}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="px-2.5 py-1 text-xs font-mono bg-purple-100 text-[#4c2472] font-bold border border-purple-300"
              >
                {nextEvent.tamilDate}
              </span>
              <span className="px-2.5 py-1 text-xs font-mono bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                {nextEvent.academicYear}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight">
              {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
            </h3>

            <p className="text-sm sm:text-base text-purple-950/80 leading-relaxed font-body">
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
                className="px-7 py-3 btn-sangam text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-[#55CCA2]" />
                <span>{locale === "ta" ? "நுழைவுச்சீட்டு பெறுக" : `Buy Pongal Tickets (${nextEvent.price})`}</span>
              </Link>

              <Link
                href={`/events/${nextEvent.slug}`}
                onClick={playClick}
                className="px-6 py-3 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider"
              >
                <span>Event Schedule & Dress Code</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-72 sm:h-84 border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] overflow-hidden group">
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

      {/* 5. The Three Pillars of OSU Tamil Sangam: Bespoke Kolam Glyphs & Monolithic Stele Blocks */}
      <section className="relative py-20 px-4 sm:px-8 z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="box-badge shadow-[2px_2px_0px_#4c2472] mb-3">
            <span>Our Foundation · முப்பெரும் தூண்கள்</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#250d38] tracking-tight font-display">
            {locale === "ta" ? "ஆட்டம் · பாட்டம் · கொண்டாட்டம்" : "The Three Pillars of Sangam"}
          </h2>
          <p className="text-sm sm:text-base text-purple-950/80 mt-3 font-body leading-relaxed">
            {locale === "ta"
              ? "நடனம், இசை, மற்றும் சமூகக் கொண்டாட்டங்களின் வழியே தமிழ் கலாச்சாரத்தை ஓஹியோவில் உயிர்ப்புடன் வைத்திருக்கும் மூன்று தூண்கள்."
              : "Our club is anchored by three vibrant traditions that empower students to celebrate and perform their heritage on campus."}
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {/* Pillar 1: Aatam */}
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="relative bg-white border-2 border-[#250d38] p-8 overflow-hidden transition-all shadow-[5px_5px_0px_#4c2472] hover:shadow-[7px_7px_0px_#55CCA2] hover:border-[#55CCA2] flex flex-col justify-between group"
          >
            {/* Giant Background Tamil Watermark Script with Zero Letter Spacing */}
            <div
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="absolute right-3 bottom-0 text-7xl font-bold font-tamil text-purple-100/50 select-none pointer-events-none group-hover:text-purple-200/70 transition-colors"
            >
              ஆடல்
            </div>

            <div>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.1, rotate: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-12 h-12 border-2 border-[#250d38] bg-purple-100 text-[#4c2472] flex items-center justify-center mb-5 shadow-[2px_2px_0px_#4c2472]"
              >
                <AatamDanceGlyph size={28} className="text-[#4c2472]" />
              </motion.div>
              <span className="text-xs font-mono text-[#4c2472] font-bold tracking-widest uppercase">
                தூண் 1 · Pillar One
              </span>
              <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-3 font-display">
                {locale === "ta" ? "ஆட்டம் · Dance" : "Aatam · Dance & Motion"}
              </h3>
              <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed mb-6 font-body">
                {locale === "ta"
                  ? "பாரம்பரிய பரதநாட்டியம் முதல் சினிமா குத்து மற்றும் ஃப்யூஷன் நடனங்கள் வரை மேடைகளை அதிரவைக்கும் நடனக் குழுக்கள்."
                  : "From classical Bharatanatyam to explosive cinematic Kuthu and contemporary collegiate fusion, our student-choreographed dance teams perform at campus showcases and Midwest events."}
              </p>
            </div>

            <Link
              href="/join"
              onClick={playClick}
              className="inline-flex items-center text-xs font-mono font-bold text-[#4c2472] hover:text-[#11694c] transition-colors hover:underline uppercase tracking-wider"
            >
              <span>Audition for Dance Troupe →</span>
            </Link>
          </motion.div>

          {/* Pillar 2: Paatam */}
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="relative bg-white border-2 border-[#250d38] p-8 overflow-hidden transition-all shadow-[5px_5px_0px_#4c2472] hover:shadow-[7px_7px_0px_#55CCA2] hover:border-[#55CCA2] flex flex-col justify-between group"
          >
            {/* Giant Background Tamil Watermark Script with Zero Letter Spacing */}
            <div
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="absolute right-3 bottom-0 text-7xl font-bold font-tamil text-emerald-100/50 select-none pointer-events-none group-hover:text-emerald-200/70 transition-colors"
            >
              இசை
            </div>

            <div>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.1, rotate: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-12 h-12 border-2 border-[#250d38] bg-[#55CCA2]/30 text-[#11694c] flex items-center justify-center mb-5 shadow-[2px_2px_0px_#4c2472]"
              >
                <PaatamMusicGlyph size={28} className="text-[#11694c]" />
              </motion.div>
              <span className="text-xs font-mono text-[#11694c] font-bold tracking-widest uppercase">
                தூண் 2 · Pillar Two
              </span>
              <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-3 font-display">
                {locale === "ta" ? "பாட்டம் · Music" : "Paatam · Music & Rhythm"}
              </h3>
              <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed mb-6 font-body">
                {locale === "ta"
                  ? "இளையராஜா மற்றும் ரஹ்மானின் இன்னிசைகள், நேரடி இசைக்குழுக்கள் மற்றும் அக்யூஸ்டிக் கல்லூரிப் பாடல்கள்."
                  : "Live acoustic jam sessions, Carnatic medleys, thunderous campus Parai drums, and vocalists uniting through celebrated Ilaiyaraaja, A.R. Rahman, and independent Tamil anthems."}
              </p>
            </div>

            <Link
              href="/join"
              onClick={playClick}
              className="inline-flex items-center text-xs font-mono font-bold text-[#11694c] hover:text-[#4c2472] transition-colors hover:underline uppercase tracking-wider"
            >
              <span>Play with Music Troupe →</span>
            </Link>
          </motion.div>

          {/* Pillar 3: Kondatam */}
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
            className="relative bg-white border-2 border-[#250d38] p-8 overflow-hidden transition-all shadow-[5px_5px_0px_#4c2472] hover:shadow-[7px_7px_0px_#55CCA2] hover:border-[#55CCA2] flex flex-col justify-between group"
          >
            {/* Giant Background Tamil Watermark Script with Zero Letter Spacing */}
            <div
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="absolute right-3 bottom-0 text-7xl font-bold font-tamil text-amber-100/50 select-none pointer-events-none group-hover:text-amber-200/70 transition-colors"
            >
              மகிழ்
            </div>

            <div>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.1, rotate: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-12 h-12 border-2 border-[#250d38] bg-amber-100 text-[#b45309] flex items-center justify-center mb-5 shadow-[2px_2px_0px_#4c2472]"
              >
                <KondatamFestGlyph size={28} className="text-[#b45309]" />
              </motion.div>
              <span className="text-xs font-mono text-[#b45309] font-bold tracking-widest uppercase">
                தூண் 3 · Pillar Three
              </span>
              <h3 className="text-2xl font-bold text-[#250d38] mt-1 mb-3 font-display">
                {locale === "ta" ? "கொண்டாட்டம் · Fellowship" : "Kondatam · Celebration"}
              </h3>
              <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed mb-6 font-body">
                {locale === "ta"
                  ? "வாழை இலை பொங்கல் விருந்து, தீபாவளி கொண்டாட்டங்கள், விளையாட்டுப் போட்டிகள் மற்றும் வாழ்நாள் நட்பு."
                  : "Traditional banana-leaf Pongal harvest feasts, Diwali celebrations, games on the Oval, and creating an inclusive cultural sanctuary for undergraduate and graduate Buckeyes."}
              </p>
            </div>

            <Link
              href="/join"
              onClick={playClick}
              className="inline-flex items-center text-xs font-mono font-bold text-[#b45309] hover:text-[#4c2472] transition-colors hover:underline uppercase tracking-wider"
            >
              <span>Join The Student Family →</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 6. Photo Vault & Memories Spotlight */}
      <section className="relative py-16 px-4 sm:px-8 z-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="box-badge shadow-[2px_2px_0px_#4c2472] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#55CCA2]" />
              <span>Collegiate Photo Vault</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] tracking-tight font-display">
              {locale === "ta" ? "நினைவுகள் & புகைப்படத் தொகுப்பு" : "Memories & Photo Archives"}
            </h2>
          </div>
          <Link
            href="/gallery"
            onClick={playClick}
            className="text-xs font-mono text-[#4c2472] hover:text-[#11694c] font-bold transition-colors"
          >
            <span>{locale === "ta" ? "முழு தொகுப்பைக் காண்க" : "Explore All Vaults (100+ Photos) →"}</span>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          >
            <Link
              href="/gallery/berry-cute-picnic"
              onClick={playClick}
              className="border-2 border-[#250d38] bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] hover:border-[#55CCA2] transition-all group flex flex-col justify-between h-full"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b-2 border-[#250d38]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no"
                  alt="TS A Berry Cute Picnic"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]">
                  2024–2025
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  31 Photos
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS &quot;A Berry Cute Picnic&quot;
                </h3>
                <p className="text-xs text-purple-950/75 line-clamp-2 leading-relaxed font-body">
                  Fall semester kickoff picnic on the South Oval with fresh berry treats, blankets, and community bonding.
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          >
            <Link
              href="/gallery/streetside-sapad"
              onClick={playClick}
              className="border-2 border-[#250d38] bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] hover:border-[#55CCA2] transition-all group flex flex-col justify-between h-full"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b-2 border-[#250d38]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no"
                  alt="TS Streetside Sapad Event"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]">
                  2018–2019 Archive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  31 Photos
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS Streetside Sapad Event
                </h3>
                <p className="text-xs text-purple-950/75 line-clamp-2 leading-relaxed font-body">
                  Authentic South Indian street food feast celebrating hot kothu parotta, crispy dosas, and filter kaapi.
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          >
            <Link
              href="/gallery/namma-jathara"
              onClick={playClick}
              className="border-2 border-[#250d38] bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] hover:border-[#55CCA2] transition-all group flex flex-col justify-between h-full"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b-2 border-[#250d38]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no"
                  alt="TS x TT: Namma Jathara"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]">
                  2018–2019 Archive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  31 Photos
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS x TT: Namma Jathara
                </h3>
                <p className="text-xs text-purple-950/75 line-clamp-2 leading-relaxed font-body">
                  Historic cultural carnival with Telugu Thallulu featuring festive games, folk dance, and regional cuisine.
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 7. Signature Moment: Filter Coffee Intermission Pavilion Box */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 bg-[#250d38] border-2 border-[#55CCA2] shadow-[8px_8px_0px_#55CCA2] relative overflow-hidden text-white">
          <div className="box-badge-dark mb-4 text-xs font-mono font-bold tracking-widest uppercase">
            <FilterKaapiGlyph size={18} className="text-[#55CCA2]" />
            <span>இடைவேளை · INTERVAL</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-3">
            {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
          </h3>

          <p className="text-xs sm:text-sm text-purple-200/90 max-w-lg mx-auto mb-6 leading-relaxed font-body">
            {locale === "ta"
              ? "ஒரு நிமிடம் நில்லுங்கள், சூடான கும்பகோணம் டிகிரி காபியை ருசியுங்கள். எங்கள் சங்கத்தில் இணைந்து புதிய நண்பர்களை உருவாக்குங்கள்!"
              : "Pause for a moment, enjoy the frothy aroma of Kumbakonam degree kaapi, and pull up a chair. Connect with the Buckeye Tamil community today."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/join"
              onClick={playClick}
              className="px-7 py-3.5 btn-sangam-mint text-xs font-mono font-bold uppercase tracking-wider"
            >
              Join the Student GroupMe
            </Link>
            <Link
              href="/about"
              onClick={playClick}
              className="px-7 py-3.5 btn-sangam-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              Read Our Constitution & History
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
