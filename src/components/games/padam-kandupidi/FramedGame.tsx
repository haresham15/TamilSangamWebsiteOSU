// src/components/games/padam-kandupidi/FramedGame.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameShell } from "../shared/GameShell";
import {
  PADAM_MOVIES,
  getDailyPadam,
  type PadamMovie,
} from "@/data/games/padamData";
import { matchesTanglishFuzzy } from "@/lib/games/tanglish";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Film, FastForward, Check, AlertCircle, Sparkles } from "lucide-react";

export function FramedGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const targetMovie: PadamMovie = useMemo(
    () => getDailyPadam(currentSeed),
    [currentSeed]
  );

  const [activeFrame, setActiveFrame] = useState<number>(1); // 1 to 6
  const [maxUnlockedFrame, setMaxUnlockedFrame] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [guesses, setGuesses] = useState<Array<{ text: string; status: "wrong" | "skipped" | "correct" }>>([]);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("padam-kandupidi", dailyDate);
      if (rec.status === "won" || rec.status === "lost") {
        if (rec.status === "won") setIsWon(true);
        if (rec.status === "lost") setIsLost(true);
        setActiveFrame(6);
        setMaxUnlockedFrame(6);
        return;
      }
    }

    setActiveFrame(1);
    setMaxUnlockedFrame(1);
    setGuesses([]);
    setIsWon(false);
    setIsLost(false);
    setSearchQuery("");
  }, [targetMovie, isPractice, dailyDate]);

  // Autocomplete suggestions
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return PADAM_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.music.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectMovie = (movie: PadamMovie) => {
    if (isWon || isLost) return;

    if (movie.id === targetMovie.id) {
      setGuesses((prev) => [...prev, { text: movie.title, status: "correct" }]);
      setIsWon(true);
      setActiveFrame(6);
      setMaxUnlockedFrame(6);
      arcadeAudio.playVictoryArpeggio();
      if (!isPractice) {
        updateDailyGameRecord(
          "padam-kandupidi",
          {
            status: "won",
            guessesCount: guesses.length + 1,
          },
          dailyDate
        );
      }
    } else {
      setGuesses((prev) => [...prev, { text: movie.title, status: "wrong" }]);
      arcadeAudio.playErrorThud();
      advanceFrame();
    }

    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleSkip = () => {
    if (isWon || isLost) return;
    setGuesses((prev) => [...prev, { text: "Skipped Frame", status: "skipped" }]);
    arcadeAudio.playClick(360);
    advanceFrame();
  };

  const advanceFrame = () => {
    if (maxUnlockedFrame < 6) {
      const next = maxUnlockedFrame + 1;
      setMaxUnlockedFrame(next);
      setActiveFrame(next);
    } else {
      setIsLost(true);
      setActiveFrame(6);
      setMaxUnlockedFrame(6);
      if (!isPractice) {
        updateDailyGameRecord(
          "padam-kandupidi",
          {
            status: "lost",
            guessesCount: 6,
          },
          dailyDate
        );
      }
    }
  };

  const shareCard = useMemo(() => {
    const frameCount = isWon ? `${guesses.length}/6` : "X/6";
    const squares = guesses
      .map((g) => (g.status === "correct" ? "🟩" : g.status === "skipped" ? "⬛" : "🟥"))
      .join("");

    return generateShareCard({
      gameSlug: "padam-kandupidi",
      titleEn: "Padam Kandupidi",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `Framed in ${frameCount}`,
      gridVisual: squares,
    });
  }, [puzzleNum, isWon, guesses]);

  return (
    <GameShell
      gameSlug="padam-kandupidi"
      titleEn="Padam Kandupidi"
      titleTa="படம் கண்டுபிடி"
      subtitleEn="Kollywood Movie In 6 Frames"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`Frame ${activeFrame} of 6`}
      rules={[
        "Identify the blockbuster Tamil movie across 6 progressive clues.",
        "Frame 1: Color Palette + Year + Music Director.",
        "Frame 2: Iconic Prop / Atmosphere.",
        "Frame 3: Iconic Dialogue in Tanglish + Tamil.",
        "Frame 4: Setting / Backdrop.",
        "Frame 5: Cast Initials & Director.",
        "Frame 6: Full Scene Clue.",
      ]}
      tips={[
        "The music director and release year narrow the era dramatically.",
        "Iconic punchlines in Frame 3 are unmistakable to Tamil movie buffs!",
      ]}
      culturalNote="Kollywood cinema is a central cultural heartbeat of Tamil society, giving us enduring punchlines, musical masterpieces, and shared community memories."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`Movie: ${targetMovie.title} (${targetMovie.tamilTitle}) · Directed by ${targetMovie.director} · Music by ${targetMovie.music} (${targetMovie.year})`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Frame Number Tabs (Clickable to review past clues) */}
        <div className="flex gap-1.5 w-full mb-3 justify-center">
          {Array.from({ length: 6 }).map((_, idx) => {
            const frameNum = idx + 1;
            const isUnlocked = frameNum <= maxUnlockedFrame || isWon || isLost;
            const isCurrent = frameNum === activeFrame;

            return (
              <button
                key={idx}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && setActiveFrame(frameNum)}
                className={`h-2.5 flex-1 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                    : isUnlocked
                    ? "bg-[#E5B869] hover:bg-[#fde047]"
                    : "bg-[#25173B] cursor-not-allowed opacity-40"
                }`}
                title={`Frame ${frameNum}${isUnlocked ? " (View Clue)" : " (Locked)"}`}
              />
            );
          })}
        </div>

        {/* Current Active Clue Frame Card */}
        <div className="w-full mb-4 p-5 rounded-3xl bg-[#1B112B] border-2 border-[rgba(166,240,207,0.3)] shadow-2xl flex flex-col items-center text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A6F0CF] font-bold mb-3">
            CLUE FRAME {activeFrame} OF 6
          </span>

          {/* Frame 1: Palette + Year + Music */}
          {activeFrame === 1 && (
            <div className="w-full flex flex-col items-center">
              <span className="text-xs text-[#C4B7D7] font-mono mb-2">
                Color Palette of the Film
              </span>
              <div className="flex gap-2 mb-4">
                {targetMovie.clues.frame1.palette.map((color, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: color }}
                    className="w-12 h-12 rounded-xl shadow-md border border-white/20"
                  />
                ))}
              </div>
              <p className="text-sm font-serif font-medium text-[#F4F0FA]">
                Released: <span className="text-[#E5B869] font-mono">{targetMovie.clues.frame1.year}</span> · Music by:{" "}
                <span className="text-[#A6F0CF] font-bold">{targetMovie.clues.frame1.music}</span>
              </p>
            </div>
          )}

          {/* Frame 2: Prop / Atmosphere */}
          {activeFrame === 2 && (
            <div className="w-full flex flex-col items-center py-2">
              <span className="text-[10px] font-mono uppercase text-[#C4B7D7] mb-1">
                Iconic Prop & Atmosphere
              </span>
              <p className="text-base font-serif text-[#F4F0FA] mb-1">
                {targetMovie.clues.frame2.propOrAtmosphere}
              </p>
              <p lang="ta" className="text-xs text-[#E5B869]" style={{ letterSpacing: 0 }}>
                {targetMovie.clues.frame2.tamilProp}
              </p>
            </div>
          )}

          {/* Frame 3: Famous Dialogue */}
          {activeFrame === 3 && (
            <div className="w-full flex flex-col items-center py-2">
              <span className="text-[10px] font-mono uppercase text-[#C4B7D7] mb-1">
                Iconic Dialogue
              </span>
              <p className="text-base sm:text-lg font-serif italic text-[#A6F0CF] mb-1">
                {targetMovie.clues.frame3.dialogueEn}
              </p>
              <p lang="ta" className="text-sm text-[#E5B869] font-medium" style={{ letterSpacing: 0 }}>
                {targetMovie.clues.frame3.dialogueTa}
              </p>
            </div>
          )}

          {/* Frame 4: Setting / Backdrop */}
          {activeFrame === 4 && (
            <div className="w-full flex flex-col items-center py-2">
              <span className="text-[10px] font-mono uppercase text-[#C4B7D7] mb-1">
                Primary Setting
              </span>
              <p className="text-base font-serif text-[#F4F0FA] mb-1">
                {targetMovie.clues.frame4.setting}
              </p>
              <p lang="ta" className="text-xs text-[#E5B869]" style={{ letterSpacing: 0 }}>
                {targetMovie.clues.frame4.tamilSetting}
              </p>
            </div>
          )}

          {/* Frame 5: Cast Initials & Director */}
          {activeFrame === 5 && (
            <div className="w-full flex flex-col items-center py-2">
              <span className="text-[10px] font-mono uppercase text-[#C4B7D7] mb-1">
                Cast & Director
              </span>
              <p className="text-base font-serif text-[#A6F0CF] font-bold mb-1">
                {targetMovie.clues.frame5.castInitials}
              </p>
              <p className="text-xs text-[#E5B869]">
                Directed by {targetMovie.clues.frame5.director}
              </p>
            </div>
          )}

          {/* Frame 6: Iconic Scene Clue */}
          {activeFrame === 6 && (
            <div className="w-full flex flex-col items-center py-2">
              <span className="text-[10px] font-mono uppercase text-[#C4B7D7] mb-1">
                Climax / Iconic Scene
              </span>
              <p className="text-base font-serif text-[#F4F0FA]">
                {targetMovie.clues.frame6.iconicScene}
              </p>
            </div>
          )}
        </div>

        {/* Revealed Movie Card on Finish */}
        {(isWon || isLost) && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block mb-1">
              {isWon ? "FRAMED!" : "TODAY'S FILM"}
            </span>
            <h3 className="text-xl font-serif font-medium text-[#F4F0FA]">
              {targetMovie.title}{" "}
              <span lang="ta" className="text-base text-[#E5B869] font-normal" style={{ letterSpacing: 0 }}>
                ({targetMovie.tamilTitle})
              </span>
            </h3>
            <p className="text-xs text-[#C4B7D7] mt-1">
              Directed by {targetMovie.director} · Music by {targetMovie.music} ({targetMovie.year})
            </p>
          </div>
        )}

        {/* Input & Autocomplete Dropdown */}
        {!isWon && !isLost && (
          <div className="relative w-full mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredMovies.length > 0) {
                    e.preventDefault();
                    handleSelectMovie(filteredMovies[0]);
                  }
                }}
                placeholder="Guess movie (e.g. Vikram, Master, Baasha)..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#1A1228] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] placeholder-[#C4B7D7]/40 text-sm focus:outline-none focus:border-[#A6F0CF] transition-colors"
              />
              <button
                onClick={handleSkip}
                className="px-3.5 py-3 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#A6F0CF] text-xs font-mono uppercase flex items-center gap-1 transition-colors shrink-0"
              >
                Skip <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown suggestions */}
            {isDropdownOpen && filteredMovies.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] shadow-2xl overflow-hidden divide-y divide-[rgba(125,96,166,0.2)]">
                {filteredMovies.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMovie(m)}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#342052] transition-colors group"
                  >
                    <div>
                      <span className="font-serif text-[#F4F0FA] group-hover:text-[#A6F0CF] block">
                        {m.title}
                      </span>
                      <span className="text-[11px] text-[#C4B7D7]">
                        {m.year} · {m.director}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guesses list */}
        <div className="w-full space-y-1.5">
          {guesses.map((g, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                g.status === "correct"
                  ? "bg-[#10B981]/20 border-[#10B981] text-[#A6F0CF]"
                  : "bg-[#1E142E] border-[rgba(125,96,166,0.3)] text-[#C4B7D7]"
              }`}
            >
              <span>{g.text}</span>
              <span className="font-bold">
                {g.status === "correct" ? "CORRECT" : g.status === "skipped" ? "SKIPPED" : "INCORRECT"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
