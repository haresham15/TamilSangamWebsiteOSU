"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS } from "@/data/board";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Crown, Mail } from "lucide-react";
import { CourtyardHeader } from "@/components/muttram/CourtyardHeader";
import { MuttramButton } from "@/components/muttram/MuttramButton";
import { OrganicRouteGateway } from "@/components/muttram/OrganicRouteGateway";
import CountUp from "@/components/CountUp";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import styles from "./board.module.css";

const BoardHeroCanvas = dynamic(
  () => import("@/components/board/BoardHeroCanvas").then((m) => m.BoardHeroCanvas),
  { ssr: false, loading: () => <div className="h-dvh bg-hero-espresso text-antique-gold grid place-items-center"><Crown aria-label="Loading student leadership colonnade" /></div> }
);

export default function BoardPage() {
  const { locale } = useLocale();
  const { playClick, playMarimba } = useAudio();
  const reduceMotion = useReducedMotion();
  const [hoveredMember, setHoveredMember] = useState(CURRENT_BOARD[0]);
  const officersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rows = officersRef.current?.querySelectorAll<HTMLButtonElement>("[data-officer-id]");
    if (!rows) return;
    const visible = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.set(entry.target, entry);
        else visible.delete(entry.target);
      });
      const nearest = [...visible.values()].sort((a, b) =>
        Math.abs(a.target.getBoundingClientRect().top - window.innerHeight * .3) -
        Math.abs(b.target.getBoundingClientRect().top - window.innerHeight * .3)
      )[0];
      const id = (nearest?.target as HTMLElement | undefined)?.dataset.officerId;
      const member = CURRENT_BOARD.find((item) => item.id === id);
      if (member) setHoveredMember(member);
    }, { rootMargin: "-15% 0px -35% 0px", threshold: [0, .25, .5] });
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full text-left bg-transparent">
      <div id="board-hero-trigger" data-hero-container="true" className="relative z-10 w-full">
        <BoardHeroCanvas bezel={null} />
      </div>
      <EditorialSheetHandoff
        badge="DEMOCRATIC COUNCIL"
        sublabel="OFFICERS 2026–2027"
        className="text-hearth-espresso"
      >
        {/* Physical Top Border Metrics Bezel */}
        <dl className={styles.bezel} aria-label="Tamil Sangam at a glance">
          <div><dt>Buckeye Members</dt><dd>{reduceMotion ? 120 : <CountUp to={120} duration={2} />}+</dd></div>
          <div><dt>Executive Officers</dt><dd>{reduceMotion ? 9 : <CountUp to={9} duration={1.5} />}</dd></div>
          <div><dt>Campus Galas & Events</dt><dd>{reduceMotion ? 14 : <CountUp to={14} duration={1.8} />}</dd></div>
          <div><dt>Est. at Ohio State</dt><dd>{reduceMotion ? 2021 : <CountUp to={2021} from={2000} duration={2.2} separator="" />}</dd></div>
        </dl>
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-28 sm:pt-36 pb-24 sm:pb-32 scroll-mt-32">
          <CourtyardHeader
            align="left"
            eyebrow="Democratic Council · 2026–2027"
            title={locale === "ta" ? "நிர்வாகக் குழு & வழிகாட்டிகள்" : "The Executive Board"}
            tamilTitle={locale !== "ta" ? "ஆளுமை · மாணவர் தலைமை" : undefined}
            description="Democratic student governance serving 120+ Buckeye members. Meet the officers leading community festivals, language workshops, and student advocacy across Columbus."
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mt-16 sm:mt-24">
            <aside className={styles.portrait + " lg:col-span-5 sticky top-28 self-start z-10"} aria-label="Selected officer" data-testid="officer-portrait">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={hoveredMember.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .2 }}>
                  <div className={styles.portraitPrint}>
                    {hoveredMember.photoUrl && hoveredMember.photoUrl !== "/emblem.svg" ? (
                      <Image src={hoveredMember.photoUrl} alt={hoveredMember.nameEn} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 450px" />
                    ) : (
                      <span className={styles.monogram} aria-label={hoveredMember.nameEn + " monogram"}>{hoveredMember.nameEn.split(/\s+/).map((part) => part[0]).join("")}</span>
                    )}
                  </div>
                  <div className="space-y-3 pt-6">
                    <p className="font-mono text-xs text-hearth-terracotta uppercase tracking-widest">{hoveredMember.roleEn}</p>
                    <p lang="ta" className="font-tamil text-base leading-relaxed">{hoveredMember.roleTa} · {hoveredMember.nameTa}</p>
                    <h2 className="text-3xl font-serif">{hoveredMember.nameEn}</h2>
                    <p className="text-sm leading-relaxed" lang={locale === "ta" ? "ta" : undefined}>{locale === "ta" ? hoveredMember.bioTa : hoveredMember.bioEn}</p>
                    {hoveredMember.quote && <blockquote className="text-sm font-serif italic border-l-2 border-hearth-terracotta pl-4">{hoveredMember.quote}</blockquote>}
                    <a href={"mailto:" + hoveredMember.email} className="min-h-12 inline-flex items-center gap-2 text-sm text-hearth-terracotta break-all focus-visible:outline-2 focus-visible:outline-offset-4"><Mail className="size-4 shrink-0" aria-hidden="true" />{hoveredMember.email}</a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </aside>
            <div ref={officersRef} className="lg:col-span-7">
              {CURRENT_BOARD.map((member, index) => (
                <button key={member.id} type="button" data-officer-id={member.id} aria-pressed={hoveredMember.id === member.id}
                  onMouseEnter={() => { playMarimba(); setHoveredMember(member); }} onFocus={() => setHoveredMember(member)}
                  onClick={() => { playClick(); setHoveredMember(member); }} className={styles.officer}>
                  <span className="flex gap-4 text-xs font-mono uppercase tracking-widest text-hearth-terracotta"><span>{String(index + 1).padStart(2, "0")}</span>{member.roleEn}</span>
                  <span className="block font-serif text-3xl sm:text-5xl leading-tight mt-4">{member.nameEn}</span>
                  <span lang="ta" className="block font-tamil text-lg leading-relaxed mt-2">{member.nameTa} · {member.roleTa}</span>
                  <span className="block text-sm leading-relaxed mt-4 max-w-xl">{member.bioEn}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Working Subcommittee Councils: Borderless Typographic Grid */}
          <div className="mt-28 sm:mt-40 pt-16 border-t border-hearth-espresso/20 space-y-16">
            <div className="text-center space-y-3">
              <span className="font-sans text-xs font-semibold text-hearth-terracotta tracking-widest uppercase block">
                Working Groups · துணைக் குழுக்கள்
              </span>
              <h3 className="text-3xl sm:text-5xl font-serif font-normal text-hearth-espresso">
                Subcommittee Coordinators
              </h3>
              <p className="text-base text-hearth-espresso/80 font-sans max-w-xl mx-auto leading-relaxed">
                Dedicated student organizers leading choreography, social media trailers, campus catering, and community service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 text-left">
              {SUBCOMMITTEE_MEMBERS.map((sub, i) => (
                <div key={sub.id || i} className={styles.coordinator + " space-y-2"} onPointerMove={(event) => {
                  if (!window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty("--pointer-x", (event.clientX - rect.left) + "px");
                  event.currentTarget.style.setProperty("--pointer-y", (event.clientY - rect.top) + "px");
                }} onPointerLeave={(event) => {
                  event.currentTarget.style.removeProperty("--pointer-x");
                  event.currentTarget.style.removeProperty("--pointer-y");
                }}>
                  <span className="font-mono text-xs text-hearth-terracotta uppercase tracking-widest font-semibold block">
                    {sub.areaEn}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-serif text-hearth-espresso">{sub.nameEn}</h4>
                  <p className="text-sm font-sans text-hearth-espresso/80" lang="ta">
                    {sub.nameTa} · {sub.areaTa}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Plain-Language Democratic Governance: Architectural Statement Naked on Background */}
          <div className="mt-28 pt-16 border-t border-hearth-espresso/20 space-y-6 max-w-3xl">
            <span className="font-sans text-xs font-semibold text-hearth-terracotta tracking-widest uppercase block">
              Democratic Governance · ஜனநாயக விதிகள்
            </span>
            <h4 className="text-3xl sm:text-4xl font-serif text-hearth-espresso">
              Constitution of Tamil Sangam at Ohio State
            </h4>
            <p className="text-base sm:text-lg font-sans text-hearth-espresso/80 leading-relaxed">
              Our organization is fully student-run and democratically governed under Ohio State University Student Activities guidelines. Executive officers are elected annually by general body vote, and all constitutional amendments are publicly accessible.
            </p>
            <div className="pt-2">
              <MuttramButton href="/guide" variant="secondary" size="md" onClick={playClick}>
                Read Organization FAQ & Guidelines →
              </MuttramButton>
            </div>
          </div>

          {/* Borderless Organic Transportation to Join */}
          <div className="mt-28 sm:mt-36">
            <OrganicRouteGateway
              primaryHref="/join"
              primaryLabel="Sign the Guestbook"
              eyebrow="Step Across the Threshold · அடுத்த வாசல்"
              title="Join the Sangam Fellowship"
              tamilTitle="எங்களுடன் இணையுங்கள்"
              description="Membership is open to every student, alumni, and community member in Columbus. Sign the digital guestbook and take your place at the hearth."
            />
          </div>

        </div>
      </EditorialSheetHandoff>
    </div>
  );
}
