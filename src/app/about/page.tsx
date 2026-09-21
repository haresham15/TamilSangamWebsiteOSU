"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { CLUB_PURPOSE, CLUB_ACTIVITIES, MEMBERSHIP_GOVERNANCE } from "@/data/constitution";
import { 
  BookOpen, 
  Heart, 
  Users, 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Award,
  Globe2,
  CalendarCheck,
  Scale
} from "lucide-react";

export default function AboutPage() {
  const { locale } = useLocale();
  const { playWoodClick } = useAudio();

  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-01");

  const timelineEvents = [
    {
      year: "2021",
      titleEn: "Re-imagining Tamil Sangam on Campus",
      titleTa: "வளாகத்தில் தமிழ் சங்கத்தின் மறுதொடக்கம்",
      descriptionEn: "A passionate group of undergraduate and graduate students re-ignited Tamil Sangam at OSU to provide a cultural sanctuary and home away from home.",
      descriptionTa: "ஓஹியோ வளாகத்தில் தமிழ்க் கலாச்சாரத்தையும் மாணவர் நட்பையும் பேணிப் பாதுகாக்க சங்கம் மீண்டும் புத்துயிர் பெற்றது.",
    },
    {
      year: "2023",
      titleEn: "Inaugural Powerhouse Pongal in Ohio Union",
      titleTa: "முதல் பவர்ஹவுஸ் பொங்கல் பெருவிழா",
      descriptionEn: "Transitioned from small community rooms to the grand Performance Hall at the Ohio Union, welcoming over 350 students with earthen pot cooking.",
      descriptionTa: "350க்கும் மேற்பட்ட மாணவர்களுடன் ஓஹியோ யூனியனில் மண்பானை பொங்கல் திருவிழா கோலாகலமாகத் தொடங்கியது.",
    },
    {
      year: "2024",
      titleEn: "Parai Attam & Folk Ensembles Founded",
      titleTa: "பறை ஆட்டக் கலைக் குழு உருவாக்கம்",
      descriptionEn: "Established the campus's first student-run folk percussion ensemble, bringing thunderous traditional parai rhythms to collegiate showcases across the Midwest.",
      descriptionTa: "பாரம்பரிய நாட்டுப்புற இசைக்கலைகளை முன்னிறுத்தி வளாகத்தின் முதல் பறை ஆட்டக் குழு உருவானது.",
    },
    {
      year: "2026",
      titleEn: "Project Aintinai & Community Expansion",
      titleTa: "ஐந்திணை திட்டம் & மாணவர் சமூக விரிவாக்கம்",
      descriptionEn: "Unveiled Project Aintinai — an open, accessible digital home bridging 2,000-year-old classical Sangam landscapes with modern student life, interactive culture tools, and community archives.",
      descriptionTa: "சங்க இலக்கியத்தின் ஐந்திணை நிலங்களை நவீன மாணவர் வாழ்வியலோடும் கலைகளோடும் இணைக்கும் இணையதளம்.",
    },
  ];

  const filteredFaqs = FAQS.filter((f) => {
    const q = faqSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      f.questionEn.toLowerCase().includes(q) ||
      f.answerEn.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* Page Header with Strict Typographic Modular Scale */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          {locale === "ta" ? "எங்களைப் பற்றி" : "About the Sangam"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-display leading-[1.08] mb-4">
          {locale === "ta" ? "யாதும் ஊரே யாவரும் கேளீர்" : "To Us All Towns Are Home, Everyone Our Kin"}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது தமிழ்ப் பண்பாட்டின் உன்னதங்களை, கலை வடிவங்களை, மற்றும் நட்புணர்வை ஓஹியோ பல்கலைக்கழக வளாகத்தில் வளர்க்கும் முதன்மை மாணவர் அமைப்பாகும்."
            : "The Ohio State University Tamil Sangam is dedicated to uniting the Tamil diaspora, encouraging language literacy, promoting cross-cultural integration, and raising awareness and philanthropic support for vital causes."}
        </p>
      </div>

      {/* 1. What is a Sangam? Essay Card */}
      <div className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-[var(--border-strong)] shadow-2xl mb-16 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-tint)] font-mono text-xs uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Classical Heritage · சங்க இலக்கிய மரபு</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display leading-tight">
            {locale === "ta" ? "சங்கம் என்றால் என்ன?" : "What is a Sangam?"}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
            In antiquity, a <em className="text-[var(--accent-tint)] not-italic font-semibold">Sangam</em> (சங்கம்) referred to the legendary literary academies and royal assemblies of poets, philosophers, and musicians convened in Madurai and across Tamilakam over two millennia ago. In these gatherings, bards sang of love, heroism, landscapes, justice, and human resilience.
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
            At The Ohio State University, we carry this spirit forward into the diaspora. Our Sangam is an intellectual and cultural sanctuary where students gather over warm filter coffee, rehearse dynamic dance choreographies, converse in classical verse and modern dialect, and welcome every Buckeye with open arms.
          </p>
        </div>
      </div>

      {/* 2. Official Core Mission & Purpose (The 4 Pillars) */}
      <div className="mb-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
          <Globe2 className="w-4 h-4" />
          <span>Constitution & Mandate · அடிப்படை நோக்கங்கள்</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-8 font-display leading-tight">
          {locale === "ta" ? "சங்கத்தின் முதன்மை நோக்கங்கள்" : "Core Mission & Purpose"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLUB_PURPOSE.map((p, idx) => (
            <div key={p.id} className="glass-glow-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[var(--accent-tint)] uppercase tracking-wider block mb-2">
                  Mandate 0{idx + 1}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 font-display">
                  {locale === "ta" ? p.titleTa : p.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  {locale === "ta" ? p.descriptionTa : p.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Official Activities & Community Engagement */}
      <div className="mb-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-2">
          <CalendarCheck className="w-4 h-4" />
          <span>Programs & Operations · சங்கத்தின் செயல்பாடுகள்</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-8 font-display leading-tight">
          {locale === "ta" ? "வளாக நிகழ்வுகள் & செயல்பாடுகள்" : "Key Activities & Programming"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLUB_ACTIVITIES.map((act, idx) => (
            <div key={act.id} className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">
                  Activity 0{idx + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-display">
                  {locale === "ta" ? act.titleTa : act.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  {locale === "ta" ? act.descriptionTa : act.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Governance, Non-Discrimination & Safety Policy */}
      <div className="mb-20 rounded-3xl glass-panel-elevated p-8 sm:p-10 border border-[var(--color-temple-bronze)]/30 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 mb-2">
          <Scale className="w-4 h-4" />
          <span>Safety & Constitutional Compliance · சட்ட நெறிமுறைகள்</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
          {locale === "ta" ? "பாதுகாப்பு, பாகுபாடின்மை & பல்கலைக்கழக கொள்கை 1.15" : "Non-Discrimination Policy & University Policy 1.15"}
        </h2>

        <div className="space-y-4 max-w-4xl text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
          <p>
            {MEMBERSHIP_GOVERNANCE.nonDiscriminationPolicy}
          </p>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4">
            <span className="text-xs font-mono font-semibold text-[var(--accent-tint)] uppercase tracking-wider block mb-1">
              Sexual Misconduct & Harassment Zero-Tolerance (Policy 1.15)
            </span>
            <p className="text-slate-200">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.policy115ComplianceTa : MEMBERSHIP_GOVERNANCE.policy115ComplianceEn}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Membership Rules & Voting Rights Qualifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        <div className="glass-glow-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <Users className="w-6 h-6 text-[var(--color-temple-bronze)] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 font-display">
              {locale === "ta" ? "உறுப்பினர் சேர்க்கை & 90% விதி" : "Membership Demographics (90% Student Body)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body mb-3">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.studentQuotaTa : MEMBERSHIP_GOVERNANCE.studentQuotaEn}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.openStatusTa : MEMBERSHIP_GOVERNANCE.openStatusEn} {MEMBERSHIP_GOVERNANCE.communityPolicyEn}
            </p>
          </div>
        </div>

        <div className="glass-glow-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <Award className="w-6 h-6 text-[var(--accent-tint)] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 font-display">
              {locale === "ta" ? "வாக்குரிமை & நிர்வாக வழிகாட்டல்" : "Voting Rights & Executive Shadowing"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--accent-tint)] font-semibold leading-relaxed font-body mb-3">
              {locale === "ta" ? MEMBERSHIP_GOVERNANCE.votingRequirementTa : MEMBERSHIP_GOVERNANCE.votingRequirementEn}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Regular participation empowers members to steer festival programming, cast ballots for officer seats, and learn event directorship firsthand.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Club Milestone Timeline */}
      <div className="mb-20">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Milestones · மைல்கற்கள்
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-8 font-display leading-tight">
          {locale === "ta" ? "சங்க வரலாற்றின் மைல்கற்கள்" : "Our Journey Across the Years"}
        </h2>

        <div className="space-y-6">
          {timelineEvents.map((evt, idx) => (
            <div
              key={idx}
              className="glass-glow-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-6 sm:items-baseline"
            >
              <span className="text-3xl sm:text-4xl font-extrabold font-display text-[var(--accent-tint)] shrink-0">
                {evt.year}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  {locale === "ta" ? evt.titleTa : evt.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Frequently Asked Questions (Accordion) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-1">
              FAQ · அடிக்கடி கேட்கப்படும் கேள்விகள்
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-display leading-tight">
              {locale === "ta" ? "பொதுவான வினாக்கள்" : "Frequently Asked Questions"}
            </h2>
          </div>

          {/* Quick FAQ Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-body"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="glass-glow-card rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    playWoodClick();
                    setExpandedFaq(isExpanded ? null : faq.id);
                  }}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-white font-display">
                    {locale === "ta" ? faq.questionTa : faq.questionEn}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--accent-tint)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 font-body">
                    {locale === "ta" ? faq.answerTa : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
