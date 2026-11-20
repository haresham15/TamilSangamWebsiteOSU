"use client";

import type { Group } from "three";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SceneView } from "@/components/canvas/SceneView";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { useLenis } from "@/components/providers/MotionProvider";
import { registerSystem } from "@/engine/masterTick";
import { GamesFocusScene, gamesBeachQuality } from "./GamesFocusScene";
import { gamesDiagnosticsEnabled, type GamesRenderDiagnostics } from "./compositor/GamesRenderDiagnostics";
import { getDebugScrollProgress } from "./gamesRail";
import { getGamesExitOpacity, mapGamesScrollProgress } from "./gamesScroll";
import { disposeForeground, loadForeground } from "./handAsset";
import { GAMES_POSTERS, posterBeatAt, posterUrl } from "./gamesPosters";
import { useBootStore } from "@/engine/bootStore";
import styles from "./gamesHero.module.css";

const beatAt = posterBeatAt;

export function GamesHeroCanvas() {
  const runway = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLDivElement>(null);
  const [hand, setHand] = useState<Group | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exited, setExited] = useState(false);
  const [portrait, setPortrait] = useState(() => (typeof window !== "undefined" ? window.matchMedia("(aspect-ratio < 13/10)").matches : false));
  const [hidden, setHidden] = useState(() => (typeof document !== "undefined" ? document.hidden : false));
  const [drawn, setDrawn] = useState(false);
  const drawnProgress = useRef<number | null>(null);
  const heroReady = useRef(false);
  const diagnostics = useRef<GamesRenderDiagnostics | null>(null);
  /** Per composite: the drawn progress goes straight to the DOM; React state changes once, on the first draw. */
  const onReady = useCallback((progress: number) => {
    heroReady.current = true;
    drawnProgress.current = progress;
    const text = progress.toFixed(3);
    if (stage.current && stage.current.dataset.mediaProgress !== text) stage.current.dataset.mediaProgress = text;
    setDrawn(true);
  }, []);
  const lenis = useLenis();
  const { mode, qualityLevel } = useRenderMode();
  // Fixed at mount, as the Events hero does: the beach is built per quality and is not rebuilt mid-scroll.
  const [quality] = useState(() => gamesBeachQuality(mode, qualityLevel));
  const debug = useMemo(() => getDebugScrollProgress(), []);
  const [cover] = useState(() => isHeroCinematicEnabled("games"));
  const [coldSkip] = useState(() => (typeof window !== "undefined" ? window.location.hash === "#arcade" : false));
  // Static (reduced motion, Lite, Tier C), a cold #arcade visit or a media failure: poster only.
  // Portrait animates with its own optics; its posters are the portrait stills.
  const staticMode = mode === "static" || coldSkip || failed;
  // React state changes only when the beat changes; per-tick progress lives in refs and data-* attributes.
  const [beat, setBeat] = useState(() => beatAt(debug ?? 0));
  const [still, setStill] = useState(0);
  const progressRef = useRef(debug ?? 0);
  const beatRef = useRef(beat);
  const pastHeroRef = useRef(false);
  const exitedRef = useRef(false);
  const staticRef = useRef(staticMode);
  const skipping = useRef(false);
  const [inView, setInView] = useState(true);
  const active = !staticMode && !exited && inView;
  const ready = active && loaded && drawn && Boolean(hand);
  const posterIndex = staticMode ? still : exited ? 3 : beat;

  /** Writes per-tick progress to the DOM; touches React state only on a beat change. */
  const applyProgress = useCallback((value: number) => {
    progressRef.current = value;
    const element = stage.current;
    const text = value.toFixed(3);
    if (element && element.dataset.progress !== text) {
      element.dataset.progress = text;
      element.dataset.requestedProgress = text;
    }
    const isStatic = staticRef.current;
    const visual = exitedRef.current || pastHeroRef.current ? 1 : value;
    if (intro.current) intro.current.style.opacity = isStatic ? "1" : String(Math.max(0, 1 - visual / 0.08));
    if (wash.current) wash.current.style.opacity = isStatic || exitedRef.current ? "0" : String(getGamesExitOpacity(value));
    const nextBeat = beatAt(value);
    if (nextBeat !== beatRef.current) {
      beatRef.current = nextBeat;
      setBeat(nextBeat);
    }
  }, []);

  // data-media-progress is written by onReady per composite, outside React's render.
  useLayoutEffect(() => {
    if (stage.current && !stage.current.dataset.mediaProgress) stage.current.dataset.mediaProgress = "0.000";
  }, []);

  useLayoutEffect(() => {
    staticRef.current = staticMode;
    exitedRef.current = exited;
    applyProgress(progressRef.current);
  }, [staticMode, exited, applyProgress]);

  useEffect(() => {
    if ((ready || staticMode) && !useBootStore.getState().isSceneReady("games-hero")) {
      useBootStore.getState().markReady("games-hero");
    }
  }, [ready, staticMode]);

  const skip = useCallback((immediate = false) => {
    const target = document.getElementById("arcade");
    if (!target) return;
    skipping.current = true;
    exitedRef.current = true;
    setExited(true);
    applyProgress(1);
    target.focus({ preventScroll: true });
    const end = window.scrollY + target.getBoundingClientRect().top;
    const finish = () => {
      skipping.current = false;
    };
    if (lenis && !immediate && !staticRef.current) {
      lenis.scrollTo(end, { duration: 0.8, force: true, onComplete: finish });
    } else {
      if (lenis) lenis.scrollTo(end, { immediate: true, force: true });
      else window.scrollTo({ top: end, behavior: "instant" });
      finish();
    }
  }, [lenis, applyProgress]);

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
    if (coldSkip) queueMicrotask(() => skip(true));
    return () => {
      sheet?.removeEventListener("focusin", onFocus);
      window.removeEventListener("hashchange", onHash);
    };
  }, [skip, coldSkip, debug]);

  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { rootMargin: "200px 0px" });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  // Critically damped follow of the scroll target; runs on the shared master tick.
  useEffect(() => {
    if (staticMode || debug !== null) return;
    return registerSystem({ order: 45, step: (dt) => {
      const element = runway.current;
      if (!element || skipping.current) return;
      const distance = element.offsetHeight - window.innerHeight;
      if (distance <= 0) return;
      const target = mapGamesScrollProgress(-element.getBoundingClientRect().top / distance);
      pastHeroRef.current = target >= 1;
      const next = progressRef.current + (target - progressRef.current) * (1 - Math.exp(-12 * Math.min(dt, 0.05)));
      const settled = Math.abs(next - target) < 0.0001 ? target : next;
      if (settled !== progressRef.current) applyProgress(settled);
    } });
  }, [staticMode, debug, applyProgress]);

  useEffect(() => {
    if (!exited || staticMode || debug !== null) return;
    let previousY = window.scrollY;
    const resume = () => {
      const currentY = window.scrollY;
      if (currentY < previousY && runway.current && runway.current.getBoundingClientRect().bottom > window.innerHeight) {
        skipping.current = false;
        exitedRef.current = false;
        setExited(false);
      }
      previousY = currentY;
    };
    window.addEventListener("scroll", resume, { passive: true });
    return () => window.removeEventListener("scroll", resume);
  }, [exited, staticMode, debug]);

  useEffect(() => {
    const aspect = window.matchMedia("(aspect-ratio < 13/10)");
    const preferences = () => {
      setPortrait(aspect.matches);
    };
    const visibility = () => setHidden(document.hidden);
    const contextLost = () => setFailed(true);
    aspect.addEventListener("change", preferences);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("webglcontextlost", contextLost, true);
    return () => {
      aspect.removeEventListener("change", preferences);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("webglcontextlost", contextLost, true);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let foreground: Group | null = null;
    let live = true;
    const fallback = () => { if (live) setFailed(true); };
    heroReady.current = false;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const updateDeadline = () => {
      clearTimeout(deadline);
      if (!document.hidden && !heroReady.current) {
        deadline = setTimeout(() => { if (!heroReady.current) { controller.abort(); fallback(); } }, debug !== null ? 30000 : 45000);
      }
    };
    document.addEventListener("visibilitychange", updateDeadline);
    updateDeadline();
    queueMicrotask(() => {
      if (!live) return;
      setLoaded(false);
      setDrawn(false);
      setHand(null);
    });
    // The beach is built in-process; the hand is the only download.
    loadForeground(controller.signal)
      .then(group => {
        foreground = group;
        if (!live) { disposeForeground(group); foreground = null; return; }
        setHand(group);
        setLoaded(true);
      }).catch(() => { if (!controller.signal.aborted) fallback(); });
    return () => {
      live = false;
      clearTimeout(deadline);
      document.removeEventListener("visibilitychange", updateDeadline);
      controller.abort();
      if (foreground) disposeForeground(foreground);
      queueMicrotask(() => setLoaded(false));
    };
  }, [active, debug]);

  useEffect(() => {
    if (!gamesDiagnosticsEnabled) return;
    const host = window as unknown as { __gamesHero?: { setProgress: (p: number) => void; getProgress: () => number; getState: () => unknown } };
    host.__gamesHero = {
      setProgress: (p) => {
        if (!Number.isFinite(p)) return;
        applyProgress(Math.max(0, Math.min(1, p)));
      },
      getProgress: () => progressRef.current,
      getState: () => ({ realtime: true, quality, drawn, displayed: drawnProgress.current, loaded, handReady: Boolean(hand), hidden, active,
        diagnostics: diagnostics.current?.snapshot(performance.now()) ?? null }),
    };
    return () => { delete host.__gamesHero; };
  }, [quality, drawn, loaded, hand, hidden, active, applyProgress]);

  // Scroll updates keep the scene mounted; its frame callbacks read the continuous progress ref.
  const scene = useMemo(() => active && loaded && hand && <SceneView index={2} visible={!hidden} className={styles.view}>
    <Suspense fallback={null}><GamesFocusScene progressRef={progressRef} hand={hand} quality={quality} frozen={debug !== null} stageRef={frame} onReady={onReady} diagnosticsRef={diagnostics} /></Suspense>
  </SceneView>, [active, loaded, hand, hidden, onReady, quality, debug]);

  return (
    <section ref={runway} className={styles.runway} data-static={staticMode || debug !== null} data-cover={cover} aria-label="Beach Blast">
      <div ref={stage} className={styles.stage} data-hero-canvas="games" data-media-state={staticMode ? "static" : ready ? "ready" : "loading"}>
        <a href="#arcade" className={styles.skip} onClick={(event) => { event.preventDefault(); skip(); }}>
          Skip to Arcade <span aria-hidden="true">↓</span>
        </a>
        <div ref={frame} className={styles.frame} data-ready={ready} data-realtime={!staticMode} role="img" aria-label="A pair of black glasses frames three distant explosions on a sunlit beach before opening into The Sangam Arcade.">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.poster} src={posterUrl(posterIndex, portrait)} alt="" width={1912} height={800} fetchPriority="high" />
          {scene}
        </div>
        <div className={styles.overlays}>
          <div ref={intro} className={styles.intro}>
            <p>OSU Tamil Sangam presents</p>
            <p>Scroll <span aria-hidden="true">·</span> <span lang="ta" className="font-tamil tracking-normal normal-case leading-relaxed">கீழே செல்</span></p>
          </div>
          {staticMode && (
            <div className={styles.caption}>
              <div className={styles.stills} aria-label="Beach Blast stills">
                {GAMES_POSTERS.map((item, index) => (
                  <button key={item.title} type="button" aria-label={`Show ${item.title}`} aria-pressed={still === index} onClick={() => setStill(index)}>
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={wash} className={styles.exitWash} aria-hidden="true" />
      </div>
    </section>
  );
}
