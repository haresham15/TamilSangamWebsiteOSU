// src/components/games/shared/GameDrawer.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Check, ArrowRight, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { copyToClipboard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { ARCADE_GAMES_CATALOG, type ArcadeGameSlug } from "@/lib/games/storage";

interface GameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: "won" | "lost";
  titleEn: string;
  titleTa: string;
  puzzleNumber: number;
  timeFormatted?: string;
  movesOrGuesses?: string | number;
  shareCardText: string;
  culturalTrivia?: string;
  nextUnplayedSlug?: ArcadeGameSlug | null;
  onPlayAgainPractice?: () => void;
}

export function GameDrawer({
  isOpen,
  onClose,
  status,
  titleEn,
  titleTa,
  puzzleNumber,
  timeFormatted,
  movesOrGuesses,
  shareCardText,
  culturalTrivia,
  nextUnplayedSlug,
  onPlayAgainPractice,
}: GameDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    arcadeAudio.playClick(600);
    const success = await copyToClipboard(shareCardText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const nextGameMeta = nextUnplayedSlug
    ? ARCADE_GAMES_CATALOG.find((g) => g.slug === nextUnplayedSlug)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0A0612]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#1A1228] border border-[rgba(125,96,166,0.4)] shadow-2xl p-6 sm:p-7 text-[#F4F0FA] max-h-[90vh] overflow-y-auto"
        >
          {/* Status Header */}
          <div className="text-center pb-5 border-b border-[rgba(125,96,166,0.2)]">
            <div className="inline-flex p-3 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.3)] text-[#A6F0CF] mb-3 shadow-[0_0_20px_rgba(166,240,207,0.15)]">
              {status === "won" ? <Trophy className="w-8 h-8" /> : <Sparkles className="w-8 h-8 text-[#E5B869]" />}
            </div>

            <h2 className="text-2xl font-serif font-medium text-[#F4F0FA]">
              {status === "won" ? "Splendid! வெற்றி!" : "Good Try! தொடருங்கள்!"}
            </h2>
            <p className="text-xs font-mono uppercase tracking-widest text-[#A6F0CF] mt-1">
              {titleEn} #{puzzleNumber} · <span lang="ta" style={{ letterSpacing: 0 }}>{titleTa}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 my-5">
            {timeFormatted && (
              <div className="p-3.5 rounded-xl bg-[#25173B]/60 border border-[rgba(125,96,166,0.25)] text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4B7D7] block">
                  Time
                </span>
                <span className="text-xl font-mono font-medium text-[#A6F0CF] mt-0.5 block">
                  {timeFormatted}
                </span>
              </div>
            )}
            {movesOrGuesses !== undefined && (
              <div className="p-3.5 rounded-xl bg-[#25173B]/60 border border-[rgba(125,96,166,0.25)] text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4B7D7] block">
                  Effort
                </span>
                <span className="text-xl font-mono font-medium text-[#E5B869] mt-0.5 block">
                  {movesOrGuesses}
                </span>
              </div>
            )}
          </div>

          {/* Cultural Trivia Blurb */}
          {culturalTrivia && (
            <div className="mb-5 p-4 rounded-xl bg-[#140C20] border border-[rgba(229,184,105,0.3)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E5B869] font-semibold flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                CULTURAL CONTEXT
              </span>
              <p className="text-xs text-[#E2D9EE] leading-relaxed">
                {culturalTrivia}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Copy Share Card */}
            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                copied
                  ? "bg-[#A6F0CF] text-[#140C20] shadow-[0_0_20px_rgba(166,240,207,0.3)]"
                  : "bg-[#A6F0CF] text-[#140C20] hover:bg-[#bbf4dc]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to Clipboard! பகிர்வதற்கு தயார்!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Score Card (GroupMe / WhatsApp)
                </>
              )}
            </button>

            {/* Next Unplayed Game Button */}
            {nextGameMeta && (
              <Link
                href={`/games/${nextGameMeta.slug}`}
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] hover:border-[#A6F0CF]/60 hover:text-[#A6F0CF] font-medium text-sm flex items-center justify-between transition-colors group"
              >
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] block">
                    NEXT UNPLAYED GAME
                  </span>
                  <span className="text-sm font-serif">
                    Play {nextGameMeta.titleEn} ({nextGameMeta.titleTa})
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A6F0CF] group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* Practice / Archive Mode Replay */}
            {onPlayAgainPractice && (
              <button
                onClick={() => {
                  onPlayAgainPractice();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-[rgba(125,96,166,0.3)] text-[#C4B7D7] hover:text-[#F4F0FA] hover:bg-[#25173B]/50 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play Unlimited Practice Puzzle
              </button>
            )}

            {/* Back to Arcade */}
            <Link
              href="/games#arcade"
              onClick={onClose}
              className="block w-full text-center py-2 text-xs font-mono uppercase tracking-wider text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
            >
              ← Back to Arcade Hub
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
