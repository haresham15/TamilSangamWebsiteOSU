// src/components/navigation/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { isEditionComplete } from "@/lib/gamesStorage";
import { Magnet } from "@/components/ui/react-bits";
import { NAV_ROUTES, NavRoute } from "./navRoutes";
import { SikkuKolamToggle } from "./SikkuKolamToggle";
import { NavBilingualItem } from "./NavBilingualItem";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { playClick, playSilkSwish } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [gamesUnsolved, setGamesUnsolved] = useState(true);

  const navRef = useRef<HTMLDivElement>(null);
  const openScrollYRef = useRef<number>(0);

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
    "/gallery",
    "/games",
    "/guide",
    "/suggestions",
    "/join",
  ];
  const isHeroRoute = darkHeroRoutes.includes(normalizedPath);

  // Adaptive Backdrop & Hero Detection
  const [isPastHero, setIsPastHero] = useState(false);
  const isDarkHero = isHeroRoute && !isPastHero;
  const isInHeroZone = isHeroRoute && !isPastHero;

  // Auto-collapse if user enters or scrolls back into hero zone
  useEffect(() => {
    if (isInHeroZone && isOpen) {
      setIsOpen(false);
    }
  }, [isInHeroZone, isOpen]);

  // Track active route
  const getActiveRoute = useCallback((): NavRoute => {
    if (pathname === "/") return NAV_ROUTES[0];
    const matched = NAV_ROUTES.find(
      (r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(`${r.href}/`))
    );
    return matched || NAV_ROUTES[0];
  }, [pathname]);

  const activeRoute = getActiveRoute();

  // Scroll detection for dark hero vs. courtyard backdrop
  useEffect(() => {
    const getHeroFallbackThreshold = (): number => {
      if (typeof window === "undefined") return 1200;
      const vh = window.innerHeight || 800;
      if (pathname === "/") return vh * 3.8;
      if (pathname === "/about") return vh * 3.0;
      if (pathname === "/guide") return vh * 2.8;
      if (pathname === "/games") return vh * 2.8;
      if (pathname === "/events") return vh * 2.2;
      if (pathname === "/gallery") return vh * 2.2;
      if (pathname === "/suggestions") return vh * 2.2;
      if (pathname === "/join") return vh * 1.8;
      if (pathname === "/board") return vh * 1.4;
      return vh * 1.5;
    };

    let ticking = false;
    let cachedSheet: HTMLElement | null = null;
    let sheetCheckTime = 0;

    const evaluateScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        const now = performance.now();
        if (!cachedSheet || !cachedSheet.isConnected || now - sheetCheckTime > 1500) {
          cachedSheet = document.querySelector<HTMLElement>("[data-editorial-sheet]");
          sheetCheckTime = now;
        }

        let pastHero = false;
        if (cachedSheet) {
          pastHero = cachedSheet.getBoundingClientRect().top <= 80;
        } else {
          const heroEl = document.querySelector<HTMLElement>(
            "[data-hero-pinned], [data-hero-stage], [data-hero-container], .hero-scroll-stage"
          );
          if (heroEl) {
            pastHero = heroEl.getBoundingClientRect().bottom <= 80;
          } else {
            const threshold = getHeroFallbackThreshold();
            pastHero = threshold === 0 || scrollY >= threshold;
          }
        }
        setIsPastHero(pastHero);

        // Auto-collapse if user scrolls past 180px while open
        if (isOpen && Math.abs(scrollY - openScrollYRef.current) > 180) {
          setIsOpen(false);
        }
      });
    };

    evaluateScroll();
    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [pathname, isHeroRoute, isOpen]);

  // Close triggers: Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        playClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, playClick]);

  // Close triggers: Click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        playClick();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, playClick]);

  // Toggle handler
  const handleToggle = () => {
    if (!isOpen) {
      openScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
      playSilkSwish();
      setIsOpen(true);
    } else {
      playClick();
      setIsOpen(false);
    }
  };

  const handleLinkClick = () => {
    playClick();
    setIsOpen(false);
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playClick();
    setIsOpen(false);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("ts_skip_hero", "true");
      } catch {
        // Ignore storage exceptions
      }
    }

    if (pathname === "/") {
      e.preventDefault();
      const target =
        document.getElementById("flagship-gathering") ||
        document.querySelector<HTMLElement>("[data-editorial-sheet]");
      if (target) {
        if (window.__lenis) {
          window.__lenis.scrollTo(target, { offset: -20, duration: 1.0 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // Spring animations for width morph
  const containerSpring = isOpen
    ? ({ type: "spring", stiffness: 260, damping: 26, mass: 0.9 } as const)
    : ({ type: "spring", stiffness: 320, damping: 30, mass: 0.8 } as const);

  return (
    <LayoutGroup id="muttram-navbar-expandable">
      <header
        id="global-floating-nav"
        className="fixed top-2.5 sm:top-3.5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center items-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <motion.div
          ref={navRef}
          layout
          transition={containerSpring}
          style={{ borderRadius: isOpen ? 26 : 9999 }}
          className={`pointer-events-auto relative border transition-colors duration-300 ${
            isOpen
              ? isDarkHero
                ? "w-full max-w-6xl bg-[#140C20]/95 border-[#A6F0CF]/35 text-[#F4F0FA] shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                : "w-full max-w-6xl bg-[#140C20]/95 border-[rgba(125,96,166,0.25)] text-[#F4F0FA] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              : isDarkHero
              ? "w-auto max-w-[440px] bg-[#140C20]/85 border-[#A6F0CF]/35 text-[#F4F0FA] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
              : "w-auto max-w-[440px] bg-[#140C20]/92 border-[rgba(125,96,166,0.25)] text-[#F4F0FA] shadow-[0_8px_30px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.2)] backdrop-blur-md"
          } p-1.5 sm:p-2`}
        >
          {/* ======================================================================= */}
          {/* DESKTOP VIEW (>= 1024px): Seamless horizontal expansion                */}
          {/* ======================================================================= */}
          <div className="hidden lg:flex items-center justify-between gap-2 xl:gap-3 px-2">
            {/* Left: Brand Lockup */}
            <Link
              href="/#flagship-gathering"
              onClick={handleBrandClick}
              aria-label="OSU Tamil Sangam Home"
              className="group flex flex-col text-left shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0] rounded-xs select-none pr-2"
            >
              <span
                className={`font-serif font-bold text-sm sm:text-base tracking-tight transition-colors leading-tight ${
                  isDarkHero
                    ? "text-[#F4F0FA] group-hover:text-[#A6F0CF]"
                    : "text-[#F4F0FA] group-hover:text-[#A6F0CF]"
                }`}
              >
                {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className={`font-tamil text-[9px] transition-opacity mt-0.5 leading-none font-medium ${
                  isDarkHero
                    ? "text-[#A6F0CF]/80 group-hover:text-[#A6F0CF]"
                    : "text-[#C4B7D7] opacity-65 group-hover:opacity-100"
                }`}
              >
                {locale === "ta" ? "The Ohio State University" : "ஒஹியோ மாநிலப் பல்கலைக்கழகம்"}
              </span>
            </Link>

            {/* Center Context Pill: Visible ONLY when Collapsed (State A) */}
            <AnimatePresence mode="wait">
              {!isOpen && (
                <motion.div
                  key="collapsed-active-pill"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all select-none ${
                    isDarkHero
                      ? "bg-white/10 border border-white/15 text-[#F4F0FA]"
                      : "bg-[#25173B] border border-[rgba(125,96,166,0.25)] text-[#F4F0FA]"
                  }`}
                >
                  <span className="font-medium">
                    {locale === "ta" ? activeRoute.ta : activeRoute.en}
                  </span>
                  <span
                    className={`size-1.5 rounded-full ${
                      activeRoute.isNew
                        ? "bg-[#A6F0CF] shadow-[0_0_6px_#A6F0CF] animate-pulse"
                        : isDarkHero
                        ? "bg-[#A6F0CF]"
                        : "bg-[#A6F0CF]"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className={`font-tamil text-[10px] opacity-80 ${
                      isDarkHero ? "text-[#A6F0CF]" : "text-[#A6F0CF]"
                    }`}
                  >
                    {locale === "ta" ? activeRoute.en : activeRoute.ta}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Middle Track: Staggered Bilingual Reveal (State B - Expanded) */}
            <AnimatePresence>
              {isOpen && (
                <motion.nav
                  key="desktop-expanded-links"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  aria-label="Expanded Navigation"
                  className="flex items-center gap-x-1 xl:gap-x-1.5 flex-1 justify-center overflow-x-hidden py-0.5 px-1"
                >
                  {NAV_ROUTES.map((route, index) => {
                    const isActive = activeRoute.href === route.href;
                    return (
                      <NavBilingualItem
                        key={route.href}
                        route={route}
                        isActive={isActive}
                        isDarkHero={isDarkHero}
                        locale={locale}
                        gamesUnsolved={gamesUnsolved}
                        isExpanded={isOpen}
                        onClick={handleLinkClick}
                        index={index}
                      />
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Right Cluster: CTA (Visible when Expanded) + Sikku Kolam Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="desktop-cta"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                  >
                    <Magnet padding={20} magnetStrength={1.8} maxOffset={4}>
                      <Link
                        href="/join"
                        onClick={handleLinkClick}
                        tabIndex={isOpen ? 0 : -1}
                        className={`group inline-flex items-center gap-1 font-sans text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD6E0] rounded-full py-1 px-3 ${
                          isDarkHero
                            ? "text-[#F4F0FA] hover:text-[#A6F0CF] bg-white/5 hover:bg-white/10"
                            : "text-[#F4F0FA] hover:text-[#A6F0CF] bg-[#25173B]/80 hover:bg-[#25173B]"
                        }`}
                      >
                        <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
                        <span
                          className={`text-xs transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                            isDarkHero ? "text-[#A6F0CF]" : "text-[#A6F0CF]"
                          }`}
                        >
                          ↗
                        </span>
                      </Link>
                    </Magnet>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sikku Kolam Knot Toggle Button */}
              <SikkuKolamToggle
                isOpen={isOpen}
                onToggle={handleToggle}
                isDarkHero={isDarkHero}
              />
            </div>
          </div>

          {/* ======================================================================= */}
          {/* MOBILE & TABLET VIEW (< 1024px): Smooth vertical card expansion        */}
          {/* ======================================================================= */}
          <div className="lg:hidden flex flex-col w-full">
            {/* Top Bar inside Pill */}
            <div className="flex items-center justify-between gap-2 px-2 py-0.5">
              <Link
                href="/#flagship-gathering"
                onClick={handleBrandClick}
                aria-label="OSU Tamil Sangam Home"
                className="group flex flex-col text-left shrink-0 cursor-pointer select-none"
              >
                <span
                  className={`font-serif font-bold text-sm tracking-tight transition-colors leading-tight ${
                    isDarkHero ? "text-[#F4F0FA]" : "text-[#F4F0FA]"
                  }`}
                >
                  {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
                </span>
                <span
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className={`font-tamil text-[8.5px] leading-none mt-0.5 font-medium ${
                    isDarkHero ? "text-[#A6F0CF]/80" : "text-[#C4B7D7] opacity-75"
                  }`}
                >
                  {locale === "ta" ? "The Ohio State University" : "ஒஹியோ மாநிலப் பல்கலைக்கழகம்"}
                </span>
              </Link>

              {/* Center Active Pill on Mobile */}
              {!isOpen && (
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans ${
                    isDarkHero
                      ? "bg-white/10 text-[#F4F0FA]"
                      : "bg-[#25173B] text-[#F4F0FA]"
                  }`}
                >
                  <span className="font-medium truncate max-w-[90px]">
                    {locale === "ta" ? activeRoute.ta : activeRoute.en}
                  </span>
                  <span
                    className={`size-1.5 rounded-full ${
                      activeRoute.isNew
                        ? "bg-[#A6F0CF] animate-pulse"
                        : isDarkHero
                        ? "bg-[#A6F0CF]"
                        : "bg-[#A6F0CF]"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Kolam Toggle */}
              <SikkuKolamToggle
                isOpen={isOpen}
                onToggle={handleToggle}
                isDarkHero={isDarkHero}
              />
            </div>

            {/* Mobile Expanded 2-Column Grid */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="mobile-expanded-grid"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden pt-3 mt-2 border-t border-current/10"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {NAV_ROUTES.map((route, index) => {
                      const isActive = activeRoute.href === route.href;
                      return (
                        <motion.div
                          key={route.href}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <Link
                            href={route.href}
                            onClick={handleLinkClick}
                            className={`flex flex-col p-2.5 rounded-xl border transition-colors ${
                              isActive
                                ? isDarkHero
                                  ? "bg-white/15 border-[#A6F0CF]/35 text-[#F4F0FA]"
                                  : "bg-[#25173B] border-[rgba(125,96,166,0.25)] text-[#F4F0FA]"
                                : isDarkHero
                                ? "bg-white/5 border-white/5 text-[#C4B7D7] hover:bg-white/10"
                                : "bg-white/60 border-black/5 text-[#F4F0FA] hover:bg-white"
                            }`}
                          >
                            <span className="font-sans text-xs font-semibold inline-flex items-center gap-1.5">
                              {locale === "ta" ? route.ta : route.en}
                              {route.isNew && (
                                <span className="font-mono text-[7px] font-bold uppercase tracking-wider px-1 py-[0.5px] rounded-full bg-[#F26BB5]/15 text-[#A6F0CF] border border-[#A6F0CF]/35">
                                  NEW
                                </span>
                              )}
                              {route.badge && !route.isNew && gamesUnsolved && (
                                <span className="size-1.5 rounded-full bg-[#A6F0CF] animate-pulse" />
                              )}
                            </span>
                            <span
                              lang="ta"
                              style={{ letterSpacing: 0 }}
                              className={`font-tamil text-[9px] mt-0.5 ${
                                isDarkHero ? "text-[#A6F0CF]" : "text-[#A6F0CF]"
                              }`}
                            >
                              {locale === "ta" ? route.en : route.ta}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Mobile CTA */}
                  <div className="pt-3 mt-3 border-t border-current/10">
                    <Link
                      href="/join"
                      onClick={handleLinkClick}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#A6F0CF] text-[#140C20] font-sans font-semibold text-xs hover:bg-[#7AE7B5] transition-colors shadow-xs"
                    >
                      <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </header>
    </LayoutGroup>
  );
};
