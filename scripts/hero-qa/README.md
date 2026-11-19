# Hero art pass: working guide

Read this before changing any hero. It covers what "better" means, the shared look kit,
the rendering infrastructure you must use, the rules, and how to check your work.

## The goal
The heroes read as game-engine primitives ("Roblox"). Each hero keeps the concept in its
PRD (`docs/heroes/*.md`); the art pass raises how it is built, lit and shot. Remove these
tells, in this order:

1. **Silhouette.** Raw boxes, cylinders and spheres with razor edges and visible facets.
   Use profiles, bevels, mouldings, taper. A real object is never a single primitive.
2. **Material.** One flat colour per mesh. Add albedo and roughness breakup, micro normal,
   dirt in creases, wear on edges.
3. **Grounding.** No occlusion or contact shadow, so objects float. Bake vertex AO, add
   contact shadows, darken junctions.
4. **Lighting.** Even, unmotivated light. Build a hierarchy: one key with a source in the
   scene, a dim fill of the opposite colour temperature, a rim. Let things fall into shadow.
5. **Atmosphere.** No air. Add haze layers, light shafts, dust, so planes separate.
6. **Scale and repetition.** Identical, perfectly aligned copies. Jitter instances.
7. **Lens.** Linear camera moves and flat staging. Use foreground/mid/background parallax,
   eased moves, framing that leaves room for the page copy.

Restraint matters as much as detail: fewer, better-made things, lit well. Do not add glow,
particles or bloom without a reason in the scene.

## Look kit: `src/gl/art/` (read the files; they are short and documented)
| Import | Use |
|---|---|
| `geometry.ts` | `roundedBox`, `chamferedBox`, `latheProfile(points, {smooth})`, `flutedShaft`, `polygonalShaft`, `mergeParts(parts)` (many parts → one geometry → one draw), `jitterTransforms`, `applyInstanceTransforms`, `seeded` |
| `vertexAO.ts` | `bakeVertexAO(geometry, {ground, bands, cavity, edges})` writes the `aCavity` attribute (creases + exposed edges) |
| `surface.ts` | `withSurfaceDetail(material, opts)` patches any MeshStandard/Physical material; `createSurfaceMaterial(preset, params, detail)` with presets `stone`, `agedBrass`, `bronze`, `silk`, `lacquerWood`, `plaster`, `wetAsphalt`. Pass `cavity: true` only for geometry that went through `bakeVertexAO` |
| `LightRig.tsx` | `<LightRig>` key / fill / rim with one shadow caster |
| `Atmosphere.tsx` | `<LightShaft from to>`, `<DustMotes>`, `<HazeLayer>` (all additive: keep intensities low, see "Grade") |
| `ContactShadow.tsx` | `<ContactShadows spots>`: one instanced draw of soft ground shadows |

Worked example: `src/components/board/CorridorTreadmill.tsx` (`createArchitecture`): pillars
built from merged lathe/fluted/chamfered parts, baked AO, stone material, contact shadows,
still one instanced draw per part.

Lessons already learned there:
- A tiled normal map on a glossy surface aliases into glitter. On low-roughness surfaces use
  `withSurfaceDetail` with `bump: 0` and roughness variation instead.
- Keep lathe/fluting tessellation modest (28 radial segments reads as round at hero scale).

**The kit is read-only for you.** If you need something added or changed, say so in your
report; do not edit `src/gl/**`.

## Infrastructure you must use
- `useRenderMode()` (`src/components/providers/useRenderMode.ts`) → `{ mode: 'static' | 'B' | 'A', tier, lite, reducedMotion, qualityLevel }`. `static` renders the hero's static fallback and must load no 3D assets. Scale counts with `mode` and `qualityLevel` (0 best → 2).
- Grade: `<View ... grade={{ hero, profile }}>` from `src/components/canvas/SceneView.tsx`. Profiles are in `src/gl/grade/gradeConfig.ts`. Under the grade the scene is summed in linear HDR before tone mapping, so **additive layers look much brighter graded than ungraded**. Always compare default vs `?grade=0`.
- `BakedEnvironment` (`src/gl/BakedEnvironment.tsx`) for environment lighting. Do not use drei `<Environment>` with children (it leaks PMREM targets in three r186).
- `useShadowUpdates({ mode: 'static' | 'onChange' | 'everyN' })` (`src/gl/shadows.ts`) instead of drei `BakeShadows`. One shadow-casting light per hero.
- `useStaticBatch(rootRef, excludeRefs)` (`src/gl/useStaticBatch.ts`) merges static meshes that share a material into one draw.
- `useDisposeOnUnmount(...memoisedValues)` (`src/gl/dispose.ts`). R3F does not dispose hand-built geometries, materials, textures or `<primitive>` objects.
- Frame loop: `useFrame` deltas must be clamped (`Math.min(delta, 0.05)`); no allocation per frame; no GPU objects at module scope. `node scripts/check-frame-deltas.cjs` enforces this.
- Budgets: `src/config/heroBudgets.ts`. Everything stays behind `isHeroCinematicEnabled("<hero>")` so `?cinematic_<hero>=0` shows the old look.

## Rules
- Edit only your hero's directory and its `public/<hero>/` assets. Read-only: `src/gl/**`, `src/engine/**`, `src/components/gl/**`, `src/components/canvas/**`, `src/config/**`, `assets/RIGHTS.md`, `package.json`. Report needed changes instead.
- No git writes (commit, stash, checkout, reset, restore). No new npm dependencies.
- Do not start or stop servers and do not run `next build`. A dev server is already running at `http://localhost:3300`; other agents share it.
- Assets: procedural first. If a surface truly needs a texture, CC0 only (Poly Haven, ambientCG), ≤1K, WebP, inside the hero's texture budget; put the source URL and licence in your report for `assets/RIGHTS.md`. No downloaded models.
- Honour reduced motion and Lite. Tamil text keeps `lang="ta"` and is split by grapheme (`src/lib/tamilGraphemes.ts`), never by code unit. Do not invent content (names, dates, venues).
- At most three expressive moments per page. Page copy over the scene must stay readable.
- Read `AGENTS.md` and `src/components/AGENTS.md` (if present) first.

## Workflow
1. Capture the hero at three scroll beats (desktop and 375px) and look at the images. Write a ranked list of what looks cheap.
2. Fix in order: silhouette → materials → grounding → lighting → atmosphere → camera → motion.
3. Re-capture after each step and look again. Judge with your eyes, not from the code.
4. Finish the engineering items in your brief, the static fallback, and the checks below.

## Commands (Git Bash; the project root must be passed as a Windows path)
```bash
ROOT="C:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU"
export MSYS_NO_PATHCONV=1   # stops Git Bash rewriting "/board" into a file path

# Screenshots, graded and ungraded, desktop + 375px (ONLY_DESKTOP=1 for desktop only).
# Prints draw calls / triangles / texture MB / fps. Args: root route outDir [scrollY...]
node scripts/hero-qa/shots.mjs "$ROOT" /board tests/artifacts/qa/board 0 700 1500

# Leak check: GPU object counts must be flat across route round trips.
node scripts/hero-qa/leak.mjs "$ROOT" /board /links

# Static fallbacks (reduced motion, Lite) + live console check.
node scripts/hero-qa/verify_static.mjs "$ROOT" /board tests/artifacts/qa/board-static

# Visible draw objects in the scene (find what to batch).
node scripts/hero-qa/meshlist.mjs /board

# Budget harness (dev-server fps is indicative only; calls/triangles/textures/leaks are valid).
PLAYWRIGHT_BASE_URL=http://localhost:3300 node --no-warnings --experimental-strip-types \
  scripts/capture-all-heroes.mjs --perf --heroes=board

npx tsc --noEmit
npx eslint <files you touched>
node scripts/check-frame-deltas.cjs
```
`poster-example-join.mjs` shows how the Join static poster was rendered (UI hidden, scene
settled); copy the approach for your hero's poster. Put captures under `tests/artifacts/qa/<hero>/`
(gitignored). Run one browser script at a time: the machine is short on memory.

## What to return
- Before/after screenshot paths for the three beats, desktop and 375px.
- Your ranked tells list and what you did about each; what still looks weak and why.
- Draw calls / triangles / texture MB vs budget, leak-check output, static-fallback result.
- `tsc`, eslint and `check-frame-deltas` results for your files.
- Requests for shared-code changes, and any RIGHTS entries to add.
