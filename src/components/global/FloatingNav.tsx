"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { Menu, X } from "lucide-react";
import { Magnet } from "@/components/ui/react-bits";
import { isEditionComplete } from "@/lib/gamesStorage";

// ============================================================================
// 1. NAVIGATION ROUTE CONFIGURATION
// ============================================================================
interface NavRoute {
  href: string;
  en: string;
  ta: string;
  badge?: boolean;
}

const NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/gallery", en: "Gallery", ta: "நினைவுகள்" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", badge: true },
  { href: "/guide", en: "Guide & FAQ", ta: "வழிகாட்டி" },
  { href: "/suggestions", en: "Ideas", ta: "கருத்து" },
];

export const FloatingNav: React.FC = () => {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { playClick, playSilkSwish } = useAudio();

  const [gamesUnsolved, setGamesUnsolved] = useState(true);
  useEffect(() => {
    setGamesUnsolved(!isEditionComplete("2026-10"));
  }, [pathname]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);
  useModalScrollLock(isMobileMenuOpen, handleCloseMobileMenu);

  // Dark 3D Hero sections at the top of specific pages
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const darkHeroRoutes = ["/", "/events", "/about", "/board", "/gallery", "/games", "/guide", "/suggestions", "/join"];
  const isHeroRoute = darkHeroRoutes.includes(normalizedPath);

  // Visibility & Contextual Backdrop State
  const [isPastHero, setIsPastHero] = useState(false);
  const [isInHeroZone, setIsInHeroZone] = useState(() => isHeroRoute);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const scrollStateRef = useRef({
    isPastHero: false,
    isInHeroZone: isHeroRoute,
    isScrolledDown: false,
    isAtTop: true,
  });

  const isDarkHero = isHeroRoute && !isPastHero;

  // References for Gooey Active Indicator & Magnetic Mechanics
  const headerRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const innerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isShiftedRefs = useRef<Record<string, boolean>>({});

  const mainDotRef = useRef<HTMLSpanElement>(null);
  const trailDotRef = useRef<HTMLSpanElement>(null);
  const previousHrefRef = useRef<string | null>(null);

  // Determine current active route key
  const getActiveRouteHref = useCallback((): string | null => {
    if (pathname === "/") return "/";
    if (pathname === "/join") return null; // CTA is separate
    const matched = NAV_ROUTES.find(
      (r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(`${r.href}/`))
    );
    return matched ? matched.href : null;
  }, [pathname]);

  const activeHref = getActiveRouteHref();

  // ============================================================================
  // 2. HERO ANIMATION SCROLL THRESHOLD & ADAPTIVE BACKDROP ENGINE
  // ============================================================================
  useEffect(() => {
    const getHeroThreshold = (): number => {
      if (typeof window === "undefined") return 0;
      if (pathname === "/") return 850;
      if (pathname === "/about") return 2200;
      if (pathname === "/events") return 1400;
      if (pathname === "/board") return 800;
      if (pathname === "/gallery") return 800;
      if (pathname === "/guide") return 2400;
      if (pathname === "/suggestions") return 800;
      if (pathname === "/join") return 800;
      return 0;
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
        if (!cachedSheet || now - sheetCheckTime > 2000) {
          cachedSheet = document.querySelector<HTMLElement>("[data-editorial-sheet]");
          sheetCheckTime = now;
        }

        let pastHero = false;
        if (cachedSheet) {
          pastHero = cachedSheet.getBoundingClientRect().top <= 80;
        } else {
          const threshold = getHeroThreshold();
          pastHero = threshold === 0 || scrollY >= threshold;
        }

        const inHero = isHeroRoute && !pastHero;
        const atTop = scrollY <= 32;
        const scrolledDown = scrollY > 20;

        const prev = scrollStateRef.current;
        if (
          prev.isPastHero !== pastHero ||
          prev.isInHeroZone !== inHero ||
          prev.isAtTop !== atTop ||
          prev.isScrolledDown !== scrolledDown
        ) {
          scrollStateRef.current = {
            isPastHero: pastHero,
            isInHeroZone: inHero,
            isAtTop: atTop,
            isScrolledDown: scrolledDown,
          };
          setIsPastHero(pastHero);
          setIsInHeroZone(inHero);
          setIsAtTop(atTop);
          setIsScrolledDown(scrolledDown);
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
  }, [pathname, isHeroRoute]);

  // ============================================================================
  // 3. REACTBITS KINEMATICS: GOOEY ACTIVE INDICATOR
  // ============================================================================
  const updateGooeyIndicator = useCallback(
    (animate = true) => {
      const navContainer = navContainerRef.current;
      const mainDot = mainDotRef.current;
      const trailDot = trailDotRef.current;

      if (!navContainer || !mainDot || !trailDot) return;

      if (!activeHref || !itemRefs.current[activeHref]) {
        // No active center route (e.g. on /join or 404): gently hide indicator
        gsap.to([mainDot, trailDot], {
          opacity: 0,
          scale: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        return;
      }

      const activeEl = itemRefs.current[activeHref];
      if (!activeEl) return;

      const navRect = navContainer.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      // Calculate center coordinate relative to nav container
      const targetCenterX = elRect.left - navRect.left + elRect.width / 2;
      const dotRadius = 3; // 6px diameter -> 3px radius
      const targetX = targetCenterX - dotRadius;

      // Check for user-preferred reduced motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const prevHref = previousHrefRef.current;
      const isInitialMount = prevHref === null;
      previousHrefRef.current = activeHref;

      if (isInitialMount || !animate || prefersReducedMotion) {
        // Direct placement without morphing transition
        gsap.killTweensOf([mainDot, trailDot]);
        gsap.set(mainDot, {
          x: targetX,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
        });
        gsap.set(trailDot, {
          opacity: 0,
          scale: 0,
          x: targetX,
        });
        return;
      }

      // Route change with Gooey stretch & snap physics
      const prevEl = prevHref ? itemRefs.current[prevHref] : null;
      let startX = targetX;
      if (prevEl) {
        const prevRect = prevEl.getBoundingClientRect();
        startX = prevRect.left - navRect.left + prevRect.width / 2 - dotRadius;
      }

      const deltaX = targetX - startX;
      const distance = Math.abs(deltaX);

      // Kill any running transitions
      gsap.killTweensOf([mainDot, trailDot]);

      // Set trail droplet at origin
      gsap.set(trailDot, {
        x: startX,
        opacity: 0.95,
        scale: 1,
      });

      // Elongation stretch factor based on distance traveled (up to 2.4x)
      const stretchFactor = Math.min(2.4, 1 + distance / 70);

      // Main dot flies to target, stretching along the travel vector
      gsap.fromTo(
        mainDot,
        {
          x: startX,
          scaleX: stretchFactor,
          scaleY: 0.75,
          opacity: 1,
        },
        {
          x: targetX,
          scaleX: 1.15,
          scaleY: 0.9,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            // Settle with subtle spring rebound
            gsap.to(mainDot, {
              scaleX: 1,
              scaleY: 1,
              duration: 0.35,
              ease: "elastic.out(1.2, 0.5)",
            });
          },
        }
      );

      // Trailing droplet holds briefly, then collapses into gooey threshold
      gsap.to(trailDot, {
        scale: 0,
        opacity: 0,
        x: startX + deltaX * 0.22,
        duration: 0.26,
        delay: 0.08,
        ease: "power2.in",
      });
    },
    [activeHref]
  );

  useEffect(() => {
    updateGooeyIndicator(true);

    const handleResize = () => updateGooeyIndicator(false);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [updateGooeyIndicator]);

  // When nav theme or hero boundaries shift, re-synchronize dot placement
  useEffect(() => {
    updateGooeyIndicator(false);
  }, [isPastHero, isDarkHero, isMobileMenuOpen, updateGooeyIndicator]);

  // ============================================================================
  // 4. REACTBITS KINEMATICS: MAGNETIC PROXIMITY ENGINE (<= 50px Threshold)
  // ============================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const navContainer = navContainerRef.current;
    if (!navContainer) return;

    const PROXIMITY_THRESHOLD = 50; // 50px proximity radius per Master Directive
    const MAX_PULL_OFFSET = 7; // Max subtle tactile shift (in px)

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      NAV_ROUTES.forEach((route) => {
        const item = itemRefs.current[route.href];
        const inner = innerRefs.current[route.href];
        if (!item || !inner) return;

        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const diffX = mouseX - centerX;
        const diffY = mouseY - centerY;
        const dist = Math.hypot(diffX, diffY);

        const activationRadius = PROXIMITY_THRESHOLD + rect.width / 2;

        if (dist <= activationRadius) {
          isShiftedRefs.current[route.href] = true;
          const pullRatio = 1 - dist / activationRadius;
          const shiftX = (diffX / dist) * pullRatio * MAX_PULL_OFFSET;
          const shiftY = (diffY / dist) * pullRatio * (MAX_PULL_OFFSET * 0.75);

          gsap.to(inner, {
            x: shiftX,
            y: shiftY,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else if (isShiftedRefs.current[route.href]) {
          isShiftedRefs.current[route.href] = false;
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });
    };

    const handlePointerLeave = () => {
      NAV_ROUTES.forEach((route) => {
        const inner = innerRefs.current[route.href];
        if (inner && isShiftedRefs.current[route.href]) {
          isShiftedRefs.current[route.href] = false;
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    navContainer.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      navContainer.removeEventListener("pointerleave", handlePointerLeave);
      NAV_ROUTES.forEach((route) => {
        const inner = innerRefs.current[route.href];
        if (inner) {
          gsap.killTweensOf(inner);
          inner.style.transform = "";
        }
      });
    };
  }, []);

  const handleLinkClick = () => {
    playClick();
    setIsMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    playSilkSwish();
    setIsMobileMenuOpen((prev) => !prev);
  };


  return (
    <>
      {/* ========================================================================= */}
      {/* SVG GOOEY NAV FILTER DEFINITION (ReactBits Liquid Metrology)              */}
      {/* ========================================================================= */}
      <svg
        className="absolute w-0 h-0 pointer-events-none -z-50 opacity-0 overflow-hidden"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="muttram-gooey-nav" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* THE "FLUID MUTTRAM" NAVBAR: Compact Floating Capsule Island               */}
      {/* ========================================================================= */}
      <header
        id="global-floating-nav"
        ref={headerRef}
        className={`fixed top-2.5 sm:top-3.5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isInHeroZone
            ? "-translate-y-16 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`pointer-events-auto max-w-5xl mx-auto flex items-center justify-between relative px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border transition-all duration-300 ${
            isDarkHero
              ? "bg-[#161210]/85 border-[#D4AF37]/25 text-[#FAF7F2] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
              : "bg-[#FAF9F6]/90 border-[#2A2825]/10 text-[#2A2825] shadow-[0_8px_30px_rgba(42,40,37,0.08),0_1px_2px_rgba(42,40,37,0.04)] backdrop-blur-md"
          }`}
        >
          {/* ----------------------------------------------------------------------- */}
          {/* 1. THE LOGO (LEFT): Heavy Serif in Charcoal/Espresso or Warm Ivory      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              onClick={handleLinkClick}
              aria-label="OSU Tamil Sangam Home"
              className="group flex flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-xs"
            >
              <span
                className={`font-serif font-bold text-sm sm:text-base tracking-tight transition-colors leading-none ${
                  isDarkHero ? "text-[#FAF9F6] group-hover:text-[#E5A93C]" : "text-[#2A2825] group-hover:text-[#B85C38]"
                }`}
              >
                {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className={`font-tamil text-[9px] transition-opacity mt-0.5 leading-none font-medium ${
                  isDarkHero
                    ? "text-[#E5A93C]/80 group-hover:text-[#E5A93C]"
                    : "text-[#57524C] opacity-60 group-hover:opacity-100"
                }`}
              >
                {locale === "ta" ? "The Ohio State University" : "ஓஹியோ மாநிலப் பல்கலைக்கழகம்"}
              </span>
            </Link>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. THE LINKS (CENTER): Compact Bilingual Capsule Stack, Magnetic        */}
          {/* ----------------------------------------------------------------------- */}
          <nav
            ref={navContainerRef}
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-x-1 xl:gap-x-1.5 relative py-0.5"
          >
            {/* Gooey Active Indicator Track (rests above active link) */}
            <div
              className="absolute -top-1 left-0 w-full h-2 pointer-events-none overflow-visible"
              style={{ filter: "url(#muttram-gooey-nav)" }}
              aria-hidden="true"
            >
              {/* Main Indicator Dot */}
              <span
                ref={mainDotRef}
                className={`absolute top-0 w-1.5 h-1.5 rounded-full ${
                  isDarkHero
                    ? "bg-[#E5A93C] shadow-[0_0_8px_rgba(229,169,60,0.7)]"
                    : "bg-[#B85C38] shadow-[0_0_6px_rgba(184,92,56,0.45)]"
                }`}
                style={{ willChange: "transform, opacity" }}
              />
              {/* Trailing Liquid Droplet for Gooey Morph */}
              <span
                ref={trailDotRef}
                className={`absolute top-0 w-1 h-1 rounded-full ${
                  isDarkHero ? "bg-[#E5A93C]" : "bg-[#B85C38]"
                }`}
                style={{ willChange: "transform, opacity", opacity: 0 }}
              />
            </div>

            {NAV_ROUTES.map((route) => {
              const isActive = activeHref === route.href;

              return (
                <div
                  key={route.href}
                  ref={(el) => {
                    itemRefs.current[route.href] = el;
                  }}
                  className="relative group py-0.5"
                >
                  <Link
                    href={route.href}
                    ref={(el) => {
                      innerRefs.current[route.href] = el;
                    }}
                    onClick={handleLinkClick}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={
                      route.badge && gamesUnsolved
                        ? `${locale === "ta" ? route.ta : route.en}, new puzzles available`
                        : undefined
                    }
                    className={`relative flex flex-col items-center justify-center cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-full px-2.5 py-0.5 transition-colors ${
                      isActive
                        ? isDarkHero
                          ? "bg-white/[0.08]"
                          : "bg-[#2A2825]/[0.05]"
                        : "hover:bg-black/[0.03]"
                    }`}
                    style={{ willChange: "transform" }}
                  >
                    {/* Primary Navigation Text */}
                    <span
                      className={`font-sans text-[12px] xl:text-[13px] leading-tight tracking-tight whitespace-nowrap transition-colors duration-200 inline-flex items-center gap-1 ${
                        isDarkHero
                          ? isActive
                            ? "font-semibold text-[#FAF9F6]"
                            : "font-medium text-[#FAF9F6]/80 group-hover:text-white"
                          : isActive
                          ? "font-semibold text-[#2A2825]"
                          : "font-medium text-[#2A2825]/75 group-hover:text-[#161210]"
                      }`}
                    >
                      {locale === "ta" ? route.ta : route.en}
                      {route.badge && gamesUnsolved && (
                        <span
                          className="size-[5px] rounded-full bg-[#D4AF37] ring-1 ring-[#161210] shadow-[0_0_4px_#D4AF37] animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    {/* Secondary Color Text (Tamil Subtitle - Compact & Clear) */}
                    <span
                      lang="ta"
                      style={{ letterSpacing: 0 }}
                      className={`font-tamil text-[9px] xl:text-[9.5px] leading-none mt-0.5 whitespace-nowrap transition-all duration-200 pointer-events-none ${
                        isDarkHero
                          ? isActive
                            ? "text-[#E5A93C] font-semibold opacity-100"
                            : "text-[#E5A93C]/70 font-medium opacity-60 group-hover:opacity-100 group-hover:text-[#E5A93C]"
                          : isActive
                          ? "text-[#B85C38] font-semibold opacity-100"
                          : "text-[#B85C38]/70 font-medium opacity-60 group-hover:opacity-100 group-hover:text-[#B85C38]"
                      }`}
                    >
                      {locale === "ta" ? route.en : route.ta}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. THE CALL TO ACTION (RIGHT): Compact "Join the Hearth ↗"              */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center gap-2 shrink-0">
            <Magnet padding={25} magnetStrength={1.8} maxOffset={5}>
              <Link
                href="/join"
                onClick={handleLinkClick}
                className={`group hidden sm:inline-flex items-center gap-1 font-sans text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-full py-1 px-2.5 ${
                  isDarkHero
                    ? "text-[#FAF9F6] hover:text-[#E5A93C]"
                    : "text-[#2A2825] hover:text-[#B85C38]"
                }`}
              >
                <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
                <span
                  className={`text-xs transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isDarkHero ? "text-[#E5A93C]" : "text-[#B85C38]"
                  }`}
                >
                  ↗
                </span>
              </Link>
            </Magnet>

            {/* Mobile Menu Hamburger Trigger */}
            <button
              onClick={handleToggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className={`lg:hidden w-8 h-8 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] ${
                isDarkHero
                  ? "text-[#FAF9F6] hover:bg-white/10"
                  : "text-[#2A2825] hover:text-[#B85C38] hover:bg-[#2A2825]/5"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 5. MOBILE NAVIGATION DRAWER (Clean Sunlit Courtyard Aesthetic)             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            className="fixed inset-0 z-50 bg-[#FAF9F6]/98 backdrop-blur-xl lg:hidden flex flex-col pt-24 px-6 pb-12 justify-between overflow-y-auto overscroll-contain pointer-events-auto"
          >
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#2A2825]/10 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-lg text-[#2A2825] block">
                    {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
                  </span>
                  <span
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="font-tamil text-xs text-[#B85C38]"
                  >
                    வழிகாட்டி & பக்க அட்டவணை
                  </span>
                </div>
                <button
                  onClick={handleToggleMobileMenu}
                  aria-label="Close menu"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#2A2825] hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links List */}
              <div className="flex flex-col space-y-2">
                {NAV_ROUTES.map((route) => {
                  const isActive = activeHref === route.href;

                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-3 min-h-[48px] transition-colors rounded-xs ${
                        isActive
                          ? "bg-[#F4EFE6] text-[#2A2825] font-semibold"
                          : "text-[#2A2825]/85 hover:bg-[#F4EFE6]/60"
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-sans text-base font-medium inline-flex items-center gap-1.5">
                          {locale === "ta" ? route.ta : route.en}
                          {route.badge && (
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
                          )}
                        </span>
                        <span
                          lang="ta"
                          style={{ letterSpacing: 0 }}
                          className="font-tamil text-xs opacity-60 text-[#57524C]"
                        >
                          {locale === "ta" ? route.en : route.ta}
                        </span>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#B85C38]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="pt-6 border-t border-[#2A2825]/10">
              <Link
                href="/join"
                onClick={handleLinkClick}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] bg-[#B85C38] text-[#FAF9F6] font-sans font-semibold text-sm hover:bg-[#A04A27] transition-colors shadow-sm"
              >
                <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
                <span>↗</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
