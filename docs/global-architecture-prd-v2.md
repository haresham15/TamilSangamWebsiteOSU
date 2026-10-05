<USER_REQUEST>
# Global Architecture — "One Canvas, One Clock"
### Execution-grade PRD v2 + agent directive (supersedes the "Phase 2 UI/UX Overhaul" master directive)

**Scope:** site-wide rendering and interaction infrastructure. **Package manager: `npm` only** (commit `package-lock.json`, use `npm ci` in CI).
**Date:** October 3, 2026
**Code samples** are reference implementations written for this spec and **not run**. Test them.

---

## 0. What changed from your directive, and why

| # | Your directive | v2 | Reason |
|---|---|---|---|
| 1 | "Next.js 15" | **Next.js 16.3.5 / React 19.2 / R3F v9 / drei v10 / `lenis`** | What the repo uses; R3F v8 doesn't support React 19. Pin exact versions with `npm view` at install time. |
| 2 | Canvas at `zIndex: -1`, `pointerEvents: none` | **`html` carries the page background, `body` is transparent, canvas sits below `#app-root`; R3F events bound to `#app-root` via `eventSource`**. Canvas height is `100lvh`. | A canvas at −1 vanishes behind an opaque `body` background. `pointer-events: none` also kills every R3F pointer event unless you rebind the event source. `100vh`/`100svh` fixed canvases resize as the mobile URL bar moves. |
| 3 | `<View>` *or* `tunnel-rat` | **`<View>`** (it is built on tunnel-rat) **after a Phase 1 spike with pass/fail criteria and two fallback plans** (§3.4) | View is purpose-built for this, but it takes over the render loop, so post-processing and global shader patches need decisions *before* the heroes migrate. |
| 4 | Lenis snippet | **Add `lenis.on('scroll', ScrollTrigger.update)`**, create Lenis with `autoRaf: false` | Lenis's own GSAP recipe has that line; without it ScrollTrigger lags Lenis. |
| 5 | "R3F Sync: use the same frame data" | **`frameloop="never"` + `advance()` called from the one ticker**, in explicit order | Otherwise R3F keeps its own `requestAnimationFrame` loop and you still have two clocks. `advance(timestamp, runGlobalEffects?)` exists for exactly this. |
| 6 | `gsap.ticker.lagSmoothing(0)` | **Kept, plus a delta clamp (`dt ≤ 1/20 s`) in every consumer** | With lag smoothing off, a backgrounded tab returns with a huge delta; springs, state machines, and shaders would jump. |
| 7 | Full-screen black boot overlay, scroll and DOM frozen until `progress = 100` | **Once per session, tier A only, hard 3 s cap, skippable, `inert` instead of pointer hacks, `<noscript>` safe** | Most visitors arrive from Instagram on phones. A mandatory blocking slate hurts them and delays real content. |
| 8 | `useProgress` drives the slate | **Plus handling for `total === 0`, asset errors, and timeouts** | `useProgress` only sees loader-managed assets; with nothing to load it never "completes" the way you expect, and a 404 can stall it. |
| 9 | "Mathematically render the materials" for shader warm-up | **`renderer.compileAsync(scene, camera)` + `renderer.initTexture()` using the production lights, fog, environment, and tone mapping** | Programs are keyed by lights, fog, shadows, and material patches. Compiling a different configuration warms nothing. |
| 10 | Shutter via `scaleY: 0` | **Two compositor-only panels using `yPercent`** | Same look; animates on the GPU compositor, no layout or paint. |
| 11 | `clamp(2.5rem, 5vw + 1.5rem, 8rem)` | **Type tokens whose max ≤ ~2.5× min for readable text; larger sizes only for decorative `aria-hidden` text; Tamil-specific line-height rules** | Common accessibility guidance: if the max is much more than 2.5× the min, 200% zoom may not enlarge the text enough (WCAG 1.4.4). Verify by zoom testing. |
| 12 | Headings overlapping image boundaries | **Allowed with contrast, reading-order, and focus rules** (§7.2) | Overlap is visual only; the DOM order must stay logical and AA contrast must hold wherever text crosses an image. |
| 13 | `data-speed` bound to the Lenis instance | **`data-speed` implemented with ScrollTrigger scrub (transform-only), decorative layers only** | ScrollTrigger is already synced to Lenis. GSAP's ScrollSmoother also has `data-speed` but must not be combined with Lenis. |
| 14 | Spring `stiffness: 150, damping: 15` | **Same numbers, implemented as a tiny spring on the master tick** (§8) | Those parameters are Motion/Framer-style. Framer Motion runs its own scheduler, which breaks "one clock" for pointer physics. |
| 15 | DOM images mapped to hidden planes | **Real `<img>` stays (SEO, a11y, Lite); planes live in a dedicated orthographic View per grid; rect-based sync; hard texture budget** (§9) | Avoids per-frame layout thrash, double downloads, and a blank page if WebGL fails. |
| 16 | Routes "project" scenes into the canvas | **Adds route transitions, idle/hover warm-up of the next scene, focus management** (§5) | A persistent canvas removes context churn; it doesn't hide scene swaps. |
| 17 | Scene names reference films ("Leo crowd", "Alaipayuthey", "Vaaranam Aayiram") | **Neutral component names** (`CrowdScene`, `PlatformBoard`, `FretboardHighway`, `MorningGates`) | Film names don't belong in shipped bundles, source maps, or loader copy. I haven't seen the "Leo crowd" scene; Phase 0 audits it for likeness and IP. |

**Not verified:** I haven't seen `src/`, the "Cinematic Heritage" base styles, or the Events/Home 3D scenes. Phase 0 is a read-only audit; file names below are placeholders until it reports.

---

## 1. How this relates to the hero PRDs

The Gallery, Join, and Guide hero PRDs each assume their own `<Canvas>`. Under this architecture they become **canvas-agnostic scene components** rendered inside a `<View>`:

| Hero | Change when migrating | Known risk |
|---|---|---|
| Gallery (guitar neck) | Drop its `<Canvas>`; `frameloop` logic becomes governor requests; delta clamp | **Post-processing** (Bloom/DOF) and `MeshTransmissionMaterial` inside a View: decide in the spike (§3.4) |
| Join (morning gates) | Same | **`SoftShadows` patches the global shader chunk**, which would change shadows for every scene on the shared renderer. Replace with PCF soft shadows or mount/unmount with strict cleanup |
| Guide (split-flap board) | Same; `frameloop="demand"` becomes governor requests | None beyond the shared rules |
| Home / Events / Board / Ideas | Unknown to me | Phase 0 inventory |

---

## 2. Guardrails

- **Frozen:** DOM copy and content, form logic, the visual intent of each hero. This PRD changes infrastructure and interaction physics, not what the pages say.
- **Tier policy:** Tier C / Lite (reduced motion, Save-Data, low battery, no WebGL2, context loss) **mounts no global canvas and no Lenis**. DOM-only experience with the heroes' still images.
- **In-app browsers** (Instagram, TikTok) start at tier B: no boot slate, no DOM-image planes, native touch scroll.
- **Accessibility floor:** WCAG 2.2 AA, `prefers-reduced-motion` honored everywhere, keyboard scroll and find-in-page unbroken, `aria-hidden` canvas.
- **No film assets or names** in shipped code, comments that survive minification, or UI copy.

---

## 3. Phase 1 — The persistent canvas

### 3.1 Stacking and layout

```css
/* globals.css */
html  { background: var(--bg); }        /* page background lives on html */
body  { background: transparent; }
#gl-root  { position: fixed; top: 0; left: 0; width: 100%; height: 100lvh; z-index: 0; pointer-events: none; }
#app-root { position: relative; z-index: 1; }   /* all DOM content sits above the canvas */
```
Any DOM area that should *show* WebGL (a View, an image well) must have a transparent background. Opaque sections naturally cover the canvas. Use `svh` for DOM hero wrappers and `lvh` for the canvas.

```tsx
// app/layout.tsx  (server component)
import "lenis/dist/lenis.css";
import { Providers } from "@/components/providers/Providers";     // client: MotionProvider, TierProvider, TransitionProvider
import { GlobalCanvas } from "@/components/gl/GlobalCanvas";      // client

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div id="app-root">{children}</div>
          <GlobalCanvas />
        </Providers>
      </body>
    </html>
  );
}
```
Do not use `template.tsx` anywhere above pages that use Views; it remounts on navigation.

```tsx
// components/gl/GlobalCanvas.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

export function GlobalCanvas() {
  const tier = useTier();
  const [source, setSource] = useState<HTMLElement | null>(null);
  useEffect(() => setSource(document.getElementById("app-root")), []);
  if (!source || tier === "C") return null;                         // Lite: no canvas at all

  return (
    <div id="gl-root" aria-hidden="true">
      <Canvas
        eventSource={source} eventPrefix="client"                   // R3F events come from the DOM wrapper
        frameloop="never"                                           // the master ticker calls advance() (§4)
        dpr={[1, tier === "A" ? 1.75 : 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl, advance }) => { gl.setClearAlpha(0); registerRenderer(gl, advance); }}
      >
        <View.Port />
      </Canvas>
    </div>
  );
}
```

Page usage:

```tsx
// any page: the View is an ordinary div that tracks its own rect
<View className="h-[100svh] w-full">
  <MorningGates />                // scene component; no <Canvas> inside
</View>
```

### 3.2 Events
With `pointer-events: none` on the canvas and `eventSource` bound to `#app-root`, R3F listens to DOM events and raycasts. Two rules: (1) only objects that need interaction get `onClick`/`onPointerMove`; (2) DOM buttons mark themselves with `data-no-gl` and the scene's handlers return early if the original event target is inside one, so a DOM click never fires a 3D object behind it.

### 3.3 Lifecycle
- Each scene disposes its geometries, materials, textures, and render targets on unmount. A dev-mode leak guard logs `renderer.info.memory` before/after each route.
- Handle `webglcontextlost`: switch the tier to C for the session, show the Lite stills.
- The governor (§4.3) renders nothing when no View is visible.

### 3.4 Spike: exit criteria (Phase 1 does not complete without these)

| # | Test | Pass |
|---|---|---|
| S1 | Two Views (a pinned hero and a tall DOM-image grid) render together while Lenis scrolls at ~3000 px/s | 60 fps on an M1-class machine and ≥ 30 fps on a mid Android; scissor edge within 1 px of the DOM edge |
| S2 | R3F pointer events inside a View while DOM buttons remain clickable | 3D objects respond; DOM clicks never trigger 3D |
| S3 | Post-processing in a View (Bloom on the Gallery-style dust) | Works, **or** a decision recorded: (a) fake bloom in-shader, (b) per-View render target composite, or (c) that hero keeps its own canvas |
| S4 | 20 navigations between two 3D routes | No flash, no context loss, GPU memory returns to baseline |
| S5 | iOS Safari + Chrome Android while the URL bar collapses | No View misalignment, no canvas resize storms |

**Fallbacks:** if S1 or S4 fail, **Plan B** is one canvas per route with a texture/geometry cache shared across routes and a context-count guard. If only S3 fails, **Plan C**: that hero keeps its own canvas and the rest use the global one.

---

## 4. Phase 2 — The master ticker

### 4.1 One callback, explicit order

Instead of three libraries each trusting the ticker's registration order, register **one** callback and call subsystems in a fixed order:

```ts
// engine/masterTick.ts
export const scroll = { y: 0, velocity: 0, direction: 0, progress: 0 };
type System = { order: number; step: (dt: number, t: number) => void };
const systems: System[] = [];
export const registerSystem = (s: System) => (systems.push(s), systems.sort((a, b) => a.order - b.order));

let last = 0, frame = 0;
export function masterTick(timeSec: number, lenis: Lenis | null) {
  const dt = Math.min(timeSec - last, 1 / 20); last = timeSec;           // clamp: lag smoothing is off
  lenis?.raf(timeSec * 1000);                                             // 1) smooth scroll (emits 'scroll' → ScrollTrigger.update)
  scroll.y = lenis ? lenis.scroll : window.scrollY;                       // 2) publish scroll state
  scroll.velocity = lenis ? lenis.velocity : 0;
  for (const s of systems) s.step(dt, timeSec);                           // 3) springs, parallax, image planes, camera rigs
  const level = governor.level();                                         // 4) render last
  if (level === 0 || (level === 1 && (++frame & 1))) return;             // 0 = paused, 1 = 30 fps ambient, 2 = every tick
  rendererAdvance?.(timeSec * 1000, true);
}
```

```tsx
// components/providers/MotionProvider.tsx
"use client";
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ autoRaf: false, lerp: 0.1, syncTouch: false, anchors: true, allowNestedScroll: true });
    lenis?.on("scroll", ScrollTrigger.update);                           // the line your directive was missing
    const tick = (t: number) => masterTick(t, lenis);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);                                                      // context/store for useLenis()
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); };
  }, []);
  return <>{children}</>;
}
```
`syncTouch: false` keeps native touch scrolling (better on iOS and in-app browsers). Use `data-lenis-prevent` on any nested scrollable area. React StrictMode double-mounts effects in dev; the cleanup above makes that safe.

### 4.2 R3F on the same clock
`<Canvas frameloop="never">`; `registerRenderer` stores the `advance` function from `onCreated`; `masterTick` calls it. Inside scenes, `useFrame((state, delta) => …)` runs once per `advance`, and its `delta` comes from that same timestamp. Clamp it again (`Math.min(delta, 0.05)`) in any scene that integrates motion.

### 4.3 Frame governor
Systems declare why they need frames; nothing renders if nobody asks.

```ts
// engine/governor.ts
type Level = 0 | 1 | 2;               // 0 idle, 1 ambient (~30 fps), 2 active (every tick)
const asks = new Map<string, Level>();
export const governor = {
  request(key: string, level: Level) { level ? asks.set(key, level) : asks.delete(key); },
  level(): Level { if (document.hidden) return 0; let m: Level = 0; for (const v of asks.values()) if (v > m) m = v as Level; return m; },
};
```
Typical requests: scroll active (2), a flip animation running (2), a hero's idle breathing while visible (1), pointer over an interactive 3D object (2). A page with no visible View requests nothing, so the GPU idles.

### 4.4 Scroll and route behaviour
- On pathname change: `lenis.scrollTo(0, { immediate: true, force: true })`, then `lenis.resize()` and `ScrollTrigger.refresh()` after the new page's content and fonts settle (`document.fonts.ready`).
- Scroll velocity for effects (e.g., the Gallery strings, plane skew) comes from `scroll.velocity`. Note Lenis smooths velocity, so constants tuned against raw wheel velocity need retuning.
- Reduced motion: no Lenis; native scroll; `scroll.velocity` computed from deltas or set to 0.

---

> **Approval gate.** Per your protocol: after Phases 0–2, output the exact `layout.tsx`, `GlobalCanvas`, `MotionProvider`, `masterTick`, and `governor` code, plus the S1–S5 results, and **stop**. Do not start the boot sequence, typography, magnetic, or image-plane work until I approve.

---

## 5. Route transitions and warm-up (new)

1. **Intercept:** on internal navigation, `transition.go(href)`: the shutter closes → `router.push(href)` → the new page mounts and its scene registers → wait for the scene's `ready` (compiled and textures initialized) with a 1.2 s cap → shutter opens → the hero intro timeline starts. Use `<Link onNavigate>` with `preventDefault()` for link clicks (introduced in recent Next versions; verify with Context7). Back/forward can't be intercepted, so use a simple fade for those.
2. **Warm the next route** on link `pointerenter`/`focus` and on idle: `router.prefetch(href)`, the scene's `useGLTF.preload`/texture preloads, and a deferred `compileAsync` for its patched shaders.
3. **Focus and announcements:** after each transition move focus to `main` (`tabindex="-1"`), update `document.title`, and announce the new page in a polite live region. The shutter panels are `aria-hidden`.
4. **Reduced motion:** no shutter; an instant swap with the live-region announcement.

---

## 6. Phase 3 — Boot sequence and shader warm-up

### 6.1 When it runs
Only if **all** are true: first page load of the session (`sessionStorage`), tier A, not an in-app browser, no reduced motion, no Save-Data. Otherwise skip straight to the page. Content is server-rendered under the slate, the slate has a visible **Skip** control, and a hard **3 s** cap releases it no matter what. A `<noscript>` rule hides it.

### 6.2 Progress honesty
`progress = max(prev, realProgress)`, never decreasing. `useProgress` caveats: if `total === 0` treat as 100; on `errors.length` log and continue; the 3 s cap overrides. Readout is monospace with `font-variant-numeric: tabular-nums`, formatted `00.00%`. **Copy is just the readout and the club name**, with no build narration ("COMPILING SHADERS…").

### 6.3 Warm-up (per scene, via a hook)
```ts
// gl/useWarmup.ts
export function useWarmup(sceneId: string) {
  const { gl, scene, camera } = useThree();       // inside a View these are that View's scene/camera
  useEffect(() => {
    let live = true;
    (async () => {
      await document.fonts.ready;
      // lights, fog, environment and tone mapping must already be the production ones
      await gl.compileAsync(scene, camera);        // non-blocking where KHR_parallel_shader_compile exists
      scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; m?.map && gl.initTexture(m.map); });
      if (live) bootStore.markReady(sceneId);
    })();
    return () => { live = false; };
  }, [gl, scene, camera, sceneId]);
}
```
Rules: set `customProgramCacheKey` on every `onBeforeCompile`-patched material (string board, flap cells, dissolve props, DOM planes) so variants are keyed deliberately; compile with every object visible (compilation walks visible objects); re-warm if the tier changes. Log per-scene compile time in the debug HUD.

### 6.4 Interaction freeze
`lenis.stop()` plus `inert` on `#app-root` while the slate is up, then `lenis.start()` and remove `inert`. Announce "Loading" via `role="status"` and remove the announcement on release. Never leave the page frozen if the boot errors; the `finally` always releases.

### 6.5 The reveal
Two panels (top and bottom halves) animate `yPercent: -100` / `100` with `expo.inOut`, ~0.9 s, compositor-only. Optional: a single kolam line draws along the seam as it opens. A strict cascade follows: hero intro timeline → headline reveal (Tamil text split by grapheme with `Intl.Segmenter`, never by code unit) → nav → secondary content. The same shutter component is reused for route transitions (§5).

---

## 7. Phase 4 — Fluid typography and editorial layouts

### 7.1 Tokens (Tailwind v4 `@theme`; starting points, tune by eye and zoom test)

```css
@theme {
  --text-display: clamp(2.5rem, 1rem + 5vw, 6rem);        /* hero H1; max/min = 2.4 */
  --text-title:   clamp(1.75rem, 1rem + 2.6vw, 3.5rem);
  --text-body:    clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-mark:    clamp(8rem, 5rem + 22vw, 26rem);        /* decorative watermark only: aria-hidden */
}
:lang(ta) { letter-spacing: 0; text-transform: none; line-height: 1.65; }
:lang(ta) .display { line-height: 1.25; }                  /* tall Tamil glyphs: never clip vowel signs */
```
Verify: browser zoom to 200% must visibly enlarge body and heading text; no horizontal scroll at 320 px; `text-wrap: balance` on headings. Check Tamil and Latin side by side and apply a per-script size adjustment if one looks smaller. The directive's example (2.5rem → 8rem) is fine for decorative watermark text, not for readable headings. If you want serif headings, confirm the Tamil pairing against the site's current display face first.

### 7.2 Overlap rules (asymmetrical grid collisions)
Overlap with named grid areas (`grid-area` layering), not absolute positioning. Rules: the **DOM order stays logical** (heading before its image); text stays real, selectable DOM text above the image; AA contrast must hold at every point text crosses the image (use a tinted scrim or `mix-blend-mode` only with a verified fallback); focus rings are never hidden under overlapping neighbors; the stacked layout is used at ≤ 640 px and under reduced motion.

### 7.3 Parallax (`data-speed`)
```ts
// engine/parallax.ts  (inside gsap.context; torn down on route change)
gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
  const speed = parseFloat(el.dataset.speed ?? "1");            // 1 = normal, <1 slower, >1 faster
  const range = () => (1 - speed) * window.innerHeight * 0.5;
  gsap.fromTo(el, { y: () => -range() }, {
    y: () => range(), ease: "none",
    scrollTrigger: { trigger: el.closest("[data-parallax-scope]") ?? el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });
});
```
Transform-only; decorative layers only (`aria-hidden`, never body text); at most ~8 animated layers per page; disabled on `(pointer: coarse)`, tier B/C, and reduced motion.

---

## 8. Phase 5 — Magnetic physics

```ts
// engine/spring.ts
export class Spring {
  x = 0; v = 0; target = 0;
  constructor(public k = 150, public c = 15, public m = 1) {}
  step(dt: number) { const a = (-this.k * (this.x - this.target) - this.c * this.v) / this.m; this.v += a * dt; this.x += this.v * dt; }
  get settled() { return Math.abs(this.v) < 0.01 && Math.abs(this.x - this.target) < 0.01; }
}
```
`k = 150, c = 15` is underdamped (damping ratio ≈ 0.61, ≈ 9% overshoot, settles in well under a second), which matches "snaps back forcefully". Register it as a system on the master tick; request governor level 2 only while unsettled.

- **Which buttons:** only primary CTAs (Join, tickets). Not nav, not form fields.
- **Pull:** active within `1.4 × half-size + 60 px`; target offset = `0.3 × (cursor − center)`, clamped to 16 px; inner text moves 1.4× the shell for depth. Apply the transform to an inner wrapper so the real hit area never runs away from the pointer.
- **Guardrails:** `(pointer: fine) and (hover: hover)` only; off for reduced motion; keyboard focus shows a normal focus ring and no motion; `mouseleave` sets `target = 0`.
- **Framer Motion:** keep only for non-physics UI (mount/unmount, layout) or remove it from the bundle if nothing else uses it.

---

## 9. Phase 6 — DOM → WebGL image planes

### 9.1 Structure
- **Real `<img>` stays** (served by `next/image`, same-origin, so no CORS trouble). When its plane is ready, set `data-gl-ready` and hide the image with `opacity: 0` (never `display:none`/`visibility:hidden`, which break accessibility). Tier B/C and WebGL failure leave the `<img>` visible.
- **One `<View>` per image grid** with an `<OrthographicCamera makeDefault>` so 1 world unit = 1 CSS px. Plane position inside the View: `x = rect.left − view.left + w/2 − view.width/2`, `y = −(rect.top − view.top + h/2 − view.height/2)`. Cache each image's rect on `ResizeObserver`/load, not every frame. The View tracks its own rect, so scroll needs no extra math.
- **Image wells must have a transparent background**; rounded corners are applied in the shader, not with `overflow: hidden`.
- **Gating:** `IntersectionObserver` with `rootMargin: 200px`. Only intersecting images have an active plane; mounting/unmounting a plane also loads/disposes its texture. Cap simultaneous planes at 16 (tier A) / 0 (tier B).
- **Textures:** load from `img.currentSrc` so the browser cache serves it; `colorSpace = SRGBColorSpace`; at most one texture upload per frame; budget ≤ 80 MB GPU texture memory on tier A. Every image used must be self-hosted (the current Google Photos hotlinks are fragile and may block CORS).
- **Interaction:** hover/leave from DOM events on the wrapper write to a plane registry (target `uHover`, `uMouse`); the tick springs them. Scroll velocity adds a mild skew.

### 9.2 Shader (skeleton)

```glsl
// fragment (ShaderMaterial, toneMapped:false)
uniform sampler2D uTex; uniform vec2 uPlane, uImage, uMouse; uniform float uHover, uVel, uTime, uRadius;
varying vec2 vUv;
vec2 coverUv(vec2 uv) { float k = max(uPlane.x / uImage.x, uPlane.y / uImage.y); return (uv - 0.5) * (uPlane / (uImage * k)) + 0.5; }
float sdRoundRect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 uv = coverUv(vUv);
  vec2 d = vUv - uMouse; float dist = length(d * vec2(uPlane.x / uPlane.y, 1.0));
  float ripple = sin(dist * 28.0 - uTime * 4.0) * exp(-dist * 5.0) * uHover;      // liquid wave
  vec2 off = normalize(d + 1e-4) * ripple * 0.012;
  float ca = 0.004 * uHover + 0.002 * abs(uVel);                                    // chromatic aberration
  vec3 col = vec3(texture2D(uTex, uv + off + vec2(ca, 0.)).r, texture2D(uTex, uv + off).g, texture2D(uTex, uv + off - vec2(ca, 0.)).b);
  float a = 1.0 - smoothstep(-1.0, 1.0, sdRoundRect((vUv - 0.5) * uPlane, uPlane * 0.5, uRadius));
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
```

---

## 10. Performance budgets and measurement

| Item | Target |
|---|---|
| WebGL contexts | **1** for the app lifetime |
| Master tick CPU (excluding render) | ≤ 1.5 ms on a mid device |
| Long tasks during scroll | none > 50 ms |
| GPU, tier A, hero View + 16 planes | ≤ 8 ms/frame (M1 / iPhone-13 class) |
| Tier B | ≥ 30 fps on mid Android, no planes |
| Boot slate | ≤ 3 s hard cap, first session only; LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (Lite path) |
| Memory | after 20 route cycles, `renderer.info.memory` (geometries, textures) returns to baseline |
| Texture memory | ≤ 80 MB (A), ≤ 40 MB (B) |

Measure with the Chrome DevTools MCP at mobile emulation with 4–6× CPU throttle; add a duplicate-`three` check (`npm ls three` must show one version; fail CI otherwise).

---

## 11. Accessibility

`inert` and `role="status"` for the boot slate; focus moves to `main` after transitions with a live-region announcement; Lenis off for reduced motion; `data-lenis-prevent` on nested scrollers; keyboard scroll, PageDown, find-in-page, and anchors work; canvas `aria-hidden`; magnetic and parallax off for coarse pointers and reduced motion; overlapping type meets AA; no flashing beyond 3 per second.

---

## 12. Debug and test tooling

- `?debug` HUD: fps, governor level and requests, active Views, plane count, `renderer.info` (calls, triangles, geometries, textures), per-scene compile times, tier.
- Unit tests: `Spring` settles without NaN; `masterTick` clamps `dt`; governor returns 0 with no requests or when hidden; plane-rect math.
- Playwright: navigate across routes ×20 and assert no context loss; scroll captures at fixed progress; a no-JS smoke test; reduced-motion test; a WebView-like user agent test.

---

## 13. File layout

```
src/app/layout.tsx
src/components/providers/{Providers,MotionProvider,TierProvider,TransitionProvider}.tsx
src/components/gl/{GlobalCanvas,SceneRoot,useWarmup}.tsx
src/components/gl/planes/{ImageGridView,DomPlane,registry}.ts(x)
src/components/ui/{Shutter,BootSlate,Magnetic}.tsx
src/engine/{masterTick,governor,spring,parallax,bootStore,renderer}.ts
src/styles/{globals.css,type.css}
```

---

## 14. Phases and agent prompts

Paste one at a time and `/clear` between phases.

**Standing preamble:**
```text
Read docs/redesign/global-architecture-prd-v2.md. Package manager is npm only. Next.js is 16.x, React 19.2, R3F v9, drei v10, lenis. Use Context7 for current docs. Do not add features outside the current phase. Run tsc, eslint and next build; capture Playwright screenshots at 390/768/1440 and report fps with the Chrome DevTools MCP.
```

**Phase 0 — Audit** *(read-only)*
```text
Do NOT edit files. Inventory: every <Canvas> in the repo and what scene it mounts (including the Events crowd scene), every use of useFrame, EffectComposer, SoftShadows, MeshTransmissionMaterial and custom shaders, every requestAnimationFrame / Lenis / ScrollTrigger / framer-motion usage, current Lenis init, the layout.tsx tree, the tier hook, installed versions, and `npm ls three`. For the Events crowd scene, report whether it depicts real people or film IP. List contradictions with the PRD.
```

**Phase 1 — Global canvas + spike**
```text
Implement section 3: stacking CSS, layout.tsx, GlobalCanvas (frameloop="never"), two demo Views (a pinned hero and a tall image grid with an orthographic camera) and the debug HUD. Run spikes S1-S5 and report pass/fail with numbers. Do not migrate real heroes yet.
```

**Phase 2 — Master ticker** *(then STOP)*
```text
Implement section 4: MotionProvider with Lenis (autoRaf false, ScrollTrigger.update), masterTick with explicit order and dt clamp, advance() integration, the governor, route-change scroll reset. Output the exact layout.tsx and the Lenis/GSAP init files plus the spike results, then stop and wait for my approval.
```
**Gate (explicit approval required).**

**Phase 3 — Transitions, boot, warm-up**
```text
Implement sections 5 and 6: Shutter, TransitionProvider (Link onNavigate), warm-up hook with compileAsync/initTexture, BootSlate with all gating conditions, the 3 s cap, Skip, inert, noscript, and honest progress. Neutral copy only.
```

**Phase 4 — Typography and layout**
```text
Implement section 7: type tokens, Tamil rules, zoom and 320 px tests, the overlap grid pattern with contrast checks, and ScrollTrigger-based data-speed parallax. Apply to the Hero headers and the About page only first.
```

**Phase 5 — Magnetic**
```text
Implement section 8: Spring on the master tick, Magnetic wrapper for the Join/ticket CTAs only, with all guardrails. Remove framer-motion if nothing else needs it.
```

**Phase 6 — DOM image planes**
```text
Implement section 9 for the Gallery grid only: ImageGridView with orthographic camera, DomPlane, IntersectionObserver gating, texture budget, and the shader. Keep the real <img>; confirm tier B/C and WebGL failure leave the images visible.
```

**Phase 7 — Hero migration**
```text
Migrate the Gallery, Join and Guide heroes into Views one at a time per section 1, resolving the post-processing and SoftShadows decisions recorded in the spike. Verify each hero's own acceptance checklist still passes.
```

**Phase 8 — Hardening**
```text
Run the section 10 measurements and section 12 tests. Use perf-a11y-auditor and design-critic. Produce pass/fail against every budget and a ranked must-fix list.
```

---

## 15. Definition of done

- [ ] One WebGL context for the lifetime of the app; none at all in Lite
- [ ] 20-route-cycle leak test returns to baseline; no flash on navigation
- [ ] One ticker: Lenis, ScrollTrigger, springs, parallax, and R3F `advance` all run from it in a fixed order; no stray `requestAnimationFrame` loops
- [ ] `lenis.on('scroll', ScrollTrigger.update)` present; `dt` clamped everywhere
- [ ] Spike S1–S5 recorded; fallbacks documented for anything that failed
- [ ] Boot slate runs at most once per session, ≤ 3 s, skippable, never blocks content for in-app or reduced-motion users
- [ ] Per-scene shader warm-up uses production lights/fog/env; first-mount hitches gone
- [ ] Type tokens pass 200% zoom and 320 px tests; Tamil never clipped; overlaps pass AA
- [ ] Magnetic and parallax absent on coarse pointers, reduced motion, and tier B/C
- [ ] Gallery planes respect the 16-plane and 80 MB budgets; `<img>` remains the fallback
- [ ] No film names in shipped scene names, loader copy, or UI

---

## 16. Open decisions for you

1. **Spike-first:** accept the View-based plan with Plan B / Plan C fallbacks if the spike fails?
2. **Boot slate:** once per session on tier A only (recommended), or on every load?
3. **Framer Motion:** remove it, or keep for layout/mount animations?
4. **Display face:** the directive says "serif headings". Keep the current display face, or introduce a serif, and what is its Tamil pairing?
5. **Image planes:** Gallery only, or also Events and Board?
6. **Joins and hero scenes:** is the Events crowd scene cleared for likeness and IP?
7. **Join `SoftShadows`:** replace with PCF soft shadows in the shared renderer?
8. **Touch scrolling:** keep it native (recommended) or enable Lenis touch sync?
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-03T15:02:45-04:00.

The user's current state is as follows:
Active Document: c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\guide-hero\board\audio.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 10
Other open documents:
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\guide-hero\board\audio.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\guide-hero\board\cells.tsx (LANGUAGE_TSX)
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\guide-hero\store\guideStore.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\guide-hero\GuideHero.tsx (LANGUAGE_TSX)
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\components\splitflap\SplitFlapMiniHeader.tsx (LANGUAGE_TSX)
</ADDITIONAL_METADATA>