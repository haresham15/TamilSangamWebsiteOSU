"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { CLUB_PURPOSE } from "@/data/constitution";
import { GopuramZScroll } from "@/components/about/GopuramZScroll";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";
import { CulturalGlossaryTerm } from "@/components/ui/CulturalGlossaryTerm";
import { HeritageTextureOverlay } from "@/components/ui/HeritageTextureOverlay";
import { 
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
      name: "Telugu Tamasha at OSU",
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
      <div
        className="relative w-full overflow-hidden bg-[#fffdfa]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
        }}
      >
        <GopuramZScroll />
        {/* Bottom overlay gradient blending agent */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#fffdfa] via-[#fffdfa]/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* The section immediately below the Hero: negative margin pull-up */}
      <div className="relative z-20 -mt-32 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 overflow-hidden vignette-ambient-warm">
        {/* Tactile Sandstone Texture Overlay */}
        <HeritageTextureOverlay variant="sandstone" opacity={0.02} />

        {/* Structural Tamil Background Watermarks */}
        <WatermarkGlyph text="தமிழ்" opacity={0.04} align="right" theme="light" />
        <WatermarkGlyph text="நோக்கம்" opacity={0.032} align="left" theme="light" className="top-[60%]" />

        {/* Page Header */}
        <div className="max-w-3xl mb-16 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display leading-[1.08] mb-4">
            {locale === "ta" ? "யாதும் ஊரே யாவரும் கேளீர்" : "To Us All Towns Are Home, Everyone Our Kin"}
          </h1>
          <p className="text-base sm:text-lg text-[#250d38] font-medium leading-relaxed font-body">
            {locale === "ta"
              ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது மாணவர்கள் அனைவரும் ஒன்றிணைந்து தமிழ் பண்பாட்டை ரசிக்கவும், நல்ல உணவை ருசிக்கவும், மற்றும் நட்பை வளர்க்கவும் வழிகாட்டும் திறந்த மனப்பான்மை கொண்ட மாணவர் அமைப்பாகும்."
              : "The Ohio State University Tamil Sangam is an open, welcoming student-run cultural hub. We bring people of all backgrounds, cultures, and languages together to celebrate Tamil culture, eat incredible food, hang out, and build genuine collegiate friendships."}
          </p>
        </div>

        {/* 1. What is a Sangam? Essay Card (Cultural Archway with Filigree Brass & Kanjeevaram Sheen) */}
        <div className="rounded-t-[36px] rounded-b-md p-8 sm:p-12 border border-[#B5A642]/40 bg-white shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_35px_rgba(255,184,77,0.2)] hover:border-[#FFB84D] transition-all duration-300 mb-16 relative z-10 overflow-hidden">
          {/* Subtle Tactile Kanjeevaram Silk Sheen */}
          <HeritageTextureOverlay variant="kanjeevaram" opacity={0.025} />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="flex items-center gap-2 font-mono text-xs text-[#11694c] font-bold">
              <span>EST. 2021</span>
              <span>·</span>
              <span>COLUMBUS, OHIO</span>
              <span>·</span>
              <CulturalGlossaryTerm termKey="yaadhum-oore" className="text-[#87500e]">
                PURANANURU 192
              </CulturalGlossaryTerm>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-[#250d38] font-display leading-tight">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம் என்பது என்ன?" : "What is Tamil Sangam at OSU?"}
            </h2>

            <p className="text-sm sm:text-base text-[#250d38] leading-relaxed font-body">
              In Tamil, the word{" "}
              <CulturalGlossaryTerm termKey="sangam" className="text-[#4c2472] font-bold">
                Sangam
              </CulturalGlossaryTerm>{" "}
              (சங்கம்) represents an ancient assembly, union, or community gathering where thinkers, poets, and friends gather as equals. At The Ohio State University, our Sangam is an active, open, and casual student hub for Tamil Buckeyes and everyone in our campus community.
            </p>

            <p className="text-sm sm:text-base text-[#250d38] leading-relaxed font-body">
              Our events are relaxed and social — whether it&apos;s chilling on the South Oval with snacks, savoring hot kothu parotta at street food nights, jamming to film music, or celebrating at our annual Diwali party. You don&apos;t need to speak Tamil, and you don&apos;t need any specific cultural background: students of all languages, majors, and backgrounds are always welcome to hang out and find a home away from home!
            </p>
          </div>
        </div>

        {/* 2. Official Core Mission & Purpose (The 4 Pillars) */}
        <div className="mb-20 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
            {locale === "ta" ? "சங்கத்தின் முதன்மை நோக்கங்கள்" : "Core Mission & Purpose"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CLUB_PURPOSE.map((p) => (
              <div
                key={p.id}
                className="rounded-t-[28px] rounded-b-md p-6 sm:p-8 bg-white border border-[#B5A642]/35 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_30px_rgba(255,184,77,0.2)] hover:border-[#FFB84D] flex flex-col justify-between transition-all duration-300"
              >
                <div>
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
        <div className="mb-20 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
            {locale === "ta" ? "வளர்ச்சிப் படிகள்" : "Our Journey at Ohio State"}
          </h2>

          <div className="space-y-4">
            {timelineEvents.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-t-[24px] rounded-b-md p-6 sm:p-8 bg-white border border-[#B5A642]/35 shadow-[3px_3px_0px_#4c2472] hover:shadow-[0_0_30px_rgba(255,184,77,0.2)] hover:border-[#FFB84D] flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300"
              >
                <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#87500e]">
                    {evt.year}
                  </span>
                </div>
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
        <div className="mb-20 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] mb-8 font-display leading-tight">
            {locale === "ta" ? "கூட்டமைப்புகள் & ஆதரவாளர்கள்" : "Campus Alliances & Community Partners"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((pt, idx) => (
              <div
                key={idx}
                className="rounded-t-[28px] rounded-b-md p-6 sm:p-8 bg-white border border-[#B5A642]/35 shadow-[4px_4px_0px_#4c2472] hover:shadow-[0_0_30px_rgba(255,184,77,0.2)] hover:border-[#FFB84D] transition-all duration-300"
              >
                <span className="text-xs font-mono font-bold text-[#11694c] uppercase tracking-wider block mb-2">
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
        <div id="faq" className="scroll-mt-32 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#250d38] font-display leading-tight">
                {locale === "ta" ? "பொதுவான வினாக்கள்" : "Frequently Asked Questions"}
              </h2>
            </div>

            {/* Quick FAQ Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#87500e] absolute left-3 top-3.5" />
              <input
                id="faq-search-input"
                name="faq_search"
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions..."
                aria-label="Search frequently asked questions"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#B5A642]/40 rounded-t-lg rounded-b-md shadow-[2px_2px_0px_#4c2472] text-[#250d38] placeholder-purple-900/40 text-xs font-mono outline-none focus:border-[#FFB84D] focus:shadow-[0_0_20px_rgba(255,184,77,0.2)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-t-[20px] rounded-b-md bg-white border border-[#B5A642]/35 shadow-[2px_2px_0px_#4c2472] hover:shadow-[0_0_25px_rgba(255,184,77,0.18)] hover:border-[#FFB84D] overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    id={`faq-question-${faq.id}`}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${faq.id}`}
                    onClick={() => {
                      playWoodClick();
                      setExpandedFaq(isExpanded ? null : faq.id);
                    }}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] cursor-pointer hover:bg-purple-50/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#250d38] font-display">
                      {locale === "ta" ? faq.questionTa : faq.questionEn}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#4c2472] shrink-0 font-bold" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-question-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t-2 border-purple-100"
                      >
                        <div className="px-5 pb-5 pt-3 text-xs sm:text-sm text-[#250d38] leading-relaxed font-body">
                          {locale === "ta" ? faq.answerTa : faq.answerEn}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

}
