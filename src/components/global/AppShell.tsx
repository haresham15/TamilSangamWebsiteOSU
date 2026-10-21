"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";
import { UnifiedFloatingDock } from "./UnifiedFloatingDock";
import { SangamChatbot } from "@/components/chat/SangamChatbot";
import { DirectorHUD } from "@/director/DirectorHUD";
import { ClickSpark } from "@/components/ui/react-bits";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Global ⌘K / Ctrl+K Command Palette Keyboard Trigger
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isLinksPage = pathname === "/links";

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-clip">
      {/* Kolam Gold Click Spark Particles Overlay */}
      <ClickSpark sparkColor="#D4AF37" sparkCount={8} sparkRadius={18} duration={420} />

      {/* 1. Global Floating Nav: Pure routing only */}
      {!isLinksPage && <FloatingNav />}

      {/* 2. ⌘K Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 3. Main Route Content with Hardware-Accelerated Fluid Transition */}
      <main className="flex-1 w-full flex flex-col">
        <motion.div
          key={pathname}
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex-1 w-full flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* 4. Bounded Free-Tier AI Chatbot (controlled by Unified Floating Dock) */}
      {!isLinksPage && (
        <SangamChatbot
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          hideTrigger={true}
        />
      )}

      {/* 5. Unified Bottom-Right Floating Utility Dock (Ask Nanba, Audio, ⌘K) */}
      {!isLinksPage && (
        <UnifiedFloatingDock
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isChatOpen={isChatOpen}
        />
      )}

      {/* 6. Footer (Skipped on /links) */}
      {!isLinksPage && <Footer onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 7. Director's Viewport Diagnostics HUD (§6) */}
      <DirectorHUD />
    </div>
  );
};

