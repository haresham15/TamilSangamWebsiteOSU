---
name: sangam-motion
description: The motion language, tiers, and budgets for the OSU Tamil Sangam site. Use for any animation, scroll, or WebGL work.
---

# Sangam Motion Engineering Skill

## Core Principles

1. **Physical Motion Language**:
   - Elements have tangible physical depth reflecting the official emblem's mint extrusion.
   - User-caused interaction: Elements tilt with the pointer (spring physics: `stiffness: 300–400, damping: 25–30`), press flat on scroll, and pop on activation.
   - System transitions: Time-based tweens with custom cubic beziers (`duration: 0.35s, ease: [0.16, 1, 0.3, 1]`).

2. **Signature Choreography**:
   - **Kolam Line Draw-On**: SVG path `stroke-dashoffset` line reveals grounded in dot grids.
   - **Roundel Iris Wipe**: Circle `clip-path` expanding outward from the origin point.
   - **Woven-Border Marquee**: Kanchipuram silk temple border (*thazhampoo reku*) scrolling with velocity skew.
   - **Pinned Scrubbed Triptych**: Pinned scroll sequences where each pillar expands with mask reveals.
   - **Ola-Leaf Rail**: Horizontal scroll strips emulating classical palm-leaf manuscripts.
   - **Glyph-Mosaic Image Reveal**: Imagery resolving from Tamil character ink-density clusters.

3. **Motion Tiers**:
   - **Tier A (High Performance)**: Full 3D medallion, WebGL shaders, smooth scrolling, ambient canvas fields (Target: 60 FPS).
   - **Tier B (Balanced)**: Reduced particles, static post-processing, standard scroll integration.
   - **Tier C / Lite**: Static SVG/CSS typography, native browser scrolling, zero canvas overhead. Default for `prefers-reduced-motion`, `Save-Data`, low battery, and in-app WebViews (Instagram, TikTok).

4. **Resource Budgets & Disposal**:
   - Initial route JS: ≤ 170 KB gzip (excluding lazy-loaded 3D scenes).
   - WebGL initialization strictly deferred until after Largest Contentful Paint (LCP).
   - Single persistent canvas; pause rendering immediately when tab is hidden (`document.hidden`) or off-screen.
   - Full lifecycle cleanup: dispose geometries, materials, textures, and event listeners on component unmount.

5. **Aesthetic Restraint**:
   - Limit to a maximum of **three** primary focal moments per page (e.g. Hero Medallion, Pinned Pillars, Footer Credits).
   - Avoid generic AI motion: never apply `transition: all 0.3s` or uniform fade-and-slide on every section.
