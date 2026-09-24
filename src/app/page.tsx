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
import { EVENTS } from "@/data/events";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Sparkles
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
    <div className="relative w-full overflow-hidden bg-[#fffdfa] font-body text-left">
      {/* 1. Subtle Ambient Background Kolam Lattice */}
      <GlowingKolamField />

      {/* 2. Hero Section: Digital Kolam 3D Particle Vortex & Text Mask Reveal */}
      <DigitalKolamHero nextEventSlug={nextEvent.slug} />

      {/* 3. Woven Temple Border Marquee Divider */}
      <WovenBorderMarquee
        text="ஆட்டம் · பாட்டம் · கொண்டாட்டம் · AATAM · PAATAM · KONDATAM · OHIO STATE TAMIL SANGAM"
        speedSeconds={28}
        variant="mint"
      />

      {/* 4. Flagship Festival Spotlight */}
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
                primaryText={locale === "ta" ? "நுழைவுச்சீட்டு பெறுக" : `Get Event Tickets (${nextEvent.price})`}
                secondaryText={locale === "ta" ? `Get Event Tickets (${nextEvent.price})` : "நுழைவுச்சீட்டு பெறுக"}
                variant="primary"
                icon={<Ticket className="w-4 h-4 text-[#55CCA2]" />}
                className="w-full sm:w-auto justify-center"
              />

              <PalagaiButton
                href={`/events/${nextEvent.slug}`}
                primaryText={locale === "ta" ? "நிகழ்ச்சி நிரல் & உடை" : "Schedule & Dress Code"}
                secondaryText={locale === "ta" ? "Schedule & Dress Code" : "நிகழ்ச்சி நிரல் & உடை"}
                variant="white"
                className="w-full sm:w-auto justify-center"
              />
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

      {/* 5. The Four Pillars of OSU Tamil Sangam: Kanchipuram Silk Fluid Hover Reveals */}
      <SilkHoverPillars />

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
            <span>{locale === "ta" ? "முழு தொகுப்பைக் காண்க" : "Explore All Photo Archives →"}</span>
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
                  src="https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no"
                  alt="TS A Berry Cute Picnic"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]">
                  2025–2026
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  5 Photos
                </div>
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
              className="border-2 border-[#250d38] bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] hover:border-[#55CCA2] transition-all group flex flex-col justify-between h-full"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b-2 border-[#250d38]">
                <Image
                  src="https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no"
                  alt="TS Streetside Sapad Event"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-[#55CCA2] font-bold uppercase border border-[#55CCA2]">
                  2025–2026 Archive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  5 Photos
                </div>
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
                  2025–2026 Archive
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#250d38] text-[10px] font-mono text-white font-bold border border-white/40">
                  5 Photos
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-[#250d38] font-display mb-1 group-hover:text-[#4c2472] transition-colors">
                  TS x TT: Namma Jathara
                </h3>
                <p className="text-xs text-[#250d38] font-medium line-clamp-2 leading-relaxed font-body">
                  A spring campus carnival hosted with Telugu Thallulu featuring outdoor games, music, and food stalls.
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
            <PalagaiButton
              href="/join"
              primaryText={locale === "ta" ? "மாணவர் குழுவில் இணைக" : "Join the Student GroupMe"}
              secondaryText={locale === "ta" ? "Join the Student GroupMe" : "மாணவர் குழுவில் இணைக"}
              variant="mint"
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
