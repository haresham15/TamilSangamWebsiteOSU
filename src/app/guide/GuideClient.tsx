"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { FAQS, FaqItem } from "@/data/faq";
import { KnowledgeItem } from "@/data/knowledgeBase";
import { useGuideStore } from "@/components/guide-hero/store/guideStore";
import { trackFaqEngagement } from "@/components/guide-hero/faqEngagement";

// Nudge scroll helper per PRD §7:
// Scroll the page toward the hero by at most 0.6 × viewport height, 600 ms,
// and skip it if the user scrolled manually in the last 400 ms or prefers reduced motion.
function nudgeScrollToHero() {
  if (typeof window === "undefined") return;
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) return;

  const hero = document.getElementById("guide-station-hero");
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  if (rect.bottom < 0 || window.scrollY > 300) {
    const maxNudge = 0.6 * window.innerHeight;
    const targetScroll = Math.max(0, window.scrollY - maxNudge);
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }
}
import {
  Search,
  ChevronDown,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Database,
  ArrowUp,
} from "lucide-react";
import { SplitFlapMiniHeader } from "@/components/splitflap/SplitFlapMiniHeader";
import { WatermarkGlyph } from "@/components/ui/WatermarkGlyph";

import { GuideHero } from "@/components/guide-hero/GuideHero";
import { HeroGradientTransition } from "@/components/ui/HeroGradientTransition";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";
import { audioLayer } from "@/utils/audioLayer";
import { initTerminalBootScramble } from "@/utils/scrambleTerminal";

const FAQ_CATEGORIES = [
  "All",
  "General",
  "Membership",
  "Events",
  "Performances",
  "Governance",
] as const;

export interface GuideClientProps {
  initialPopularRanking?: RankedFaq[];
}

export function GuideClient({ initialPopularRanking }: GuideClientProps) {
  const { locale } = useLocale();
  const { playClick, playWoodClick, playBell } = useAudio();

  // Active guide section tab
  const [activeTab, setActiveTab] = useState<"guide" | "faq" | "knowledge">("faq");

  // 3D Split-Flap Board State
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ Filter state
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
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
  const refreshKnowledgeBase = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setKnowledgeList(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge base:", err);
    }
  }, []);

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

  const guideLeadRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (guideLeadRef.current) {
      initTerminalBootScramble(guideLeadRef.current, {
        start: "top 80%",
        duration: 0.8,
      });
    }
  }, []);

  // Synchronize board with selected FAQ via Zustand action (PRD §7)
  const handleSelectFaq = useCallback((faq: FaqItem) => {
    useGuideStore.getState().selectFaq(faq, "accordion");
  }, []);

  // Broadcast a guide chapter to the 3D board
  const handleBroadcastChapter = useCallback(
    (title: string, summary: string) => {
      playWoodClick();
      useGuideStore.getState().setActiveItem(
        {
          text: `${title}. ${summary}`,
          catCode: "GUID",
          statusText: "STUDENT USER GUIDE",
        },
        "guide-chapter",
        "accordion"
      );
      nudgeScrollToHero();
    },
    [playWoodClick]
  );

  // Synchronize board when search query changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    useGuideStore.getState().setSearchQuery(query);
  }, []);

  // PRD §7: Debounced board flipping on search
  // Never flip on every keystroke — flip on pause >= 350ms or on clear
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim()) {
      useGuideStore.getState().resetToDefault();
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();
      const match = FAQS.find((faq) => {
        return (
          faq.questionEn.toLowerCase().includes(q) ||
          faq.questionTa.toLowerCase().includes(q) ||
          faq.answerEn.toLowerCase().includes(q) ||
          faq.tags.some((t) => t.toLowerCase().includes(q)) ||
          faq.category.toLowerCase().includes(q)
        );
      });

      if (match) {
        useGuideStore.getState().selectFaq(match, "search");
        setExpandedFaqId(match.id);
        const el = document.getElementById(`faq-trigger-${match.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        // No match: board flips to 'NO MATCH FOUND' (PRD §7)
        useGuideStore.getState().setNoMatch(q);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Synchronize search query changes between console input and DOM filter
  useEffect(() => {
    const unsub = useGuideStore.subscribe((state) => {
      if (state.searchQuery !== searchQuery) {
        setSearchQuery(state.searchQuery);
      }
    });
    return unsub;
  }, [searchQuery]);

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
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesCat =
        selectedFaqCategory === "All" || f.category === selectedFaqCategory;
      if (!matchesCat) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        f.questionEn.toLowerCase().includes(q) ||
        f.questionTa.toLowerCase().includes(q) ||
        f.answerEn.toLowerCase().includes(q) ||
        f.answerTa.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedFaqCategory, searchQuery]);

  // Filtered Knowledge Base items
  const filteredKb = useMemo(() => {
    const q = kbSearch.toLowerCase().trim();
    if (!q) return knowledgeList;
    return knowledgeList.filter((item) => {
      return (
        item.titleEn.toLowerCase().includes(q) ||
        item.contentEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [knowledgeList, kbSearch]);

  return (
    <main className="relative w-full min-h-screen bg-transparent text-[#fbf7ee] selection:bg-[#d4af37] selection:text-black font-body text-left">
      {/* ========================================================================= */}
      {/* 1. TOP CINEMATIC 3D HERO: SPLIT-FLAP DEPARTURE BOARD                      */}
      {/* ========================================================================= */}
      <GuideHero id="guide-station-hero" initialPopularRanking={initialPopularRanking} />

      {/* Color Gradient Transition from 3D Mechanical Station (#0c0907) to Warm Cream Console (#FAF6EE) */}
      <HeroGradientTransition variant="guide" className="-mt-32 relative z-20" />

      {/* ========================================================================= */}
      {/* 2. STICKY MINI-HEADER STRIP (Phase 3c & 4b: Appears below floating nav)  */}
      {/* ========================================================================= */}
      <SplitFlapMiniHeader
        onSearchFocus={() => {
          const searchInput = document.getElementById("guide-faq-search-input");
          searchInput?.focus();
        }}
      />

      {/* ========================================================================= */}
      {/* 3. EDITORIAL CONSOLE: UNIFIED USER GUIDE, SEARCHABLE FAQ & KNOWLEDGE BASE */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full bg-[#FAF6EE] text-[#1c1008] pt-12 sm:pt-16 pb-32 overflow-hidden">
        {/* Structural Tamil Background Watermarks */}
        <WatermarkGlyph text="பயணம்" opacity={0.04} align="right" theme="light" />
        <WatermarkGlyph text="வழிகாட்டி" opacity={0.032} align="left" theme="light" className="top-[60%]" />

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">

          <h1
            className="text-[clamp(2.5rem,5vw+1.5rem,6rem)] font-extrabold text-[#250d38] tracking-tight font-display mb-3"
            {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
          >
            {locale === "ta"
              ? "பயனர் வழிகாட்டி & அடிக்கடி கேட்கப்படும் கேள்விகள்"
              : "User Guide & Frequently Asked Questions"}
          </h1>
          <p
            className="text-sm sm:text-base text-[#b45309] font-tamil font-medium mb-3"
            {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
          >
            {locale === "ta"
              ? "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் விதிமுறைகள், உறுப்புரிமை, மற்றும் அறிவுத் தளம்"
              : "Interactive Southern Railway split-flap engine connected live to OSU Tamil Sangam guidelines"}
          </p>
          <p ref={guideLeadRef} className="max-w-2xl mx-auto text-xs sm:text-sm text-[#4c3828] leading-relaxed font-body">
            Select any question, guide chapter, or knowledge topic below to broadcast its verified policy
            directly to the 3D mechanical departure board above.
          </p>
        </div>

        {/* Console Nav Tabs: Guide vs FAQ vs Knowledge Base */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 max-w-2xl mx-auto mb-10 rounded-none bg-[#110d0a] border border-[#261d15] shadow-[4px_4px_0px_#261d15] ticket-chamfer-tl-br blueprint-node">
          {[
            {
              id: "faq" as const,

              icon: <HelpCircle className="w-4 h-4" />,
              label:
                locale === "ta"
                  ? "01. கேள்விகள் (Searchable FAQ)"
                  : "01. Searchable FAQ",
            },
            {
              id: "guide" as const,
              icon: <BookOpen className="w-4 h-4" />,
              label:
                locale === "ta"
                  ? "02. வழிகாட்டி (Student Guide)"
                  : "02. Student User Guide",
            },
            {
              id: "knowledge" as const,
              icon: <Database className="w-4 h-4" />,
              label:
                locale === "ta"
                  ? "03. அறிவுத் தளம் (Nanba AI KB)"
                  : "03. Knowledge Base Manager",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playWoodClick();
                setActiveTab(tab.id);
              }}
              onMouseEnter={() => audioLayer.playTapeClack()}
              data-cursor="bracket"
              className={`min-h-[44px] px-5 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] active:scale-[0.98] ${
                activeTab === tab.id
                  ? "bg-[#d4af37] text-[#0d0a08] shadow-[2px_2px_0px_#261d15]"
                  : "text-[#a89985] hover:text-[#fdfaf5] hover:bg-[#1a140f] border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: INTERACTIVE SEARCHABLE FAQ                        */}
        {/* ======================================================== */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            {/* Search & Category Filter Bar */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f755a]" />
                <input
                  id="guide-faq-search-input"
                  name="faq_search"
                  type="text"
                  placeholder="Search by topic, keyword, or Tamil term (e.g. dues, language, diwali, voting, food)..."
                  aria-label="Search FAQs"
                  value={searchQuery}
                  onFocus={() => {
                    if (!searchQuery.trim()) {
                      useGuideStore.getState().setSearchPrompt();
                    }
                  }}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    const match = FAQS.find((faq) => faq.questionEn.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                    if (match) trackFaqEngagement(match.id, "search");
                  }}
                  className="w-full pl-11 pr-20 py-3.5 rounded-none bg-[#110d0a] border border-[#2b2017] text-[#f5eedf] placeholder-[#6e5d4d] text-sm font-mono focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#a89985] hover:text-[#fdfaf5] transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {FAQ_CATEGORIES.map((cat) => {
                  const isActive = selectedFaqCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        playClick();
                        setSelectedFaqCategory(cat);
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-none text-xs font-mono tracking-wider whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] ${
                        isActive
                          ? "bg-[#d4af37] text-[#0d0a08] font-bold shadow-[2px_2px_0px_#261d15]"
                          : "bg-[#140f0c] text-[#a89985] hover:text-[#fdfaf5] hover:bg-[#1f1712] border border-[#261d15]"
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* No-JS Baseline Fallback (§8) */}
            <noscript>
              <div className="p-6 bg-[#110d0a] border border-[#2b2017] text-[#f5eedf] mb-6 space-y-4">
                <h2 className="text-lg font-bold font-display text-[#d4af37]">
                  FAQ & Student Guidelines (JavaScript-Free Mode)
                </h2>
                <div className="space-y-3">
                  {FAQS.map((faq) => (
                    <details key={faq.id} className="p-4 bg-[#0c0907] border border-[#261d15]">
                      <summary className="font-bold text-[#faf5ed] cursor-pointer">
                        {faq.questionEn} · {faq.questionTa}
                      </summary>
                      <p className="mt-2 text-sm text-[#ded4c5]">{faq.answerEn}</p>
                      <p className="mt-1 text-sm text-[#e0b968] font-tamil">{faq.answerTa}</p>
                    </details>
                  ))}
                </div>
              </div>
            </noscript>

            {/* FAQ Accordion List with Live Split-Flap Integration */}
            <div className="space-y-3.5">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center rounded-none bg-[#0f0b09] border border-[#241a13] text-[#8f755a]">
                  <p className="font-mono text-sm">NO QUESTIONS MATCHED YOUR QUERY</p>
                  <p className="mt-2 text-xs text-[#6e5d4d]">
                    Try a different keyword, or ask Nanba directly.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        handleSearchChange("");
                        setSelectedFaqCategory("All");
                      }}
                      className="text-xs text-[#d4af37] hover:underline font-mono"
                    >
                      Reset filters
                    </button>
                    <span className="text-[#3b2c1d]">|</span>
                    <button
                      onClick={() => {
                        // Open the Ask Nanba chatbot widget (PRD §7)
                        const btn = document.querySelector(
                          'button[aria-label*="Ask Nanba"]'
                        ) as HTMLButtonElement | null;
                        btn?.click();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#55CCA2] hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      ASK NANBA
                    </button>
                  </div>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className={`ticket-chamfer-tl-br blueprint-node rounded-none transition-all duration-200 border ${
                        isExpanded
                          ? "bg-[#120e0b] border-[#4a3a29] shadow-[4px_4px_0px_#1f1711] glow-sodium"
                          : "bg-[#0b0806] border-[#1f1711] hover:border-[#33251a] hover:glow-halogen-mint"
                      }`}
                    >
                      {/* Accordion Question Trigger Header */}

                      <button
                        id={`faq-trigger-${faq.id}`}
                        aria-controls={`faq-panel-${faq.id}`}
                        aria-expanded={isExpanded}
                        onClick={() => {
                          playWoodClick();
                          const nextId = isExpanded ? null : faq.id;
                          setExpandedFaqId(nextId);
                          handleSelectFaq(faq);
                          if (nextId === faq.id) trackFaqEngagement(faq.id, "open");
                        }}
                        className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] rounded-none"
                      >
                        <div className="space-y-1.5 flex-1">

                          <h3
                            className="text-base sm:text-lg font-bold text-[#faf5ed] font-display"
                            {...(locale === "ta" ? { lang: "ta", style: { letterSpacing: 0 } } : {})}
                          >
                            {locale === "ta" ? faq.questionTa : faq.questionEn}
                          </h3>

                          {locale !== "ta" && faq.questionTa && (
                            <p className="text-xs sm:text-sm text-[#c59b27] font-tamil">
                              {faq.questionTa}
                            </p>
                          )}
                        </div>

                        <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-none bg-[#1a140f] border border-[#2e2116] text-[#c59b27] shrink-0">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isExpanded ? "rotate-180 text-[#d4af37]" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Accordion Expanded Answer Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            id={`faq-panel-${faq.id}`}
                            role="region"
                            aria-labelledby={`faq-trigger-${faq.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="px-5 pb-5 pt-2 border-t border-[#1c1510] space-y-4 overflow-hidden"
                          >
                            <div className="text-sm text-[#ded4c5] leading-relaxed font-body">
                              {faq.answerEn}
                            </div>

                            {faq.answerTa && (
                              <div className="p-3.5 rounded-none bg-[#0a0705] border border-[#231a12] text-xs sm:text-sm text-[#e0b968] font-tamil leading-relaxed">
                                {faq.answerTa}
                              </div>
                            )}

                            {/* Action Bar: Transmit to Split-Flap Board */}
                            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectFaq(faq);
                                  trackFaqEngagement(faq.id, "board");
                                  const hero = document.getElementById("guide-station-hero");
                                  if (hero && window.scrollY > 400) {
                                    hero.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#211810] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono tracking-wider text-[#d4af37] transition-all hover:border-[#d4af37] active:scale-[0.98]"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>SPELL OUT ON BOARD</span>
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            </div>
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
        {/* TAB 2: STUDENT USER GUIDE                                */}
        {/* ======================================================== */}
        {activeTab === "guide" && (
          <div className="space-y-8">
            {/* Chapter 1: Joining & Membership */}
            <div className="ticket-chamfer-tl-br blueprint-node p-6 sm:p-8 rounded-none bg-[#110d0a] border border-[#2e2217] hover:border-[#d4af37]/50 shadow-[4px_4px_0px_#2e2217] hover:glow-sodium transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#d4af37] uppercase tracking-wider font-bold">
                    Membership & Dues
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-bold text-[#faf5ed] font-display mt-0.5">
                    Joining the Club is 100% Free
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleBroadcastChapter(
                      "JOINING & MEMBERSHIP",
                      "NO DUES OR FEES FOR OSU STUDENTS. OPEN TO ALL LANGUAGES & MAJORS."
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#1f1711] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono text-[#d4af37] transition-all shrink-0 hover:border-[#d4af37]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BROADCAST CHAPTER ↑</span>
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#ded4c5] leading-relaxed">
                <p>
                  <strong className="text-[#faf5ed]">No Dues or Hidden Fees:</strong> General membership in OSU Tamil Sangam is completely free for all Ohio State students. You do not need to pay dues to attend our meetings, lawn kickbacks, street food nights, or general workshops.
                </p>
                <p>
                  <strong className="text-[#faf5ed]">Open to All Languages & Backgrounds:</strong> You do not need to speak Tamil or have a specific cultural background to be a member. Many active members speak English, Telugu, Hindi, or other languages and simply enjoy the community, great food, music, and casual hangouts.
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <Link
                    href="/join"
                    onClick={playClick}
                    className="px-5 py-2.5 min-h-[44px] rounded-none bg-[#55CCA2] hover:bg-[#48b68f] text-black text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[3px_3px_0px_#110d0a] transition-all active:scale-[0.98]"
                  >
                    <span>Fill Membership Form →</span>
                  </Link>
                  <Link
                    href="/links"
                    onClick={playWoodClick}
                    className="px-5 py-2.5 min-h-[44px] rounded-none bg-[#1c1510] hover:bg-[#281e17] border border-[#3b2c1d] text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37] inline-flex items-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>Join GroupMe Loop ↗</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Chapter 2: Attending Events */}
            <div className="ticket-chamfer-tl-br blueprint-node p-6 sm:p-8 rounded-none bg-[#110d0a] border border-[#2e2217] hover:border-[#d4af37]/50 shadow-[4px_4px_0px_#2e2217] hover:glow-sodium transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#d4af37] uppercase tracking-wider font-bold">
                    Events & Showcases
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#faf5ed] font-display mt-0.5">
                    Campus Events & What to Expect
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleBroadcastChapter(
                      "CAMPUS EVENTS & FESTIVALS",
                      "SOUTH OVAL PICNICS, FOOD NIGHTS, FLIPBOARD REVEALS, FREE TO ALL."
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#1f1711] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono text-[#d4af37] transition-all shrink-0 hover:border-[#d4af37]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BROADCAST CHAPTER ↑</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#ded4c5]">
                <div className="p-4 rounded-none bg-[#0c0907] border border-[#241a13]">
                  <h3 className="font-bold text-[#f5eedf] font-display text-base mb-1">
                    Casual Hangouts & Food Nights
                  </h3>
                  <p className="leading-relaxed">
                    Events like our <em>South Oval Berry Picnic</em> and <em>Streetside Sapad Night</em> are relaxed kickbacks. Dress in everyday casual campus clothes, bring your friends, grab a plate, and enjoy board games or acoustic music.
                  </p>
                </div>

                <div className="p-4 rounded-none bg-[#0c0907] border border-[#241a13]">
                  <h3 className="font-bold text-[#f5eedf] font-display text-base mb-1">
                    Cultural Carnivals & Festive Showcases
                  </h3>
                  <p className="leading-relaxed">
                    Collaborative events like <em>Namma Jathara</em> feature outdoor challenges, music circles, food stalls, and festive celebrations on campus plazas. Open to all students with free admission!
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter 3: Creative Tracks (Aatam & Paatam) */}
            <div className="ticket-chamfer-tl-br blueprint-node p-6 sm:p-8 rounded-none bg-[#110d0a] border border-[#2e2217] hover:border-[#d4af37]/50 shadow-[4px_4px_0px_#2e2217] hover:glow-sodium transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#d4af37] uppercase tracking-wider font-bold">
                    Dance & Music Tracks
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#faf5ed] font-display mt-0.5">
                    Performance, Dance & Media Tracks
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleBroadcastChapter(
                      "CREATIVE TRACKS & PERFORMANCE",
                      "AATAM DANCE REHEARSALS, PAATAM MUSIC JAMS, PHOTO & MEDIA PRODUCTION."
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#1f1711] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono text-[#d4af37] transition-all shrink-0 hover:border-[#d4af37]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BROADCAST CHAPTER ↑</span>
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#ded4c5] leading-relaxed">
                <p>
                  <strong className="text-[#faf5ed]">Aatam (ஆட்டம் · Dance):</strong> We host beginner-friendly and performance choreography rehearsals for cinematic Kuthu, fusion, and festival routines. No prior dance audition or experience is required for general workshops!
                </p>
                <p>
                  <strong className="text-[#faf5ed]">Paatam (பாட்டம் · Music):</strong> Acoustic guitarists, vocalists, keyboardists, and rhythm players can participate in casual campus jams or perform at our showcase dinners.
                </p>
                <p>
                  <strong className="text-[#faf5ed]">Media & Stage Operations:</strong> Interested in photography, videography, graphic design, social media, or stage lighting? Our Subcommittee Council welcomes students eager to learn hands-on event production.
                </p>
              </div>
            </div>

            {/* Chapter 4: Governance & Voting Rights */}
            <div className="ticket-chamfer-tl-br blueprint-node p-6 sm:p-8 rounded-none bg-[#110d0a] border border-[#2e2217] hover:border-[#d4af37]/50 shadow-[4px_4px_0px_#2e2217] hover:glow-sodium transition-all">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#d4af37] uppercase tracking-wider font-bold">
                    Constitution & Voting Rights
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#faf5ed] font-display mt-0.5">
                    Constitutional Voting & Board Shadowing
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleBroadcastChapter(
                      "CONSTITUTION & VOTING RIGHTS",
                      "ATTEND AT LEAST 2 MEETINGS AND 2 EVENTS PER SEMESTER FOR VOTING."
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#1f1711] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono text-[#d4af37] transition-all shrink-0 hover:border-[#d4af37]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BROADCAST CHAPTER ↑</span>
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#ded4c5] leading-relaxed">
                <p>
                  To qualify for active voting rights in officer elections or to qualify for Executive Board shadowing, members must meet the constitutional threshold:
                </p>
                <div className="p-4 rounded-none bg-[#091510] border border-[#1b3d2f] text-xs text-[#55CCA2] font-semibold leading-relaxed">
                  Attend at least two general body meetings and two official club events per academic semester. At least 90% of voting members must be current OSU students.
                </div>
                <p>
                  Executive Board applications open every spring semester. Active members who have participated throughout the year are eligible to run for leadership offices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: KNOWLEDGE BASE MANAGER & NANBA AI                 */}
        {/* ======================================================== */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="ticket-chamfer-tl-br blueprint-node p-6 rounded-none bg-[#110d0a] border border-[#2b2017] shadow-[4px_4px_0px_#2b2017] hover:glow-sodium text-white transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[#faf5ed]">
                    Editable Website Knowledge Base
                  </h2>
                  <p className="text-xs text-[#a89985] mt-1 max-w-2xl leading-relaxed">
                    Every response generated by our AI guide Nanba (நண்பா) is strictly verified against the entries below. You can add new club facts, event updates, or custom guidelines, which are immediately indexed!
                  </p>
                </div>

                <button
                  onClick={() => {
                    playClick();
                    setIsAddingKb(!isAddingKb);
                  }}
                  className="px-4 py-2.5 rounded-none bg-[#d4af37] hover:bg-[#e2c154] text-black text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 shrink-0 transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAddingKb ? "Close Form" : "Add Fact to KB"}</span>
                </button>
              </div>

              {/* Add Knowledge Form */}
              <AnimatePresence>
                {isAddingKb && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleAddKnowledge}
                    className="mt-6 pt-6 border-t border-[#231a12] space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-mono text-[#d4af37] uppercase font-bold mb-1">
                          Fact / Guideline Title
                        </label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Diya Night 2026 Ticket Release Policy"
                          className="w-full px-3.5 py-2.5 rounded-none bg-[#0a0705] border border-[#2e2116] text-xs font-mono text-[#f5eedf] focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-[#d4af37] uppercase font-bold mb-1">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) =>
                            setNewCategory(e.target.value as KnowledgeItem["category"])
                          }
                          className="w-full px-3.5 py-2.5 rounded-none bg-[#0a0705] border border-[#2e2116] text-xs font-mono text-[#f5eedf] focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Events">Events</option>
                          <option value="Membership">Membership</option>
                          <option value="Governance">Governance</option>
                          <option value="Culture">Culture</option>
                          <option value="Performances">Performances</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#d4af37] uppercase font-bold mb-1">
                        Verified Factual Content (Used directly by Nanba to answer questions)
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Detail the exact dates, policy rules, or requirements..."
                        className="w-full px-3.5 py-2.5 rounded-none bg-[#0a0705] border border-[#2e2116] text-xs font-mono text-[#f5eedf] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#d4af37] uppercase font-bold mb-1">
                        Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                        placeholder="tickets, diwali, fee, union, registration"
                        className="w-full px-3.5 py-2.5 rounded-none bg-[#0a0705] border border-[#2e2116] text-xs font-mono text-[#f5eedf] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={kbStatus === "saving"}
                        className="px-5 py-2 rounded-none bg-[#55CCA2] hover:bg-[#48b68f] text-black text-xs font-mono font-bold uppercase transition-all shadow-[2px_2px_0px_#110d0a]"
                      >
                        {kbStatus === "saving" ? "Indexing..." : "Save to Knowledge Base"}
                      </button>
                      {kbStatus === "success" && (
                        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Successfully added!
                        </span>
                      )}
                      {kbStatus === "error" && (
                        <span className="text-xs text-rose-400 font-mono">
                          Failed to save. Please try again.
                        </span>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Knowledge Base Filter & Entries List */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f755a]" />
                <input
                  type="text"
                  placeholder="Filter knowledge entries by title, keyword, or text..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-none bg-[#110d0a] border border-[#2b2017] text-xs font-mono text-[#f5eedf] placeholder-[#6e5d4d] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredKb.length === 0 ? (
                  <div className="col-span-full p-8 text-center rounded-none bg-[#0f0b09] border border-[#241a13] text-[#8f755a]">
                    <p className="font-mono text-sm">NO KNOWLEDGE ENTRIES FOUND</p>
                  </div>
                ) : (
                  filteredKb.map((item) => (
                    <div
                      key={item.id}
                      className="ticket-chamfer-tl-br blueprint-node p-5 rounded-none bg-[#0c0907] border border-[#231a13] hover:border-[#55CCA2] shadow-[3px_3px_0px_#110d0a] hover:glow-halogen-mint flex flex-col justify-between transition-all"
                    >
                      <div>

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] px-2 py-0.5 rounded-none bg-[#1f1711] border border-[#3b2c1d]">
                            {item.category}
                          </span>
                          <button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            title="Delete entry"
                            className="text-[#8f755a] hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-[#faf5ed] font-display mb-1.5">
                          {item.titleEn}
                        </h4>
                        <p className="text-xs text-[#a89985] leading-relaxed">
                          {item.contentEn}
                        </p>
                      </div>

                      {item.keywords && item.keywords.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#1c1510] flex flex-wrap gap-1.5">
                          {item.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="text-[9px] font-mono text-[#6e5d4d] bg-[#140f0c] px-1.5 py-0.5 rounded-none"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}

export default GuideClient;
