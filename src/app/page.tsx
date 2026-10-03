"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { GlowingKolamField } from "@/components/3d/GlowingKolamField";
import { DigitalKolamHero } from "@/components/hero/DigitalKolamHero";
import { SilkHoverPillars } from "@/components/home/SilkHoverPillars";
import { WovenBorderMarquee } from "@/components/ui/WovenBorderMarquee";
import {
  FilterKaapiGlyph,
} from "@/components/ui/KolamIcons";
import { PalagaiButton } from "@/components/ui/PalagaiButton";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { CulturalGlossaryTerm } from "@/components/ui/CulturalGlossaryTerm";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { EVENTS } from "@/data/events";
import { 
  Calendar, 
  MapPin
} from "lucide-react";

export default function HomePage() {
  const { locale } = useLocale();
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
    <div className="relative w-full overflow-hidden bg-[#fffdfa] font-body text-left vignette-ambient-warm">
      {/* 0. Tactile Heritage Sandstone Texture Overlay across the page */}
      <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

      {/* 1. Subtle Ambient Background Kolam Lattice */}
      <GlowingKolamField />

      {/* 2. Hero Section: Digital Kolam 3D Particle Vortex & Text Mask Reveal */}
      <DigitalKolamHero nextEventSlug={nextEvent.slug} />

      {/* 2.5 Color Gradient Transition: 3D Cosmic Plum -> Sangam Royal Purple -> Warm Ivory */}
      <HeroGradientTransition variant="home" className="-mt-32 relative z-20" />

      {/* 3. Woven Temple Border Marquee Divider */}
      <WovenBorderMarquee
        text="ஆட்டம் · பாட்டம் · கொண்டாட்டம் · AATAM · PAATAM · KONDATAM · OHIO STATE TAMIL SANGAM"
        speedSeconds={28}
        variant="mint"
      />

      {/* 3.5 The Oolai Chuvadi (Palm Leaf) Manuscript Aspect-Ratio Banner */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 -mb-6">
        <div className="oolai-chuvadi relative flex items-center justify-between gap-4 py-3 sm:py-3.5 px-6 sm:px-12 bg-[#fbf5e6] text-[#2c1507] border border-[#B5A642]/45 shadow-[0_4px_20px_rgba(181,166,66,0.12)] hover:border-[#B5A642] hover-glow-kuthuvilakku transition-all duration-300">
          {/* Classical Manuscript Eyelet Perforation Cord Holes */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#522909]/20 border border-[#522909]/40 shadow-inner" />
            <div className="w-6 h-[1px] bg-[#B5A642]/40" />
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <span
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="text-xs sm:text-sm font-tamil font-bold text-[#4a2307] tracking-normal"
            >
              யாதும் ஊரே யாவரும் கேளீர்
            </span>
            <span className="hidden sm:inline text-[#B5A642]/60">·</span>
            <span className="text-[11px] sm:text-xs font-serif italic text-[#5c310c]">
              &quot;To us, all towns are our own, and all people are our kin.&quot;
            </span>
            <span className="hidden md:inline text-[#B5A642]/60">·</span>
            <div className="hidden md:inline">
              <CulturalGlossaryTerm termKey="yaadhum-oore" className="text-[#87500e] text-[11px] font-mono">
                Purananuru 192
              </CulturalGlossaryTerm>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <div className="w-6 h-[1px] bg-[#B5A642]/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#522909]/20 border border-[#522909]/40 shadow-inner" />
          </div>
        </div>
      </div>

      {/* 4. Flagship Festival Spotlight */}
      <section className="relative py-20 px-4 sm:px-8 z-10 max-w-6xl mx-auto overflow-hidden">
        {/* Structural Tamil Background Watermark */}
        <WatermarkGlyph text="திருவிழா" opacity={0.04} align="right" theme="light" />

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 relative z-10">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#250d38] tracking-tight font-display">
              {locale === "ta" ? "அடுத்த முக்கிய நிகழ்வு" : "Next Flagship Festival"}
            </h2>
          </div>
          <Link
            href="/events"
            onClick={playClick}
            className="text-xs font-mono text-[#4c2472] hover:text-[#11694c] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-colors"
          >
            <span>{locale === "ta" ? "அனைத்து நிகழ்வுகளையும் காண்க →" : "See Every Event →"}</span>
          </Link>
        </div>

        {/* Poster & Ticket Presentation Box Structure (Cultural Geometry with Filigree Brass Borders & Temple Arch) */}
        <div className="rounded-t-[36px] rounded-b-md border border-[#B5A642]/40 bg-white p-6 sm:p-10 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.22)] hover:border-[#FFB84D] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Subtle Perforated Die-Cut Ticket Notch Details for Large Screens */}
          <div className="hidden lg:block absolute left-[58.33%] top-0 bottom-0 w-0 border-r-2 border-dashed border-[#B5A642]/40 pointer-events-none" />
          <div className="hidden lg:block absolute left-[58.33%] -top-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />
          <div className="hidden lg:block absolute left-[58.33%] -bottom-3 -translate-x-1/2 w-6 h-6 bg-[#fffdfa] border border-[#B5A642]/40 rotate-45 z-20 pointer-events-none" />

          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
              <span className="text-[#11694c]">
                {locale === "ta" ? nextEvent.statusBadgeTa : nextEvent.statusBadgeEn}
              </span>
              <span className="text-[#6b478d]">·</span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="text-[#4c2472]"
              >
                {nextEvent.tamilDate}
              </span>
              <span className="text-[#6b478d]">·</span>
              <span className="text-slate-600 font-medium">
                {nextEvent.academicYear}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] font-display tracking-tight">
              {locale === "ta" ? nextEvent.titleTa : nextEvent.titleEn}
            </h3>

            <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body">
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

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <PalagaiButton
                href={`/events/${nextEvent.slug}`}
                primaryText={locale === "ta" ? "நிகழ்ச்சி விவரங்கள் & அட்டவணை" : "View Event Details & Schedule"}
                secondaryText={locale === "ta" ? "View Event Details & Schedule" : "நிகழ்ச்சி விவரங்கள் & அட்டவணை"}
                variant="gold-foil"
                className="w-full sm:w-auto justify-center"
              />
            </div>
          </div>

          {/* Temple Arch Framing for the Event Poster (rounded-t-[44px] rounded-b-md) */}
          <div className="lg:col-span-5 relative h-72 sm:h-84 temple-arch border border-[#B5A642]/50 shadow-[4px_4px_0px_#4c2472] overflow-hidden group">
            <Image
              src={nextEvent.posterImage}
              alt={nextEvent.titleEn}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[44px] rounded-b-md"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      {/* 5. The Four Pillars of OSU Tamil Sangam: Kanchipuram Silk Fluid Hover Reveals */}
      <SilkHoverPillars />

      {/* 6. Photo Vault & Memories Spotlight */}
      <section className="relative py-16 px-4 sm:px-8 z-10 max-w-6xl mx-auto overflow-hidden">
        {/* Structural Tamil Background Watermark */}
        <WatermarkGlyph text="நினைவுகள்" opacity={0.038} align="left" theme="light" />

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 relative z-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#250d38] tracking-tight font-display">
              {locale === "ta" ? "நினைவுகள் & புகைப்படத் தொகுப்பு" : "Memories & Photo Archives"}
            </h2>
          </div>
          <Link
            href="/gallery"
            onClick={playClick}
            className="text-xs font-mono text-[#4c2472] hover:text-[#11694c] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-colors"
          >
            <span>{locale === "ta" ? "முழு தொகுப்பைக் காண்க →" : "Explore All Photo Archives →"}</span>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
        >
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          >
            <Link
              href="/gallery/berry-cute-picnic"
              onClick={playClick}
              className="temple-arch border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-t-[38px]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no"
                  alt="TS A Berry Cute Picnic"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS &quot;A Berry Cute Picnic&quot;
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  Fall semester welcome picnic on the South Oval with snacks, card games, and good conversation.
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
              className="temple-arch border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-t-[38px]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no"
                  alt="TS Streetside Sapad Event"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS Streetside Sapad Event
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  South Indian street food dinner featuring hot kothu parotta, fresh dosas, and filter coffee.
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
              className="temple-arch border border-[#B5A642]/35 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.25)] hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] focus-visible:ring-offset-2 transition-all duration-300 ease-out group flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-[#B5A642]/35 rounded-t-[38px]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no"
                  alt="TS x TT: Namma Jathara"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS x TT: Namma Jathara
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  A spring campus carnival hosted with Telugu Tamasha at OSU featuring outdoor games, music, and food stalls.
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 7. Signature Moment: Filter Coffee Intermission Pavilion Box */}
      <section className="relative py-16 px-4 sm:px-6 z-10 max-w-4xl mx-auto text-center overflow-hidden">
        {/* Structural Tamil Background Watermark */}
        <WatermarkGlyph text="வணக்கம்" opacity={0.045} align="center" theme="light" />

        <div className="p-8 sm:p-12 bg-[#250d38] rounded-t-[44px] rounded-b-md border border-[#B5A642]/50 shadow-[0_0_35px_rgba(255,184,77,0.18)] hover-glow-kuthuvilakku transition-all duration-300 relative overflow-hidden text-white z-10">
          {/* Tactile Kanjeevaram Texture Overlay */}
          <HeritageTextureOverlay variant="kanjeevaram" opacity={0.038} />

          <div className="flex justify-center mb-4 relative z-10">
            <FilterKaapiGlyph size={32} className="text-[#FFB84D]" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-3 relative z-10">
            {locale === "ta" ? "சூடான ஃபில்டர் காபி இடைவேளை" : "Filter Coffee Intermission"}
          </h3>

          <p className="text-xs sm:text-sm text-purple-200/90 max-w-lg mx-auto mb-6 leading-relaxed font-body relative z-10">
            {locale === "ta" ? (
              <span>
                ஒரு நிமிடம் நில்லுங்கள், சூடான கும்பகோணம்{" "}
                <CulturalGlossaryTerm termKey="kaapi" className="text-[#FFB84D]">
                  டிகிரி காபியை
                </CulturalGlossaryTerm>{" "}
                ருசியுங்கள். எங்கள் சங்கத்தில் இணைந்து புதிய நண்பர்களை உருவாக்குங்கள்!
              </span>
            ) : (
              <span>
                Pause for a moment, enjoy the frothy aroma of Kumbakonam degree{" "}
                <CulturalGlossaryTerm termKey="kaapi" className="text-[#FFB84D]">
                  kaapi
                </CulturalGlossaryTerm>
                , and pull up a chair. Connect with the Buckeye Tamil community today.
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <PalagaiButton
              href="/join"
              primaryText={locale === "ta" ? "மாணவர் குழுவில் இணைக" : "Join the Student GroupMe"}
              secondaryText={locale === "ta" ? "Join the Student GroupMe" : "மாணவர் குழுவில் இணைக"}
              variant="gold-foil"
              size="lg"
            />
            <PalagaiButton
              href="/about"
              primaryText={locale === "ta" ? "எங்கள் வரலாறு & நோக்கம்" : "Our Ethos & Constitution"}
              secondaryText={locale === "ta" ? "Our Ethos & Constitution" : "எங்கள் வரலாறு & நோக்கம்"}
              variant="white"
              size="lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
