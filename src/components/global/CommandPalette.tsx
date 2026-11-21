"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { EVENTS } from "@/data/events";
import { CURRENT_BOARD, SUBCOMMITTEE_MEMBERS } from "@/data/board";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { FAQS } from "@/data/faq";
import { getSynonymMatches } from "@/data/searchSynonyms";
import { Search, Calendar, Users, Image as ImageIcon, HelpCircle, ArrowRight, X, Sparkles, BookOpen, Gamepad2 } from "lucide-react";
import { NanbaAvatar } from "@/components/chat/NanbaAvatar";
import { SITE_CONFIG } from "@/data/siteConfig";

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
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useModalScrollLock(isOpen, onClose);

  // Build searchable index (memoized once)
  const items = useMemo<SearchItem[]>(
    () => [
      // Core Pages
      { id: "p-home", category: "Page", title: "Home / முகப்பு", subtitle: "Official Emblem & Flagship Highlights", href: "/", icon: <Sparkles className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-events", category: "Page", title: "Events / நிகழ்வுகள்", subtitle: "Upcoming festivals & Ticket drops", href: "/events", icon: <Calendar className="w-4 h-4 text-accent-zari" /> },
      { id: "p-about", category: "Page", title: "About / எங்களைப் பற்றி", subtitle: "Mission, Constitution, History & FAQ", href: "/about", icon: <Sparkles className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-board", category: "Page", title: "Board / குழு", subtitle: "Executive leadership & committee chairs", href: "/board", icon: <Users className="w-4 h-4 text-brand-lavender" /> },
      { id: "p-games", category: "Page", title: "The Sangam Arcade / விளையாட்டு", subtitle: "Monthly Tamil Wordle (Sollu) & Connections (Thodarpu)", href: "/games", icon: <Gamepad2 className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-sollu", category: "Page", title: "Sollu / சொல்லு", subtitle: "Monthly Tamil Wordle · Tanglish & தமிழ் Akshara puzzle", href: "/games?game=sollu", icon: <Gamepad2 className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-thodarpu", category: "Page", title: "Thodarpu / தொடர்பு", subtitle: "Monthly Tamil Connections · 16 Cultural Tiles puzzle", href: "/games?game=thodarpu", icon: <Gamepad2 className="w-4 h-4 text-accent-kumkum-dark" /> },
      { id: "p-nanba", category: "Page", title: "Ask Nanba / நண்பா (AI Guide)", subtitle: "Chat with Nanba or search verified club knowledge", href: "/guide", icon: <NanbaAvatar size={16} className="w-4 h-4 shrink-0" /> },
      { id: "p-join", category: "Page", title: "Join / இணைந்திடுங்கள்", subtitle: "Guestbook & free student membership", href: "/join", icon: <Users className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-groupme", category: "Page", title: "GroupMe Campus Chat / பிரதான அரட்டை", subtitle: "Join our active student campus chat", href: SITE_CONFIG.groupMeUrl, icon: <Users className="w-4 h-4 text-brand-teal-dark" /> },
      { id: "p-instagram", category: "Page", title: "Instagram (@tamilsangam.osu)", subtitle: "Official announcements, photo drops & reels", href: SITE_CONFIG.instagramUrl, icon: <Sparkles className="w-4 h-4 text-accent-kumkum-dark" /> },
      { id: "p-suggestions", category: "Page", title: "Suggestions & Ideas / கருத்துக்களம்", subtitle: "Campus ideas, playlists & initiatives", href: "/suggestions", icon: <Sparkles className="w-4 h-4 text-accent-zari" /> },
      { id: "p-links", category: "Page", title: "Quick Links (Bio Hub)", subtitle: "Mobile link-in-bio & social links", href: "/links", icon: <ArrowRight className="w-4 h-4 text-brand-teal-dark" /> },

      // Events
      ...EVENTS.map((e) => ({
        id: `evt-${e.slug}`,
        category: "Event" as const,
        title: `${e.titleEn} (${e.titleTa})`,
        subtitle: `${e.date} · ${e.location}`,
        href: `/events/${e.slug}`,
        icon: <Calendar className="w-4 h-4 text-accent-zari" />,
      })),

      // Board Members
      ...CURRENT_BOARD.map((b) => ({
        id: `brd-${b.id}`,
        category: "Person" as const,
        title: `${b.nameEn} (${b.nameTa})`,
        subtitle: `${b.roleEn} · ${b.committeeEn}`,
        href: `/board`,
        icon: <Users className="w-4 h-4 text-accent-bronze-dark" />,
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
        href: `/events/${a.eventSlug || a.slug}#photo-vault`,
        icon: <ImageIcon className="w-4 h-4 text-brand-teal-dark" />,
      })),

      // FAQs
      ...FAQS.map((f) => ({
        id: `faq-${f.id}`,
        category: "FAQ" as const,
        title: `${f.questionEn}`,
        subtitle: f.answerEn.slice(0, 75) + "...",
        href: "/about#faq",
        icon: <HelpCircle className="w-4 h-4 text-brand-lavender" />,
      })),
    ],
    []
  );

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items.slice(0, 8);
    const { targetIds, matchedKeywords } = getSynonymMatches(q);
    return items
      .filter((item: SearchItem) => {
        if (targetIds.has(item.id)) return true;
        for (const kw of matchedKeywords) {
          if (item.title.toLowerCase().includes(kw.toLowerCase()) || item.subtitle.toLowerCase().includes(kw.toLowerCase())) {
            return true;
          }
        }
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [items, query]);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 p-4 bg-bg-sangam-deep/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Search and command palette"
        className="box-ticket w-full max-w-[min(92vw,680px)] max-h-[min(85dvh,720px)] flex flex-col bg-bg-sangam-deep border-2 border-accent-zari/60 shadow-[8px_8px_0px_rgba(199,147,71,0.35)] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b-2 border-border-zari-muted gap-3 shrink-0">
          <Search className="w-5 h-5 text-brand-teal-dark" aria-hidden="true" />
          <input
            ref={inputRef}
            id="command-palette-input"
            name="command_search"
            type="text"
            role="combobox"
            aria-expanded={filteredItems.length > 0}
            aria-controls="command-palette-results"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
              } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
                e.preventDefault();
                handleSelect(filteredItems[selectedIndex]);
              }
            }}
            placeholder={locale === "ta" ? "நிகழ்வுகள், குழு, பக்கங்கள் தேடுங்கள்..." : "Search events, people, pages, or FAQs..."}
            aria-label="Search query"
            className="w-full bg-transparent text-ink-alabaster placeholder:text-ink-sand/70 text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search input"
              className="text-ink-sand hover:text-ink-alabaster p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 border border-border-zari-muted text-[10px] font-mono bg-white/10 text-ink-sand">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          id="command-palette-results"
          role="listbox"
          aria-label="Search suggestions"
          data-lenis-prevent
          className="flex-1 max-h-[60vh] overflow-y-auto overscroll-contain p-2 space-y-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-ink-sand">
              <p className="text-sm">{locale === "ta" ? "எந்த முடிவுகளும் கிடைக்கவில்லை" : "No matching results found."}</p>
              <p className="text-xs text-ink-sand/80 mt-1 font-sans">Try searching &apos;diwali&apos;, &apos;dance&apos;, or &apos;board&apos;</p>
            </div>
          ) : (
            filteredItems.map((item: SearchItem, idx: number) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer border-2 transition-[background-color,border-color,box-shadow,color] duration-150 ease-out ${
                    isSelected ? "bg-surface-card-dark border-brand-lavender shadow-[3px_3px_0px_var(--color-brand-lavender)] text-ink-alabaster" : "border-transparent text-ink-alabaster/90 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center border border-border-zari-muted bg-bg-sangam-deep/60 shrink-0 text-brand-teal-dark">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate text-ink-alabaster">{item.title}</span>
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-sand shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-brand-lavender/80 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? "opacity-100 text-brand-teal-dark" : "opacity-0"}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 border-t border-border-zari-muted bg-surface-card-dark flex items-center justify-between text-[11px] text-ink-sand font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-sans text-brand-teal-dark font-bold">OSU Tamil Sangam</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
