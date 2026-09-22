"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { CLUB_PURPOSE } from "@/data/constitution";
import { 
  BookOpen, 
  Heart, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Globe2,
  Handshake,
  ExternalLink
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
      descriptionEn: "Transitioned from small community rooms to the grand Performance Hall at the Ohio Union, welcoming over 350 students with authentic earthen pot cooking.",
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
      titleEn: "Community Expansion & Signature Milestones",
      titleTa: "மாணவர் சமூக விரிவாக்கம் & புதிய சாதனைகள்",
      descriptionEn: "Reaching over 500 active event attendees, 1,200+ Instagram followers, and a 450+ member student GroupMe connecting undergraduate and graduate Buckeyes.",
      descriptionTa: "500க்கும் மேற்பட்ட மாணவர் பங்கேற்பாளர்கள் மற்றும் விரிவான சமூகக் கூட்டமைப்புடன் வளர்ந்து நிற்கும் சங்கம்.",
    },
  ];

  const partners = [
    {
      name: "Tamil Thalaivas (TT)",
      type: "Student Org Collaborator",
      collaboration: "Co-host of Pattas Tappas Diwali showcase and cultural dance medleys at the Ohio Union.",
    },
    {
      name: "Central Ohio Tamil Community",
      type: "Community Alliance",
      collaboration: "Connecting collegiate students with family networks, festival celebrations, and local mentors in Central Ohio.",
    },
    {
      name: "The Ohio Union & Student Life",
      type: "Campus Venue & Affiliation",
      collaboration: "Hosting our annual gatherings in the Archie Griffin Ballroom and Performance Hall as a registered student org.",
    },
    {
      name: "Local Business Sponsors & Patrons",
      type: "Sponsorship Opportunities",
      collaboration: "Columbus South Asian groceries, restaurants, and alumni patrons supporting our authentic student festival dinners.",
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
      {/* Page Header with High Contrast Typography */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-2">
          {locale === "ta" ? "எங்களைப் பற்றி" : "About the Sangam"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display leading-[1.08] mb-4">
          {locale === "ta" ? "யாதும் ஊரே யாவரும் கேளீர்" : "To Us All Towns Are Home, Everyone Our Kin"}
        </h1>
        <p className="text-base sm:text-lg text-purple-950/85 leading-relaxed font-body font-medium">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது தமிழ்ப் பண்பாட்டின் உன்னதங்களை, கலை வடிவங்களை, மற்றும் நட்புணர்வை ஓஹியோ பல்கலைக்கழக வளாகத்தில் வளர்க்கும் முதன்மை மாணவர் அமைப்பாகும்."
            : "The Ohio State University Tamil Sangam is dedicated to uniting the Tamil diaspora, encouraging language literacy, promoting cross-cultural integration, and fostering lifelong community fellowship on campus."}
        </p>
      </div>

      {/* 1. What is a Sangam? Essay Card */}
      <div className="box-architectural p-8 sm:p-12 border-2 border-[#250d38] shadow-[6px_6px_0px_#4c2472] mb-16 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[#4c2472] font-mono text-xs uppercase tracking-widest font-bold">
            <BookOpen className="w-4 h-4 text-[#55CCA2]" />
            <span>Classical Heritage · சங்க இலக்கிய மரபு</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-[#250d38] font-display leading-tight">
            {locale === "ta" ? "சங்கம் என்றால் என்ன?" : "What is a Sangam?"}
          </h2>

          <p className="text-sm sm:text-base text-purple-950/80 leading-relaxed font-body">
            In antiquity, a <em className="text-[#4c2472] not-italic font-bold">Sangam</em> (சங்கம்) referred to the legendary literary academies and assemblies of poets, philosophers, and musicians convened across Tamilakam over two millennia ago. In these gatherings, bards sang of love, heroism, landscapes, justice, and human resilience.
          </p>

          <p className="text-sm sm:text-base text-purple-950/80 leading-relaxed font-body">
            At The Ohio State University, we carry this spirit forward into the diaspora. Our Sangam is an intellectual and cultural sanctuary where students gather over warm filter coffee, rehearse dynamic dance choreographies, converse in classical verse and modern dialect, and welcome every Buckeye with open arms.
          </p>
        </div>
      </div>

      {/* 2. Official Core Mission & Purpose (The 4 Pillars) */}
      <div className="mb-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold mb-2">
          <Globe2 className="w-4 h-4 text-[#55CCA2]" />
          <span>Constitution & Mandate · அடிப்படை நோக்கங்கள்</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
          {locale === "ta" ? "சங்கத்தின் முதன்மை நோக்கங்கள்" : "Core Mission & Purpose"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLUB_PURPOSE.map((p, idx) => (
            <div key={p.id} className="box-ticket p-6 sm:p-8 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] hover:shadow-[6px_6px_0px_#55CCA2] flex flex-col justify-between transition-all">
              <div>
                <span className="text-xs font-mono text-[#11694c] font-bold uppercase tracking-wider block mb-2">
                  Mandate 0{idx + 1}
                </span>
                <h3 className="text-xl font-bold text-[#250d38] mb-2 font-display">
                  {locale === "ta" ? p.titleTa : p.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed font-body">
                  {locale === "ta" ? p.descriptionTa : p.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Timeline & Campus Milestones */}
      <div className="mb-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold mb-2">
          <Heart className="w-4 h-4 text-[#55CCA2]" />
          <span>Milestones · வரலாறு</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
          {locale === "ta" ? "வளர்ச்சிப் படிகள்" : "Our Journey at Ohio State"}
        </h2>

        <div className="space-y-4">
          {timelineEvents.map((evt, idx) => (
            <div
              key={idx}
              className="box-architectural p-6 sm:p-8 border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] hover:shadow-[5px_5px_0px_#55CCA2] flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all"
            >
              <span className="text-3xl sm:text-4xl font-extrabold font-display text-[#4c2472] shrink-0 font-mono">
                {evt.year}
              </span>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#250d38] font-display">
                  {locale === "ta" ? evt.titleTa : evt.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed font-body">
                  {locale === "ta" ? evt.descriptionTa : evt.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Campus Alliances & Community Partners */}
      <div className="mb-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold mb-2">
          <Handshake className="w-4 h-4 text-[#55CCA2]" />
          <span>Alliances & Support · கூட்டாண்மை</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
          {locale === "ta" ? "கூட்டமைப்புகள் & ஆதரவாளர்கள்" : "Campus Alliances & Community Partners"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((pt, idx) => (
            <div key={idx} className="box-architectural p-6 sm:p-8 border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472] transition-all">
              <span className="box-badge text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3 bg-[#55CCA2] text-[#1b0d28] border border-[#1b0d28]">
                {pt.type}
              </span>
              <h3 className="text-xl font-bold text-[#250d38] mb-2 font-display">
                {pt.name}
              </h3>
              <p className="text-xs sm:text-sm text-purple-950/80 leading-relaxed font-body">
                {pt.collaboration}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Frequently Asked Questions (Accordion) */}
      <div id="faq" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-1">
              FAQ · அடிக்கடி கேட்கப்படும் கேள்விகள்
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] font-display leading-tight">
              {locale === "ta" ? "பொதுவான வினாக்கள்" : "Frequently Asked Questions"}
            </h2>
          </div>

          {/* Quick FAQ Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-600 absolute left-3 top-3.5" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] text-[#250d38] placeholder-purple-400 text-xs outline-none focus:border-[#55CCA2] font-body"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] hover:shadow-[4px_4px_0px_#55CCA2] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    playWoodClick();
                    setExpandedFaq(isExpanded ? null : faq.id);
                  }}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-[#250d38] font-display">
                    {locale === "ta" ? faq.questionTa : faq.questionEn}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#4c2472] shrink-0 font-bold" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-purple-500 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-purple-950/80 leading-relaxed border-t-2 border-purple-100 font-body">
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
