"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Menu, X } from "lucide-react";

// ============================================================================
// 1. NAVIGATION ROUTE CONFIGURATION
// ============================================================================
interface NavRoute {
  href: string;
  en: string;
  ta: string;
}

const NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/gallery", en: "Gallery", ta: "நினைவுகள்" },
  { href: "/guide", en: "Guide & FAQ", ta: "வழிகாட்டி & கேள்வி-பதில்" },
  { href: "/suggestions", en: "Ideas", ta: "கருத்து" },
];

export const FloatingNav: React.FC = () => {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { playClick, playSilkSwish } = useAudio();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Visibility & Contextual Backdrop State
  const [isPastHero, setIsPastHero] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const scrollStateRef = useRef({ isPastHero: false, isScrolledDown: false });

  // Dark 3D Hero sections at the top of specific pages
  const darkHeroRoutes = ["/", "/events", "/about", "/board"];
  const isDarkHero = darkHeroRoutes.includes(pathname) && !isPastHero;

  // References for Gooey Active Indicator & Magnetic Mechanics
  const headerRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const innerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const quickToXRefs = useRef<Record<string, (val: number) => void>>({});
  const quickToYRefs = useRef<Record<string, (val: number) => void>>({});

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
      if (pathname === "/events") return 450;
      if (pathname === "/board") return 500;
      return 0;
    };

    const evaluateScroll = () => {
      const scrollY = window.scrollY;
      const threshold = getHeroThreshold();

      const newIsPastHero = threshold === 0 || scrollY >= threshold;
      const newIsScrolledDown = scrollY > 20;

      if (
        scrollStateRef.current.isPastHero !== newIsPastHero ||
        scrollStateRef.current.isScrolledDown !== newIsScrolledDown
      ) {
        scrollStateRef.current = { isPastHero: newIsPastHero, isScrolledDown: newIsScrolledDown };
        setIsPastHero(newIsPastHero);
        setIsScrolledDown(newIsScrolledDown);
      }
    };

    evaluateScroll();
    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [pathname]);

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
      const dotRadius = 4; // 8px diameter -> 4px radius
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

    // Initialize GSAP quickTo setters for 120fps frictionless tracking
    NAV_ROUTES.forEach((route) => {
      const inner = innerRefs.current[route.href];
      if (inner) {
        quickToXRefs.current[route.href] = gsap.quickTo(inner, "x", {
          duration: 0.35,
          ease: "power2.out",
        });
        quickToYRefs.current[route.href] = gsap.quickTo(inner, "y", {
          duration: 0.35,
          ease: "power2.out",
        });
      }
    });

    const PROXIMITY_THRESHOLD = 50; // 50px proximity radius per Master Directive
    const MAX_PULL_OFFSET = 7; // Max subtle tactile shift (in px)

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      NAV_ROUTES.forEach((route) => {
        const item = itemRefs.current[route.href];
        const inner = innerRefs.current[route.href];
        const quickX = quickToXRefs.current[route.href];
        const quickY = quickToYRefs.current[route.href];

        if (!item || !inner || !quickX || !quickY) return;

        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const diffX = mouseX - centerX;
        const diffY = mouseY - centerY;
        const dist = Math.hypot(diffX, diffY);

        const activationRadius = PROXIMITY_THRESHOLD + rect.width / 2;

        if (dist <= activationRadius) {
          // As cursor approaches within 50px, pull text smoothly toward cursor
          const pullRatio = 1 - dist / activationRadius;
          const shiftX = (diffX / dist) * pullRatio * MAX_PULL_OFFSET;
          const shiftY = (diffY / dist) * pullRatio * (MAX_PULL_OFFSET * 0.75);

          quickX(shiftX);
          quickY(shiftY);
        } else {
          // Outside proximity: spring back to zero
          quickX(0);
          quickY(0);
        }
      });
    };

    const handlePointerLeave = () => {
      NAV_ROUTES.forEach((route) => {
        const inner = innerRefs.current[route.href];
        if (inner) {
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
      {/* THE "FLUID MUTTRAM" NAVBAR: Always Visible, Crystal Clear Navigation      */}
      {/* ========================================================================= */}
      <header
        id="global-floating-nav"
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-[padding,background-color,backdrop-filter,border-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-0 opacity-100 pointer-events-auto ${
          isDarkHero
            ? "pt-3.5 pb-3.5 px-6 sm:px-10 lg:px-16 bg-[#0c0814]/85 backdrop-blur-md border-b border-amber-500/20 text-[#FAF9F6] shadow-lg"
            : isScrolledDown
            ? "pt-3.5 pb-3.5 px-6 sm:px-10 lg:px-16 bg-[#FAF9F6]/92 backdrop-blur-md border-b border-[#2A2825]/8 text-[#2A2825] shadow-[0_4px_24px_rgba(42,40,37,0.06)]"
            : "pt-5 sm:pt-6 pb-3.5 px-6 sm:px-10 lg:px-16 bg-[#FAF9F6]/85 backdrop-blur-xs border-b border-[#2A2825]/5 text-[#2A2825]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between relative">

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
                className={`font-serif font-bold text-xl sm:text-2xl tracking-tight transition-colors leading-none ${
                  isDarkHero ? "text-[#FAF9F6] group-hover:text-[#E5A93C]" : "text-[#2A2825] group-hover:text-[#B85C38]"
                }`}
              >
                {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
              </span>
              <span
                lang="ta"
                style={{ letterSpacing: 0 }}
                className={`font-tamil text-[10px] sm:text-[11px] transition-opacity mt-1 leading-none font-medium ${
                  isDarkHero
                    ? "text-[#E5A93C]/85 group-hover:text-[#E5A93C]"
                    : "text-[#57524C] opacity-65 group-hover:opacity-100"
                }`}
              >
                {locale === "ta" ? "The Ohio State University" : "ஓஹியோ மாநிலப் பல்கலைக்கழகம்"}
              </span>
            </Link>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. THE LINKS (CENTER): Generous gap-x-12, Bilingual Stack, Magnetic      */}
          {/* ----------------------------------------------------------------------- */}
          <nav
            ref={navContainerRef}
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-x-10 xl:gap-x-12 relative py-2"
          >
            {/* Gooey Active Indicator Track (rests above active link) */}
            <div
              className="absolute -top-2 left-0 w-full h-3 pointer-events-none overflow-visible"
              style={{ filter: "url(#muttram-gooey-nav)" }}
              aria-hidden="true"
            >
              {/* Main Indicator Dot */}
              <span
                ref={mainDotRef}
                className={`absolute top-0 w-2 h-2 rounded-full ${
                  isDarkHero
                    ? "bg-[#E5A93C] shadow-[0_0_10px_rgba(229,169,60,0.7)]"
                    : "bg-[#B85C38] shadow-[0_0_8px_rgba(184,92,56,0.45)]"
                }`}
                style={{ willChange: "transform, opacity" }}
              />
              {/* Trailing Liquid Droplet for Gooey Morph */}
              <span
                ref={trailDotRef}
                className={`absolute top-0 w-1.5 h-1.5 rounded-full ${
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
                  className="relative group py-1"
                >
                  <Link
                    href={route.href}
                    ref={(el) => {
                      innerRefs.current[route.href] = el;
                    }}
                    onClick={handleLinkClick}
                    className="flex flex-col items-center justify-center text-center cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-xs"
                    style={{ willChange: "transform" }}
                  >
                    {/* English: Soft modern Sans-Serif */}
                    <span
                      className={`font-sans text-[13px] xl:text-[14px] leading-tight tracking-tight transition-colors duration-200 ${
                        isDarkHero
                          ? isActive
                            ? "font-semibold text-[#FAF9F6]"
                            : "font-medium text-[#FAF9F6]/85 group-hover:text-[#FAF9F6]"
                          : isActive
                          ? "font-semibold text-[#2A2825]"
                          : "font-medium text-[#2A2825]/85 group-hover:text-[#2A2825]"
                      }`}
                    >
                      {locale === "ta" ? route.ta : route.en}
                    </span>

                    {/* Tamil: Elegant shadow below, opacity-50, smaller text */}
                    <span
                      lang="ta"
                      style={{ letterSpacing: 0 }}
                      className={`font-tamil text-[10px] xl:text-[11px] leading-none mt-1 transition-opacity duration-200 pointer-events-none ${
                        isDarkHero
                          ? isActive
                            ? "text-[#E5A93C] opacity-95 font-medium"
                            : "text-[#d1b8e6] opacity-60 group-hover:opacity-85"
                          : isActive
                          ? "text-[#B85C38] opacity-90 font-medium"
                          : "text-[#57524C] opacity-50 group-hover:opacity-75"
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
          {/* 3. THE CALL TO ACTION (RIGHT): Stark text link "Join the Hearth ↗"     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/join"
              onClick={handleLinkClick}
              className={`group hidden sm:inline-flex items-center gap-1.5 font-sans text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] rounded-xs py-1 px-1.5 ${
                isDarkHero
                  ? "text-[#FAF9F6] hover:text-[#E5A93C]"
                  : "text-[#2A2825] hover:text-[#B85C38]"
              }`}
            >
              <span>{locale === "ta" ? "இணைந்திருங்கள்" : "Join the Hearth"}</span>
              <span className={`text-sm transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isDarkHero ? "text-[#E5A93C]" : "text-[#B85C38]"
              }`}>
                ↗
              </span>
            </Link>

            {/* Mobile Menu Hamburger Trigger */}
            <button
              onClick={handleToggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] ${
                isDarkHero
                  ? "text-[#FAF9F6] hover:bg-white/10"
                  : "text-[#2A2825] hover:text-[#B85C38] hover:bg-[#FAF9F6]/80"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="fixed inset-0 z-40 bg-[#FAF9F6]/98 backdrop-blur-xl lg:hidden flex flex-col pt-28 px-6 pb-12 justify-between overflow-y-auto pointer-events-auto"
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
                  className="w-8 h-8 flex items-center justify-center text-[#2A2825] hover:text-[#B85C38]"
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
                        <span className="font-sans text-base font-medium">
                          {locale === "ta" ? route.ta : route.en}
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
