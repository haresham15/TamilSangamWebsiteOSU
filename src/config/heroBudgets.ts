/**
 * Per-hero performance budgets, copied from each hero PRD in docs/heroes/.
 * Checked by `scripts/capture-all-heroes.mjs --perf`. `null` = no PRD number yet;
 * the harness reports the measurement without gating it.
 *
 * Frame-time defaults (no hero-specific PRD number): desktop p95 ≤ 20 ms and
 * throttled-mobile p95 ≤ 36 ms, taken from games-hero-hybrid-cinematic-prd.md §10,
 * the only PRD that defines a frame-interval percentile.
 *
 * No import statements: this file is loaded directly by Node (--experimental-strip-types).
 */

export interface HeroBudget {
  route: string;
  /** p95 rendered-frame interval during an active scroll, 1440×900 */
  desktopP95Ms: number;
  /** p95 rendered-frame interval during an active scroll, 375×812 DPR 3, 4× CPU throttle */
  mobileP95Ms: number;
  /** Mean fps floors when the PRD states them */
  desktopFpsMin: number | null;
  mobileFpsMin: number | null;
  /** Peak per-frame draw calls across all Views */
  callsPeak: number | null;
  /** Peak per-frame triangles across all Views */
  trianglesPeak: number | null;
  /** Estimated texture + render-target memory, MB */
  textureMb: number | null;
  source: string;
}

const DESKTOP_P95 = 20;
const MOBILE_P95 = 36;

export const HERO_BUDGETS: Record<string, HeroBudget> = {
  home: {
    route: "/",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: null,
    // PRD §8.3's ≤200k (A) / ≤90k (B) covers the two kolam tube halves only: measured offline
    // at 84k / 43k (pathBuilder.buildStaticKolamMeshes). The rendered total adds the emblem,
    // pulli dots and the shadow pass, which the PRD does not budget, so it is reported, not gated.
    trianglesPeak: null,
    textureMb: null,
    source: "home-hero-peel-and-flow-prd.md §8.3",
  },
  join: {
    route: "/join",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: null,
    trianglesPeak: null,
    textureMb: null,
    source: "join-hero-collegiate-gates-prd.md §5 (single instanced leaf draw, Tier C static)",
  },
  board: {
    route: "/board",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: 58,
    mobileFpsMin: 30,
    callsPeak: 65,
    trianglesPeak: null,
    textureMb: 18,
    source: "board-hero-chola-darbar-prd.md §5",
  },
  games: {
    route: "/games",
    desktopP95Ms: 20,
    mobileP95Ms: 36,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: 80,
    trianglesPeak: null,
    textureMb: 128,
    source: "games-hero-hybrid-cinematic-prd.md §10 (draws <80 target, graphics <128 MiB)",
  },
  events: {
    route: "/events",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: 85,
    trianglesPeak: null,
    textureMb: null,
    source: "events-hero-leo-concert-arena-prd.md §5",
  },
  guide: {
    route: "/guide",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: 110,
    trianglesPeak: 350_000,
    textureMb: 20,
    source: "guide-hero-v3-station-sequence-prd.md §8.1",
  },
  suggestions: {
    route: "/suggestions",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: null,
    trianglesPeak: null,
    textureMb: null,
    source: "suggestions-hero-kaththi-war-room-prd.md (no numeric budget; set from baseline −20%)",
  },
  about: {
    route: "/about",
    desktopP95Ms: DESKTOP_P95,
    mobileP95Ms: MOBILE_P95,
    desktopFpsMin: null,
    mobileFpsMin: null,
    callsPeak: null,
    trianglesPeak: null,
    textureMb: null,
    source: "about-hero-gopuram-z-scroll-prd.md §5 (<4 MB is ring geometry VRAM, which the texture estimate does not cover)",
  },
};
