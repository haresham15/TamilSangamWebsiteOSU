// src/components/games/shared/HowToPlayModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleTa: string;
  rules: string[];
  tips?: string[];
  culturalNote?: string;
}

export function HowToPlayModal({
  isOpen,
  onClose,
  titleEn,
  titleTa,
  rules,
  tips,
  culturalNote,
}: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0612]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1A1228] border border-[rgba(125,96,166,0.35)] shadow-2xl p-6 text-[#F4F0FA]"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(125,96,166,0.2)]">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#A6F0CF]">
                HOW TO PLAY
              </span>
              <h2 className="text-xl font-serif font-medium text-[#F4F0FA] flex items-center gap-2 mt-0.5">
                {titleEn}
                <span lang="ta" className="text-sm font-sans text-[#E5B869] font-normal" style={{ letterSpacing: 0 }}>
                  ({titleTa})
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#C4B7D7] hover:text-[#F4F0FA] hover:bg-[#25173B] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rules List */}
          <div className="mt-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#C4B7D7]">
              Rules of Play
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E2D9EE] leading-relaxed">
              {rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#25173B] border border-[rgba(166,240,207,0.3)] text-[#A6F0CF] text-xs font-mono flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tips */}
          {tips && tips.length > 0 && (
            <div className="mt-5 p-3.5 rounded-xl bg-[#25173B]/70 border border-[rgba(166,240,207,0.2)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A6F0CF] font-semibold block mb-1.5">
                PRO TIPS
              </span>
              <ul className="space-y-1.5 text-xs text-[#C4B7D7] leading-relaxed">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#A6F0CF]">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cultural Soul */}
          {culturalNote && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#140C20] border border-[rgba(229,184,105,0.3)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E5B869] font-semibold flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                TAMIL HERITAGE
              </span>
              <p className="text-xs text-[#E2D9EE] leading-relaxed">
                {culturalNote}
              </p>
            </div>
          )}

          {/* Got It Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-2.5 rounded-xl bg-[#A6F0CF] text-[#140C20] font-medium text-sm hover:bg-[#bbf4dc] transition-colors"
          >
            Got It · தொடங்கு
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
