// src/components/navigation/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Images,
  BookOpen,
  Link2,
  Lightbulb,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { isEditionComplete } from "@/lib/gamesStorage";
import {
  NAV_ROUTES,
  PRIMARY_NAV_ROUTES,
  SECONDARY_NAV_ROUTES,
  NavRoute,
} from "./navRoutes";

const getSecondaryIcon = (href: string) => {
  switch (href) {
    case "/guide":
      return BookOpen;
    case "/links":
      return Link2;
    case "/suggestions":
      return Lightbulb;
    default:
      return Sparkles;
  }
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { playClick, playSilkSwish } = useAudio();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [gamesUnsolved, setGamesUnsolved] = useState(true);
  const [isPastHero, setIsPastHero] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Check if games edition is completed
  useEffect(() => {
    setGamesUnsolved(!isEditionComplete("2026-10"));
  }, [pathname]);

  // Dark 3D Hero sections at the top of specific pages
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const darkHeroRoutes = [
    "/",
    "/events",
    "/about",
    "/board",
    "/games",
    "/guide",
    "/suggestions",
    "/join",
  ];
  const isHeroRoute = darkHeroRoutes.includes(normalizedPath);

  // Track active route
  const getActiveRoute = useCallback((): NavRoute => {
    if (pathname === "/") return NAV_ROUTES[0];
    const exact = NAV_ROUTES.find((r) => r.href !== "/" && pathname === r.href);
    if (exact) return exact;
    const prefixMatched = [...NAV_ROUTES]
      .filter((r) => r.href !== "/" && pathname.startsWith(`${r.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0];
    return prefixMatched || NAV_ROUTES[0];
  }, [pathname]);

  const activeRoute = getActiveRoute();

  const isSecondaryActive = SECONDARY_NAV_ROUTES.some(
    (r) => pathname === r.href || (r.href !== "/" && pathname.startsWith(`${r.href}/`))
  );

  // Scroll detection: reliably detect when user is past the hero on ANY page
  useEffect(() => {
    if (!isHeroRoute) {
      setIsPastHero(true);
      return;
    }

    const evaluateScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 800;

      // Check for editorial content sheet or hero container bottom
      const sheet = document.querySelector<HTMLElement>("[data-editorial-sheet]");
      if (sheet) {
        setIsPastHero(sheet.getBoundingClientRect().top <= 100);
        return;
      }

      const heroEl = document.querySelector<HTMLElement>(
        "[data-hero-pinned], [data-hero-stage], [data-hero-container], .hero-scroll-stage, #games-hero-stage"
      );
      if (heroEl) {
        setIsPastHero(heroEl.getBoundingClientRect().bottom <= 100);
        return;
      }

      // Route-specific fallback thresholds
      let threshold = vh * 1.2;
      if (pathname === "/") threshold = vh * 2.8;
      else if (pathname === "/about" || pathname === "/games") threshold = vh * 2.2;
      else if (pathname === "/guide" || pathname === "/events") threshold = vh * 1.5;

      setIsPastHero(scrollY >= threshold);
    };

    evaluateScroll();
    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [pathname, isHeroRoute]);

  // Close triggers: Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMoreOpen) setIsMoreOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        playClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, isMoreOpen, playClick]);

  // Close triggers: Click outside
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (isMoreOpen && moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
      if (isMobileMenuOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
        playClick();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isMobileMenuOpen, isMoreOpen, playClick]);

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      playSilkSwish();
      setIsMobileMenuOpen(true);
    } else {
      playClick();
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMoreMenu = () => {
    if (!isMoreOpen) {
      playSilkSwish();
      setIsMoreOpen(true);
    } else {
      playClick();
      setIsMoreOpen(false);
    }
  };

  const handleLinkClick = () => {
    playClick();
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playClick();
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);

    if (pathname === "/") {
      if (isPastHero) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const isDocked = isPastHero || !isHeroRoute;

  return (
    <header
      id="global-floating-nav"
      ref={navRef}
      className={`fixed left-0 right-0 z-50 transition-[top,padding,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isDocked
          ? "top-0 w-full bg-[#140C20]/95 backdrop-blur-xl border-b border-[#A6F0CF]/20 shadow-[0_4px_28px_rgba(0,0,0,0.5)] py-2.5 sm:py-3 px-4 sm:px-8"
          : "top-3 sm:top-4 w-full px-4 sm:px-8 pointer-events-none flex justify-center"
      }`}
    >
      <div
        className={`w-full flex items-center justify-between transition-[max-width,padding,background-color,border-color,border-radius,box-shadow] duration-300 ${
          isDocked
            ? "max-w-7xl mx-auto pointer-events-auto"
            : "max-w-6xl mx-auto pointer-events-auto bg-[#140C20]/80 backdrop-blur-md rounded-lg border border-[rgba(125,96,166,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-2 px-3 sm:px-5"
        }`}
      >
        {/* ======================================================================= */}
        {/* LEFT: Brand Lockup with Official Seal Crest                            */}
        {/* ======================================================================= */}
        <Link
          href="/"
          onClick={handleBrandClick}
          aria-label="OSU Tamil Sangam Home"
          className="group flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0] rounded-sm select-none pr-3"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full p-[1.5px] bg-gradient-to-tr from-[#A6F0CF]/70 via-[#F5D061]/50 to-[#7D60A6]/70 group-hover:from-[#A6F0CF] group-hover:to-[#FFE082] transition-colors shadow-sm">
            <Image
              src="/emblem.svg"
              alt="The Ohio State University Tamil Sangam Official Seal"
              width={36}
              height={36}
              priority
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors leading-tight">
              {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
            </span>
            <span
              lang="ta"
              style={{ letterSpacing: 0 }}
              className="font-tamil text-[9px] text-[#A6F0CF]/80 group-hover:text-[#A6F0CF] transition-opacity mt-0.5 leading-none font-medium"
            >
              {locale === "ta" ? "The Ohio State University" : "ஒஹையோ மாநிலப் பல்கலைக்கழகம்"}
            </span>
          </div>
        </Link>

        {/* ======================================================================= */}
        {/* CENTER: Hybrid Desktop Navigation (Select Pages + More Drawer)          */}
        {/* ======================================================================= */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 justify-center"
        >
          {PRIMARY_NAV_ROUTES.map((route) => {
            const isActive = activeRoute.href === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={handleLinkClick}
                aria-current={isActive ? "page" : undefined}
                className={`group relative px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-sans transition-[color,background-color] duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#F4F0FA] font-semibold"
                    : "text-[#C4B7D7] hover:text-[#F4F0FA] font-medium"
                }`}
              >
                <span>{locale === "ta" ? route.ta : route.en}</span>

                {/* Subtle Status Indicator */}
                {route.isNew && (
                  <span className="font-mono text-[8px] font-bold uppercase tracking-wider px-1 py-[0.5px] rounded-xs bg-[#A6F0CF]/20 text-[#A6F0CF]">
                    NEW
                  </span>
                )}
                {route.badge && !route.isNew && gamesUnsolved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A6F0CF] animate-pulse" />
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* More Dropdown for Secondary Pages (Gallery, Guide, Links, Ideas) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={toggleMoreMenu}
              aria-expanded={isMoreOpen}
              aria-haspopup="menu"
              aria-label={isMoreOpen ? "Close explore menu" : "Open explore menu"}
              className={`group relative px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-sans transition-[color,background-color] duration-150 flex items-center gap-1 cursor-pointer select-none ${
                isSecondaryActive || isMoreOpen
                  ? "text-[#F4F0FA] font-semibold"
                  : "text-[#C4B7D7] hover:text-[#F4F0FA] font-medium"
              }`}
            >
              <span>{locale === "ta" ? "மேலும்" : "More"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180 text-[#A6F0CF]" : "text-[#C4B7D7] group-hover:text-[#F4F0FA]"
                }`}
              />

              {isSecondaryActive && (
                <motion.div
                  layoutId="navbar-active-indicator"
                  className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Desktop More Dropdown Menu */}
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  role="menu"
                  className="absolute top-full right-0 mt-2 w-72 p-2 rounded-2xl bg-[#1A1028]/98 backdrop-blur-2xl border border-[rgba(125,96,166,0.35)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                >
                  <div className="px-2.5 py-1.5 border-b border-[rgba(125,96,166,0.2)] mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#A6F0CF] font-bold">
                      {locale === "ta" ? "கூடுதல் பக்கங்கள்" : "COMMUNITY & EXPLORE"}
                    </span>
                    <span lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-[10px] text-[#C4B7D7]">
                      {locale === "ta" ? "Explore" : "வழிகாட்டிகள்"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {SECONDARY_NAV_ROUTES.map((route) => {
                      const isActive = activeRoute.href === route.href;
                      const Icon = getSecondaryIcon(route.href);
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={handleLinkClick}
                          role="menuitem"
                          className={`group flex items-start gap-3 p-2.5 rounded-xl transition-[background-color,border-color] ${
                            isActive
                              ? "bg-[#25173B] border border-[#A6F0CF]/50 text-[#F4F0FA]"
                              : "hover:bg-[#25173B]/70 border border-transparent text-[#C4B7D7] hover:text-[#F4F0FA]"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                              isActive
                                ? "bg-[#140C20] border-[#A6F0CF]/60 text-[#A6F0CF]"
                                : "bg-[#140C20]/80 border-[rgba(125,96,166,0.25)] text-[#C4B7D7] group-hover:text-[#A6F0CF] group-hover:border-[#A6F0CF]/40"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-sans text-xs font-semibold text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors">
                                {locale === "ta" ? route.ta : route.en}
                              </span>
                              <span
                                lang="ta"
                                style={{ letterSpacing: 0 }}
                                className="font-tamil text-[10px] text-[#A6F0CF]/75 ml-2 shrink-0"
                              >
                                {locale === "ta" ? route.en : route.ta}
                              </span>
                            </div>
                            {route.descriptionEn && (
                              <p className="text-[11px] font-sans text-[#C4B7D7] mt-0.5 leading-snug line-clamp-1">
                                {locale === "ta" ? route.descriptionTa : route.descriptionEn}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ======================================================================= */}
        {/* RIGHT: Primary Action CTA & Mobile Menu Trigger                         */}
        {/* ======================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Join CTA (Desktop) */}
          <Link
            href="/join"
            onClick={handleLinkClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#A6F0CF] text-[#140C20] hover:bg-[#7AE7B5] font-sans font-semibold text-xs tracking-wide transition-all shadow-[0_0_12px_rgba(166,240,207,0.3)] hover:shadow-[0_0_18px_rgba(166,240,207,0.5)] cursor-pointer"
          >
            <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join Sangam"}</span>
            <span className="text-[11px]">↗</span>
          </Link>

          {/* Mobile Menu Button (< 1024px) */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#F4F0FA] hover:text-[#A6F0CF] hover:border-[#A6F0CF]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0]"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER / MENU SHEET (< 1024px)                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden w-full max-w-7xl mx-auto mt-2 pt-3 pb-5 px-3 sm:px-6 bg-[#140C20]/98 backdrop-blur-2xl border-t border-b border-[#A6F0CF]/25 shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
          >
            <div className="space-y-4">
              {/* Primary Navigation Grid */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A6F0CF] font-bold block mb-2 px-1">
                  {locale === "ta" ? "முக்கிய பக்கங்கள்" : "CORE & LEADERSHIP"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_NAV_ROUTES.map((route) => {
                    const isActive = activeRoute.href === route.href;
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={handleLinkClick}
                        className={`flex flex-col p-3 rounded-xl border transition-[background-color,border-color] ${
                          isActive
                            ? "bg-[#25173B] border-[#A6F0CF]/50 text-[#F4F0FA] shadow-[0_0_12px_rgba(166,240,207,0.15)]"
                            : "bg-[#1d122d]/70 border-[rgba(125,96,166,0.2)] text-[#C4B7D7] hover:bg-[#25173B] hover:text-[#F4F0FA]"
                        }`}
                      >
                        <span className="font-sans text-xs sm:text-sm font-semibold flex items-center justify-between">
                          <span>{locale === "ta" ? route.ta : route.en}</span>
                          {route.isNew && (
                            <span className="font-mono text-[8px] font-bold uppercase tracking-wider px-1 py-[0.5px] rounded-xs bg-[#A6F0CF]/20 text-[#A6F0CF]">
                              NEW
                            </span>
                          )}
                        </span>
                        <span
                          lang="ta"
                          style={{ letterSpacing: 0 }}
                          className="font-tamil text-[10px] text-[#A6F0CF]/80 mt-0.5"
                        >
                          {locale === "ta" ? route.en : route.ta}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Navigation Grid */}
              <div className="pt-2 border-t border-[rgba(125,96,166,0.2)]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4B7D7] font-bold block mb-2 px-1">
                  {locale === "ta" ? "கூடுதல் வழிகாட்டிகள்" : "EXPLORE & ARCHIVES"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SECONDARY_NAV_ROUTES.map((route) => {
                    const isActive = activeRoute.href === route.href;
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={handleLinkClick}
                        className={`flex flex-col p-2.5 rounded-xl border transition-[background-color,border-color] ${
                          isActive
                            ? "bg-[#25173B] border-[#A6F0CF]/50 text-[#F4F0FA]"
                            : "bg-[#160d23]/80 border-[rgba(125,96,166,0.15)] text-[#C4B7D7] hover:bg-[#25173B] hover:text-[#F4F0FA]"
                        }`}
                      >
                        <span className="font-sans text-xs font-medium flex items-center justify-between">
                          <span>{locale === "ta" ? route.ta : route.en}</span>
                        </span>
                        <span
                          lang="ta"
                          style={{ letterSpacing: 0 }}
                          className="font-tamil text-[9px] text-[#C4B7D7] mt-0.5"
                        >
                          {locale === "ta" ? route.en : route.ta}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Actions: Join Sangam */}
              <div className="pt-3 border-t border-[rgba(125,96,166,0.25)] flex flex-col gap-2">
                <Link
                  href="/join"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A6F0CF] text-[#140C20] font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#7AE7B5] transition-colors shadow-sm"
                >
                  <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth (Free Membership)"}</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
