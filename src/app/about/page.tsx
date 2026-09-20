"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { 
  BookOpen, 
  Heart, 
  Users, 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  ChevronUp 
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
      titleEn: "Project Aintinai & Digital Renaissance",
      titleTa: "ஐந்திணை திட்டம் & நவீன தொழில்நுட்பப் பாய்ச்சல்",
      descriptionEn: "Launched Project Aintinai — an ambitious digital home blending 2,000-year-old classical Sangam landscapes with cutting-edge WebGL, AI, and inclusive student spaces.",
      descriptionTa: "சங்க இலக்கியத்தின் ஐந்திணை நிலங்களை நவீன தொழில்நுட்பத்துடன் இணைத்து உருவான ஐந்திணை இணையதள தொடக்கம்.",
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          {locale === "ta" ? "எங்களைப் பற்றி" : "About the Sangam"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "யாதும் ஊரே யாவரும் கேளீர்" : "To Us All Towns Are Home, Everyone Our Kin"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது தமிழ்ப் பண்பாட்டின் உன்னதங்களை, கலை வடிவங்களை, மற்றும் நட்புணர்வை ஓஹியோ பல்கலைக்கழக வளாகத்தில் வளர்க்கும் முதன்மை மாணவர் அமைப்பாகும்."
            : "The Ohio State University Tamil Sangam is dedicated to celebrating one of the world's oldest continuous languages, literatures, and cultures. We create an inclusive cultural home where tradition meets modern creative expression."}
        </p>
      </div>

      {/* 1. What is a Sangam? Essay Card */}
      <div className="rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-[var(--border-strong)] shadow-2xl mb-16 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-tint)] font-mono text-xs uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Classical Heritage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            {locale === "ta" ? "சங்கம் என்றால் என்ன?" : "What is a Sangam?"}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            In antiquity, a <em>Sangam</em> (சங்கம்) referred to the legendary literary academies and royal assemblies of poets, philosophers, and musicians convened in Madurai and across Tamilakam over two millennia ago. In these gatherings, bards sang of love, heroism, landscapes, justice, and human resilience.
          </p>

          <p className="text-sm text-slate-300 leading-relaxed">
            At The Ohio State University, we carry this spirit forward into the diaspora. Our Sangam is not just a club; it is an intellectual and cultural sanctuary where students gather over warm filter coffee, rehearse dynamic dance choreographies, converse in classical verse and modern dialect, and welcome every Buckeye with open arms.
          </p>
        </div>
      </div>

      {/* 2. Core Pillars & Inclusive Welcome */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="glass-glow-card p-6 rounded-3xl">
          <Users className="w-6 h-6 text-[#f2b705] mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Open to All Buckeyes</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            You do not need to speak Tamil or have roots in South Asia to join. Everyone who enjoys community, dance, food, and culture belongs here.
          </p>
        </div>

        <div className="glass-glow-card p-6 rounded-3xl">
          <Heart className="w-6 h-6 text-[#d6452f] mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aatam, Paatam, Kondatam</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our guiding ethos: energetic dance, heartfelt vocal and instrumental music, and joyful celebration that lifts the entire campus.
          </p>
        </div>

        <div className="glass-glow-card p-6 rounded-3xl">
          <ShieldCheck className="w-6 h-6 text-[#0b7a75] mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Privacy & Respect</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We honor student privacy with strict zero-facial-recognition policies and prompt photo removal guarantees.
          </p>
        </div>
      </div>

      {/* 3. Club Milestone Timeline */}
      <div className="mb-20">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Milestones
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 font-serif">
          {locale === "ta" ? "சங்க வரலாற்றின் மைல்கற்கள்" : "Our Journey Across the Years"}
        </h2>

        <div className="space-y-6">
          {timelineEvents.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
            >
              <div className="sm:col-span-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--accent-tint)]">
                  {item.year}
                </span>
              </div>
              <div className="sm:col-span-10">
                <h4 className="text-base font-bold text-white mb-1">
                  {locale === "ta" ? item.titleTa : item.titleEn}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {locale === "ta" ? item.descriptionTa : item.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Searchable Bilingual FAQ Section */}
      <div id="faq" className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-1">
              Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              {locale === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => {
                    playWoodClick();
                    setExpandedFaq(isExpanded ? null : faq.id);
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-[var(--accent-tint)] transition-colors"
                >
                  <span>{locale === "ta" ? faq.questionTa : faq.questionEn}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--accent-tint)] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
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
