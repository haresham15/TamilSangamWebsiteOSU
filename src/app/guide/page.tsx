"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS } from "@/data/faq";
import { KnowledgeItem } from "@/data/knowledgeBase";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  ShieldCheck,
  Music,
  PlusCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function UserGuideAndFaqPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick, playBell } = useAudio();

  // Active guide section tab
  const [activeTab, setActiveTab] = useState<"guide" | "faq" | "knowledge">("guide");

  // FAQ search & filter state
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-01");

  // Knowledge base state
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [kbSearch, setKbSearch] = useState("");
  const [isAddingKb, setIsAddingKb] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<KnowledgeItem["category"]>("Events");
  const [newContent, setNewContent] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [kbStatus, setKbStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Fetch live knowledge base from API
  const refreshKnowledgeBase = async () => {
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setKnowledgeList(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge base:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialKb() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.items)) {
          setKnowledgeList(data.items);
        }
      } catch (err) {
        console.error("Failed to fetch knowledge base:", err);
      }
    }
    loadInitialKb();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setKbStatus("saving");
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: newTitle.trim(),
          category: newCategory,
          contentEn: newContent.trim(),
          keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          route: "/guide",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKbStatus("success");
        playBell(880);
        setNewTitle("");
        setNewContent("");
        setNewKeywords("");
        setIsAddingKb(false);
        refreshKnowledgeBase();
        setTimeout(() => setKbStatus("idle"), 3000);
      } else {
        setKbStatus("error");
      }
    } catch (err) {
      console.error("Failed to add knowledge entry:", err);
      setKbStatus("error");
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry from the knowledge base?")) return;
    try {
      const res = await fetch(`/api/knowledge?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        playWoodClick();
        refreshKnowledgeBase();
      } else {
        alert(data.error || "Could not delete entry");
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Filtered FAQs
  const categories = ["All", "General", "Membership", "Events", "Performances", "Governance"];
  const filteredFaqs = FAQS.filter((f) => {
    const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
    const q = faqSearch.toLowerCase().trim();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (f.questionEn.toLowerCase().includes(q) ||
        f.answerEn.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q))
    );
  });

  // Filtered Knowledge Base items
  const filteredKb = knowledgeList.filter((item) => {
    const q = kbSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.titleEn.toLowerCase().includes(q) ||
      item.contentEn.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left font-body">
      {/* 1. Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-[#4c2472] font-bold block mb-2">
          The Ohio State University · Student Resources & Operations
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#250d38] tracking-tight font-display mb-4" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
          {locale === "ta" ? "பயனர் வழிகாட்டி & கேள்வி-பதில்" : "User Guide & FAQ"}
        </h1>
        <p className="text-sm sm:text-base text-[#250d38] font-medium leading-relaxed font-body" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
          {locale === "ta"
            ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் செயல்பாடுகள், நிகழ்வுகள், மற்றும் வழிகாட்டுதல்கள் பற்றிய விரிவான தகவல்கள். எமது AI வழிகாட்டி நண்பாவும் (Nanba) இந்த அறிவுத் தளத்தைக் கொண்டே பதிலளிக்கிறது."
            : "Everything you need to know about participating in OSU Tamil Sangam — from membership and event logistics to voting rights and our Nanba-powered knowledge engine."}
        </p>
      </div>

      {/* 2. Architectural Console Tabs */}
      <div className="box-tab-strip flex flex-wrap items-center justify-center gap-2 p-1.5 max-w-2xl mx-auto mb-12">
        {[
          { id: "guide" as const, label: locale === "ta" ? "01. பயனர் வழிகாட்டி (Guide)" : "01. Student User Guide" },
          { id: "faq" as const, label: locale === "ta" ? "02. அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)" : "02. Searchable FAQ" },
          { id: "knowledge" as const, label: locale === "ta" ? "03. அறிவுத் தளம் (Knowledge Base)" : "03. Knowledge Base Manager" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playWoodClick();
              setActiveTab(tab.id);
            }}
            className={`box-tab-item min-h-[44px] px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-[border-color,background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 active:translate-x-[1px] active:translate-y-[1px] ${
              activeTab === tab.id
                ? "box-tab-item-active"
                : "text-purple-900/70 hover:text-[#250d38]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDENT USER GUIDE */}
      {/* ======================================================== */}
      {activeTab === "guide" && (
        <div className="space-y-12">
          {/* Chapter 1: Joining & Membership */}
          <div className="p-6 sm:p-8 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#11694c] font-bold uppercase tracking-wider mb-2">
              <Users className="w-4 h-4 text-[#55CCA2]" />
              <span>Chapter 01 · Membership & Getting Started</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#250d38] font-display mb-4">
              Joining the Club is 100% Free
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[#250d38] leading-relaxed font-body">
              <p>
                <strong>No Dues or Hidden Fees:</strong> General membership in OSU Tamil Sangam is completely free for all Ohio State students. You do not need to pay dues to attend our meetings, lawn kickbacks, street food nights, or general workshops.
              </p>
              <p>
                <strong>Open to All Languages & Backgrounds:</strong> You do not need to speak Tamil or have a specific cultural background to be a member. Many active members speak English, Telugu, Hindi, or other languages and simply enjoy the community, great food, music, and casual hangouts.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/join"
                  onClick={playClick}
                  className="px-4 py-2 min-h-[44px] btn-sangam-mint text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2"
                >
                  <span>Fill Membership Form →</span>
                </Link>
                <a
                  href="#stay-in-sangam"
                  onClick={playWoodClick}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center border-2 border-[#250d38] bg-white text-xs font-mono font-bold uppercase tracking-wider text-[#250d38] hover:bg-purple-50 shadow-[2px_2px_0px_#4c2472] active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 transition-[background-color,box-shadow,transform] duration-150"
                >
                  Join Email Loop in Footer ↓
                </a>
              </div>
            </div>
          </div>

          {/* Chapter 2: Attending Events */}
          <div className="p-6 sm:p-8 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#11694c] font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-[#55CCA2]" />
              <span>Chapter 02 · Events, Venues & Attire</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#250d38] font-display mb-4">
              Campus Events & What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#250d38]">
              <div className="p-4 bg-purple-50/70 border border-[#250d38]">
                <h3 className="font-bold text-[#250d38] font-display text-base mb-1">
                  Casual Hangouts & Food Nights
                </h3>
                <p className="leading-relaxed">
                  Events like our <em>South Oval Berry Picnic</em> and <em>Streetside Sapad Night</em> are relaxed kickbacks. Dress in everyday casual campus clothes, bring your friends, grab a plate, and enjoy board games or music.
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-[#250d38]">
                <h3 className="font-bold text-[#250d38] font-display text-base mb-1">
                  Cultural Carnivals & Festive Showcases
                </h3>
                <p className="leading-relaxed">
                  Collaborative events like <em>Namma Jathara</em> feature outdoor challenges, music circles, food stalls, and festive celebrations on campus plazas. Open to all students with free admission!
                </p>
              </div>
            </div>
          </div>

          {/* Chapter 3: Creative Tracks */}
          <div className="p-6 sm:p-8 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#11694c] font-bold uppercase tracking-wider mb-2">
              <Music className="w-4 h-4 text-[#55CCA2]" />
              <span>Chapter 03 · Creative Tracks: Dance, Music & Media</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#250d38] font-display mb-4">
              Get Involved in Performance & Production
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[#250d38] leading-relaxed">
              <p>
                <strong>Aatam (Dance):</strong> We host beginner-friendly and performance choreography rehearsals for cinematic Kuthu, fusion, and festival routines. No prior dance experience is required!
              </p>
              <p>
                <strong>Paatam (Music):</strong> Acoustic guitarists, singers, keyboardists, and rhythm players can participate in casual campus jams or perform at our showcase dinners.
              </p>
              <p>
                <strong>Media & Operations:</strong> Interested in photography, graphic design, social media, or stage lighting? Our Subcommittee Council welcomes students eager to learn hands-on event production.
              </p>
            </div>
          </div>

          {/* Chapter 4: Governance & Voting Rights */}
          <div className="p-6 sm:p-8 bg-white border-2 border-[#250d38] shadow-[4px_4px_0px_#4c2472]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#11694c] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#55CCA2]" />
              <span>Chapter 04 · Voting Rights & Leadership Pathways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#250d38] font-display mb-4">
              Constitutional Voting & Board Shadowing
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[#250d38] leading-relaxed">
              <p>
                To qualify for active voting rights in officer elections or to qualify for Executive Board shadowing, members must meet the constitutional threshold:
              </p>
              <div className="p-4 bg-emerald-50 border-2 border-[#55CCA2] font-mono text-xs text-[#0e4835] font-bold">
                [CONSTITUTIONAL RULE]: Attend at least TWO general body meetings and TWO official club events per academic semester. At least 90% of voting members must be current OSU students.
              </div>
              <p>
                Executive Board applications open every spring semester. Active members who have participated throughout the year are eligible to run for leadership offices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INTERACTIVE SEARCHABLE FAQ */}
      {/* ======================================================== */}
      {activeTab === "faq" && (
        <div>
          {/* Search & Category Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-purple-900/50 absolute left-3.5 top-3.5" />
              <input
                id="guide-faq-search-input"
                name="faq_search"
                type="text"
                placeholder="Search FAQs (e.g. dues, language, diwali, voting, food)..."
                aria-label="Search FAQs"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#250d38] text-sm text-[#250d38] placeholder-purple-900/40 focus:outline-none focus:border-[#55CCA2] shadow-[3px_3px_0px_#4c2472]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`min-h-[40px] px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-[background-color,border-color,color,box-shadow] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-1 ${
                    selectedCategory === cat
                      ? "bg-[#250d38] text-[#55CCA2] border-2 border-[#55CCA2] shadow-[2px_2px_0px_#55CCA2]"
                      : "bg-white text-purple-900/70 border-2 border-[#250d38] hover:bg-purple-50 shadow-[2px_2px_0px_#4c2472]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white border-2 border-[#250d38]">
                <p className="text-sm font-mono text-purple-900/60 mb-2">No matching questions found.</p>
                <p className="text-xs text-[#250d38]">
                  Try asking our friendly bot <strong>Nanba (நண்பா)</strong> directly using the floating button at the bottom right!
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border-2 border-[#250d38] bg-white shadow-[3px_3px_0px_#4c2472] overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        playWoodClick();
                        setExpandedFaqId(isOpen ? null : faq.id);
                      }}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      className="w-full min-h-[52px] p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-purple-50/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-purple-100 border border-purple-300 text-[10px] font-mono text-[#4c2472] font-bold uppercase shrink-0">
                          {faq.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#250d38] font-display" {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>
                          {locale === "ta" ? faq.questionTa : faq.questionEn}
                        </h3>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#4c2472] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-purple-900/60 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${faq.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="px-4 sm:px-5 pb-5 pt-1 border-t border-purple-100 text-xs sm:text-sm text-purple-950/85 leading-relaxed overflow-hidden"
                        >
                          <p {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}>{locale === "ta" ? faq.answerTa : faq.answerEn}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KNOWLEDGE BASE MANAGER & EDITOR */}
      {/* ======================================================== */}
      {activeTab === "knowledge" && (
        <div>
          <div className="p-6 bg-[#250d38] border-2 border-[#55CCA2] shadow-[6px_6px_0px_#55CCA2] mb-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#55CCA2] font-bold block mb-1">
                  [BOUNDED AI GROUND TRUTH ENGINE]
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Editable Website Knowledge Base
                </h2>
                <p className="text-xs text-purple-200/90 mt-1 max-w-2xl">
                  Every response generated by our AI bot Nanba (நண்பா) is strictly verified against the entries below. You can add new club facts, event updates, or custom guidelines, which are immediately indexed!
                </p>
              </div>

              <button
                onClick={() => {
                  playClick();
                  setIsAddingKb(!isAddingKb);
                }}
                className="px-4 py-2.5 min-h-[44px] btn-sangam-mint text-xs font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2"
              >
                <PlusCircle className="w-4 h-4 text-[#250d38]" />
                <span>{isAddingKb ? "Close Form" : "Add Knowledge Fact"}</span>
              </button>
            </div>
          </div>

          {/* Add Knowledge Entry Form */}
          <AnimatePresence>
            {isAddingKb && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-white border-2 border-[#250d38] shadow-[5px_5px_0px_#4c2472] mb-8"
              >
                <h3 className="text-base font-bold text-[#250d38] font-display mb-3">
                  Add New Entry to Knowledge Base
                </h3>
                <form onSubmit={handleAddKnowledge} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-purple-950 uppercase mb-1">
                        Title / Question
                      </label>
                      <input
                        id="guide-new-title-input"
                        name="title"
                        type="text"
                        placeholder="e.g. Samosa & Chai Study Hours"
                        aria-label="Title or Question"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-purple-50/50 border border-[#250d38] text-xs text-[#250d38] focus:outline-none focus:border-[#55CCA2]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-purple-950 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as KnowledgeItem["category"])}
                        className="w-full px-3 py-2 bg-purple-50/50 border border-[#250d38] text-xs text-[#250d38]"
                      >
                        <option value="Events">Events</option>
                        <option value="Membership">Membership</option>
                        <option value="Board">Board</option>
                        <option value="Constitution">Constitution</option>
                        <option value="FAQ">FAQ</option>
                        <option value="Guide">Guide</option>
                        <option value="Custom">Custom Fact</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-purple-950 uppercase mb-1">
                      Exact Content / Fact
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write the precise description or answer that the AI chatbot should know and quote..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-purple-50/50 border border-[#250d38] text-xs text-[#250d38] focus:outline-none focus:border-[#55CCA2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-purple-950 uppercase mb-1">
                      Search Keywords (comma separated)
                    </label>
                    <input
                      id="guide-new-keywords-input"
                      name="keywords"
                      type="text"
                      placeholder="e.g. study, chai, thompson library, finals"
                      aria-label="Search Keywords"
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      className="w-full px-3 py-2 bg-purple-50/50 border border-[#250d38] text-xs text-[#250d38]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      disabled={kbStatus === "saving"}
                      className="px-6 py-2.5 min-h-[44px] btn-sangam text-xs font-mono font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2"
                    >
                      {kbStatus === "saving" ? "Saving Entry..." : "Save and Index to Knowledge Base"}
                    </button>
                    {kbStatus === "success" && (
                      <span className="text-xs font-mono text-[#11694c] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Entry indexed!
                      </span>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Knowledge Base Search Bar */}
          <div className="mb-6 relative">
            <Search className="w-4 h-4 text-purple-900/50 absolute left-3.5 top-3.5" />
            <input
              id="guide-kb-search-input"
              name="kb_search"
              type="text"
              placeholder="Search indexed knowledge chunks..."
              aria-label="Search indexed knowledge chunks"
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#250d38] text-xs text-[#250d38] focus:outline-none focus:border-[#55CCA2] shadow-[3px_3px_0px_#4c2472]"
            />
          </div>

          {/* Knowledge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKb.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#250d38] text-[9px] font-mono text-[#55CCA2] uppercase font-bold border border-[#55CCA2]">
                      {item.category}
                    </span>
                    {item.isCustom && (
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-[9px] font-mono text-[#0e4835] font-bold border border-emerald-300">
                          Custom Added
                        </span>
                        <button
                          onClick={() => handleDeleteKnowledge(item.id)}
                          title="Delete custom fact"
                          aria-label="Delete custom fact"
                          className="text-red-500 hover:text-red-700 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#250d38] font-display mb-1.5">
                    {item.titleEn}
                  </h3>
                  <p className="text-xs text-purple-950/80 leading-relaxed line-clamp-3 mb-3">
                    {item.contentEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] font-mono text-purple-900/60">
                  <span>Linked page: {item.route || "/guide"}</span>
                  <span>{item.keywords.length} keywords</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
