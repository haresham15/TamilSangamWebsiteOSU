// src/components/navigation/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { isEditionComplete } from "@/lib/gamesStorage";
import { Magnet } from "@/components/ui/react-bits";
import { NAV_ROUTES, PRIMARY_NAV_ROUTES, NavRoute } from "./navRoutes";
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

        // Auto-collapse only on desktop if user scrolls far past open position (> 350px)
        if (isOpen && typeof window !== "undefined" && window.innerWidth >= 1024 && Math.abs(scrollY - openScrollYRef.current) > 350) {
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

  // Lock body scroll on mobile while navigation drawer is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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

    if (pathname === "/") {
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 0.8 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Hide nav during initial 3D hero section so hero has full stage; show permanently on scroll into content
  const shouldHideNav = isHeroRoute && !isPastHero && !isOpen;

  // Spring animation parameters for smooth width expansion without scale distortion
  const containerSpring = {
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
    mass: 0.85,
  };

  return (
    <>
      {/* Dimmed Courtyard Backdrop to intercept outside clicks and focus nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => {
              playClick();
              setIsOpen(false);
            }}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
          />
        )}
      </AnimatePresence>

      <header
        id="global-floating-nav"
        className={`fixed top-2.5 sm:top-3.5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          shouldHideNav ? "-translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        <motion.div
          ref={navRef}
          initial={false}
          animate={{
            maxWidth: isOpen ? 1152 : 440,
            borderRadius: isOpen ? 24 : 9999,
          }}
          transition={containerSpring}
          className={`pointer-events-auto relative border transition-colors duration-300 w-full ${
            isOpen
              ? isDarkHero
                ? "bg-[#1C122B]/95 border-[#C79347]/35 text-[#FAF5ED] shadow-[0_12px_44px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                : "bg-[#1C122B]/95 border-[#C79347]/35 text-[#FAF5ED] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : isDarkHero
              ? "bg-[#1C122B]/90 border-[#C79347]/30 text-[#FAF5ED] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
              : "bg-[#1C122B]/92 border-[#C79347]/30 text-[#FAF5ED] shadow-[0_8px_30px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.2)] backdrop-blur-md"
          } p-1.5 sm:p-2`}
        >
          {/* ======================================================================= */}
          {/* DESKTOP VIEW (>= 1024px): Seamless horizontal expansion                */}
          {/* ======================================================================= */}
          <div className="hidden lg:flex items-center justify-between gap-2 xl:gap-3 px-2">
            {/* Left: Brand Lockup */}
            <Link
              href="/"
              onClick={handleBrandClick}
              aria-label="OSU Tamil Sangam Home"
              className="group flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A8] rounded-full select-none pr-2"
            >
              <div className="relative w-7 h-7 shrink-0 rounded-full bg-[#271A3C] border border-[#C79347]/40 flex items-center justify-center p-1">
                <Image
                  src="/emblem.svg"
                  alt="OSU Tamil Sangam Emblem"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm tracking-tight text-[#FAF5ED] group-hover:text-[#C79347] transition-colors leading-tight">
                  {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
                </span>
                <span
                  lang="ta"
                  style={{ letterSpacing: 0 }}
                  className="font-tamil text-[9px] text-[#CBBBA8] opacity-80 group-hover:opacity-100 transition-opacity mt-0.5 leading-none font-medium"
                >
                  {locale === "ta" ? "The Ohio State University" : "ஒஹியோ மாநிலப் பல்கலைக்கழகம்"}
                </span>
              </div>
            </Link>

            {/* Center Context Pill: Visible ONLY when Collapsed (State A) */}
            <AnimatePresence mode="wait">
              {!isOpen && (
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    key="collapsed-active-pill"
                    onClick={handleToggle}
                    aria-label={`Current page: ${locale === "ta" ? activeRoute.ta : activeRoute.en}. Click to open navigation menu.`}
                    title="Click to explore all pages"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-[#271A3C] border border-[#C79347]/30 hover:border-[#C79347]/60 hover:bg-[#352254] text-[#FAF5ED] select-none cursor-pointer transition-colors"
                  >
                    <span className="font-medium group-hover:text-[#FAF5ED] transition-colors">
                      {locale === "ta" ? activeRoute.ta : activeRoute.en}
                    </span>
                    <span
                      className="size-1.5 rounded-full bg-[#2BB5A8]"
                      aria-hidden="true"
                    />
                    <span
                      lang="ta"
                      style={{ letterSpacing: 0 }}
                      className="font-tamil text-[10px] text-[#C79347] opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      {locale === "ta" ? activeRoute.en : activeRoute.ta}
                    </span>
                  </motion.button>
                </div>
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
                  className="flex items-center gap-x-0.5 xl:gap-x-1.5 flex-1 justify-center py-0.5 px-0.5 sm:px-1"
                >
                  {PRIMARY_NAV_ROUTES.map((route, index) => {
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
                        className="group inline-flex items-center gap-1 font-sans text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A8] rounded-full py-1 px-3 text-[#FAF5ED] hover:text-[#C79347] bg-[#271A3C] hover:bg-[#352254] border border-[#C79347]/30"
                      >
                        <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
                        <span className="text-xs transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#2BB5A8]">
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
                href="/"
                onClick={handleBrandClick}
                aria-label="OSU Tamil Sangam Home"
                className="group flex items-center gap-2 text-left shrink-0 cursor-pointer select-none"
              >
                <div className="relative w-6 h-6 shrink-0 rounded-full bg-[#271A3C] border border-[#C79347]/40 flex items-center justify-center p-0.5">
                  <Image
                    src="/emblem.svg"
                    alt="OSU Tamil Sangam Emblem"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-sm tracking-tight text-[#FAF5ED] leading-tight">
                    {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
                  </span>
                  <span
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="font-tamil text-[8.5px] leading-none mt-0.5 font-medium text-[#CBBBA8] opacity-80"
                  >
                    {locale === "ta" ? "The Ohio State University" : "ஒஹியோ மாநிலப் பல்கலைக்கழகம்"}
                  </span>
                </div>
              </Link>

              {/* Center Active Pill on Mobile */}
              {!isOpen && (
                <button
                  type="button"
                  onClick={handleToggle}
                  aria-label={`Current page: ${locale === "ta" ? activeRoute.ta : activeRoute.en}. Click to open navigation menu.`}
                  title="Click to explore all pages"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-[#271A3C] text-[#FAF5ED] border border-[#C79347]/30 hover:border-[#C79347]/60 transition-colors">
                    <span className="font-medium truncate max-w-[80px]">
                      {locale === "ta" ? activeRoute.ta : activeRoute.en}
                    </span>
                    <span
                      className="size-1 rounded-full bg-[#2BB5A8]"
                      aria-hidden="true"
                    />
                  </div>
                </button>
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
                  className="overflow-hidden pt-3 mt-2 border-t border-[#C79347]/20 max-h-[75vh] overflow-y-auto"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {PRIMARY_NAV_ROUTES.map((route, index) => {
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
                                ? "bg-[#271A3C] border-[#C79347]/50 text-[#FAF5ED]"
                                : "bg-[#1C122B]/70 border-white/5 text-[#CBBBA8] hover:bg-[#271A3C]/60 hover:text-[#FAF5ED]"
                            }`}
                          >
                            <span className="font-sans text-xs font-semibold inline-flex items-center gap-1.5">
                              {locale === "ta" ? route.ta : route.en}
                              {route.isNextEvent ? (
                                <span className="font-mono text-[7px] font-bold uppercase tracking-wider px-1 py-[0.5px] rounded-full bg-[#2BB5A8]/20 text-[#2BB5A8] border border-[#2BB5A8]/50">
                                  NEXT
                                </span>
                              ) : route.isNew ? (
                                <span className="font-mono text-[7px] font-bold uppercase tracking-wider px-1 py-[0.5px] rounded-full bg-[#C79347]/20 text-[#C79347] border border-[#C79347]/35">
                                  NEW
                                </span>
                              ) : null}
                              {route.badge && !route.isNew && gamesUnsolved && (
                                <span className="size-1 rounded-full bg-[#C79347]" />
                              )}
                            </span>
                            <span
                              lang="ta"
                              style={{ letterSpacing: 0 }}
                              className="font-tamil text-[9px] mt-0.5 text-[#2BB5A8]"
                            >
                              {locale === "ta" ? route.en : route.ta}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Mobile CTA */}
                  <div className="pt-3 mt-3 border-t border-[#C79347]/20">
                    <Link
                      href="/join"
                      onClick={handleLinkClick}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0F766E] text-[#FAF5ED] font-sans font-semibold text-xs hover:bg-[#0B5C56] transition-colors shadow-xs"
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
    </>
  );
};
