"use client";

import type { Group } from "three";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SceneView } from "@/components/canvas/SceneView";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { useLenis } from "@/components/providers/MotionProvider";
import { registerSystem } from "@/engine/masterTick";
import { GamesFocusScene } from "./GamesFocusScene";
import { gamesDiagnosticsEnabled, type GamesRenderDiagnostics } from "./compositor/GamesRenderDiagnostics";
import { getDebugScrollProgress } from "./gamesRail";
import { getGamesExitOpacity, mapGamesScrollProgress } from "./gamesScroll";
import { HYBRID_MANIFEST_URL, HYBRID_POSTERS, HybridFrameCache, disposeForeground, loadForeground, mediaUrl, parseHybridManifest, type DecodedPlate, type HybridManifest } from "./hybridMedia";
import { useBootStore } from "@/engine/bootStore";
import styles from "./gamesHero.module.css";

const beats = [
  { title: "The standoff" },
  { title: "A closer look" },
  { title: "Beach blast" },
  { title: "The Sangam Arcade" },
];
const beatAt = (p: number) => p < 0.22 ? 0 : p < 0.52 ? 1 : p < 0.85 ? 2 : 3;

export function GamesHeroCanvas() {
  const runway = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [plate, setPlate] = useState<DecodedPlate | null>(null);
  const [hand, setHand] = useState<Group | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [manifest, setManifest] = useState<HybridManifest | null>(null);
  const [failed, setFailed] = useState(false);
  const [exited, setExited] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const cache = useRef<HybridFrameCache | null>(null);
  const [portrait, setPortrait] = useState(() => window.matchMedia("(aspect-ratio < 13/10)").matches);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [restricted, setRestricted] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches || Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData));
  const [drawnIndex, setDrawnIndex] = useState<number | null>(null);
  const heroReady = useRef(false);
  const diagnostics = useRef<GamesRenderDiagnostics | null>(null);
  const onReady = useCallback((index: number) => { heroReady.current = true; setDrawnIndex(index); }, []);
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
  const staticMode = isLiteMode || tier === "C" || coldSkip || portrait || restricted || failed;
  const active = !staticMode && !exited && inView;
  const ready = active && loaded && drawnIndex === plate?.index;
  const displayed = hand && plate ? plate.sample.p : 0;
  const visualProgress = exited || pastHero ? 1 : progress;
  const posterIndex = exited && !staticMode ? 3 : still;

  useEffect(() => {
    if ((ready || staticMode) && !useBootStore.getState().isSceneReady("games-hero")) {
      useBootStore.getState().markReady("games-hero");
    }
  }, [ready, staticMode]);

  const skip = useCallback((immediate = false) => {
    const target = document.getElementById("arcade");
    if (!target) return;
    skipping.current = true;
    cache.current?.dispose();
    setExited(true);
    progressRef.current = 1;
    setProgress(1);
    target.focus({ preventScroll: true });
    const end = window.scrollY + target.getBoundingClientRect().top;
    const finish = () => {
      skipping.current = false;
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

  useEffect(() => {
    if (staticMode || debug !== null) return;
    return registerSystem({ order: 45, step: (dt) => {
      const element = runway.current;
      if (!element || skipping.current) return;
      const distance = element.offsetHeight - window.innerHeight;
      const target = mapGamesScrollProgress(-element.getBoundingClientRect().top / distance);
      setPastHero(target >= 1);
      const next = progressRef.current + (target - progressRef.current) * (1 - Math.exp(-9 * Math.min(dt, 0.05)));
      const settled = Math.abs(next - target) < 0.0001 ? target : next;
      if (settled !== progressRef.current) {
        progressRef.current = settled;
        setProgress(settled);
      }
    } });
  }, [staticMode, debug]);

  useEffect(() => {
    if (!exited || staticMode || debug !== null) return;
    let previousY = window.scrollY;
    const resume = () => {
      const currentY = window.scrollY;
      if (currentY < previousY && runway.current && runway.current.getBoundingClientRect().bottom > window.innerHeight) {
        skipping.current = false;
        setExited(false);
      }
      previousY = currentY;
    };
    window.addEventListener("scroll", resume, { passive: true });
    return () => window.removeEventListener("scroll", resume);
  }, [exited, staticMode, debug]);

  useEffect(() => {
    const aspect = window.matchMedia("(aspect-ratio < 13/10)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const preferences = () => {
      setPortrait(aspect.matches);
      setRestricted(motion.matches || Boolean(connection?.saveData));
    };
    const visibility = () => setHidden(document.hidden);
    const contextLost = () => setFailed(true);
    aspect.addEventListener("change", preferences);
    motion.addEventListener("change", preferences);
    connection?.addEventListener("change", preferences);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("webglcontextlost", contextLost, true);
    return () => {
      aspect.removeEventListener("change", preferences);
      motion.removeEventListener("change", preferences);
      connection?.removeEventListener("change", preferences);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("webglcontextlost", contextLost, true);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let foreground: Group | null = null;
    let frames: HybridFrameCache | null = null;
    let live = true;
    const fallback = () => { if (live) setFailed(true); };
    heroReady.current = false;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const updateDeadline = () => {
      clearTimeout(deadline);
      if (!document.hidden && !heroReady.current) {
        deadline = setTimeout(() => { if (!heroReady.current) { controller.abort(); fallback(); } }, debug !== null ? 30000 : 12000);
      }
    };
    document.addEventListener("visibilitychange", updateDeadline);
    updateDeadline();
    queueMicrotask(() => {
      if (!live) return;
      setLoaded(false);
      setDrawnIndex(null);
      setPlate(null);
      setHand(null);
    });
    fetch(HYBRID_MANIFEST_URL, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Hybrid manifest unavailable"); return response.json(); })
      .then(async value => {
        const data = parseHybridManifest(value);
        if (debug !== null && !data.samples.some(sample => sample.p === debug)) throw new Error("Exact debug sample unavailable");
        if (!live) return;
        setManifest(data);
        frames = new HybridFrameCache(data.samples, next => {
          if (!live) return;
          setPlate(next);
          setStill(beatAt(next.sample.p));
        }, fallback);
        cache.current = frames;
        frames.setActive(!document.hidden);
        frames.request(progressRef.current, debug !== null && progressRef.current === debug);
        foreground = await loadForeground(data.foreground, controller.signal);
        if (!live) { disposeForeground(foreground); foreground = null; return; }
        setHand(foreground);
        setLoaded(true);
      }).catch(() => { if (!controller.signal.aborted) fallback(); });
    return () => {
      live = false;
      clearTimeout(deadline);
      document.removeEventListener("visibilitychange", updateDeadline);
      controller.abort();
      frames?.dispose();
      if (cache.current === frames) cache.current = null;
      if (foreground) disposeForeground(foreground);
      queueMicrotask(() => { if (!cache.current) setLoaded(false); });
    };
  }, [active, debug]);

  useEffect(() => { cache.current?.setActive(!hidden); }, [hidden]);
  useEffect(() => { if (active && !hidden) cache.current?.request(progress, debug !== null && progress === debug); }, [active, hidden, progress, debug]);
  useEffect(() => {
    if (!gamesDiagnosticsEnabled) return;
    const host = window as unknown as { __gamesHero?: { setProgress: (p: number) => void; getProgress: () => number; getState: () => unknown } };
    host.__gamesHero = {
      setProgress: (p) => {
        if (!Number.isFinite(p)) return;
        progressRef.current = Math.max(0, Math.min(1, p));
        setProgress(progressRef.current);
        cache.current?.request(progressRef.current);
      },
      getProgress: () => progressRef.current,
      getState: () => ({ cache: cache.current?.stats ?? null, drawnIndex, displayed, loaded, handReady: Boolean(hand), hidden, active, revision: manifest?.revision ?? null,
        diagnostics: diagnostics.current?.snapshot(performance.now()) ?? null,
        transferBytes: manifest ? { sequence: manifest.samples.reduce((sum, sample) => sum + sample.bytes, 0), foreground: manifest.foreground.bytes } : null }),
    };
    return () => { delete host.__gamesHero; };
  }, [drawnIndex, displayed, loaded, hand, hidden, active, manifest]);

  // Scroll updates keep the scene mounted; its frame callbacks read the continuous progress ref.
  const scene = useMemo(() => active && loaded && hand && plate && <SceneView index={2} visible={!hidden} className={styles.view}>
    <Suspense fallback={null}><GamesFocusScene progressRef={progressRef} plate={plate} hand={hand} stageRef={frame} onReady={onReady} diagnosticsRef={diagnostics} /></Suspense>
  </SceneView>, [active, loaded, hand, plate, hidden, onReady]);

  return (
    <section ref={runway} className={styles.runway} data-static={staticMode || debug !== null} aria-label="Beach Blast">
      <div ref={stage} className={styles.stage} data-hero-canvas="games" data-progress={progress.toFixed(3)} data-requested-progress={progress.toFixed(3)} data-media-progress={displayed.toFixed(3)} data-frame={plate?.index ?? ""} data-asset-revision={manifest?.revision ?? ""} data-media-state={staticMode ? "static" : ready && hand && plate ? "ready" : "loading"}>
        <a href="#arcade" className={styles.skip} onClick={(event) => { event.preventDefault(); skip(); }}>
          Skip to Arcade <span aria-hidden="true">↓</span>
        </a>
        <div ref={frame} className={styles.frame} data-ready={drawnIndex !== null && active && loaded && Boolean(hand && plate)} data-hybrid={!staticMode} role="img" aria-label="A pair of black glasses frames three distant explosions on a sunlit beach before opening into The Sangam Arcade.">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.poster} src={manifest ? mediaUrl(manifest.posters[portrait ? "portrait" : "landscape"][posterIndex]) : `/media/games-hybrid/v1/posters/${portrait ? "portrait-" : ""}${HYBRID_POSTERS[posterIndex]}.webp`} alt="" width={1912} height={800} fetchPriority="high" />
          {scene}
        </div>
        <div className={styles.overlays}>
        <div className={styles.intro} style={{ opacity: staticMode ? 1 : Math.max(0, 1 - visualProgress / 0.08) }}>
          <p>OSU Tamil Sangam presents</p>
          <p>Scroll <span aria-hidden="true">·</span> <span lang="ta" className="font-tamil tracking-normal normal-case leading-relaxed">கீழே செல்</span></p>
        </div>
        {staticMode && (
          <div className={styles.caption} aria-live="off">
            <div className={styles.stills} aria-label="Beach Blast stills">
              {beats.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-pressed={still === index}
                  onClick={() => setStill(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
        <div className={styles.exitWash} aria-hidden="true" style={{ opacity: staticMode || exited ? 0 : getGamesExitOpacity(progress) }} />
      </div>
    </section>
  );
}
