"use client";

import React from "react";
import { TierProvider } from "./TierProvider";
import { MotionProvider } from "./MotionProvider";
import { TransitionProvider } from "./TransitionProvider";
import { BootSlate } from "@/components/ui/BootSlate";
import { GlobalDebugHUD } from "@/components/gl/GlobalDebugHUD";
import { LocaleProvider } from "@/context/LocaleContext";
import { TinaiProvider } from "@/context/TinaiContext";
import { AudioProvider } from "@/context/AudioContext";
import { LiteModeProvider } from "@/context/LiteModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TierProvider>
      <LiteModeProvider>
        <MotionProvider>
          <TransitionProvider>
            <LocaleProvider>
              <TinaiProvider>
                <AudioProvider>
                  <BootSlate />
                  <GlobalDebugHUD />
                  {children}
                </AudioProvider>
              </TinaiProvider>
            </LocaleProvider>
          </TransitionProvider>
        </MotionProvider>
      </LiteModeProvider>
    </TierProvider>
  );
}
export default Providers;
