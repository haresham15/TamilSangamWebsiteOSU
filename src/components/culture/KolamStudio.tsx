"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  generateSquareLattice, 
  generateProceduralKolam, 
  applySymmetry, 
  Point, 
  KolamDot 
} from "@/lib/kolamMath";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Sparkles, Download, RotateCcw } from "lucide-react";

const CANVAS_SIZE = 560;
const DOT_SPACING = 56;
const CENTER = CANVAS_SIZE / 2;
const DOTS: KolamDot[] = generateSquareLattice(7, DOT_SPACING, CENTER, CENTER);
const STROKE_WIDTH = 3;

export const KolamStudio: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playFlour, playBell, playClick } = useAudio();
  const { locale } = useLocale();

  const [symmetryFolds, setSymmetryFolds] = useState<1 | 4 | 8>(4);
  const [strokeColor, setStrokeColor] = useState<string>("#f2b705");
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [allStrokes, setAllStrokes] = useState<Point[][]>([]);
  const [nameSeed, setNameSeed] = useState<string>("");

  // Redraw canvas whenever strokes update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Draw dot lattice (Pulli)
    DOTS.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(243, 231, 211, 0.4)";
      ctx.fill();
    });

    // 2. Draw all finalized strokes
    allStrokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 6;
      ctx.shadowColor = strokeColor;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // 3. Draw current active stroke with symmetry preview
    if (currentStroke.length > 1) {
      const mirroredSets = applySymmetry(currentStroke, CENTER, CENTER, symmetryFolds);
      mirroredSets.forEach((mStroke) => {
        ctx.beginPath();
        ctx.moveTo(mStroke[0].x, mStroke[0].y);
        for (let i = 1; i < mStroke.length; i++) {
          ctx.lineTo(mStroke[i].x, mStroke[i].y);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = STROKE_WIDTH;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      });
    }
  }, [allStrokes, currentStroke, symmetryFolds, strokeColor]);

  // Drawing interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
    playFlour();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      const symmetricStrokes = applySymmetry(currentStroke, CENTER, CENTER, symmetryFolds);
      setAllStrokes((prev) => [...prev, ...symmetricStrokes]);
    }
    setCurrentStroke([]);
  };

  // Seed Kolam From Name
  const handleGenerateFromName = () => {
    if (!nameSeed.trim()) return;
    playBell(740);
    const proceduralStrokes = generateProceduralKolam(nameSeed, CENTER, CENTER, 190);
    setAllStrokes(proceduralStrokes);
  };

  // Clear Canvas
  const handleClear = () => {
    playClick();
    setAllStrokes([]);
    setCurrentStroke([]);
  };

  // Export PNG Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playBell(880);
    const link = document.createElement("a");
    link.download = `kolam-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] text-left shadow-2xl">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {locale === "ta" ? "கோல அரங்கம்" : "Kolam Studio"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[var(--accent-tint)] text-black font-semibold">
              Interactive Art
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {locale === "ta"
              ? "புள்ளிகளை இணைத்து கோலம் வரையுங்கள்; பலமடங்கு சமச்சீர் அமைப்புடன் தானாக வரையும் வசதி."
              : "Draw on the rice-flour dot grid with real-time radial symmetry or generate from your name."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white transition-all shadow-md"
            title="Clear Canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-[var(--accent-tint)] text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Canvas Display */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="relative w-full max-w-[440px] sm:max-w-[480px] aspect-square rounded-2xl overflow-hidden bg-[#0a0c16] border border-white/15 shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full cursor-crosshair"
            />
          </div>
        </div>

        {/* Tool Settings & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Radial Symmetry Mode */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Symmetry (சமச்சீர்)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { folds: 1 as const, label: "Freehand" },
                { folds: 4 as const, label: "4-Fold" },
                { folds: 8 as const, label: "8-Fold" },
              ].map((item) => (
                <button
                  key={item.folds}
                  onClick={() => {
                    playClick();
                    setSymmetryFolds(item.folds);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    symmetryFolds === item.folds
                      ? "bg-[var(--accent-tint)] text-black font-semibold border-transparent"
                      : "glass-panel text-slate-300 border-white/10 hover:border-white/25"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Rice Flour Color (நிறம்)
            </label>
            <div className="flex items-center gap-3">
              {[
                { color: "#f2b705", name: "Turmeric Gold" },
                { color: "#d6452f", name: "Vermilion Red" },
                { color: "#0b7a75", name: "Peacock Teal" },
                { color: "#f3e7d3", name: "Rice Flour White" },
                { color: "#8b5cf6", name: "Kurinji Violet" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    playClick();
                    setStrokeColor(c.color);
                  }}
                  className={`w-7 h-7 rounded-full transition-all ${
                    strokeColor === c.color ? "ring-2 ring-white scale-110" : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Procedural Kolam Seeded by Name */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--accent-tint)] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seed Kolam from Name</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameSeed}
                onChange={(e) => setNameSeed(e.target.value)}
                placeholder="Type your name..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[var(--accent-tint)] font-sans"
              />
              <button
                onClick={handleGenerateFromName}
                className="px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-semibold shrink-0 border border-white/10 transition-all"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
