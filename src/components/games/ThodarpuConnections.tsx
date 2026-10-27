// src/components/games/ThodarpuConnections.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Shuffle, RotateCcw, Lightbulb } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";
import {
  THODARPU_MONTHLY_EDITIONS,
  type ThodarpuEdition,
  type ThodarpuCategory,
  type ThodarpuTile,
} from "@/data/gamesData";

interface ThodarpuConnectionsProps {
  editionKey: string; // "2026-10" | "2026-11" | "2026-12"
  onSolved?: () => void;
}

const TIER_COLORS = {
  1: {
    bg: "bg-[#E8B94F]",
    text: "text-[#161210]",
    border: "border-[#D4AF37]",
    label: "Straightforward · எளிது",
    emoji: "🟨",
  },
  2: {
    bg: "bg-[#3D7A5A]",
    text: "text-[#FAF6F0]",
    border: "border-[#2E6F4E]",
    label: "Medium · நடுத்தரம்",
    emoji: "🟩",
  },
  3: {
    bg: "bg-[#C85A32]",
    text: "text-[#FAF6F0]",
    border: "border-[#A64420]",
    label: "Challenging · கடினம்",
    emoji: "🟧",
  },
  4: {
    bg: "bg-[#3B4978]",
    text: "text-[#FAF6F0]",
    border: "border-[#2C375D]",
    label: "Tricky / Wordplay · நுட்பம்",
    emoji: "🟦",
  },
};

export function ThodarpuConnections({ editionKey, onSolved }: ThodarpuConnectionsProps) {
  const edition: ThodarpuEdition = useMemo(() => {
    return THODARPU_MONTHLY_EDITIONS[editionKey] || THODARPU_MONTHLY_EDITIONS["2026-10"];
  }, [editionKey]);

  // Flatten all 16 tiles
  const initialTiles: ThodarpuTile[] = useMemo(() => {
    return edition.categories.flatMap((cat: ThodarpuCategory) => cat.tiles);
  }, [edition]);

  // Shuffled tile array state
  const [boardTiles, setBoardTiles] = useState<ThodarpuTile[]>(() => {
    const shuffled = [...initialTiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const seed = Math.sin((i + 1) * 93.123) * 43758.5453;
      const r = seed - Math.floor(seed);
      const j = Math.floor(r * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<ThodarpuCategory[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shakeSelection, setShakeSelection] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [guessHistory, setGuessHistory] = useState<number[][]>([]); // array of tier numbers per guess for share card
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Toggle selection
  const toggleSelect = useCallback(
    (id: string) => {
      soundEngine.playFlapFlutter(0, 1.1);
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        if (prev.length >= 4) {
          return prev; // capped at 4
        }
        return [...prev, id];
      });
    },
    []
  );

  // Shuffle remaining board tiles
  const handleShuffle = useCallback(() => {
    soundEngine.playFlapFlutter(0, 0.9);
    setBoardTiles((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  // Deselect all
  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Submit guess
  const handleSubmit = useCallback(() => {
    if (selectedIds.length !== 4) return;

    // Check which category each selected tile belongs to
    const selectedTiles = boardTiles.filter((t) => selectedIds.includes(t.id));
    const catCount: Record<string, number> = {};
    const catTiers: number[] = [];

    for (const t of selectedTiles) {
      catCount[t.categoryTitle] = (catCount[t.categoryTitle] || 0) + 1;
      // find category tier
      const foundCat = edition.categories.find((c: ThodarpuCategory) => c.titleEn === t.categoryTitle);
      if (foundCat) catTiers.push(foundCat.tier);
    }

    // Record guess history for emoji share
    setGuessHistory((prev) => [...prev, catTiers]);

    // Check for 4 matching
    const solvedTitle = Object.keys(catCount).find((cat) => catCount[cat] === 4);
    if (solvedTitle) {
      const category = edition.categories.find((c: ThodarpuCategory) => c.titleEn === solvedTitle);
      if (category) {
        soundEngine.playBellChime();
        setSolvedCategories((prev) => [...prev, category]);
        setBoardTiles((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
        setSelectedIds([]);

        if (solvedCategories.length + 1 === 4) {
          onSolved?.();
        }
      }
      return;
    }

    // Check for 3 matching ("One away...")
    const oneAway = Object.values(catCount).some((cnt) => cnt === 3);
    if (oneAway) {
      setToastMessage("One away... · இன்னும் ஒன்றே ஒன்று!");
      setTimeout(() => setToastMessage(null), 1800);
    }

    // Incorrect guess
    soundEngine.playPillarHover(0); // low thump
    setShakeSelection(true);
    setTimeout(() => setShakeSelection(false), 500);

    const nextMistakes = mistakesRemaining - 1;
    setMistakesRemaining(nextMistakes);

    if (nextMistakes <= 0) {
      // Auto-reveal remaining categories
      setToastMessage("Out of attempts! Revealing solutions...");
      setTimeout(() => {
        setSolvedCategories(edition.categories);
        setBoardTiles([]);
        setSelectedIds([]);
        setToastMessage(null);
      }, 1400);
    }
  }, [selectedIds, boardTiles, edition, mistakesRemaining, solvedCategories.length, onSolved]);

  // Copy GroupMe Share Card
  const copyShareResults = () => {
    const emojis = guessHistory.map((guess) => {
      return guess
        .map((tier) => TIER_COLORS[tier as 1 | 2 | 3 | 4]?.emoji || "⬜")
        .join("");
    });

    const isWin = solvedCategories.length === 4 && mistakesRemaining > 0;
    const header = `OSU Tamil Sangam · Thodarpu #${editionKey} (${edition.monthEn}) 🔗✨`;
    const score = isWin ? `Solved in ${guessHistory.length} guesses!` : `Completed with solutions`;

    const text = `${header}\n${score}\n\n${emojis.join(
      "\n"
    )}\n\nPlay at: tamil-sangam-website-osu.vercel.app/games`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2400);
    });
  };

  const isGameOver = solvedCategories.length === 4 || mistakesRemaining <= 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Category Instruction */}
      <p className="text-xs sm:text-sm font-sans text-[#161210]/75 text-center mb-4">
        Create 4 groups of 4 culturally connected tiles · 4 பொருத்தமான தொகுதிகளை உருவாக்கவும்
      </p>

      {/* Floating Toast Notification */}
      <div className="h-8 mb-2">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-[#161210] text-[#FAF6F0] px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-[#D4AF37]/50"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Solved Category Banners Stack */}
      <div className="w-full flex flex-col gap-2 mb-3">
        <AnimatePresence>
          {solvedCategories.map((cat) => {
            const tierStyle = TIER_COLORS[cat.tier as 1 | 2 | 3 | 4];
            return (
              <motion.div
                key={cat.titleEn}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`w-full ${tierStyle.bg} ${tierStyle.text} rounded-xl p-4 text-center shadow-md flex flex-col items-center justify-center`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-sans font-bold text-sm sm:text-base tracking-wide uppercase">
                    {cat.titleEn}
                  </h4>
                  <span lang="ta" className="font-tamil text-xs opacity-85">
                    ({cat.titleTa})
                  </span>
                </div>
                <p className="font-sans text-xs tracking-wider font-semibold opacity-90 mb-1">
                  {cat.tiles.map((t: ThodarpuTile) => t.termEn).join(", ")}
                </p>
                <p className="font-sans text-[11px] opacity-75 italic max-w-lg">
                  {cat.culturalExplanation}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Remaining Tile Grid (4x4) */}
      {boardTiles.length > 0 && (
        <div className="w-full grid grid-cols-4 gap-2.5 mb-6">
          {boardTiles.map((tile) => {
            const isSelected = selectedIds.includes(tile.id);
            return (
              <motion.button
                key={tile.id}
                animate={isSelected && shakeSelection ? { x: [-6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.35 }}
                onClick={() => toggleSelect(tile.id)}
                className={`aspect-4/3 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all duration-150 relative ${
                  isSelected
                    ? "bg-[#161210] text-[#FAF6F0] shadow-md scale-[1.02]"
                    : "bg-[#F2EAE0] hover:bg-[#EBE0D2] text-[#161210] border border-[#161210]/15"
                }`}
              >
                <span className="font-bold text-xs sm:text-sm tracking-wide leading-snug">
                  {tile.termEn}
                </span>
                <span
                  lang="ta"
                  className={`font-tamil text-[10px] mt-0.5 leading-tight ${
                    isSelected ? "text-[#FAF6F0]/75" : "text-[#161210]/60"
                  }`}
                >
                  {tile.termTa}
                </span>

                {/* Cultural Hint Popover Badge */}
                {showHints && tile.hint && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#161210] text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold shadow-xs">
                    💡 {tile.hint}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Mistake Dots Ledger */}
      {!isGameOver && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-mono text-[#161210]/70 font-medium">
            Mistakes remaining · வாய்ப்புகள்:
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <span
                key={idx}
                className={`text-sm transition-opacity duration-200 ${
                  idx < mistakesRemaining ? "text-[#C85A32] opacity-100" : "text-[#161210]/20 opacity-40"
                }`}
              >
                ❖
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls */}
      {!isGameOver ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#161210]/25 bg-[#FAF6F0] hover:bg-[#F2EAE0] text-xs font-semibold text-[#161210] transition-colors"
          >
            <Shuffle className="size-3.5" />
            <span>Shuffle · கலைத்துப் போடு</span>
          </button>

          <button
            onClick={handleDeselectAll}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 rounded-full border border-[#161210]/25 bg-[#FAF6F0] hover:bg-[#F2EAE0] disabled:opacity-40 text-xs font-semibold text-[#161210] transition-colors"
          >
            Deselect All · நீக்கு
          </button>

          <button
            onClick={() => setShowHints(!showHints)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-colors ${
              showHints
                ? "bg-[#D4AF37] text-[#161210] border-[#D4AF37]"
                : "bg-[#FAF6F0] text-[#161210]/80 border-[#161210]/25 hover:bg-[#F2EAE0]"
            }`}
          >
            <Lightbulb className="size-3.5" />
            <span>Cultural Hints</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={selectedIds.length !== 4}
            className="px-6 py-2 rounded-full bg-[#161210] hover:bg-[#C85A32] disabled:opacity-40 text-[#FAF6F0] text-xs font-bold transition-colors shadow-md"
          >
            Submit · சரிபார்
          </button>
        </div>
      ) : (
        /* Game Solved or Finished Banner */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center bg-[#F2EAE0] p-6 rounded-2xl border border-[#D4AF37]/50 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-xl text-[#161210]">
              {solvedCategories.length === 4 && mistakesRemaining > 0
                ? "Round Complete · வெற்றி!"
                : "Edition Finished · நிறைவு"}
            </h3>
          </div>

          <p className="text-xs font-sans text-[#161210]/75 text-center mb-4">
            {edition.monthEn} {edition.year} Edition · {guessHistory.length} guesses used
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={copyShareResults}
              className="flex items-center gap-2 bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-md"
            >
              {copiedShare ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  <span>Copy Results for GroupMe 📋</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const shuffled = [...initialTiles];
                for (let i = shuffled.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                setBoardTiles(shuffled);
                setSelectedIds([]);
                setSolvedCategories([]);
                setMistakesRemaining(4);
                setGuessHistory([]);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-mono text-[#161210]/70 hover:text-[#161210]"
            >
              <RotateCcw className="size-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
