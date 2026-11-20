// src/components/games/oor-kandupidi/WorldleGame.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameShell } from "../shared/GameShell";
import {
  TN_DISTRICTS,
  getDailyDistrict,
  calculateDistanceKm,
  calculateBearing,
  calculateProximity,
  type District,
} from "@/data/games/districtsData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { MapPin, Navigation, Award, Check, Sparkles } from "lucide-react";

interface GuessFeedback {
  district: District;
  distanceKm: number;
  bearing: { arrow: string; direction: string };
  proximity: number;
}

export function WorldleGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const targetDistrict = useMemo(
    () => getDailyDistrict(currentSeed),
    [currentSeed]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [guesses, setGuesses] = useState<GuessFeedback[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [bonusAnswered, setBonusAnswered] = useState<number | null>(null);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("oor-kandupidi", dailyDate);
      if (rec.status === "won" || rec.status === "lost") {
        if (rec.status === "won") setIsWon(true);
        if (rec.status === "lost") setIsLost(true);
        return;
      }
    }

    setSearchQuery("");
    setGuesses([]);
    setIsWon(false);
    setIsLost(false);
    setBonusAnswered(null);
  }, [targetDistrict, isPractice, dailyDate]);

  // Filtered districts for autocomplete (excluding already guessed)
  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.district.id)), [guesses]);
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return TN_DISTRICTS.filter(
      (d) =>
        !guessedIds.has(d.id) &&
        (d.nameEn.toLowerCase().includes(q) || d.nameTa.includes(q))
    ).slice(0, 5);
  }, [searchQuery, guessedIds]);

  const handleSelectDistrict = (district: District) => {
    if (isWon || isLost) return;
    arcadeAudio.playClick(460);

    const distance = calculateDistanceKm(
      district.lat,
      district.lng,
      targetDistrict.lat,
      targetDistrict.lng
    );
    const bearing = calculateBearing(
      district.lat,
      district.lng,
      targetDistrict.lat,
      targetDistrict.lng
    );
    const proximity = calculateProximity(distance);

    const feedback: GuessFeedback = {
      district,
      distanceKm: distance,
      bearing,
      proximity,
    };

    const nextGuesses = [...guesses, feedback];
    setGuesses(nextGuesses);
    setSearchQuery("");
    setIsDropdownOpen(false);

    if (district.id === targetDistrict.id) {
      setIsWon(true);
      arcadeAudio.playVictoryArpeggio();
      if (!isPractice) {
        updateDailyGameRecord(
          "oor-kandupidi",
          {
            status: "won",
            guessesCount: nextGuesses.length,
          },
          dailyDate
        );
      }
    } else if (nextGuesses.length >= 6) {
      setIsLost(true);
      arcadeAudio.playErrorThud();
      if (!isPractice) {
        updateDailyGameRecord(
          "oor-kandupidi",
          {
            status: "lost",
            guessesCount: 6,
          },
          dailyDate
        );
      }
    } else {
      arcadeAudio.playClick(proximity > 75 ? 580 : 380);
    }
  };

  const shareCard = useMemo(() => {
    const count = isWon ? `${guesses.length}/6` : "X/6";
    const heatSquares = guesses
      .map((g) => {
        if (g.proximity === 100) return "🟩";
        if (g.proximity >= 80) return "🟨";
        if (g.proximity >= 50) return "🟧";
        return "⬛";
      })
      .join("");

    return generateShareCard({
      gameSlug: "oor-kandupidi",
      titleEn: "Oor Kandupidi",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `${count} Guesses`,
      gridVisual: heatSquares,
    });
  }, [puzzleNum, isWon, guesses]);

  return (
    <GameShell
      gameSlug="oor-kandupidi"
      titleEn="Oor Kandupidi"
      titleTa="ஊர் கண்டுபிடி"
      subtitleEn="Tamil Nadu District Guess"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`${guesses.length} / 6`}
      rules={[
        "Identify the secret Tamil Nadu district in 6 attempts.",
        "Use the vector silhouette and geographic distance clues.",
        "After each guess, check the distance (km), direction (↗), and proximity (%).",
        "100% proximity means you found the right district!",
      ]}
      tips={[
        "Remember Tamil Nadu's coastal vs inland regions: Chennai in NE, Kanyakumari at the southern tip, Coimbatore in the west.",
        "Observe the shape of the silhouette—coastal districts often have distinct ocean boundaries.",
      ]}
      culturalNote="Tamil Nadu comprises 38 diverse districts, from the fertile Kaveri Delta (சோழ நாடு) to the rugged Kongu plateau and the southern Pandyan heartland."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`${targetDistrict.nameEn} (${targetDistrict.nameTa}): ${targetDistrict.famousFor}`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* District Vector Silhouette Card */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 p-4 rounded-3xl bg-[#1B112B] border-2 border-[rgba(166,240,207,0.3)] shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(166,240,207,0.4)]">
            <path
              d={targetDistrict.svgPath}
              fill={isWon ? "#A6F0CF" : "#25173B"}
              stroke="#A6F0CF"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          </svg>

          {/* Reveal on win or lost */}
          {(isWon || isLost) && (
            <div className="absolute inset-x-2 bottom-2 py-1 px-2 rounded-xl bg-[#140C20]/90 backdrop-blur-md border border-[rgba(166,240,207,0.4)] text-center">
              <span className="text-xs font-serif font-medium text-[#F4F0FA]">
                {targetDistrict.nameEn}{" "}
                <span lang="ta" className="text-[#E5B869]" style={{ letterSpacing: 0 }}>
                  ({targetDistrict.nameTa})
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Bonus Trivia Round on Victory */}
        {isWon && targetDistrict.bonus && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-[#25173B] border border-[rgba(229,184,105,0.4)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5B869] font-bold flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              BONUS CULTURAL ROUND
            </span>
            <p className="text-xs text-[#F4F0FA] font-medium mb-3">
              {targetDistrict.bonus.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {targetDistrict.bonus.options.map((option, idx) => {
                const isSelected = bonusAnswered === idx;
                const isCorrect = idx === targetDistrict.bonus.correctIndex;
                let btnStyle = "bg-[#140C20] text-[#C4B7D7] border-[rgba(125,96,166,0.3)] hover:border-[#A6F0CF]/50";

                if (bonusAnswered !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-[#10B981] text-[#0A0612] font-bold border-[#34D399]";
                  } else if (isSelected) {
                    btnStyle = "bg-red-950 text-red-200 border-red-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={bonusAnswered !== null}
                    onClick={() => {
                      setBonusAnswered(idx);
                      if (isCorrect) arcadeAudio.playVictoryArpeggio();
                      else arcadeAudio.playErrorThud();
                    }}
                    className={`py-2 px-3 rounded-xl text-xs text-left border transition-all ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input & Autocomplete Dropdown */}
        {!isWon && !isLost && (
          <div className="relative w-full mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Guess district (e.g. Madurai, Thanjavur)..."
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] placeholder-[#C4B7D7]/40 text-sm focus:outline-none focus:border-[#A6F0CF] transition-colors"
                />
              </div>
            </div>

            {/* Dropdown suggestions */}
            {isDropdownOpen && filteredDistricts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] shadow-2xl overflow-hidden divide-y divide-[rgba(125,96,166,0.2)]">
                {filteredDistricts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDistrict(d)}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#342052] transition-colors group"
                  >
                    <span className="font-serif text-[#F4F0FA] group-hover:text-[#A6F0CF]">
                      {d.nameEn}
                    </span>
                    <span lang="ta" className="text-xs text-[#E5B869]" style={{ letterSpacing: 0 }}>
                      {d.nameTa}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guesses Feedback List */}
        <div className="w-full space-y-2">
          {guesses.map((g, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#1E142E] border border-[rgba(125,96,166,0.35)] flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#25173B] text-[#A6F0CF] flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate font-serif text-[#F4F0FA] text-sm">
                  {g.district.nameEn}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[#C4B7D7]">{g.distanceKm} km</span>
                <span className="text-[#A6F0CF] font-bold">
                  {g.distanceKm === 0 ? "🎯" : `${g.bearing.arrow}`}
                </span>
                <div className="w-14 sm:w-16 h-2 rounded-full bg-[#140C20] overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      g.proximity === 100
                        ? "bg-[#10B981]"
                        : g.proximity >= 80
                        ? "bg-[#F59E0B]"
                        : "bg-[#7DD3FC]"
                    }`}
                    style={{ width: `${g.proximity}%` }}
                  />
                </div>
                <span className="w-8 text-right font-bold text-[#F4F0FA]">
                  {g.proximity}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
