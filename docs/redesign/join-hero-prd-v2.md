# Join Hero — "The Morning Campus"
### Execution-grade PRD v2 + agent directive (supersedes the "Nanban Gates Visual Overhaul" directive)

**Route:** `/join` · **Date:** October 2, 2026
**Scope:** environment, lighting, materials, particles, and a new memorabilia vignette. **The existing GSAP scroll animation and the swinging-gate mechanics are frozen** (§1.1).
**Code samples** are reference implementations written for this spec and **not run**. Test them.

---

## 0. What changed from your directive, and why

| # | Your directive | v2 | Reason |
|---|---|---|---|
| 1 | "Next.js 15" | **Next.js 16.3.5 / React 19.2** | What `package.json` shows. R3F must be **v9** (see the Gallery PRD §0 for the version plan). |
| 2 | Drei `<Sky/>` + a fog color that "matches the canvas background exactly" | **Custom gradient sky dome whose horizon color is the fog color** (drei `<Sky/>` kept as fallback) | Drei's Sky draws a blue Rayleigh sky. Fog tints distant geometry toward `#F4EEDD`, but the sky behind it stays blue, so you get a visible band at the horizon. Making the dome's horizon *be* the fog color guarantees a seamless blend. |
| 3 | `<Environment preset="dawn"/>` | **Procedural `Lightformer` environment** (self-hosted CC0 HDRI as optional upgrade) | Drei presets are fetched from a CDN at runtime. That adds a network dependency, can fail under CSP or offline, and breaks the site's "procedural, no external fetch" convention. |
| 4 | Sky `sunPosition [10,5,−10]` and light at `[15,10,−15]` | **One shared sun vector** drives sky glow, light, shadow camera, and light shafts | The two numbers differ in elevation (19.5° vs 25°), so the glow and the shadows disagree. |
| 5 | `<SoftShadows/>` for every device | **Tier A only**; PCF soft shadows on B; none on C | PCSS patches the global shadow shader chunk and is expensive on mobile, and `/join` is mostly opened from Instagram. |
| 6 | Wrought iron `metalness 0.9, roughness 0.25, #1A1A1A` | **Variant B (recommended): painted iron** `metalness 0.35, roughness 0.42, clearcoat 0.3`; your spec kept as Variant A | Painted iron is a dielectric coating. At metalness 0.9 a near-black base reads as dark chrome, not iron. Compare both in the Phase 3 screenshots. |
| 7 | Leaves with `transmission: 0.2` | **Cheap thin-surface translucency patch** (backlight term) | `transmission` forces an extra full-scene render pass. Backlit leaves are exactly what a translucency term is for, at near-zero cost. |
| 8 | Oak leaves or cherry blossoms | **Ohio buckeye leaves** (palmate, five leaflets) plus a few jasmine petals | A first day at Ohio State is late summer. Cherry blossoms are spring; buckeye leaves are specific to Columbus and the jasmine nods to the Tamil side. |
| 9 | Nothing about the DOM | **Overlay contrast audit** (§7) | Going from a black hero to a cream one can silently break light-on-dark text in the 3-step form and nav. |
| 10 | "Memorabilia" as a request | **A story-faithful vignette** with confidence tiers and a do-not-include list (§5) | Accuracy needs verified story beats, and some of the film's material must stay out. |

---

## 1. Guardrails

### 1.1 Frozen scope
Do not modify: the GSAP timeline(s) that drive the gate and scroll, the gate rig and its swing, or any file that defines them. Phase 0 lists these as `PROTECTED_PATHS`. **Every gate review must show `git diff --stat main -- <PROTECTED_PATHS>` empty.** New objects may *read* the gate progress value to react (e.g. bunting sways more as the gates open) but may not add tweens to existing timelines or reparent gate parts. Everything new lives outside the gate's swing arc (keep-out volume in §5.3).

### 1.2 Film and IP
*Nanban* (2012, dir. Shankar) is a copyrighted film, and a remake of *3 Idiots*. The vignette is **visual evocation for people who know the film, plain meaning for everyone else**:
- No stills, poster art, title lettering, music, song lyrics, dialogue, or actor/character likenesses.
- No character names, actor names, or the film's fictional college name in shipped UI, alt text, metadata, or filenames. The Tamil word நண்பன் / "nanban" means "friend" and is fine as a word; the film's logo and typography are not.
- "All is well" is a widely used phrase and the film's tagline. Use it only as hand-chalked text on a blackboard prop, never set in the film's lettering.
- No Block O, OSU seal, or mascot. A plain buckeye nut and buckeye leaves are natural objects and fine.

### 1.3 Material that stays out
The film touches student suicide and ragging, among other heavy material. **Do not depict** any of it: no ropes, ceiling fans as props, hospital or childbirth imagery, bullying scenes, or anything referencing a character's death. The vignette is warm and light by design.

### 1.4 Culture
Tamil text on props (blackboard, trunk) is rendered with Canvas 2D after `document.fonts.ready`, follows the `tamil-text` skill, and is logged to `docs/redesign/tamil-review.md` for a native reader. Any 3D Tamil letterforms use the HarfBuzz → SVG path → extrusion pipeline, never `TextGeometry`.

---

## 2. Art direction

**The moment:** the first morning on campus. Low sun behind the gates, cool shadows toward the camera, warm haze, dew still on the stone. It should feel like arriving early and finding your people already there.

**The story the vignette tells (§5):** three friends' tumblers of chai on a bench, and a fourth seat with a fourth tumbler waiting. The film is about three friends and the search for the one who went missing. On a Join page, the empty seat is for *you*. That single composition carries the whole concept; the other props support it.

**Palette (sRGB):**

| Role | Value |
|---|---|
| Fog / horizon | `#F4EEDD` |
| Sky mid (haze) | `#F7E7C6` |
| Sky zenith | `#9CC4E8` |
| Sun | `#FFF8E7` |
| Limestone | `#E8E4D9` (map-driven) |
| Pathway | `#D1CCC0` |
| Iron | `#141414` base |
| Club accents (bunting, tassel, ribbons) | site purple, mint, gold tokens |

**This hero is fixed "morning"** and deliberately ignores the global time-of-day/tinai system. Note it in a code comment so nobody "fixes" it.

---

## 3. Environment

### 3.1 One sun

```ts
// env/sun.ts
import { Vector3 } from "three";

const ELEV = (22 * Math.PI) / 180;   // low morning sun
const AZIM = (45 * Math.PI) / 180;   // back-right of the camera view axis
export const SUN_DIR = new Vector3(
  Math.cos(ELEV) * Math.sin(AZIM),   //  0.656
  Math.sin(ELEV),                    //  0.375
 -Math.cos(ELEV) * Math.cos(AZIM),   // -0.656
).normalize();
export const SUN_DIST = 40;
export const SUN_POS: [number, number, number] = SUN_DIR.clone().multiplyScalar(SUN_DIST).toArray();
```

### 3.2 Sky dome and fog

```glsl
// sky fragment (dome mesh: BackSide, depthWrite false, fog false, renderOrder -1)
varying vec3 vDir;
uniform vec3 uHorizon;  // = FOG_COLOR  (#F4EEDD)
uniform vec3 uMid;      // #F7E7C6
uniform vec3 uZenith;   // #9CC4E8
uniform vec3 uSunDir;
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHorizon, uMid, smoothstep(0.00, 0.18, h));
  c = mix(c, uZenith, smoothstep(0.12, 0.85, h));
  float s = max(dot(d, uSunDir), 0.0);
  c += vec3(1.0, 0.86, 0.62) * (pow(s, 64.0) * 0.8 + pow(s, 6.0) * 0.18);   // disc + halo
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

Fog: `scene.fog = new THREE.FogExp2(FOG_COLOR, 0.015)` and `<color attach="background" args={[FOG_COLOR]} />`. Both use the **same constant**.

### 3.3 Environment light (no network)

```tsx
<Environment resolution={256} frames={1} background={false}>
  {/* sun softbox, back-right */}
  <Lightformer form="rect" intensity={6} color="#FFF3D6" scale={[14, 10, 1]} position={SUN_POS} target={[0, 0, 0]} />
  {/* cool sky dome overhead */}
  <Lightformer form="ring" intensity={1.4} color="#BFD9F2" scale={30} position={[0, 24, 0]} target={[0, 0, 0]} />
  {/* warm ground bounce */}
  <Lightformer form="rect" intensity={0.9} color="#E8D9B8" scale={[30, 30, 1]} rotation-x={-Math.PI / 2} position={[0, -2, 0]} />
  {/* soft front fill so camera-facing stone is not mud */}
  <Lightformer form="rect" intensity={1.1} color="#FFF8EE" scale={[20, 8, 1]} position={[0, 4, 18]} target={[0, 2, 0]} />
</Environment>
```

---

## 4. Materials

| Surface | Spec |
|---|---|
| **Stone pillars** | CC0 limestone/block PBR set (map, normal, roughness), **1k KTX2** desktop and **512** mobile, `anisotropy 8`. Triplanar or per-face UV. Color `#E8E4D9`, roughness ~0.9. Fallback: procedural noise bump + roughness 0.9. |
| **Pathway** | Cobblestone or concrete set, color `#D1CCC0`, roughness 1.0 with a roughness map. Optional "morning dew": a few darker, low-roughness patches (0.35) to catch sky glints. |
| **Iron, Variant A** | `metalness 0.9, roughness 0.25, color #1A1A1A`. |
| **Iron, Variant B (recommended)** | `color #141414, metalness 0.35, roughness 0.42, clearcoat 0.3, clearcoatRoughness 0.4`. |
| **Brass fixtures** | `metalness 1, roughness 0.3`. |

---

## 5. The vignette (memorabilia)

Keep-out volume: $X \in [-3.80, +3.80]$, $Y \in [0.00, 5.50]$, $Z \in [-0.50, +3.75]$. Nothing from the vignette enters this volume.

1. Bench with 3 chai tumblers in davaras + 1 empty tumbler with tag "வாங்க நண்பா" ($x = +1.1W, z = +0.6W$).
2. Blackboard on easel: chalk "ALL IS WELL", "வாங்க நண்பா", and live line "Next meeting: ..." ($x = -1.2W, z = +0.5W$).
3. Rooftop water tank silhouette on distant building, two birds.
4. Mortarboard + rolled scroll with purple/mint tassel on gate finial.
5. Bunting catenary + clipboard on pillar.
6. Library due-date card + SILENCE PLEASE tag.
7. Kalyana pathrikai + jasmine garland (malli poo).
8. Wildlife photographer's camera on tripod.
9. Family photo on steel tiffin carrier on trunk.
10. Painted tin trunk with bedding roll ($x = -0.9W, z = +0.9W$).
11. Drafting board with blueprint and spinning gear-train windmill.
12. Bicycle leaning on wall.
13. Gold topper medal on ribbon.
14. Buckeye nut on bench arm.
