// src/components/games/shared/HowToPlayModal.tsx
"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";

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
  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      tone="dark"
      size="sm"
      eyebrow="How to play"
      title={titleEn}
      tamilTitle={titleTa}
      bodyClassName="px-6 pb-6"
    >
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
    </DialogShell>
  );
}
