"use client";

import React from "react";
import { Cpu, Terminal, Layers, Zap } from "lucide-react";

export default function UnderTheHoodPage() {

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Engineering Case Study & Architecture
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          Under The Hood: Project Aintinai
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          How we architected a culturally grounded, ultra-responsive web destination honoring 2,000-year-old Tamil literary traditions with WebGL 3D procedural graphics, Web Audio API, and grapheme-safe typography.
        </p>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <Cpu className="w-5 h-5 text-[var(--accent-tint)] mb-2" />
          <h4 className="text-sm font-bold text-white">Next.js App Router</h4>
          <p className="text-xs text-slate-400 mt-1">React 19 Server Components with Turbopack and client boundaries.</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <Layers className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Three.js Procedural 3D</h4>
          <p className="text-xs text-slate-400 mt-1">Scroll-driven Gopuram ascent with ACESFilmic tone-mapping.</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <Terminal className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Web Audio Synthesizer</h4>
          <p className="text-xs text-slate-400 mt-1">Procedural brass temple bells, mridangam, and parai synthesis.</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <Zap className="w-5 h-5 text-sky-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Grapheme-Safe Text</h4>
          <p className="text-xs text-slate-400 mt-1">Intl.Segmenter handling for Tamil vowel-consonant conjuncts.</p>
        </div>
      </div>

      {/* Deep Dive 1: Tamil Script & Complex Shaping */}
      <div className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl mb-12 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
          Linguistic Engineering
        </span>
        <h2 className="text-2xl font-bold text-white font-serif">
          1. Tamil Typography & Grapheme Integrity
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Indic scripts like Tamil feature combining vowel signs (உயிர்மெய் குறிகள்) and pulli (virama) diacritics. Splitting strings with standard JavaScript <code className="px-1 py-0.5 rounded bg-white/10 text-xs font-mono">str.split(&apos;&apos;)</code> tears vowel signs away from their consonants, resulting in broken or corrupted glyph rendering.
        </p>
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-emerald-400 space-y-1">
          <p>{"// Grapheme cluster segmentation standard"}</p>
          <p>const segmenter = new Intl.Segmenter(&apos;ta&apos;, &#123; granularity: &apos;grapheme&apos; &#125;);</p>
          <p>const glyphs = [...segmenter.segment(tamilText)].map(s =&gt; s.segment);</p>
        </div>
        <p className="text-xs text-slate-400">
          Strict CSS standards: <code className="text-white font-mono">line-height &gt;= 1.6</code>, <code className="text-white font-mono">letter-spacing: 0</code>, and <code className="text-white font-mono">text-transform: none</code> to prevent vowel clip anomalies.
        </p>
      </div>

      {/* Deep Dive 2: Procedural Kolam Mathematics */}
      <div className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl mb-12 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
          Computational Ethnomathematics
        </span>
        <h2 className="text-2xl font-bold text-white font-serif">
          2. Mathematical Kolam Lattices & Symmetry
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Traditional Tamil kolam art forms have been studied in computer science as array grammars, picture languages, and knot theory. Our Kolam Studio implements:
        </p>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
          <li><strong>Cartesian & Idukku Pulli Dot Lattices:</strong> Procedural coordinate generation based on grid dimensions.</li>
          <li><strong>Radial Rotational Group Transformations:</strong> Real-time 4-fold and 8-fold radial symmetry matrix transforms mapping drawn coordinate deltas to rotational angles.</li>
          <li><strong>Polynomial Loop Interpolation:</strong> Seeded procedural curves wrapping around dots based on cryptographic hashing of the user&apos;s name.</li>
        </ul>
      </div>

      {/* Deep Dive 3: Performance Tiering & Accessibility */}
      <div className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl mb-12 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
          Progressive Enhancement & Tiers
        </span>
        <h2 className="text-2xl font-bold text-white font-serif">
          3. Performance Budgets & Tiered Rendering
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-[var(--accent-tint)] mb-1">Tier A: Full 3D</h4>
            <p className="text-xs text-slate-300">WebGL 3D Gopuram Ascent, ACESFilmic tone-mapping, particle morphing, and interactive field.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-purple-400 mb-1">Tier B: Reduced GPU</h4>
            <p className="text-xs text-slate-300">Canvas 2D particle swarm, lower pixel ratio, smooth mobile scrolling.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-emerald-400 mb-1">Tier C / Lite Mode</h4>
            <p className="text-xs text-slate-300">Zero-canvas static fallback for reduced-motion, save-data, and in-app browsers.</p>
          </div>
        </div>
      </div>

      {/* Deep Dive 4: Real-time Time-of-Day Theming */}
      <div className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)]">
          Chronobiology & Literature
        </span>
        <h2 className="text-2xl font-bold text-white font-serif">
          4. The Five Times of Day (சிறுபொழுது)
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The website queries the visitor&apos;s local clock every 60 seconds and gracefully shifts CSS OKLCH tokens and lighting shaders:
        </p>
        <div className="space-y-1 text-xs font-mono text-slate-300">
          <p><span className="text-[#f2b705]">வைகறை (Vaigarai · Dawn, 4am-8am):</span> Marutham · Turmeric Gold</p>
          <p><span className="text-[#b5573a]">நண்பகல் (Nanpagal · Midday, 8am-2pm):</span> Paalai · Terracotta Amber</p>
          <p><span className="text-[#0b7a75]">எற்பாடு (Erpaadu · Sunset, 2pm-6pm):</span> Neithal · Seashore Coral & Indigo</p>
          <p><span className="text-[#6b8e4e]">மாலை (Maalai · Evening, 6pm-10pm):</span> Mullai · Jasmine Lamplight</p>
          <p><span className="text-[#8b5cf6]">யாமம் (Yaamam · Midnight, 10pm-4am):</span> Kurinji · Deep Indigo Starry Night</p>
        </div>
      </div>
    </div>
  );
}
