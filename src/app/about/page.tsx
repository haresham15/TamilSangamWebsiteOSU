"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { CLUB_PURPOSE } from "@/data/constitution";
import { GopuramZScroll } from "@/components/about/GopuramZScroll";
import { 
  BookOpen, 
  Heart, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Globe2,
  Handshake
} from "lucide-react";

export default function AboutPage() {
  const { locale } = useLocale();
  const { playWoodClick } = useAudio();

  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-01");

  const timelineEvents = [
    {
      year: "2021",
      titleEn: "Student Organization Founded",
      titleTa: "மாணவர் அமைப்பு தொடக்கம்",
      descriptionEn: "Ohio State students established the organization to provide a welcoming community space for Tamil culture, social gatherings, and student support on campus.",
      descriptionTa: "வளாகத்தில் தமிழ் மாணவர்கள் ஒன்றிணைந்து பழகவும், பண்பாட்டைப் பகிர்ந்து கொள்ளவும் சங்கம் தொடங்கப்பட்டது.",
    },
    {
      year: "2023",
      titleEn: "Annual Cultural Celebrations",
      titleTa: "ஆண்டு கலாச்சார விழாக்கள்",
      descriptionEn: "Began hosting annual gatherings and dinners at the Ohio Union, bringing students and friends together for music, food, and student performances.",
      descriptionTa: "மாணவர் கலை நிகழ்ச்சிகள் மற்றும் உணவுடன் கூடிய பெருவிழாக்கள் ஓஹியோ யூனியனில் தொடங்கப்பட்டன.",
    },
    {
      year: "2024",
      titleEn: "Collaborative Campus Events",
      titleTa: "இணைந்த வளாக நிகழ்வுகள்",
      descriptionEn: "Expanded collaborations with fellow multicultural student organizations, co-hosting community socials and cultural celebrations across campus.",
      descriptionTa: "பிற கலாச்சார மாணவர் அமைப்புகளுடன் இணைந்து புதிய நிகழ்வுகள் முன்னெடுக்கப்பட்டன.",
    },
    {
      year: "2025–2026",
      titleEn: "Ongoing Socials & Campus Fellowship",
      titleTa: "தொடர் சந்திப்புகள் & மாணவர் தோழமை",
      descriptionEn: "Hosting regular picnics, street food dinners, card games, and festive celebrations open to all Ohio State students.",
      descriptionTa: "புல்வெளி சந்திப்புகள், தெருவோர உணவு மாலைகள், மற்றும் கொண்டாட்டங்கள் வழியே தொடர்ந்து செயல்படும் மாணவர் சங்கம்.",
    },
  ];

  const partners = [
    {
      name: "Telugu Thallulu (TT)",
      type: "Student Org Collaborator",
      collaboration: "Collaborating on campus events such as the Namma Jathara spring carnival.",
    },
    {
      name: "The Ohio Union & Student Life",
      type: "Campus Affiliation",
      collaboration: "Hosting our general body meetings, dinners, and events as a registered student organization.",
    },
    {
      name: "Central Ohio Community",
      type: "Community Network",
      collaboration: "Connecting students with local festivals, community gatherings, and alumni in Columbus.",
    },
    {
      name: "Columbus Local Dining",
      type: "Local Catering",
      collaboration: "Sourcing South Indian catering, dosas, and snacks for club events from local Columbus kitchens.",
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
    <div className="w-full text-left font-body bg-[#fffdfa]">
      {/* Cinematic 3D Gopuram Z-Axis Mission Fly-Through */}
      <GopuramZScroll />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Page Header with High Contrast Typography */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-2">
          {locale === "ta" ? "எங்களைப் பற்றி" : "About the Sangam"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display leading-[1.08] mb-4">
          {locale === "ta" ? "யாதும் ஊரே யாவரும் கேளீர்" : "To Us All Towns Are Home, Everyone Our Kin"}
        </h1>
        <p className="text-base sm:text-lg text-[#250d38] font-medium leading-relaxed font-body">
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது மாணவர்கள் அனைவரும் ஒன்றிணைந்து தமிழ் பண்பாட்டை ரசிக்கவும், நல்ல உணவை ருசிக்கவும், மற்றும் நட்பை வளர்க்கவும் வழிகாட்டும் திறந்த மனப்பான்மை கொண்ட மாணவர் அமைப்பாகும்."
            : "The Ohio State University Tamil Sangam is an open, welcoming student-run cultural hub. We bring people of all backgrounds, cultures, and languages together to celebrate Tamil culture, eat incredible food, hang out, and build genuine collegiate friendships."}
        </p>
      </div>

      {/* 1. What is a Sangam? Essay Card */}
      <div className="box-architectural p-8 sm:p-12 border-2 border-[#250d38] shadow-[6px_6px_0px_#4c2472] mb-16 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[#4c2472] font-mono text-xs uppercase tracking-widest font-bold">
            <BookOpen className="w-4 h-4 text-[#55CCA2]" />
            <span>Community & Fellowship · மக்கள் சங்கமம்</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-[#250d38] font-display leading-tight">
            {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம் என்பது என்ன?" : "What is Tamil Sangam at OSU?"}
          </h2>

          <p className="text-sm sm:text-base text-[#250d38] leading-relaxed font-body">
            In Tamil, the word <em className="text-[#4c2472] not-italic font-bold">Sangam</em> (சங்கம்) simply means an assembly, union, or community gathering where people come together. At The Ohio State University, our Sangam is an active, open, and casual student hub for Tamil Buckeyes and everyone in our campus community.
          </p>

          <p className="text-sm sm:text-base text-[#250d38] leading-relaxed font-body">
            Our events are relaxed and social — whether it&apos;s chilling on the South Oval with snacks, savoring hot kothu parotta at street food nights, jamming to film music, or celebrating at our annual Diwali party. You don&apos;t need to speak Tamil, and you don&apos;t need any specific cultural background: students of all languages, majors, and backgrounds are always welcome to hang out and find a home away from home!
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
                <p className="text-xs sm:text-sm text-[#250d38] leading-relaxed font-body">
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
                <p className="text-xs sm:text-sm text-[#250d38] leading-relaxed font-body">
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
              <p className="text-xs sm:text-sm text-[#250d38] leading-relaxed font-body">
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
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#250d38] leading-relaxed border-t-2 border-purple-100 font-body">
                    {locale === "ta" ? faq.answerTa : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
}
