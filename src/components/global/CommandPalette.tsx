"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { EVENTS } from "@/data/events";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS } from "@/data/board";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { FAQS } from "@/data/faq";
import { Search, Calendar, Users, Image as ImageIcon, HelpCircle, ArrowRight, X, Sparkles, BookOpen, Bot } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: "Page" | "Event" | "Person" | "Gallery" | "Culture Toy" | "FAQ";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build searchable index
  const items: SearchItem[] = [
    // Core Pages
    { id: "p-home", category: "Page", title: "Home / முகப்பு", subtitle: "Official Emblem & Flagship Highlights", href: "/", icon: <Sparkles className="w-4 h-4 text-[#55CCA2]" /> },
    { id: "p-events", category: "Page", title: "Events / நிகழ்வுகள்", subtitle: "Upcoming festivals & Ticket drops", href: "/events", icon: <Calendar className="w-4 h-4 text-[#f59e0b]" /> },
    { id: "p-about", category: "Page", title: "About / எங்களைப் பற்றி", subtitle: "Mission, Constitution, History & FAQ", href: "/about", icon: <Sparkles className="w-4 h-4 text-[#55CCA2]" /> },
    { id: "p-board", category: "Page", title: "Board / குழு", subtitle: "Executive leadership & committee chairs", href: "/board", icon: <Users className="w-4 h-4 text-[#a855f7]" /> },
    { id: "p-gallery", category: "Page", title: "Gallery / நினைவுகள்", subtitle: "Festival memories & photo albums", href: "/gallery", icon: <ImageIcon className="w-4 h-4 text-[#06b6d4]" /> },
    { id: "p-guide", category: "Page", title: "User Guide & FAQ / வழிகாட்டி", subtitle: "Handbook, Searchable FAQ & AI Knowledge Manager", href: "/guide", icon: <BookOpen className="w-4 h-4 text-[#55CCA2]" /> },
    { id: "p-nanba", category: "Page", title: "Ask Nanba / நண்பா (AI Guide)", subtitle: "Chat with Nanba or search verified club knowledge", href: "/guide", icon: <Bot className="w-4 h-4 text-[#55CCA2]" /> },
    { id: "p-join", category: "Page", title: "Join / இணைந்திடுங்கள்", subtitle: "GroupMe gateway & audition signups", href: "/join", icon: <Users className="w-4 h-4 text-[#10b981]" /> },
    { id: "p-suggestions", category: "Page", title: "Suggestions / பரிந்துரைகள்", subtitle: "Blueprint reveal & community suggestion box", href: "/suggestions", icon: <Sparkles className="w-4 h-4 text-[#FFC526]" /> },
    { id: "p-links", category: "Page", title: "Quick Links (Bio Hub)", subtitle: "Mobile link-in-bio & social links", href: "/links", icon: <ArrowRight className="w-4 h-4 text-[#55CCA2]" /> },

    // Events
    ...EVENTS.map((e) => ({
      id: `evt-${e.slug}`,
      category: "Event" as const,
      title: `${e.titleEn} (${e.titleTa})`,
      subtitle: `${e.date} · ${e.location}`,
      href: `/events/${e.slug}`,
      icon: <Calendar className="w-4 h-4 text-[#f2b705]" />,
    })),

    // Board Members
    ...CURRENT_BOARD.map((b) => ({
      id: `brd-${b.id}`,
      category: "Person" as const,
      title: `${b.nameEn} (${b.nameTa})`,
      subtitle: `${b.roleEn} · ${b.committeeEn}`,
      href: `/board`,
      icon: <Users className="w-4 h-4 text-[#6b8e4e]" />,
    })),

    // Subcommittee Members
    ...SUBCOMMITTEE_MEMBERS.map((s) => ({
      id: `sub-${s.id}`,
      category: "Person" as const,
      title: `${s.nameEn} (${s.nameTa})`,
      subtitle: `Subcommittee · ${s.areaEn}`,
      href: `/board`,
      icon: <Users className="w-4 h-4 text-[var(--accent-tint)]" />,
    })),

    // Gallery Albums
    ...GALLERY_ALBUMS.map((a) => ({
      id: `gal-${a.slug}`,
      category: "Gallery" as const,
      title: `${a.titleEn} (${a.titleTa})`,
      subtitle: `${a.photoCount} photos · ${a.academicYear}`,
      href: `/gallery/${a.slug}`,
      icon: <ImageIcon className="w-4 h-4 text-[#0b7a75]" />,
    })),

    // FAQs
    ...FAQS.map((f) => ({
      id: `faq-${f.id}`,
      category: "FAQ" as const,
      title: `${f.questionEn}`,
      subtitle: f.answerEn.slice(0, 75) + "...",
      href: "/about#faq",
      icon: <HelpCircle className="w-4 h-4 text-[#8b5cf6]" />,
    })),
  ];

  const filteredItems = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      playClick();
      onClose();
      router.push(item.href);
    },
    [onClose, playClick, router]
  );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search site command palette"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        className="box-ticket w-full max-w-2xl bg-[#160d26] border-2 border-[#55CCA2] shadow-[8px_8px_0px_#55CCA2] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b-2 border-white/10 gap-3">
          <Search className="w-5 h-5 text-[#55CCA2]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={locale === "ta" ? "நிகழ்வுகள், குழு, பக்கங்கள் தேடுங்கள்..." : "Search events, people, pages, or FAQs..."}
            aria-label="Search query"
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search input"
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 border border-white/20 text-[10px] font-mono bg-white/10 text-slate-300">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">{locale === "ta" ? "எந்த முடிவுகளும் கிடைக்கவில்லை" : "No matching results found."}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Try searching &apos;diwali&apos;, &apos;dance&apos;, or &apos;board&apos;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer border-2 transition-all ${
                    isSelected ? "bg-[#250d38] border-[#55CCA2] shadow-[3px_3px_0px_#55CCA2] text-white" : "border-transparent text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center border border-white/20 bg-black/40 shrink-0 text-[#55CCA2]">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{item.title}</span>
                        <span className="box-badge-dark text-[9px] font-mono text-slate-300 border border-white/20 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? "opacity-100 text-[#55CCA2]" : "opacity-0"}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[var(--accent-tint)]">OSU Tamil Sangam</span>
        </div>
      </div>
    </div>
  );
};
