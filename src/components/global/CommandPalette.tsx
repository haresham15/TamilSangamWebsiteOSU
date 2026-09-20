"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { EVENTS } from "@/data/events";
import { CURRENT_BOARD } from "@/data/board";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { FAQS } from "@/data/faq";
import { Search, Calendar, Users, Image as ImageIcon, HelpCircle, ArrowRight, X, Sparkles } from "lucide-react";

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
    // Pages & Culture Toys
    { id: "p-home", category: "Page", title: "Home / முகப்பு", subtitle: "Gopuram Ascent & Signature Hero", href: "/", icon: <Sparkles className="w-4 h-4 text-[#f2b705]" /> },
    { id: "p-events", category: "Page", title: "Events / நிகழ்வுகள்", subtitle: "Upcoming festivals & Tamil Calendar", href: "/events", icon: <Calendar className="w-4 h-4 text-[#d6452f]" /> },
    { id: "p-initiatives", category: "Page", title: "Initiatives / முன்னெடுப்புகள்", subtitle: "Aatam, Paatam, Kondatam", href: "/initiatives", icon: <Sparkles className="w-4 h-4 text-[#0b7a75]" /> },
    { id: "p-gallery", category: "Page", title: "Gallery / நினைவுகள்", subtitle: "Photo albums & Memory Vault", href: "/gallery", icon: <ImageIcon className="w-4 h-4 text-[#6b8e4e]" /> },
    { id: "p-board", category: "Page", title: "Board / குழு", subtitle: "Trading cards & Liquid Roster", href: "/board", icon: <Users className="w-4 h-4 text-[#b5573a]" /> },
    { id: "p-culture", category: "Culture Toy", title: "Culture Lab / கலாச்சார அரங்கம்", subtitle: "Kolam Studio, Solkattu, Thirukkural", href: "/culture-lab", icon: <Sparkles className="w-4 h-4 text-[#8b5cf6]" /> },
    { id: "p-links", category: "Page", title: "Quick Links (Bio Hub)", subtitle: "Lightweight Linktree replacement", href: "/links", icon: <ArrowRight className="w-4 h-4 text-[#f2b705]" /> },
    { id: "p-ask", category: "Page", title: "Ask Sangam AI / கேளுங்கள்", subtitle: "Interactive concierge assistant", href: "/ask", icon: <HelpCircle className="w-4 h-4 text-[#38bdf8]" /> },

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
      subtitle: `${b.roleEn} · ${b.major}`,
      href: `/board#${b.id}`,
      icon: <Users className="w-4 h-4 text-[#6b8e4e]" />,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-3xl glass-panel-elevated border border-[var(--border-strong)] shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-[var(--accent-tint)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={locale === "ta" ? "நிகழ்வுகள், குழு, பக்கங்கள் தேடுங்கள்..." : "Search events, people, pages, or FAQs..."}
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">{locale === "ta" ? "எந்த முடிவுகளும் கிடைக்கவில்லை" : "No matching results found."}</p>
              <p className="text-xs text-slate-500 mt-1">Try searching &apos;pongal&apos;, &apos;dance&apos;, or &apos;board&apos;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected ? "bg-white/15 text-white shadow-md border border-white/10" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white/10 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? "opacity-100 text-[var(--accent-tint)]" : "opacity-0"}`} />
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
