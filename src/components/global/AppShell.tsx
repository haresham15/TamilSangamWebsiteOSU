"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";
import { CornerUtilityDrawer } from "./CornerUtilityDrawer";
import { SangamChatbot } from "@/components/chat/SangamChatbot";
import { DirectorHUD } from "@/director/DirectorHUD";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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
  const isHomePage = pathname === "/";

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-clip">
      {/* 1. Global Floating Nav (Skipped on /links to preserve Linktree simplicity) */}
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

      {/* 4. Bounded Free-Tier AI Chatbot (Skipped on /links and homepage) */}
      {!isLinksPage && !isHomePage && <SangamChatbot />}

      {/* 5. Minimalist Corner Utility Drawer (Relocated search, theme, language, audio) */}
      {!isLinksPage && <CornerUtilityDrawer onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 6. Footer (Skipped on /links) */}
      {!isLinksPage && <Footer onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 7. Director's Viewport Diagnostics HUD (§6) */}
      <DirectorHUD />
    </div>
  );
};

