// src/components/games/shared/GameShell.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { arcadeAudio } from "@/lib/games/audio";
import { HowToPlayModal } from "./HowToPlayModal";
import { GameDrawer } from "./GameDrawer";
import { getDailyGauntletSummary, type ArcadeGameSlug } from "@/lib/games/storage";

interface GameShellProps {
  gameSlug: ArcadeGameSlug;
  titleEn: string;
  titleTa: string;
  subtitleEn?: string;
  puzzleNumber: number;
  dateStr: string;
  isPracticeMode?: boolean;
  onTogglePractice?: () => void;
  // Timer & Moves
  elapsedSeconds?: number;
  movesOrScore?: string | number;
  // How to play content
  rules: string[];
  tips?: string[];
  culturalNote?: string;
  // Victory / Game over state
  isComplete: boolean;
  gameStatus: "unplayed" | "in_progress" | "won" | "lost";
  shareCardText: string;
  culturalTrivia?: string;
  onPlayAgainPractice?: () => void;
  children: React.ReactNode;
}

export function GameShell({
  gameSlug,
  titleEn,
  titleTa,
  subtitleEn,
  puzzleNumber,
  dateStr,
  isPracticeMode = false,
  onTogglePractice,
  elapsedSeconds = 0,
  movesOrScore,
  rules,
  tips,
  culturalNote,
  isComplete,
  gameStatus,
  shareCardText,
  culturalTrivia,
  onPlayAgainPractice,
  children,
}: GameShellProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => arcadeAudio.getMuted());
  const [nextUnplayed, setNextUnplayed] = useState<ArcadeGameSlug | null>(null);

  // Sync mute state on mount
  useEffect(() => {
    setIsMuted(arcadeAudio.getMuted());
  }, []);

  // When game completes, trigger drawer and victory sound
  useEffect(() => {
    if (isComplete) {
      if (gameStatus === "won") {
        arcadeAudio.playVictoryArpeggio();
      }
      const summary = getDailyGauntletSummary(dateStr);
      setNextUnplayed(summary.nextUnplayedSlug);
      // Small delay for emotional payoff
      const timer = setTimeout(() => {
        setIsDrawerOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isComplete, gameStatus, dateStr]);

  const toggleSound = () => {
    const next = arcadeAudio.toggleMute();
    setIsMuted(next);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#140C20] text-[#F4F0FA] flex flex-col justify-between selection:bg-[#A6F0CF]/20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#1A1228]/90 backdrop-blur-md border-b border-[rgba(125,96,166,0.3)] px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back Link & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/games#arcade"
              className="p-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#A6F0CF] hover:border-[#A6F0CF]/50 transition-colors flex items-center justify-center shrink-0"
              aria-label="Back to Arcade Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-medium text-[#F4F0FA] truncate flex items-center gap-1.5">
                  {titleEn}
                  <span
                    lang="ta"
                    className="text-xs sm:text-sm font-sans text-[#E5B869] font-normal"
                    style={{ letterSpacing: 0 }}
                  >
                    ({titleTa})
                  </span>
                </h1>
                {isPracticeMode ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/40">
                    Practice
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#A6F0CF]/15 text-[#A6F0CF] border border-[#A6F0CF]/30">
                    #{puzzleNumber}
                  </span>
                )}
              </div>
              {subtitleEn && (
                <p className="text-[11px] text-[#C4B7D7] font-sans truncate hidden sm:block">
                  {subtitleEn}
                </p>
              )}
            </div>
          </div>

          {/* Right: Metrics & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Timer / Score Pill */}
            {(elapsedSeconds > 0 || movesOrScore !== undefined) && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#25173B]/80 border border-[rgba(125,96,166,0.3)] text-xs font-mono">
                {elapsedSeconds > 0 && (
                  <span className="text-[#A6F0CF] font-medium">
                    {formatTimer(elapsedSeconds)}
                  </span>
                )}
                {movesOrScore !== undefined && (
                  <span className="text-[#C4B7D7] border-l border-[rgba(125,96,166,0.4)] pl-2">
                    {movesOrScore}
                  </span>
                )}
              </div>
            )}

            {/* Practice Mode Toggle */}
            {onTogglePractice && (
              <button
                onClick={onTogglePractice}
                title={isPracticeMode ? "Switch to Daily Puzzle" : "Switch to Practice Mode"}
                className={`p-2 rounded-lg border transition-colors ${
                  isPracticeMode
                    ? "bg-[#E5B869]/20 border-[#E5B869]/40 text-[#E5B869]"
                    : "bg-[#25173B] border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#F4F0FA]"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              className="p-2 rounded-lg bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#A6F0CF]" />}
            </button>

            {/* Help / Rules */}
            <button
              onClick={() => setIsHelpOpen(true)}
              title="How to Play"
              className="p-2 rounded-lg bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Open Drawer button when complete */}
            {isComplete && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                title="View Results & Share"
                className="p-2 rounded-lg bg-[#A6F0CF] text-[#140C20] font-medium hover:bg-[#bbf4dc] transition-colors flex items-center gap-1.5 text-xs"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Summary</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Center Playfield */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        {children}
      </main>

      {/* Footer Cultural Line */}
      <footer className="w-full py-3 px-4 text-center border-t border-[rgba(125,96,166,0.2)] text-[11px] font-mono text-[#C4B7D7]/70">
        The Sangam Daily Arcade · Built with pride for Ohio State University
      </footer>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        titleEn={titleEn}
        titleTa={titleTa}
        rules={rules}
        tips={tips}
        culturalNote={culturalNote}
      />

      <GameDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        status={gameStatus === "lost" ? "lost" : "won"}
        titleEn={titleEn}
        titleTa={titleTa}
        puzzleNumber={puzzleNumber}
        timeFormatted={elapsedSeconds > 0 ? formatTimer(elapsedSeconds) : undefined}
        movesOrGuesses={movesOrScore}
        shareCardText={shareCardText}
        culturalTrivia={culturalTrivia}
        nextUnplayedSlug={nextUnplayed}
        onPlayAgainPractice={onPlayAgainPractice}
      />
    </div>
  );
}
