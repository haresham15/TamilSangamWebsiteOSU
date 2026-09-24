"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS, BoardMember } from "@/data/board";
import { CLUB_PURPOSE, MEMBERSHIP_GOVERNANCE } from "@/data/constitution";
import { HolographicCard } from "@/components/3d/HolographicCard";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { ArrowUpRight, ShieldCheck, Mail, ArrowRight, X, Users, Award } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function BoardPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const [activeTab, setActiveTab] = useState<"current" | "liquid" | "subcommittee" | "governance" | "join-board">("current");
  const [hoveredMember, setHoveredMember] = useState<BoardMember>(CURRENT_BOARD[0]);
  const [activeModalCard, setActiveModalCard] = useState<BoardMember | null>(null);

  const committees = [
    {
      titleEn: "Cultural & Performance Committee (Aatam & Paatam)",
      titleTa: "கலாச்சார & கலைக் குழு",
      descriptionEn: "Choreographing group dances, curating live acoustic concerts, managing stage lighting, and coaching new performers.",
      descriptionTa: "நடனப் பயிற்சி, நேரடி இசைக் குழுக்கள், மற்றும் மேடை கலை நிகழ்ச்சிகளை வடிவமைக்கும் பிரிவு.",
      roles: ["Student Choreographer", "Music Director", "Stage Manager"],
    },
    {
      titleEn: "Media, Visuals & Marketing Crew",
      titleTa: "ஊடகம் & விளம்பரக் குழு",
      descriptionEn: "Creating cinematic event posters, managing Instagram & TikTok (@osutamilsangam), shooting event photos, and designing promotional trailers.",
      descriptionTa: "சமூக வலைதள விளம்பரங்கள், புகைப்படக் கலை, மற்றும் போஸ்டர் வடிவமைப்பு.",
      roles: ["Graphic Designer", "Social Media Coordinator", "Event Photographer"],
    },
    {
      titleEn: "Festival Operations & Logistics",
      titleTa: "நிகழ்வு ஒருங்கிணைப்பு & வரவேற்புக் குழு",
      descriptionEn: "Coordinating venue setup at the Ohio Union, catering authentic banana leaf meals, ticketing, and welcoming guests.",
      descriptionTa: "விழா அரங்க மேலாண்மை, தலைவாழை இலை உணவு ஏற்பாடு, மற்றும் விருந்தினர் வரவேற்பு.",
      roles: ["Logistics Coordinator", "Hospitality Lead", "Volunteer Coordinator"],
    },
    {
      titleEn: "Community Outreach & Freshman Welcoming",
      titleTa: "மாணவர் தொடர்பு & வழிகாட்டல்",
      descriptionEn: "Connecting incoming undergraduate and graduate students, planning campus chai socials, and hosting study nights.",
      descriptionTa: "புதிய மாணவர்களுக்கான வழிகாட்டல் மற்றும் நட்புச் சந்திப்புகள்.",
      roles: ["Freshman Ambassador", "Graduate Student Liaison", "Mentorship Lead"],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] block mb-2 font-bold">
          The Ohio State University · Student Leadership
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4">
          {locale === "ta" ? "நிர்வாகக் குழு & தலைமைப் பொறுப்புகள்" : "Executive Board & Leadership"}
        </h1>
        <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தை வழிநடத்தும் 9 முதன்மை நிர்வாகிகள், துணைக் குழு உறுப்பினர்கள், மற்றும் அதிகாரப்பூர்வ சட்டதிட்டங்கள்."
            : "Meet the 9 student executive officers, dedicated subcommittee leaders, and constitutional governance guiding The Ohio State University Tamil Sangam."}
        </p>
      </div>

      {/* Architectural Ledger Console Tabs */}
      <div className="box-tab-strip flex flex-wrap items-center justify-center gap-2 p-1.5 max-w-4xl mx-auto mb-12">
        {[
          { id: "current" as const, label: locale === "ta" ? "செயற்குழு 2025–26 (9)" : "Executive Board 2025–26 (9)" },
          { id: "liquid" as const, label: locale === "ta" ? "பெயர் அரங்கம் (Liquid Roster)" : "Liquid Roster (Editorial)" },
          { id: "subcommittee" as const, label: locale === "ta" ? "துணைக் குழு (Subcommittee)" : "Subcommittee Council (9)" },
          { id: "governance" as const, label: locale === "ta" ? "அரசியலமைப்பு & வாக்குரிமை" : "Governance & Voting Rights" },
          { id: "join-board" as const, label: locale === "ta" ? "பொறுப்புகளில் இணையுங்கள்" : "Join Leadership Pathways" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playWoodClick();
              setActiveTab(tab.id);
            }}
            className={`box-tab-item px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-all ${
              activeTab === tab.id
                ? "box-tab-item-active"
                : "text-purple-900/70 hover:text-[#250d38]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 3D Holographic Trading Cards Grid (9 Executive Officers) */}
      {activeTab === "current" && (
        <div>
          <div className="text-center mb-8">
            <div className="box-badge-dark inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#55CCA2] bg-[#250d38] text-xs font-mono text-[#55CCA2] shadow-[2px_2px_0px_#55CCA2]">
              <span className="w-1.5 h-1.5 bg-[#55CCA2]" />
              <span>HOVER CARD TO TILT FOIL SHEEN · CLICK CARD OR FLIP BUTTON FOR PORTFOLIO</span>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {CURRENT_BOARD.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                layoutId={`board-card-container-${member.id}`}
                className="flex justify-center"
              >
                <HolographicCard
                  member={member}
                  onExpand={() => {
                    playClick();
                    setActiveModalCard(member);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 2. Liquid Roster View (Split-Screen Editorial Inspection) */}
      {activeTab === "liquid" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vertical Interactive Officer List */}
          <div className="lg:col-span-7 space-y-3">
            {CURRENT_BOARD.map((member) => {
              const isHovered = hoveredMember.id === member.id;
              return (
                <div
                  key={member.id}
                  onMouseEnter={() => setHoveredMember(member)}
                  onClick={() => {
                    playClick();
                    setActiveModalCard(member);
                  }}
                  className={`p-4 sm:p-5 border-2 transition-all cursor-pointer text-left ${
                    isHovered
                      ? "bg-[#250d38] border-[#55CCA2] shadow-[4px_4px_0px_#55CCA2] translate-x-1"
                      : "bg-[#160d26]/80 border-white/10 hover:border-white/25 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#55CCA2] font-bold">
                        0{CURRENT_BOARD.indexOf(member) + 1}
                      </span>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                          {member.nameEn}
                        </h3>
                        <p className="text-xs text-[#55CCA2] font-mono">
                          {member.nameTa} · {member.roleEn} ({member.roleTa})
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 transition-opacity ${isHovered ? "opacity-100 text-[#55CCA2]" : "opacity-30"}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Morphed Portrait Display */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="box-ticket relative w-full max-w-sm bg-[#160d26] border-2 border-white/20 shadow-[6px_6px_0px_#4c2472] p-6 flex flex-col justify-between">
              <div className="relative w-full h-52 overflow-hidden shadow-inner bg-black/40 border-2 border-white/10 flex items-center justify-center p-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={hoveredMember.photoUrl}
                    alt={hoveredMember.nameEn}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="text-2xl font-display font-bold text-white block">
                      {hoveredMember.nameTa}
                    </span>
                    <span className="text-xs text-[#55CCA2] font-mono">
                      {hoveredMember.roleTa}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white font-semibold">{hoveredMember.committeeEn}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{hoveredMember.bioEn}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-300 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                  <span>{hoveredMember.email}</span>
                </span>
                <span className="text-[var(--accent-tint)]">{hoveredMember.term}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subcommittee Council (9 Dedicated Members) */}
      {activeTab === "subcommittee" && (
        <div className="space-y-8">
          <div className="box-architectural-dark p-8 border-2 border-white/20 shadow-[5px_5px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#55CCA2] mb-2 font-bold">
              <Users className="w-4 h-4" />
              <span>The Operational Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
              {locale === "ta" ? "துணைக் குழு உறுப்பினர்கள்" : "Subcommittee Working Council"}
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {locale === "ta"
                ? "கலாச்சார நிகழ்ச்சிகள், மேடை தொழில்நுட்பம், மென்பொருள் கட்டமைப்பு, உணவு விருந்தோம்பல் மற்றும் புதிய மாணவர் வழிகாட்டலை முன்னெடுக்கும் அர்ப்பணிப்புள்ள 9 துணைக் குழு உறுப்பினர்கள்."
                : "Our 9 appointed subcommittee members form the backbone of daily club operations, spearheading stage engineering, web systems, performance rehearsals, ticketing, and student outreach."}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SUBCOMMITTEE_MEMBERS.map((sub, idx) => (
              <motion.div
                key={sub.id}
                variants={itemVariants}
                className="box-ticket p-6 bg-[#160d26] border-2 border-white/15 hover:border-[#55CCA2] shadow-[4px_4px_0px_rgba(76,36,114,0.4)] hover:shadow-[5px_5px_0px_#55CCA2] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#55CCA2] tracking-wider font-bold">
                      COUNCIL · 0{idx + 1}
                    </span>
                    <span className="w-2 h-2 bg-emerald-400 border border-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white tracking-tight mb-1">
                    {sub.nameEn}
                  </h3>
                  <p className="text-xs text-[#55CCA2] font-tamil mb-4">
                    {sub.nameTa}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Focus Domain
                  </span>
                  <p className="text-xs font-semibold text-slate-200">
                    {sub.areaEn}
                  </p>
                  <p className="text-[11px] text-slate-400 font-tamil mt-0.5">
                    {sub.areaTa}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 4. Constitution, Governance & Voting Rights */}
      {activeTab === "governance" && (
        <div className="space-y-8">
          {/* Key Rule: 2 Meetings + 2 Events for Voting & Shadowing */}
          <div className="box-ticket p-8 sm:p-10 bg-[#160d26] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#55CCA2] mb-3 font-bold">
              <Award className="w-4 h-4" />
              <span>Official Constitutional Threshold</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-4">
              {locale === "ta" ? "வாக்குரிமை & நிர்வாக வழிகாட்டல் தகுதிகள்" : "Voting Rights & Executive Board Shadowing"}
            </h2>
            <div className="p-5 border-2 border-white/15 bg-black/50 mb-6 max-w-3xl shadow-[3px_3px_0px_rgba(0,0,0,0.4)]">
              <p className="text-sm sm:text-base font-semibold text-[#55CCA2] leading-relaxed font-mono">
                {locale === "ta"
                  ? MEMBERSHIP_GOVERNANCE.votingRequirementTa
                  : MEMBERSHIP_GOVERNANCE.votingRequirementEn}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Active engagement is the hallmark of Sangam democracy. By attending meetings and events, general members build firsthand understanding of event production and club finances, earning the right to elect officers and propose constitutional amendments.
            </p>
          </div>

          {/* 4 Core Constitutional Pillars */}
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#55CCA2] block mb-2 font-bold">
              Constitutional Mandate · நோக்கங்கள்
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-6">
              {locale === "ta" ? "சங்கத்தின் நான்கு முதன்மை நோக்கங்கள்" : "The Four Pillars of Club Purpose"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CLUB_PURPOSE.map((p, idx) => (
                <div key={p.id} className="box-architectural-dark p-6 border-2 border-white/15 shadow-[3px_3px_0px_#4c2472]">
                  <span className="text-[10px] font-mono text-[#55CCA2] block mb-1 font-bold">
                    PURPOSE 0{idx + 1}
                  </span>
                  <h4 className="text-lg font-bold font-display text-white mb-2">
                    {locale === "ta" ? p.titleTa : p.titleEn}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {locale === "ta" ? p.descriptionTa : p.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Demographics & Policy 1.15 Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="box-architectural-dark p-6 border-2 border-white/15 shadow-[3px_3px_0px_#4c2472] space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#55CCA2] block font-bold">
                Student Quota & Year-Round Enrollment
              </span>
              <h4 className="text-base font-bold font-display text-white">
                90% Ohio State Student Composition
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locale === "ta" ? MEMBERSHIP_GOVERNANCE.studentQuotaTa : MEMBERSHIP_GOVERNANCE.studentQuotaEn}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t-2 border-white/10">
                {locale === "ta" ? MEMBERSHIP_GOVERNANCE.communityPolicyTa : MEMBERSHIP_GOVERNANCE.communityPolicyEn}
              </p>
            </div>

            <div className="box-architectural-dark p-6 border-2 border-white/15 shadow-[3px_3px_0px_#4c2472] space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 block font-bold">
                Safety & University Compliance
              </span>
              <h4 className="text-base font-bold font-display text-white">
                University Policy 1.15 & Non-Discrimination
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locale === "ta" ? MEMBERSHIP_GOVERNANCE.policy115ComplianceTa : MEMBERSHIP_GOVERNANCE.policy115ComplianceEn}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t-2 border-white/10">
                Strict adherence to Ohio State guidelines ensures our club is an inclusive, welcoming sanctuary free from discrimination, harassment, or bias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Get Involved in Leadership & Student Committees */}
      {activeTab === "join-board" && (
        <div className="space-y-8">
          <div className="box-architectural-dark p-8 border-2 border-white/20 shadow-[5px_5px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#55CCA2] mb-2 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Student Leadership Pathways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
              {locale === "ta" ? "செயற்குழுவில் இணையுங்கள்" : "Shape the Sangam — Join a Committee"}
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
              {locale === "ta"
                ? "எங்கள் சங்கத்தின் ஒவ்வொரு நிகழ்வும் மாணவர் தன்னார்வலர்கள் மற்றும் துணைக் குழுக்களின் உழைப்பால் மட்டுமே சாத்தியமாகிறது. முன் அனுபவம் தேவையில்லை; உங்கள் ஆர்வம் மட்டுமே போதுமானது."
                : "All major productions and festivals are powered by student committee members. Whether you want to choreograph, design posters, coordinate dinner catering, or welcome new students, there is a place for you."}
            </p>

            <Link
              href="/join#performer"
              onClick={playClick}
              className="btn-sangam-mint inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider"
            >
              <span>Apply for Committee & Volunteer Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {committees.map((com, idx) => (
              <div key={idx} className="box-architectural-dark p-6 border-2 border-white/15 shadow-[3px_3px_0px_#4c2472] text-left">
                <span className="text-[10px] font-mono uppercase text-[#55CCA2] block mb-1 font-bold">
                  Pillar 0{idx + 1}
                </span>
                <h3 className="text-lg font-bold font-display text-white mb-2">
                  {com.titleEn}
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {com.descriptionEn}
                </p>
                <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-white/10">
                  {com.roles.map((role, rIdx) => (
                    <span
                      key={rIdx}
                      className="box-badge-dark text-[10px] font-mono text-slate-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Element Detail Modal */}
      <AnimatePresence>
        {activeModalCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--surface-sunken)]/85 backdrop-blur-md"
            onClick={() => setActiveModalCard(null)}
          >
            <motion.div
              layoutId={`board-card-container-${activeModalCard.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="box-ticket relative w-full max-w-lg bg-[#160d26] border-2 border-[#55CCA2] shadow-[8px_8px_0px_#55CCA2] p-6 sm:p-8 text-left overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close officer modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 bg-black/40 p-2 border-2 border-white/15">
                  <Image
                    src={activeModalCard.photoUrl}
                    alt={activeModalCard.nameEn}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">
                    {activeModalCard.nameEn}
                  </h2>
                  <p className="text-xs font-mono text-[#55CCA2]">
                    {activeModalCard.nameTa} · {activeModalCard.roleEn} ({activeModalCard.roleTa})
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-300 mb-6">
                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Committee Leadership
                  </span>
                  <p className="font-semibold text-white">{activeModalCard.committeeEn}</p>
                  <p className="text-slate-400 font-tamil mt-0.5">{activeModalCard.committeeTa}</p>
                </div>

                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Responsibilities & Mission
                  </span>
                  <p>{activeModalCard.bioEn}</p>
                  <p className="font-tamil text-slate-400 mt-1">{activeModalCard.bioTa}</p>
                </div>

                <div>
                  <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Key Officer Responsibilities
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {activeModalCard.responsibilitiesEn.map((resp, rIdx) => (
                      <li key={rIdx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                <a
                  href={`mailto:${activeModalCard.email}`}
                  className="flex items-center gap-1.5 text-[#55CCA2] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>{activeModalCard.email}</span>
                </a>
                <span className="text-[#55CCA2] font-bold">{activeModalCard.term}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
