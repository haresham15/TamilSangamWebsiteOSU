"use client";

import React, { useState, useMemo } from "react";
import { FAQS, FaqItem } from "@/data/faq";
import {
  Search,
  ChevronDown,
  Sparkles,
  Train,
  CheckCircle2,
  Tag,
  ArrowUpRight,
} from "lucide-react";

interface FAQContentProps {
  faqs?: FaqItem[];
  activeFaqId?: string;
  onSelectFaq?: (faq: FaqItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const CATEGORIES = [
  "All",
  "General",
  "Membership",
  "Performances",
  "Events",
  "Governance",
] as const;

export function FAQContent({
  faqs = FAQS,
  activeFaqId = "faq-01",
  onSelectFaq,
  searchQuery: externalSearch,
  onSearchChange: setExternalSearch,
}: FAQContentProps) {
  // Local search fallback if not controlled externally
  const [internalSearch, setInternalSearch] = useState("");
  const search = externalSearch !== undefined ? externalSearch : internalSearch;
  const setSearch = setExternalSearch || setInternalSearch;

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(activeFaqId);

  // Filtered FAQs based on Category and Search Query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchCat =
        selectedCategory === "All" || faq.category === selectedCategory;
      if (!matchCat) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        faq.questionEn.toLowerCase().includes(q) ||
        faq.questionTa.toLowerCase().includes(q) ||
        faq.answerEn.toLowerCase().includes(q) ||
        faq.answerTa.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    });
  }, [faqs, selectedCategory, search]);

  const handleAccordionClick = (faq: FaqItem) => {
    const nextId = expandedId === faq.id ? null : faq.id;
    setExpandedId(nextId);
    if (onSelectFaq) {
      onSelectFaq(faq);
    }
  };

  return (
    <div className="relative z-20 w-full min-h-screen bg-[#050201] pt-16 pb-32 px-4 sm:px-6 lg:px-8 border-t border-[#1c1510]">
      <div className="max-w-4xl mx-auto">
        {/* ========================================================================= */}
        {/* EDITORIAL HEADER (Sanity CMS-Ready Architecture)                         */}
        {/* ========================================================================= */}
        <div className="text-center mb-12">
          {/* Railway Station Dispatch Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17110c] border border-[#38281a] text-[#f59e0b] text-xs font-mono tracking-wider uppercase mb-4 shadow-inner">
            <Train className="w-3.5 h-3.5" />
            <span>KNOWLEDGE ARCHIVE & SANGAM DISPATCH</span>
            <span className="text-[#8f755a]">·</span>
            <span className="font-tamil">வினா விடை</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#fdfaf5] tracking-tight font-display mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-[#c59b27] font-tamil font-medium mb-4">
            அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் விளக்கங்கள்
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#a89985] leading-relaxed">
            Select any question to inspect detailed guidelines or broadcast the answer directly to the 
            mechanical split-flap departure board above.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH & CATEGORY FILTER BAR                                              */}
        {/* ========================================================================= */}
        <div className="space-y-4 mb-10">
          {/* Interactive Search Field */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8f755a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or Tamil term (e.g., tickets, membership, தீபாவளி)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#110d0a] border border-[#2b2017] text-[#f5eedf] placeholder-[#6e5d4d] text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#a89985] hover:text-[#fdfaf5] transition-colors"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#d4af37] text-[#0d0a08] font-bold shadow-md shadow-[#d4af37]/20"
                      : "bg-[#140f0c] text-[#a89985] hover:text-[#fdfaf5] hover:bg-[#1f1712] border border-[#261d15]"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EDITORIAL ACCORDION LIST                                                  */}
        {/* ========================================================================= */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0f0b09] border border-[#241a13] text-[#8f755a]">
              <p className="font-mono text-sm">NO QUESTIONS MATCHED YOUR QUERY</p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-3 text-xs text-[#d4af37] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              const isBoardActive = activeFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isExpanded
                      ? "bg-[#120e0b] border-[#4a3a29] shadow-xl"
                      : "bg-[#0b0806] border-[#1f1711] hover:border-[#33251a]"
                  }`}
                >
                  {/* Accordion Question Trigger Header */}
                  <button
                    onClick={() => handleAccordionClick(faq)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1.5 flex-1">
                      {/* Category Tag & Index */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#8f755a]">
                          [#{String(index + 1).padStart(2, "0")}]
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#d4af37] px-2 py-0.5 rounded bg-[#1f1711] border border-[#3b2c1d]">
                          <Tag className="w-2.5 h-2.5" />
                          {faq.category}
                        </span>
                        {isBoardActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ON BOARD
                          </span>
                        )}
                      </div>

                      {/* Question English */}
                      <h3 className="text-base sm:text-lg font-bold text-[#faf5ed] font-display">
                        {faq.questionEn}
                      </h3>

                      {/* Question Tamil */}
                      <p className="text-xs sm:text-sm text-[#c59b27] font-tamil">
                        {faq.questionTa}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-[#1a140f] border border-[#2e2116] text-[#c59b27] shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180 text-[#d4af37]" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Accordion Expanded Answer Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#1c1510] space-y-4">
                      {/* English Answer */}
                      <div className="text-sm text-[#ded4c5] leading-relaxed font-sans">
                        {faq.answerEn}
                      </div>

                      {/* Tamil Answer */}
                      <div className="p-3.5 rounded-xl bg-[#0a0705] border border-[#231a12] text-xs sm:text-sm text-[#e0b968] font-tamil leading-relaxed">
                        {faq.answerTa}
                      </div>

                      {/* Action Bar: Transmit to 3D Split-Flap Board */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#8f755a]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sanity Verified Club Policy</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectFaq) onSelectFaq(faq);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#211810] hover:bg-[#2e2116] border border-[#4a3826] text-xs font-mono tracking-wider text-[#d4af37] transition-all hover:border-[#d4af37]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>SEND TO FLAP BOARD</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
