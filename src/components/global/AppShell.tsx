"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isLinksPage = pathname === "/links";

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* 1. Global Floating Nav (Skipped on /links to preserve Linktree simplicity) */}
      {!isLinksPage && <FloatingNav onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 2. ⌘K Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 3. Main Route Content with Hardware-Accelerated Fluid Transition */}
      <main className="flex-1 w-full flex flex-col">
        <motion.div
          key={pathname}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex-1 w-full flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* 4. Footer (Skipped on /links) */}
      {!isLinksPage && <Footer />}
    </div>
  );
};
