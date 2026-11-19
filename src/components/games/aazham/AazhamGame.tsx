// src/components/games/aazham/AazhamGame.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AAZHAM_BIWEEKLY_EDITIONS,
  type AazhamDiveEdition,
  type AazhamTier,
  AAZHAM_TIER_META,
} from "@/data/aazhamData";
import { matchAazhamGuess } from "@/lib/aazhamNormalizer";
import {
  type AazhamRoundResult,
  saveAazhamDiveCompletion,
  getAazhamDiveResult,
} from "@/lib/aazhamStorage";
import { OceanBackdrop } from "./OceanBackdrop";
import { SubmergedLayer } from "./SubmergedLayer";
import { DiveHeader } from "./DiveHeader";
import { DepthRail } from "./DepthRail";
import { DiveStage } from "./DiveStage";
import { AtmosphericOverlay } from "./AtmosphericOverlay";
import { DiveResults } from "./DiveResults";
import { useDiveAudio } from "./useDiveAudio";

interface AazhamGameProps {
  editionId: string;
  onSolved?: () => void;
  onBackToArcade?: () => void;
}

type GamePhase = "diving" | "post_dive";

const ROUND_TIME_SECONDS = 25.0;

export function AazhamGame({
  editionId,
  onSolved,
  onBackToArcade,
}: AazhamGameProps) {
  // Resolve active edition
  const edition: AazhamDiveEdition = useMemo(() => {
    return (
      AAZHAM_BIWEEKLY_EDITIONS[editionId] ||
      AAZHAM_BIWEEKLY_EDITIONS["2026-10-A"]
    );
  }, [editionId]);

  // Check if player has already completed this dive
  const [existingCompletion, setExistingCompletion] = useState(() =>
    getAazhamDiveResult(edition.id)
  );

  const [phase, setPhase] = useState<GamePhase>(() =>
    existingCompletion ? "post_dive" : "diving"
  );
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [roundResults, setRoundResults] = useState<AazhamRoundResult[]>(() =>
    existingCompletion ? existingCompletion.roundResults : []
  );
  const [currentResult, setCurrentResult] = useState<AazhamRoundResult | null>(null);
  const [isPlunging, setIsPlunging] = useState(false);
  const [plungeVelocity, setPlungeVelocity] = useState(0);
  const [triggerShockwave, setTriggerShockwave] = useState(false);

  // Audio engine
  const {
    isMuted,
    toggleMute,
    playSonarTick,
    playRejectThud,
    playTierLockIn,
    playPlungeRush,
  } = useDiveAudio();

  // Animation frame & timer tracking
  const timerRafRef = useRef<number | null>(null);
  const roundStartTimeRef = useRef<number>(performance.now());
  const roundActiveRef = useRef<boolean>(true);

  // Current Depth (0 to 7000)
  const currentDepth = useMemo(() => {
    return roundResults.reduce((acc, r) => acc + r.depthMeters, 0);
  }, [roundResults]);

  const depthProgress = Math.max(0, Math.min(1, currentDepth / 7000));
  const activePrompt = edition.prompts[currentPromptIdx];

  // Active accent color based on depth
  const activeAccentColor = useMemo(() => {
    if (depthProgress >= 0.82) return "#00F5D4"; // Kumari Abyss
    if (depthProgress >= 0.60) return "#2DD4BF"; // Kapatapuram
    if (depthProgress >= 0.35) return "#DFB968"; // Poompuhar Chola Brass
    if (depthProgress >= 0.15) return "#38BDF8"; // Twilight Reef
    return "#5EEAD4"; // Sunlit Surface
  }, [depthProgress]);

  // Urgency ratio when timer < 8s
  const urgencyRatio = useMemo(() => {
    if (phase !== "diving" || currentResult) return 0;
    if (timeLeft > 8.0) return 0;
    return Math.max(0, Math.min(1, (8.0 - timeLeft) / 8.0));
  }, [phase, currentResult, timeLeft]);

  // Advance to Next Prompt Choreography
  const advanceToNext = useCallback(
    (newResults: AazhamRoundResult[], pointsGained: number) => {
      // 1. Trigger Hydrodynamic Plunge Rush
      setIsPlunging(true);
      const velocity = Math.min(1.0, 0.3 + (pointsGained / 100) * 0.7);
      setPlungeVelocity(velocity);
      playPlungeRush(velocity);

      // 2. Dissolve prompt & accelerate upward water motion (600ms)
      setTimeout(() => {
        setPlungeVelocity(0);

        if (currentPromptIdx < edition.prompts.length - 1) {
          setCurrentPromptIdx((prev) => prev + 1);
          setCurrentResult(null);
          setIsPlunging(false);
          roundActiveRef.current = true;
          roundStartTimeRef.current = performance.now();
          setTimeLeft(ROUND_TIME_SECONDS);
        } else {
          // Dive completed!
          setIsPlunging(false);
          setPhase("post_dive");
          const completion = saveAazhamDiveCompletion(edition.id, newResults);
          setExistingCompletion(completion);
          onSolved?.();
        }
      }, 700);
    },
    [currentPromptIdx, edition.id, edition.prompts.length, onSolved, playPlungeRush]
  );

  // Handle Timeout (25s expired)
  const handleTimeout = useCallback(() => {
    if (!roundActiveRef.current || !activePrompt) return;
    roundActiveRef.current = false;

    playRejectThud();

    const timeoutResult: AazhamRoundResult = {
      promptId: activePrompt.id,
      userGuess: "Timed out",
      tier: 0,
      depthMeters: 0,
    };

    const newResults = [...roundResults, timeoutResult];
    setCurrentResult(timeoutResult);
    setRoundResults(newResults);

    // Give 1.4s to view the timeout message before plunging to next
    setTimeout(() => {
      advanceToNext(newResults, 0);
    }, 1400);
  }, [activePrompt, advanceToNext, playRejectThud, roundResults]);

  // 60fps RequestAnimationFrame High-Precision Countdown Timer
  useEffect(() => {
    if (phase !== "diving" || currentResult || isPlunging) {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
      return;
    }

    roundActiveRef.current = true;
    roundStartTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!roundActiveRef.current) return;

      const elapsed = (now - roundStartTimeRef.current) * 0.001;
      const remaining = Math.max(0, ROUND_TIME_SECONDS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleTimeout();
        return;
      }

      timerRafRef.current = requestAnimationFrame(loop);
    };

    timerRafRef.current = requestAnimationFrame(loop);

    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    };
  }, [phase, currentPromptIdx, currentResult, isPlunging, handleTimeout]);

  // Handle Player Guess Submit
  const handleGuessSubmit = useCallback(
    (rawGuess: string): boolean => {
      if (phase !== "diving" || !activePrompt || !roundActiveRef.current) return false;

      const match = matchAazhamGuess(rawGuess, activePrompt.answers);
      if (!match) {
        playRejectThud();
        return false;
      }

      // Valid Guess Accepted!
      roundActiveRef.current = false;
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);

      const depthMeters = AAZHAM_TIER_META[match.tier].depthMeters;
      const isTrap = match.tier === 15;

      const result: AazhamRoundResult = {
        promptId: activePrompt.id,
        userGuess: rawGuess,
        matchedEntityId: match.id,
        matchedDisplayNameEn: match.displayEn,
        matchedDisplayNameTa: match.displayTa,
        tier: match.tier,
        depthMeters,
        trapTriggered: isTrap,
        culturalBlurb: match.culturalBlurb,
      };

      const newResults = [...roundResults, result];
      setCurrentResult(result);
      setRoundResults(newResults);
      playTierLockIn(match.tier);

      // Trigger shockwave on high-value pearls
      if (match.tier >= 85) {
        setTriggerShockwave(true);
        setTimeout(() => setTriggerShockwave(false), 850);
      }

      // 950ms Lock-in display -> followed by plunge transition
      setTimeout(() => {
        advanceToNext(newResults, match.tier);
      }, 950);

      return true;
    },
    [activePrompt, advanceToNext, phase, playRejectThud, playTierLockIn, roundResults]
  );

  // Play Again Trigger
  const handlePlayAgain = () => {
    setRoundResults([]);
    setCurrentResult(null);
    setCurrentPromptIdx(0);
    setIsPlunging(false);
    setTimeLeft(ROUND_TIME_SECONDS);
    roundActiveRef.current = true;
    roundStartTimeRef.current = performance.now();
    setPhase("diving");
  };

  return (
    <div
      id="aazham-immersion-viewport"
      className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden select-none bg-[#01050A] text-[#F4F7F5] flex flex-col"
    >
      {/* LAYER 0 (z-0): WebGL Ocean Shader / Caustics / Deep Light */}
      <OceanBackdrop
        depthProgress={depthProgress}
        plungeVelocity={plungeVelocity}
        urgency={urgencyRatio}
      />

      {/* LAYER 1 (z-10): Parallax Maritime Silhouettes (Poompuhar / Chola Ship / Astrolabe) */}
      <SubmergedLayer
        depthProgress={depthProgress}
        roundIndex={currentPromptIdx}
      />

      {/* LAYER 2 (z-20): Persistent Bathymetric Top Header Telemetry */}
      <DiveHeader
        currentDepth={currentDepth}
        currentRoundIdx={currentPromptIdx}
        roundResults={roundResults}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onBackToArcade={onBackToArcade}
        editionNo={edition.editionNo}
      />

      {/* LAYER 2 (z-20): Left Bathymetric Ruler */}
      <DepthRail
        currentDepth={currentDepth}
        roundResults={roundResults}
      />

      {/* LAYER 3 (z-30): Active Editorial Stage OR Post-Dive Results */}
      <main className="relative z-30 flex-1 w-full h-[calc(100dvh-56px)] overflow-y-auto overflow-x-hidden md:pl-[68px]">
        {phase === "diving" && activePrompt ? (
          <DiveStage
            prompt={activePrompt}
            roundIndex={currentPromptIdx}
            timeLeft={timeLeft}
            disabled={!roundActiveRef.current || isPlunging}
            currentResult={currentResult}
            onGuessSubmit={handleGuessSubmit}
            onKeystroke={playSonarTick}
            accentColor={activeAccentColor}
            isPlunging={isPlunging}
          />
        ) : (
          <DiveResults
            edition={edition}
            roundResults={roundResults}
            onPlayAgain={handlePlayAgain}
            onBackToArcade={onBackToArcade}
          />
        )}
      </main>

      {/* LAYER 4 (z-40): Optical Finishing Pass (Film Grain, Dynamic Vignette, Shockwave) */}
      <AtmosphericOverlay
        depthProgress={depthProgress}
        urgency={urgencyRatio}
        triggerShockwave={triggerShockwave}
      />
    </div>
  );
}
