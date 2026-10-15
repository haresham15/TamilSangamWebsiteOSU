# PRD — Home Hero: "Peel & Flow" (Top-Only Split → Flowing Wreath)

**Project:** OSU Tamil Sangam website · Next.js 16 · R3F v9 · drei · GSAP ScrollTrigger · Lenis · Tailwind 4
**Surface:** Home hero, Acts I–II (the digital kolam → the wreath around the Thirukkural)
**Supersedes:** *Wreath Split v3*, §6.1 (kolam geometry), §7 (the bend math: polar mapping, top-to-bottom zipper, "joined at the bottom") and §6.2's "emblem recedes to z = −30".
**Keeps:** *Wreath Split v3* §3 (hard constraints), §5 (scroll/pin architecture, with the simplified overlap formula in §9 below), §7.10 (Kural tiers), §7.11 (UI purge), §8 (slate), §9 (Monolith).
**Audience:** The implementing developer / AI agent. A paste-ready directive is in **Part B**.

---

# PART A: PRODUCT REQUIREMENTS

## 0. Why this document exists

The current build gets the colour, the pulli dots, the gold material and the end-state Kural right. The *motion model* is wrong. The previous approach morphed the whole pattern into a ring with a position blend, so the lines behave like a rigid sheet being squashed, split at both ends, and piled into the lower corners. What you described is different in kind:

> The camera starts on a digital kolam. The kolam splits **only at the top** and the lines **unravel and peel downward like water**. The camera travels down with them. The **bottom of the kolam becomes the top of a wreath** that forms around the Thirukkural, the half's **inward curves invert** to form the ring, the **dots stay still**, and the **"அ" stays still**.

That is a **thread-pulling** motion, not a shape morph. This PRD specifies it precisely.

---

## 1. Defects observed in the attached end-state frame

(Read from the screenshot only; I haven't seen the animation in motion.)

| # | Observation | Cause (likely) | Requirement |
|---|---|---|---|
| 1 | Lines read as random wire noodles piled in the **lower-left and lower-right corners**; no ring around the Kural | Whole-pattern area is compressed into corner regions; strands have no destination "lane" | Every strand has a **designed ring lane** it ends on (§7.6) |
| 2 | Lines bear no visible relation to the dots | Strands are noise curves, not authored to weave the lattice | Strands are **generated from the dot lattice** (§6) |
| 3 | Sharp kinks near the upper tips of both clusters; flattened/twisted tube shading | Coarse polylines, unstable tube frames | C² centrelines, dense uniform sampling, **stable tube frames** (§8.2) |
| 4 | A tiny "அ" sits over the English translation near screen centre | Emblem is still animated in screen space / on a z-recede | Emblem is **world-static** and **fully out of frame** at the end (§5.3) |
| 5 | Pulli dots show through the Tamil and English text | Dots drawn at full alpha behind the Kural | Dots keep their positions but **dim near the text** (§8.4) |
| 6 | The pattern empties at the top **and** collects at the bottom | Split begins at both ends | **Top-only split** with a defined front (§7.4) |

---

## 2. The experience (storyboard)

### 2.1 World layout (side view, camera travels down)

```
 y = +0.55 Hv ┌──────────────────────────────────────┐ ← weave top  (strand TAILS)
              │  digital kolam WEAVE (dots static)   │
              │  "அ" in the central void             │ ← camera starts here (view window ±0.5 Hv)
              │  strands woven around the dots        │
 y = −1.05 Hv └───────────────┬──────────────────────┘ ← weave bottom (strand HEADS exit)
                   ╲   threads pour out, sweep down     ╱
                    ╲  the sides, curve inward & under  ╱
              ┌──────╲────────  crossing at the "tie"  ╱───────┐
 y = −1.2 Hv  │   ( W R E A T H   around the Kural )          │ ← camera ends here
              └─────────────────────────────────────────────┘
```
`Hv` = world height of the viewport at z = 0 (7.57 units at FOV 35°, camera z = 12).

### 2.2 States

| `p` | Camera | What the viewer sees |
|---|---|---|
| **0.00** | Top of the kolam | Full kolam woven around the dots, chrome "அ" in the central void, light pulses travelling along lines |
| **0.06** | Begins to descend | At the **top centre**, the innermost strands' upper ends **begin to peel away**; a small V-notch opens in the weave |
| **0.15** | −0.1 Hv | Notch deepens and widens; peeled tails lift off the plane and curl outward; threads leaving the weave's bottom are not yet in view |
| **0.28** | −0.3 Hv | The vacated region (only dots left) now covers the upper third. The first threads become visible **streaming down** both sides in long, water-like S-curves |
| **0.40** | −0.65 Hv | "அ" has scrolled off the top. Threads sweep **under** the future ring and cross at the tie; the ring starts to fill from the bottom |
| **0.52** | −1.0 Hv | The weave is nearly gone; the wreath is almost complete; last threads settle with a **ripple** |
| **0.60** | −1.2 Hv (arrived) | Complete wreath, open gap at the top, dots static behind; Kural tiers reveal inside |
| **0.60 → Act III** | Hold | Reading dwell; ambient shimmer only |

### 2.3 Topology (please confirm, see §14 Q1)
- **Kolam top → wreath bottom. Kolam bottom → wreath top.** (The pattern is turned over as it pours around the text.)
- Threads flow **downward** out of the weave's bottom, then **curve inward and under**, then **climb** the ring and end at its top, leaving a small **gap at the top** ("the bottom part disconnects and becomes the top of the wreath").
- **Crossed wreath (default):** threads from the right half pass under the ring's bottom and climb the **left** arc; left-half threads climb the **right** arc. They cross at the bottom like a tied wreath. Because each half's inward curve ends up on the opposite side, this is the "inward curves invert" behaviour you described.
- **Alternative (not default):** same-side wreath (each half climbs its own side); requires a small curl at the bottom. Keep as a flag.

---

## 3. Goals, non-goals, success criteria

### Goals
1. The motion reads as **fluid threads being drawn out of a weave**, not a morph.
2. **Top-only split**: the first visible event is a V-notch at the top; nothing happens at the bottom of the weave until threads emerge there.
3. **Dots and "அ" never move** (only dot brightness may respond).
4. A **clean ring** forms around the Kural with an open top gap; **no piles, no kinks, no self-intersecting tangles**.
5. Pure function of scroll `p` → **perfectly reversible** scrubbing.
6. 60 fps on Tier A, no per-tick React state, no allocations in `useFrame`.

### Non-goals
No physics simulation, no GPU compute, no `framer-motion`. Motion is analytic (path-following), so it's cheap and reversible.

### Success criteria
| Metric | Target |
|---|---|
| Kink test | On CPU-sampled centrelines at 11 values of `p`, max turning angle between consecutive samples ≤ 8° (rest, mid, end) |
| Continuity | Position error across the weave→stream junction (`s = 0`) < 1e-4 world units; tangent error < 1° |
| Length conservation | Thread length changes by < 0.5% across all `p` (threads don't stretch) |
| Reversibility | Scrub 0 → 1 → 0: max screen-space error < 1 px |
| Static layers | Dot positions and emblem transform identical (bit-for-bit) at all `p` |
| End-state | "அ" completely off-screen at `p ≥ 0.45`; wreath inner void radius = `R_in` ± 2%; all strand ends inside the ring band |
| Frame rate | ≥ 55 fps median on M1 Air at 1440p; triangles ≤ 200k (A) / ≤ 90k (B) |

---

## 4. Constraints carried over
`frameloop="never"` on the global canvas; `safeDelta = Math.min(delta, 0.05)` in every `useFrame`; no `framer-motion`, no `rounded-*`, no shadows; 1 px `border-white/10`; progress from ScrollTrigger is written to a **ref** only; the hero draws through the global bloom/grade (or an in-scene fallback); Tamil is never split by code unit; nav/chat are visually purged but remain reachable.

---

## 5. World model and camera

### 5.1 Layers
| Layer | Moves? | Notes |
|---|---|---|
| **Pulli dots** | **No** | `InstancedMesh`, matrices written once at mount. Only a per-instance **alpha/glow uniform** may change (§8.4) |
| **"அ" emblem** | **No** | World position `(0, 0, 0)`, tiny idle micro-motion allowed (`A ≤ 0.04`, tilt ≤ 3°, disabled for reduced motion). **No z-recede, no fade.** Leaves the frame because the camera descends |
| **Strands (tubes)** | **Yes** | The only animated geometry (§7) |
| **Ghost/dust layers** | Optional | Behind the dots (z < 0); may drift; cheap |

### 5.2 Camera
Pure vertical truck with a gentle settle.
```
camY(p)   = y0 + (y_c − y0) · smootherstep( clamp((p − p_c0)/(p_c1 − p_c0), 0, 1) )
p_c0 = 0.04,  p_c1 = 0.60
y0 = 0,  y_c = −1.2·Hv
camZ(p)   = 12 → 11.2   (slight push-in over the same window)
pitch(p)  = −4° → 0°    (starts looking marginally down, settles level)
```
Camera speed is *slower* than scroll on purpose (≈ 0.55 Hv per 100dvh), so the dots drift past with weight and the choreography has room to breathe. These values are starting points; the **composition rules** (§10.3) are normative.

### 5.3 "அ" correctness
- Placed in the **central void** of the weave at the start frame, centred on screen.
- **Acceptance:** at `p ≥ 0.45` it is entirely outside the frustum; at no `p` does it appear over the Kural text.
- Remove any leftover z-exit/fade code and any screen-space positioning of the emblem.

### 5.4 Dots
Reuse the existing pulli lattice generator (the approved look: small warm-gold dots, diamond/oval lattice with a central void). **Extend it vertically** to cover `y ∈ [+0.6 Hv, −1.9 Hv]` so the camera always has dots in view. The lattice must be mirror-symmetric about `x = 0` and **the seam passes between the two innermost dot columns**.

---

## 6. The strands at rest (the kolam weave)

### 6.1 Design rules ("organic, fluid, still a kolam")
- **One strand per dot column** on each half (≈ 7 per half for the current lattice), plus optional short **link strands**. Strands run **mostly top-to-bottom** (this is essential: it is what makes them wrap around a ring later).
- Each strand **weaves around the dots in its column**: it passes alternately left and right of each dot, and every Nth dot it makes a **loop** around the dot (a prolate trochoid: `x = x_k + A·sinθ`, `y = y_j + c·θ + B·cosθ`, `B > c` gives the loop). Adjacent strands use opposite phase so they **interlace** (over/under via a ±0.02 z offset at crossings). This is the sikku/pulli logic.
- **Fluid, not jittery:** C² splines (centripetal Catmull-Rom or cubic B-spline) through waypoints generated from the dot positions; one consistent wavelength (≈ 2 dot spacings), consistent loop size, slight low-frequency irregularity (≤ 6% of dot spacing) sampled from `|x|` so symmetry holds.
- **Symmetry:** build the right half; the left half is the **same mesh mirrored** (`scale.x = −1`). No strand crosses the seam at rest (they stay in their own half), so splitting never "tears" anything.
- **Ends:** every strand is an **open curve** with two ends: **head** = the end at the *bottom* of the weave, **tail** = the end at the *top*.
- **Cultural review:** a kolam practitioner should sign off the pattern before the build is "approved".

### 6.2 Sampling
Resample each strand to uniform arc length `ds_path = 0.02` (path texture) and `ds_tube = 0.045` (tube rings, Tier A) / `0.07` (Tier B). Reject any generated strand with a turning angle > 6° between path samples (the generator must smooth/regenerate).

### 6.3 Parameters (starting)
| Parameter | Value |
|---|---|
| Strands per half `K` | 7 (match dot columns), max 10 |
| Weave height | ≈ 1.6 Hv (`y: +0.55 Hv → −1.05 Hv`) |
| Strand length `L_k` | 1.9–2.1 Hv (loops add ~20%) |
| Tube radius `r0` | 0.012 Hv (≈ 4–5 px at 900 px high); taper at ends to 0.35 r0 |
| Loop frequency | every 3rd dot, alternating |
| Interlace z | ±0.02 |

---

## 7. The flow mechanism (core of this PRD)

### 7.1 Concept: a rope on a conveyor
Each strand is a **fixed-length rope** of length `L`. It slides along a **composite path Π** made of two parts:
1. its own **weave curve** (traversed from tail to head), then
2. an authored **stream-and-lane path Γ** (down the side, under the ring, up the ring).

Because the rope slides *along its own weave curve*, the woven part of the kolam **looks unchanged** (the curve is identical; only the rope slides along it). The visible changes happen only at the two ends:
- At the **tail** (top), the rope **leaves the weave**, so lines are progressively *consumed from the top*. That is the **top-only split**.
- At the **head** (bottom), the rope **pours out** along Γ, flows down the sides, curves under, and climbs the ring.

This gives the unravelling thread feel, guarantees continuity (no tearing), and is reversible.

### 7.2 Definitions
- Rope coordinate `a ∈ [0, L]`: distance from the **head** (a = 0 head, a = L tail).
- Path `Π(s)`, `s ∈ [−L, S_end]`: `s < 0` is the weave interior (`−s` = arc position from the head end), `s ≥ 0` is Γ. `s = 0` is the **weave exit point** (head end of the weave).
- **Feed** `f(p)`: how far the rope has been pulled. A rope point `a` sits at
  ```
  s(a, p) = f(p) − a                         position = Π(s)
  ```
  At rest (`f = 0`): point `a` is at `Π(−a)`, i.e., exactly its woven position ✓.
- Lane start `s_L0` (path distance from the weave exit to the lane's start) and lane end `s_L1 = s_L0 + L`. The **final feed** is
  ```
  F = s_L0 + L        →  head at s = F = s_L1 (ring top),  tail at s = F − L = s_L0 (ring bottom)
  ```
  So the rope ends *exactly filling* its lane. **Kolam top (tail) → ring bottom; kolam bottom (head) → ring top** ✓.

### 7.3 Feed schedule (per strand `k`)
```
x_k(p) = clamp( (p − p0_k) / Δp , 0, 1 )
f_k(p) = F_k · E(x_k)           E = smootherstep, with a short settle term (below)
p0_k   = p_a + γ·rank_k + jitter_k           // rank 0 = innermost strand, 1 = outermost
```
Starting values: `p_a = 0.04`, `γ = 0.16`, `Δp = 0.42`, `jitter ≤ ±0.01`. The last strand therefore completes at `p ≈ 0.62` (= camera arrival).

**Settle (arrival ripple):** for `x_k > 0.9` add `ε·sin(ω(x_k−0.9))·exp(−κ(x_k−0.9))` to `E` (ε ≤ 1.5% of `F_k`) so threads relax into place instead of stopping dead. This is still a pure function of `p`.

### 7.4 Why the split is top-only, and what it looks like
Each strand's **tail** retracts down its own weave by `f_k(p)`. Strands nearest the seam start first (`rank` small), so at any `p` the inner strands' tails are lower than the outer strands' tails. The vacated region (dots only) is therefore a **V-shaped notch with its apex pointing down at the seam, widening toward the top edge**: exactly an unzipping from the top. **Nothing happens at the bottom of the weave** until threads emerge there.

**Peel-lift (so it curls off, not just fades):** the last `ℓ = 0.18 Hv` of rope next to the tail, *while still inside the weave*, lifts out of plane:
```
w(a)   = clamp(1 − (L − a)/ℓ, 0, 1)²                     // 1 at the tail, 0 at ℓ away
g(s_t) = smoothstep(−ℓ, −0.02, s_t) · (1 − smoothstep(0, 0.12, s_t))   // s_t = f − L (tail position)
lift   = w · g · ( A_x · outward + A_z · ẑ + A_n · curlNoise(σ) )
```
(`A_x ≈ 0.10 Hv`, `A_z ≈ 0.07 Hv`, `outward` = away from the seam.) Peeling edges curl toward the camera and outward like paper. Continuous and zero when `w` or `g` is zero ✓.

### 7.5 The stream path Γ ("flow like water")
Built per strand, **C¹ at `s = 0`** (starts along the weave's head tangent), in four phases:

| Phase | Shape | Rules |
|---|---|---|
| **1. Peel-out** | Leaves the weave bottom heading down, bends **outward** | Initial tangent = weave head tangent; radius of curvature ≥ 0.12 Hv |
| **2. Channel** | Runs **down the outer side** of the screen at `x ≈ ±X_ch,k` | Lateral wander (low-frequency noise, amplitude ≤ 0.04 Hv, zero at both ends); strands keep ≥ 1.5 tube diameters apart |
| **3. Under-sweep** | Curves **inward and under** the ring bottom, crossing the seam | Smooth J/S curve; right threads pass in front of left threads at the crossing via a ±0.03 z bias |
| **4. Lane** | Climbs the ring (§7.6) | Tangent continuous with the under-sweep at the lane start |

Build with centripetal Catmull-Rom through authored waypoints, then **re-parameterise by arc length** into `N` samples. **Water qualities (normative):**
1. **Follow-through:** heads lead, tails trail (inherent to the conveyor).
2. **No linear moves:** every trajectory is a smooth curve; no straight lerps anywhere.
3. **Variation:** per-strand speed jitter (±8%), waypoint offsets, and noise seed.
4. **Ambient ripple:** a small travelling wave along the rope, `Δn = a_r·sin(k·σ − ω·t)·bell(σ)`, `a_r ≤ 0.006 Hv`, using the rope's `σ = s` so ripples **travel with the thread**. This is time-based (allowed) and independent of scroll reversibility.
5. **Settle:** see §7.3.

### 7.6 The wreath lane (the ring)
- Ring centre `C = (0, y_c)`; inner clear radius `R_in = 0.32 Hv` (sized so the Kural block fits, see §10.4); band `[R_in + 0.03 Hv, R_in + 0.03 Hv + 0.20 Hv]`.
- Strand `k` gets its own **lane radius** `r_k` (evenly spaced across the band, innermost strand → innermost lane so the lanes never cross).
- **Lane curve (right-half rope, crossed wreath):** starts at the ring bottom `θ = π` heading toward −x, climbs the **left** arc to the top: `θ ∈ [π, 2π − φ_gap]` (clockwise from 6 o'clock to just before 12 o'clock). `φ_gap = 14°` leaves the **open gap at the top**.
  ```
  r(θ) = r_k + A_k · sin(ν·θ + ψ_k) · bell(θ)             // ripple absorbs excess rope length
  pos  = C + ( r(θ)·sinθ , ε·r(θ)·cosθ , z(θ) )           // ε: ellipse factor
  ```
- **Length matching (mandatory solver):** the lane's arc length must equal the rope length `L_k`. Choose integer `ν` (waves per half ring, ≈ 10–14) and solve `A_k` by bisection so `lane_length(A_k) = L_k`. If `A_k` exceeds `0.35·(lane spacing)` (neighbouring lanes would collide), increase `ν`, shorten the weave strands, or widen the band. This is what prevents the "pile" in the screenshot.
- The mirrored (left) half produces the **right arc**; both halves' tails meet at the bottom crossing, both heads end at the top gap with **tapered tips**.
- Optional **tip ornament** (tiny leaf-bud or bead) at the gap ends.

### 7.7 Putting it together (per rope point)
```
s    = f_k(p) − a
P    = Π_k(s) + lift(a, p) + ripple(s, t)
T    = normalize( Π_k(s+h) − Π_k(s−h) ),   h = ds_path/2
ρ    = r0 · taper(a)                       // thin at both ends
```
Everything is analytic: **no state, no integration, no history.**

### 7.8 Reversibility and numerics
- Depends only on `p` (and time for the small ambient ripple).
- Clamp `s` to `[−L, S_end]`; clamp `x_k`; guard normalisation (`max(len, 1e-6)`).
- CPU reference `flowMath.ts` implements `Π`, `f_k`, `lift` for tests, the debug overlay, and the static fallback.

---

## 8. Rendering

### 8.1 Data layout
- **Path texture** `uPath` (RGBA32F, `N × K`): row = strand, texel = `(x, y, z, 0)` of `Π_k` at uniformly spaced `s`. Also uniforms per strand: `s_min,k = −L_k`, `ds`, `F_k`, `p0_k`, `L_k`. `K ≈ 7–10`, `N ≈ 4096` ⇒ ≈ 0.6 MB. Use `texelFetch` + manual linear interpolation (no float-linear filtering requirement).
- **Tube geometry** (static, built once): vertices indexed by `(strand k, ring index m, radial index ω)`. Attributes: `aStrand` (row), `aA = m·ds_tube` (rope coordinate `a`), `aOmega` (angle). Indices never change.
- **Two meshes, one geometry/material:** `RightHalf` and `LeftHalf` (`scale.x = −1`). Per-mesh uniform `uZBias = ±0.03` separates the crossing.

### 8.2 Vertex shader (tube frames that never twist)
```glsl
// per vertex
float k  = aStrand;
float x  = clamp((uP - uP0[k]) / uDP, 0.0, 1.0);
float f  = uF[k] * easeSettle(x);
float s  = f - aA;                                   // rope coordinate → path coordinate
vec3  C0 = fetchPath(k, s);
vec3  C1 = fetchPath(k, s + uH);
vec3  C2 = fetchPath(k, s - uH);
vec3  T  = normalize(C1 - C2);

vec3  R  = vec3(0.0, 0.0, 1.0);                      // camera axis as reference
vec3  N  = R - dot(R, T) * T;
N = (length(N) < 1e-3) ? vec3(1.0, 0.0, 0.0) : normalize(N);
vec3  B  = cross(T, N);

float rho = uR0 * taper(aA, uL[k]);
vec3  P   = C0 + peelLift(aA, s, k) + rippleOffset(N, s, uTime);
vec3  surface = P + rho * (cos(aOmega) * N + sin(aOmega) * B);
vNormalObj = cos(aOmega) * N + sin(aOmega) * B;      // smooth normals
```
- Three fetches per vertex (plus interpolation) is fine at ≤ 80k vertices per half.
- The camera-facing reference frame keeps tubes round and prevents twisting under heavy deformation (this replaces Frenet/rigid rotation).
- Material: keep the current **gold PBR** look (patched `MeshStandardMaterial` via `onBeforeCompile`, fog on). Add a faint **light pulse** travelling along `aA`.

### 8.3 Performance
| Item | Tier A | Tier B |
|---|---|---|
| Radial segments | 10 | 8 |
| `ds_tube` | 0.045 | 0.07 |
| Strands per half | 7–10 | 6–7 |
| Triangles (both halves) | ≤ 200k | ≤ 90k |
| Path samples `N` | 4096 | 2048 |

Zero allocations per frame; uniforms written from refs; one `uP` update per frame.

### 8.4 Dots, emblem, grade
- **Dots:** static. A shader uniform `uTextMask` fades dot alpha to ~0.15 inside radius `1.15·R_in` around `C` once the wreath forms (smooth by `p`), so the Kural stays legible. A soft **glow pulse** may travel down the lattice following the peel front (brightness only).
- **Emblem:** chrome material as in the current build, static.
- **Grade:** the hero draws through the global bloom/grade (Phase 0 check). Without it the gold will not glow; if the global stack can't be used, add an in-scene additive glow and a CSS vignette/grain overlay.

---

## 9. Timeline and scroll architecture

Use the same pinned-stage + overlapping-Monolith pattern, with a **simplified formula**:
```
hero section height   = D + 100dvh              (stage sticky for D)
Monolith margin-top   = −100dvh                  (always)
ACT3_START            = 1 − 100/D_vh             (e.g. D = 420 → 0.762)
ScrollTrigger         = start "top top", end "bottom bottom", scrub 0.6   (progress → ref only)
```
(The slate then enters exactly when `p = ACT3_START` and fully covers the stage exactly when the pin ends.)

| Range `p` (D = 420dvh) | What happens |
|---|---|
| Load | Boot slate → kolam draw-on, emblem emerges (time-based) |
| 0.00 – 0.04 | Hold (idle shimmer) |
| 0.04 – 0.62 | **Peel & Flow** (camera descent, feeds `f_k`, §5.2 / §7.3) |
| 0.54 – 0.66 | **Kural tiers**: Tamil 0.54→0.58 (slide up + blur→0), English word-by-word 0.58→0.62, caption 0.62→0.66 |
| 0.66 – 0.762 | Dwell: ambient shimmer, wreath breathing |
| 0.762 – 1.00 | Act III slate rise (natural 1:1), WebGL paused when covered |

Mobile uses a smaller `D` (≈ 360dvh); recompute `ACT3_START` from the formula.

UI purge, Kural text/translation requirements, accessibility, and Monolith content remain as in *Wreath Split v3* §7.10, §7.11, §8, §9, §11.

---

## 10. Motion quality rules and composition targets

### 10.1 Feel
- Gentle ease-in at the very start (the first notch should feel like a thread catching), smooth mid-speed streaming, a soft settle.
- No sudden speed changes; first and second derivatives of `f_k(p)` are continuous.
- Threads never visibly stretch, snap, or pass through the tubes of their own half (same-half lanes are separated radially; cross-half crossings are z-biased).

### 10.2 Parameter table (all live-tunable in the lab)
| Parameter | Start | Range |
|---|---|---|
| `p_a`, `γ`, `Δp` | 0.04, 0.16, 0.42 | — |
| Strand speed jitter | ±8% | 0–15% |
| `ℓ` (peel-lift length), `A_x`, `A_z` | 0.18, 0.10, 0.07 (× Hv) | — |
| Channel offset `X_ch,k` | 0.62–0.9 × (Wv/2) | — |
| `R_in`, band width | 0.32 Hv, 0.20 Hv | — |
| `φ_gap` | 14° | 8–20° |
| `ν` (waves per half ring) | 12 | 8–16 |
| Ripple `a_r` | 0.006 Hv | 0–0.012 |
| Settle `ε`, `ω`, `κ` | 0.015, 18, 7 | — |

### 10.3 Composition rules (normative, tune parameters to hit them)
1. For `p ∈ [0.06, 0.40]` the **notch/peel front is in the top half of the frame** and the unpeeled weave is visible below it.
2. At `p ≈ 0.28` at least **three** streaming threads are visible on each side.
3. At `p ≈ 0.40` the ring's **bottom crossing** is visible entering from the bottom of the frame.
4. At `p = 0.60` the wreath is complete, centred on screen, with a visible top gap; no tube overlaps the Kural block.
5. The upper third of the frame **never** contains orphaned/loose strand fragments after `p = 0.45`.

### 10.4 Kural fit
Inscribed text block ≤ `1.5·R_in` wide (px), centred at `C`; Tamil couplet `font-size` clamped so two lines fit; the translation and caption sit beneath within the void.

---

## 11. Fallbacks
- **Tier B:** fewer strands, coarser tubes, same maths.
- **Simplified fallback (only if the conveyor approach cannot ship):** per-vertex delayed Bézier from rest to lane position (`P = Bézier(F, M, W; e)` with `e` staggered by distance from the seam and by arc length along the strand) plus the same camera descent and static dots/emblem. It keeps "top-only split" and "ring at the bottom" but loses true thread continuity. Document it as the fallback, not the target.
- **Reduced motion / Tier C / no WebGL:** a static **end-state SVG** (ring of lanes drawn from `flowMath.ts` at `p = 1`), Kural text visible, no pin.

---

## 12. Testing and QA

### 12.1 Unit tests on `flowMath.ts` / `pathBuilder.ts`
- Path is **C¹** at `s = 0`; tangent angle error < 1°.
- Rope **length conservation** across `p` (< 0.5%).
- **Lane length match** (`|lane − L| / L < 0.5%`); lanes inside the band; no two same-half lanes within 1.5 tube diameters.
- **Kink detector:** turning angle per sample ≤ 8° for `p ∈ {0, 0.1, …, 1}`.
- `f_k(p)` monotonic, `C²`-smooth, ends at `F_k`.
- Symmetry: mirrored path equals the left-half path.
- No NaN/Inf for `p ∈ [0,1]` and for `s` at the clamps.

### 12.2 Integration/visual
- **Real-scroll pin test** (guards the Guide-hero bug class): scroll to `section.bottom − innerHeight`, assert `progress ≥ 0.999` while the stage is still pinned; assert the slate's top equals the viewport bottom at `p = ACT3_START`.
- **Static-layer test:** dot instance matrices and emblem transform identical at `p = 0` and `p = 0.6`.
- **Emblem off-screen test** at `p ≥ 0.45`.
- **Screenshot frames** (1440×900 and 390×844): `p = 0, 0.06, 0.15, 0.28, 0.40, 0.52, 0.60, 0.70`.
- **Forward/reverse scrub video** and an overlaid CPU-vs-GPU centreline comparison (`?debug=ref`).
- **Perf capture** across a scripted scroll; triangles/draw calls logged.

### 12.3 Approval frames
| Frame | `p` | Must show |
|---|---|---|
| **P0** | 0.00 | Full weave around dots, chrome "அ" centred, no kinks; strands visibly follow the dots |
| **P1** | 0.06 | Small V-notch at top centre; peeled tails lifting and curling outward |
| **P2** | 0.15 | Notch deeper/wider; weave below intact; no activity at bottom edge |
| **P3** | 0.28 | Top third vacated (dots only); ≥ 3 threads per side streaming down |
| **P4** | 0.40 | "அ" gone; threads sweeping under; ring filling from the bottom |
| **P5** | 0.52 | Wreath nearly complete; settle ripples visible; weave gone |
| **P6** | 0.60 | Complete ring, top gap, dots dimmed near text, Kural revealed legibly |

### 12.4 Lab page
`/home/lab?p=…&debug=1` (noindex): `p` slider; per-strand feed sliders; draw **Π paths** (weave in blue, Γ in orange, lane in green); show rope-coordinate gradient; freeze time; CPU-vs-GPU overlay; tier switch; FPS/`renderer.info`.

---

## 13. Delivery plan and gates

| Phase | Deliverable | **Gate** |
|---|---|---|
| **0. Preflight** | Constants + pin/overlap layout and real-scroll test; `/home/lab`; `flowMath.ts` + tests (no rendering yet); grade-routing check; remove emblem z-exit/screen-space code | Pin tests and math tests green |
| **1. Rest state** | Dot lattice extended; **strand generator** from dots; spline/sampling rules; tube geometry with stable frames, static (no animation); mirrored halves; emblem static; camera descent only | **Frame P0** approved (organic, kink-free, dot-aware weave); camera descent smooth |
| **2. Path building** | Composite paths Π (weave + Γ + lane), length-matching solver, path texture upload, debug path overlay | Unit tests green; overlay shows continuous, non-colliding lanes |
| **3. Flow** | GPU conveyor feed, stagger, top-only notch, peel-lift, settle, ripple | **Frames P1–P3**; reverse scrub identical; kink/continuity tests green |
| **4. Wreath** | Lane convergence, crossing z-bias, tip ornaments, dot dimming mask, emblem off-screen check | **Frames P4–P6**; success criteria met |
| **5. Text + Act III + polish** | Kural tiers, dwell, slate, tiers/fallbacks, perf pass | Full QA, device matrix, reduced-motion verified |

**Rule:** no phase starts until a human approves the previous phase's frames.

---

## 14. Open questions (please answer; defaults in brackets)
1. **Topology:** Is *kolam top → wreath bottom, kolam bottom → wreath top*, with **crossed** wreath arcs, what you picture? [Yes, crossed; same-side available as a flag.]
2. Should the top gap of the wreath stay **open** at the end? [Yes, ~14°.]
3. **Strand count/density:** keep ≈ 7 strands per half (clear, elegant) or denser? [7]
4. Should the **dots** react (brightness pulse as the front passes), or stay completely constant? [Subtle pulse.]
5. Who signs off the **kolam pattern** authenticity?
6. Any need for the **emblem** to idle-float, or fully still? [Tiny idle only.]
7. Camera: is a **slow-glide** (slower than scroll) OK, or should the world track scroll 1:1? [Slow glide.]

---

# PART B: PASTE-READY AGENT DIRECTIVE

```
# MISSION: HOME HERO — "PEEL & FLOW" (TOP-ONLY SPLIT → FLOWING WREATH)
Stack: Next.js 16, React 19, R3F v9, drei, GSAP ScrollTrigger, Lenis, Tailwind 4. Package manager: npm ONLY.
Spec: docs/home-hero-peel-and-flow-prd.md is authoritative. It supersedes the bend math in Wreath Split v3 (§6.1, §7).

WHAT WE ARE BUILDING (one paragraph)
The camera starts on a digital kolam (static pulli dots + a woven set of gold strands + a static chrome "அ"). As the user scrolls,
the camera glides DOWN the kolam. The kolam splits ONLY AT THE TOP: strands' upper ends peel away (V-notch widening downward).
Each strand is a fixed-length ROPE that slides along a composite path: first along its own weave curve, then out of the weave's
bottom, down the sides, under the ring (crossing the other half), and up around a ring LANE that wraps the Thirukkural. Kolam TOP
ends at the ring BOTTOM; kolam BOTTOM ends at the ring TOP (open gap). Dots and "அ" NEVER move.

HARD CONSTRAINTS
1. frameloop="never" on the global Canvas; every useFrame uses safeDelta = Math.min(delta, 0.05).
2. No framer-motion, no rounded-*, no shadow-*; 1px borders border-white/10. Progress lives in a REF (no per-tick React state).
3. The motion is an analytic function of scroll p. NO simulation, NO integration, NO state. It must be perfectly reversible.
4. Dots: InstancedMesh with matrices written once. Emblem: static world transform. Only a dot alpha/glow uniform may change.
5. Strands are NOT noise curves. Generate them from the dot lattice (weave around dots, loops, interlace), C2 splines,
   uniform arc-length sampling, max 6-8 degrees turning per sample. No kinks.
6. Strand = rope. Rope point a (distance from head) sits at path position s = f_k(p) - a on composite path Pi_k(s).
   Weave interior is s<0 (traversed tail->head), Gamma stream+lane is s>=0. Path must be C1 at s=0.
7. Tube vertex shader reads Pi_k from a float path texture, uses 3 samples for the tangent, and builds frames with a camera-axis
   reference vector (never Frenet/twisting). Left half = same geometry/material with scale.x=-1 and a small z-bias.
8. The wreath lane for every strand must LENGTH-MATCH the rope (solve ripple amplitude by bisection). No piles of lines.
9. Hero draws through the global bloom/grade or an in-scene fallback. No bloom-less hero.
10. Tamil is never split by code unit. Nav/chat are visually purged but remain reachable (focus, top-edge hover, scroll-up).
11. Do not add dependencies without asking.

MATH FIRST (REQUIRED BEFORE ANY SHADER/GEOMETRY CODE)
Reply with your plan, in your own words: how you generate strands from the dot lattice; the composite path Pi (weave + stream +
lane) and how you guarantee C1 continuity and length matching; the feed f_k(p) with seam-first stagger (top-only notch);
the peel-lift of the tail; the lane geometry (ring centre, radii, ripple solver, crossed wreath); the vertex-shader frame
construction; the path-texture layout; the tests you will write (continuity, kinks, length conservation, reversibility,
real-scroll pin test). Wait for approval.

PHASES (STOP AT EACH GATE; HUMAN APPROVAL REQUIRED)
0 Preflight: constants, pin/overlap layout + real-scroll test, /home/lab, flowMath.ts + tests, remove emblem z-exit.
1 Rest state: dot lattice extended, strand generator, static tubes, mirrored halves, camera descent. Frame P0.
2 Path building: Pi paths, lane solver, path texture, debug overlay.
3 Flow: GPU conveyor, stagger, top-only notch, peel-lift, settle, ripple. Frames P1-P3 + reverse scrub video.
4 Wreath: lane convergence, crossing z-bias, tips, dot dimming mask. Frames P4-P6.
5 Kural tiers, dwell, slate, tiers/fallbacks, perf, device matrix.

EVERY PHASE MUST: run the app; capture Playwright screenshots at the specified p values; critique them against PRD §12.3;
commit; report what looks wrong before asking to proceed.

FIRST REPLY: acknowledge constraints, list unanswered items from PRD §14, then deliver MATH FIRST only.
```
<ADDITIONAL_METADATA>
The current local time is: 2026-10-10T15:26:16-04:00.

The user's current state is as follows:
Active Document: c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\director\wireframe.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 27
Other open documents:
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\director\wireframe.ts (LANGUAGE_TYPESCRIPT)
No browser pages are currently open.
</ADDITIONAL_METADATA>