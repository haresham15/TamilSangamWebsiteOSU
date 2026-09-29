# Vaaranam Aayiram Gallery Hero (v2 Architecture & Tuning Guide)

**Surface:** `/gallery`  
**Stack:** React 19 · Next.js 16 · Three.js 0.186 · React Three Fiber v9 · GSAP ScrollTrigger · Lenis · Framer Motion

---

## 1. Architectural Overview

The `/gallery` hero is a cinematic 2.5D diorama inspired by Gautham Vasudev Menon's *Vaaranam Aayiram*—capturing the feeling of driving the East Coast Road at golden hour, viewing collegiate memories through the resonant metallic strings of an acoustic guitar.

```
app/gallery/page.tsx
└─ <GalleryHeroCanvas/>                (Client Component, GSAP Pinned)
   ├─ <Canvas> (R3F WebGL2)
   │  └─ <SceneRoot/>                  (Reads non-reactive mutable telemetry)
   │     ├─ <CameraRig/>               (Eye height 1.4m, handheld sway, pointer parallax)
   │     ├─ <Sky/>                     (Dusk violet to coral gradient + procedural FBM clouds)
   │     ├─ <Sun/>                     (Exponential radial falloff billboard with HDR core)
   │     ├─ <Hills/>                   (3-layer atmospheric perspective headlands)
   │     ├─ <Sea/>                     (Specular glitter column under sun)
   │     ├─ <Verge/> & <Road/>         (Perspective asphalt with scrolling dashed lines)
   │     ├─ <Roadside/>                (Instanced palm & utility pole silhouettes with golden rim)
   │     ├─ <DustMotes/>               (300 additive twinkling motes in sunbeam)
   │     ├─ <PolaroidField/>           (14-card pool evenly spaced along highway)
   │     │  └─ <PolaroidCard/>         (0.83:1 ratio, wind flutter vertex shader, unlit-biased photo)
   │     ├─ <Strings/>                 (6 acoustic gauged strings, 4-harmonic standing wave shader)
   │     └─ <PostFX/>                  (Bloom, Volumetric GodRays, 35mm grain, Vignette)
   ├─ <HeroOverlay/>                   (Bilingual title, skip link, auto-hiding scroll cue)
   └─ <WashOverlay/>                   (Sunset ivory whiteout dissolve ramp)
```

---

## 2. Core Tuning Constants (`heroTimeline.ts`)

All optical, kinematic, and timeline parameters are centrally controlled in [`src/components/gallery/heroTimeline.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gallery/heroTimeline.ts):

| Parameter | Value | Description |
|---|---|---|
| `cameraEyeHeight` | `1.4m` | Eye level above highway road plane |
| `baseFov` | `38°` | Anamorphic cinematic focal length at rest |
| `finaleFov` | `58°` | Widened FOV as camera rushes into solar core |
| `sunZ` | `-380m` | Deep world coordinate of setting sun billboard |
| `sunY` | `7.0m` | Low elevation above horizon |
| `roadWidth` | `8.4m` | Asphalt plane width |
| `fogDensity` | `0.006` | Atmospheric exponential squared haze density |
| `dustCount` | `300` | Floating particle motes in sunbeam |
| `bloomThreshold` | `0.85` | Cutoff luminance for bloom filter |
| `bloomIntensityBase` | `0.8` | Resting golden glow intensity |
| `bloomIntensityFinale` | `6.0` | Maximum blinding solar flash intensity |
| `grainOpacity` | `0.07` | 35mm film grain overlay factor |
| `vignetteDarkness` | `0.55` | Anamorphic peripheral darkening |

---

## 3. String Physical Modeling (`GuitarString.tsx` & `pluckBus.ts`)

- **Gauge Variation**: 6 distinct gauged radii from Low E ($0.0022\text{m}$, wound helical ribbing) down to High E ($0.0008\text{m}$, plain steel).
- **Standing Wave Modal Equation**:
  $$\Delta y(u, t) = \sum_{n=1}^{4} \frac{E}{n^2} \sin(n \pi u) \cos(n \omega t + n \phi)$$
- **Decay Constant ($\tau$)**:
  - Low E (String 0): $\tau = 3.2\text{s}$ (long, resonant bass sustain)
  - High E (String 5): $\tau = 1.8\text{s}$ (snappy treble decay)
- **Pluck Triggers**:
  1. **Scroll Velocity**: Smooth strums when $|v| > 250\text{px/s}$.
  2. **Pointer Hover / Drag**: Plucks when cursor crosses string screen plane.
  3. **Click / Tap**: Direct impulse pluck ($E = 0.95$).
  4. **Intro Arpeggio**: Automatic ascending strum on page mount ($E = 0.45$).

---

## 4. Master Scroll Choreography (`getHeroTimelineValues`)

Across the $3600\text{px}$ GSAP pinned runway:
1. **$p \in [0.00, 0.08]$ ("Golden hour arrives")**: Idle glide, title and scroll cue active, strings at rest.
2. **$p \in [0.08, 0.55]$ ("The Journey")**: Camera advances $-4\text{m} \to -49\text{m}$, FOV $38^\circ \to 44^\circ$, full memory stream flow, title fades by $p = 0.16$.
3. **$p \in [0.55, 0.80]$ ("The Approach")**: Camera accelerates $-49\text{m} \to -139\text{m}$, FOV $44^\circ \to 50^\circ$, strings slacken and fade out (`stringsOpacity: 1.0 -> 0.0`), sun grows.
4. **$p \in [0.80, 0.94]$ ("The Blinding")**: Camera plunges toward solar core ($-139\text{m} \to -259\text{m}$), FOV $50^\circ \to 58^\circ$, bloom ramps to $6.0$, warm ivory wash overlay ramps $0 \to 1$ via `easeInCubic`.
5. **$p \ge 0.98$ ("Dissolve & Vault Hand-off")**: Canvas pauses, seamless transition into `#gallery-vault-content` masonry archive. Reverse scrolling smoothly rewinds the entire timeline.
