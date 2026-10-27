"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SceneView } from "@/components/canvas/SceneView";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { useLenis } from "@/components/providers/MotionProvider";
import { registerSystem } from "@/engine/masterTick";
import { GamesFocusScene } from "./GamesFocusScene";
import { getDebugScrollProgress } from "./gamesRail";
import styles from "./gamesHero.module.css";

const beats = [
  { title: "The standoff", image: "j1" },
  { title: "A closer look", image: "j2" },
  { title: "Beach blast", image: "j3" },
  { title: "The Sangam Arcade", image: "j4" },
];

export function GamesHeroCanvas() {
  const runway = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const lenis = useLenis();
  const debug = useMemo(() => getDebugScrollProgress(), []);
  const [coldSkip] = useState(() => window.location.hash === "#arcade");
  const [progress, setProgress] = useState(debug ?? 0);
  const [still, setStill] = useState(0);
  const progressRef = useRef(debug ?? 0);
  const skipping = useRef(false);
  const [inView, setInView] = useState(true);
  const staticMode = isLiteMode || tier === "C" || coldSkip;
  const beat = progress < 0.22 ? 0 : progress < 0.52 ? 1 : progress < 0.85 ? 2 : 3;

  const skip = useCallback((immediate = false) => {
    const target = document.getElementById("arcade");
    if (!target) return;
    skipping.current = true;
    progressRef.current = 1;
    setProgress(1);
    const end = staticMode ? target.offsetTop : (runway.current?.offsetTop ?? 0) +
      (runway.current?.offsetHeight ?? 0) - window.innerHeight;
    const finish = () => {
      skipping.current = false;
      target.focus({ preventScroll: true });
    };
    if (lenis && !immediate && !staticMode) {
      lenis.scrollTo(end, { duration: 0.8, force: true, onComplete: finish });
    } else {
      if (lenis) lenis.scrollTo(end, { immediate: true, force: true });
      else window.scrollTo({ top: end, behavior: "instant" });
      finish();
    }
  }, [lenis, staticMode]);

  useEffect(() => {
    const page = document.getElementById("games-page");
    if (!page) return;
    page.dataset.staticHero = String(staticMode);
    return () => { delete page.dataset.staticHero; };
  }, [staticMode]);

  useEffect(() => {
    const sheet = document.getElementById("arcade");
    const onFocus = (event: FocusEvent) => {
      if (event.target !== sheet && progressRef.current < 1 && debug === null) skip(true);
    };
    const onHash = () => { if (window.location.hash === "#arcade") skip(true); };
    sheet?.addEventListener("focusin", onFocus);
    window.addEventListener("hashchange", onHash);
    if (coldSkip) skip(true);
    return () => {
      sheet?.removeEventListener("focusin", onFocus);
      window.removeEventListener("hashchange", onHash);
    };
  }, [skip, coldSkip, debug]);

  useEffect(() => {
    if (!stage.current) return;
    let release: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      clearTimeout(release);
      if (entry.isIntersecting) setInView(true);
      else release = setTimeout(() => setInView(false), 2000);
    });
    observer.observe(stage.current);
    return () => { observer.disconnect(); clearTimeout(release); };
  }, []);

  useEffect(() => {
    if (staticMode || debug !== null) return;
    return registerSystem({ order: 45, step: (dt) => {
      const element = runway.current;
      if (!element || skipping.current) return;
      const distance = element.offsetHeight - window.innerHeight;
      const target = Math.max(0, Math.min(1, -element.getBoundingClientRect().top / distance));
      const next = progressRef.current + (target - progressRef.current) * (1 - Math.exp(-5.5 * dt));
      const settled = Math.abs(next - target) < 0.0001 ? target : next;
      if (settled !== progressRef.current) {
        progressRef.current = settled;
        setProgress(settled);
      }
    } });
  }, [staticMode, debug]);

  useEffect(() => {
    const page = document.getElementById("games-page");
    const q = Math.max(0, Math.min(1, (progress - 0.9) / 0.1));
    const reveal = q < 0.5 ? 4 * q ** 3 : 1 - (-2 * q + 2) ** 3 / 2;
    page?.style.setProperty("--games-sheet-offset", `${(1 - reveal) * 100}dvh`);
  }, [progress]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_VERCEL_ENV !== "preview") return;
    const host = window as unknown as { __gamesHero?: { setProgress: (p: number) => void; getProgress: () => number } };
    host.__gamesHero = {
      setProgress: (p) => {
        if (!Number.isFinite(p)) return;
        progressRef.current = Math.max(0, Math.min(1, p));
        setProgress(progressRef.current);
      },
      getProgress: () => progressRef.current,
    };
    return () => { delete host.__gamesHero; };
  }, []);

  return (
    <section ref={runway} className={styles.runway} data-static={staticMode || debug !== null} aria-label="Beach Blast">
      <div ref={stage} className={styles.stage} data-hero-canvas="games" data-progress={progress.toFixed(3)}>
        <a href="#arcade" className={styles.skip} onClick={(event) => { event.preventDefault(); skip(); }}>
          Skip to Arcade <span aria-hidden="true">↓</span>
        </a>
        <div ref={frame} className={styles.frame} data-ready={ready && !staticMode && inView} role="img" aria-label="A pair of black glasses frames three distant explosions on a sunlit beach before opening into The Sangam Arcade.">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.poster} src={`/images/games-hero/${staticMode ? beats[still].image : "j1"}.avif`} alt="" width={1912} height={800} />
          {!staticMode && inView && <SceneView index={2} className={styles.view}>
            <Suspense fallback={null}><GamesFocusScene scrollP={progress} stageRef={frame} onReady={onReady} /></Suspense>
          </SceneView>}
        </div>
        <div className={styles.intro} style={{ opacity: staticMode ? 1 : Math.max(0, 1 - progress / 0.08) }}>
          <p>OSU Tamil Sangam presents</p>
          <p>Scroll <span aria-hidden="true">·</span> <span lang="ta" className="font-tamil tracking-normal normal-case leading-relaxed">கீழே செல்</span></p>
        </div>
        <div className={styles.caption} aria-live="off" style={{ opacity: staticMode ? 1 : Math.max(0, 1 - (progress - 0.85) / 0.08) }}>
          <span className="font-mono text-xs text-antique-gold">0{(staticMode ? still : beat) + 1} / 04</span>
          <p className="font-display text-2xl sm:text-3xl">{beats[staticMode ? still : beat].title}</p>
          {staticMode && <div className={styles.stills} aria-label="Beach Blast stills">
            {beats.map((item, index) => <button key={item.image} type="button" aria-label={`Show ${item.title}`} aria-pressed={still === index} onClick={() => setStill(index)}>{index + 1}</button>)}
          </div>}
        </div>
      </div>
    </section>
  );
}
