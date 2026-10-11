# Authentic Side Kolams Architectural Review & Verification

**Scope:** Two authentic, detailed, world-static purple Sikku Kolams flanking the Home Hero start frame.  
**Approved Sibling Pair (Option A):**
- **Kolam L (Left Flank):** Candidate #1 (ID `46815`, Fundamental Config: `AXXXBABABX`)
- **Kolam R (Right Flank):** Candidate #2 (ID `46895`, Fundamental Config: `XBXXXABABX`)

---

## 1. Mathematical & Topological Ground Truth

| Metric | Kolam L (Left) | Kolam R (Right) | Requirement / Budget | Status |
|---|---|---|---|---|
| **Dot Grid Lattice** | 9 × 9 dots (8 × 8 cells) | 9 × 9 dots (8 × 8 cells) | 9 × 9 Pulli lattice | PASS |
| **Symmetry Group** | Full $D_4$ Dihedral | Full $D_4$ Dihedral | 4-fold rotational + bilateral reflection | PASS |
| **Crossings Count** | 28 | 28 | 18–34 sweet spot | PASS (Matched) |
| **Closed Loop Count** | 5 | 5 | $\le 5$ (Theoretical $D_4$ minimum) | PASS (Matched) |
| **Alternating Weave** | 100% Solvable BFS | 100% Solvable BFS | Consecutive over/under alternation | PASS |
| **World Position** | $x = -0.70 \cdot (W_v/2)$, $y = 0$, $z = -0.2$ | $x = +0.70 \cdot (W_v/2)$, $y = 0$, $z = -0.2$ | Desktop margins, static | PASS |
| **Mobile Scaling** | $x = -0.82 \cdot (W_v/2)$, $d$ clamped | $x = +0.82 \cdot (W_v/2)$, $d$ clamped | Zero overlap with central emblem | PASS |
| **Triangle Count** | 22,096 | 22,224 | $\le 25,000$ per kolam | PASS |

---

## 2. Geometry Engine Implementation

1. **Continuous Curve Generation (`buildCurve.ts`)**:
   - Uniform G1 arc & line sampling with step $ds = 0.10 \cdot d$.
   - 2-pass light Laplacian smoothing ($\alpha = 0.25$) to eliminate corner curvature discontinuities without shape distortion.
   - Over/Under Elevation: $+0.055 \cdot d$ for over-passes, $-0.055 \cdot d$ for under-passes.
   - Gap Carving: under-strands severed with a $0.9 \cdot \text{tubeRadius}$ gap on each side of every crossing, creating authentic physical depth.
   - Parallel-Transport Frames (Bishop / RMF): 100% singularity-free, zero-twist 3D tube geometry with 8 radial cylinder segments.

2. **Phase 3 Richness Layers (`SideKolam.tsx`)**:
   - **81 Instanced Pulli Dots**: Nestled inside loop centers with radius $0.07 \cdot d$, pearl lavender `#E6DBFF` with soft emissive `#D4C2FC`.
   - **16 Perimeter Apex Beads**: Instanced pearl beads (radius $0.045 \cdot d$) placed at the geometric tips of the outer scallops, reflecting South Indian temple jewelry traditions.
   - **Soft Radial Halo Disc**: Quad at $z = -0.08$ with procedural radial gradient texture (`#3A1B7A`, peak alpha 0.10, additive blending), providing ambient temple glow.
   - **Static Flour Dust Ring**: 72 deterministic particle points around the perimeter ($5.4 \cdot d - 6.7 \cdot d$, size $0.022 \cdot d$, alpha 0.32) simulating dry rice flour (*arisi maavu*) particles.

3. **Motion Restraint & Scroll Fade**:
   - Both kolams have `matrixAutoUpdate = false` and zero world movement.
   - Synchronous opacity fade from $1.0 \to 0.0$ between scroll progress $p = 0.20$ and $0.38$, clearing the scene completely before Thirukkural 81 enters centered pure negative space.

---

## 3. Verification & Test Evidence

- **Unit Tests**:
  - `src/components/home-hero/side-kolams/__tests__/buildCurve.test.ts`: **5/5 PASS**
  - `src/components/home-hero/side-kolams/__tests__/tileGrammar.test.ts`: **3/3 PASS**
- **Type Safety**:
  - `npm run typecheck` (`tsc --noEmit`): **0 errors**
- **Visual Auditing**:
  - Desktop Viewport (1440 × 900): Flanking purple kolams clearly visible with over/under gaps, apex beads, and pearl pulli dots.
  - Mobile Viewport (390 × 844): Scaled into margins with clean separation from the central golden emblem.
  - Scroll Fade: Fades cleanly to alpha 0 by $p = 0.38$, leaving Act II in pure negative space.
