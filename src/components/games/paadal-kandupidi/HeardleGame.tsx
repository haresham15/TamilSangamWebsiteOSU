// src/components/games/paadal-kandupidi/HeardleGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { GameShell } from "../shared/GameShell";
import {
  PAADAL_TRACKS,
  getDailyPaadal,
  type PaadalTrack,
} from "@/data/games/paadalData";
import { matchesTanglishFuzzy } from "@/lib/games/tanglish";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Play, Pause, FastForward, Music2, AlertCircle, Sparkles, Volume2 } from "lucide-react";

const UNLOCK_SECONDS = [1, 2, 4, 7, 11, 16];

export function HeardleGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const targetTrack: PaadalTrack = useMemo(
    () => getDailyPaadal(currentSeed),
    [currentSeed]
  );

  const [step, setStep] = useState<number>(0); // 0 to 5 (corresponds to UNLOCK_SECONDS)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [guesses, setGuesses] = useState<Array<{ text: string; status: "wrong" | "skipped" | "right_movie" | "correct" }>>([]);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch preview URL from route handler
  useEffect(() => {
    let active = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setPlaybackProgress(0);

    fetch(`/api/games/paadal/${targetTrack.trackId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.previewUrl) {
          setAudioUrl(data.previewUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [targetTrack]);

  // Load saved record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("paadal-kandupidi", dailyDate);
      if (rec.status === "won" || rec.status === "lost") {
        if (rec.status === "won") setIsWon(true);
        if (rec.status === "lost") setIsLost(true);
        setStep(5);
        return;
      }
    }

    setStep(0);
    setGuesses([]);
    setIsWon(false);
    setIsLost(false);
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, [targetTrack, isPractice, dailyDate]);

  const unlockedSeconds = UNLOCK_SECONDS[step];

  // Play audio snippet
  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
    }
    const audio = audioRef.current;
    if (!audio) {
      // Audio preview not loaded or unavailable
      arcadeAudio.playClick(440);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setIsPlaying(true);
      arcadeAudio.playClick(520);

      // Animation interval
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (!audioRef.current || audioRef.current.paused) {
          clearInterval(interval);
          setIsPlaying(false);
          return;
        }

        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= unlockedSeconds) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
          setPlaybackProgress(0);
          clearInterval(interval);
        } else {
          setPlaybackProgress(elapsed / unlockedSeconds);
        }
      }, 50);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Filtered tracks for autocomplete
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return PAADAL_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.movie.toLowerCase().includes(q) ||
        t.composer.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectTrack = (track: PaadalTrack) => {
    if (isWon || isLost) return;

    if (track.id === targetTrack.id) {
      // Correct!
      setGuesses((prev) => [...prev, { text: `${track.title} — ${track.movie}`, status: "correct" }]);
      setIsWon(true);
      arcadeAudio.playVictoryArpeggio();
      if (!isPractice) {
        updateDailyGameRecord(
          "paadal-kandupidi",
          {
            status: "won",
            guessesCount: guesses.length + 1,
            solveTimeSeconds: unlockedSeconds,
          },
          dailyDate
        );
      }
    } else if (track.movie.toLowerCase() === targetTrack.movie.toLowerCase()) {
      // Right movie, wrong song!
      setGuesses((prev) => [...prev, { text: `${track.title} — ${track.movie}`, status: "right_movie" }]);
      setErrorMessage(`Right movie (${track.movie})! But try another song from the soundtrack.`);
      advanceStep();
      arcadeAudio.playClick(500);
    } else {
      setGuesses((prev) => [...prev, { text: `${track.title} — ${track.movie}`, status: "wrong" }]);
      advanceStep();
      arcadeAudio.playErrorThud();
    }

    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleSkip = () => {
    if (isWon || isLost) return;
    setGuesses((prev) => [...prev, { text: "Skipped", status: "skipped" }]);
    advanceStep();
    arcadeAudio.playClick(360);
  };

  const advanceStep = () => {
    if (step < 5) {
      setStep((s) => s + 1);
    } else {
      setIsLost(true);
      if (!isPractice) {
        updateDailyGameRecord(
          "paadal-kandupidi",
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
    const timeUsed = isWon ? `${unlockedSeconds}s` : "X";
    const squares = guesses
      .map((g) => {
        if (g.status === "correct") return "🟩";
        if (g.status === "right_movie") return "🟨";
        if (g.status === "wrong") return "🟥";
        return "⬛";
      })
      .join("");

    return generateShareCard({
      gameSlug: "paadal-kandupidi",
      titleEn: "Paadal Kandupidi",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `Solved in ${timeUsed} (${guesses.length}/6 tries)`,
      gridVisual: squares,
    });
  }, [puzzleNum, isWon, unlockedSeconds, guesses]);

  return (
    <GameShell
      gameSlug="paadal-kandupidi"
      titleEn="Paadal Kandupidi"
      titleTa="பாடல் கண்டுபிடி"
      subtitleEn="Progressive Song Intro Guess"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`${unlockedSeconds}s Unlocked (${step + 1}/6)`}
      rules={[
        "Listen to the opening audio snippet of an iconic Tamil song.",
        "Unlocks progressively: 1s → 2s → 4s → 7s → 11s → 16s.",
        "Search by song title, movie, or music director.",
        "Guessing the right movie gives an amber nudge to help you narrow down the track!",
      ]}
      tips={[
        "Listen for signature rhythm sections (Anirudh's synth bass, Rahman's woodwinds, Harris's acoustic guitar).",
        "If you are stuck, skip to unlock more seconds of the melody.",
      ]}
      culturalNote="Tamil cinema music is the soundtrack of our diaspora life—from Ilaiyaraaja's rural melodies to A.R. Rahman's global orchestrations and Anirudh's stadium anthems."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`Song: ${targetTrack.title} (${targetTrack.tamilTitle}) · Movie: ${targetTrack.movie} · Composer: ${targetTrack.composer} (${targetTrack.year})`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Waveform Timeline Card */}
        <div className="w-full mb-4 p-5 rounded-3xl bg-[#1B112B] border-2 border-[rgba(166,240,207,0.3)] shadow-2xl flex flex-col items-center">
          {/* Audio Visualizer Waves */}
          <div className="w-full h-16 flex items-center justify-between gap-1 mb-4 px-2">
            {Array.from({ length: 32 }).map((_, i) => {
              const hPct = 20 + Math.sin(i * 0.4) * 40 + (i % 3) * 15;
              const isWaveActive = isPlaying && i / 32 <= playbackProgress;

              return (
                <div
                  key={i}
                  style={{ height: `${hPct}%` }}
                  className={`flex-1 rounded-full transition-all duration-100 ${
                    isWaveActive
                      ? "bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                      : i / 32 <= (step + 1) / 6
                      ? "bg-[#E5B869]/50"
                      : "bg-[#25173B]"
                  }`}
                />
              );
            })}
          </div>

          {/* Segmented Timeline Bar */}
          <div className="w-full grid grid-cols-6 gap-1 h-2 rounded-full overflow-hidden bg-[#140C20] mb-4">
            {UNLOCK_SECONDS.map((sec, idx) => (
              <div
                key={sec}
                className={`h-full transition-colors ${
                  idx <= step ? "bg-[#A6F0CF]" : "bg-[#25173B]"
                }`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#A6F0CF] text-[#140C20] shadow-[0_0_20px_rgba(166,240,207,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <span className="text-xs font-mono text-[#C4B7D7]">
              {unlockedSeconds}s snippet
            </span>
          </div>
        </div>

        {/* Revealed Song Card on Finish */}
        {(isWon || isLost) && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block mb-1">
              {isWon ? "SOLVED TRACK" : "TODAY'S TRACK"}
            </span>
            <h3 className="text-lg font-serif font-medium text-[#F4F0FA]">
              {targetTrack.title}
            </h3>
            <p className="text-xs text-[#E5B869] mt-0.5">
              {targetTrack.movie} · {targetTrack.composer} ({targetTrack.year})
            </p>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="w-full mb-3 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-mono flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMessage}</span>
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
                  setErrorMessage(null);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredTracks.length > 0) {
                    e.preventDefault();
                    handleSelectTrack(filteredTracks[0]);
                  }
                }}
                placeholder="Search song or movie..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#1A1228] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] placeholder-[#C4B7D7]/40 text-sm focus:outline-none focus:border-[#A6F0CF] transition-colors"
              />
              <button
                onClick={handleSkip}
                className="px-3 py-3 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#A6F0CF] text-xs font-mono uppercase flex items-center gap-1 transition-colors shrink-0"
              >
                Skip <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown results */}
            {isDropdownOpen && filteredTracks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] shadow-2xl overflow-hidden divide-y divide-[rgba(125,96,166,0.2)]">
                {filteredTracks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(t)}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#342052] transition-colors group"
                  >
                    <div>
                      <span className="font-serif text-[#F4F0FA] group-hover:text-[#A6F0CF] block">
                        {t.title}
                      </span>
                      <span className="text-[11px] text-[#C4B7D7]">
                        {t.movie} · {t.composer}
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
                  : g.status === "right_movie"
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                  : "bg-[#1E142E] border-[rgba(125,96,166,0.3)] text-[#C4B7D7]"
              }`}
            >
              <span>{g.text}</span>
              <span className="font-bold">
                {g.status === "correct"
                  ? "CORRECT"
                  : g.status === "right_movie"
                  ? "RIGHT MOVIE"
                  : g.status === "skipped"
                  ? "SKIPPED"
                  : "INCORRECT"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
