"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FloatingNav } from "./FloatingNav";
import { CustomCursor } from "./CustomCursor";
import { CommandPalette } from "./CommandPalette";
import { KolamBootLoader } from "./KolamBootLoader";
import { CinematicGrade } from "./CinematicGrade";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isLinksPage = pathname === "/links";

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* 1. Kolam Boot Loader on Initial Visit (Skipped on /links) */}
      {!isLinksPage && <KolamBootLoader />}

      {/* 2. Magnetic Context-Aware Cursor */}
      {!isLinksPage && <CustomCursor />}

      {/* 3. Global Floating Glassmorphism Nav (Skipped on /links to preserve Linktree simplicity) */}
      {!isLinksPage && <FloatingNav onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 4. Film Grain & LUT Grade (Skipped on /links) */}
      {!isLinksPage && <CinematicGrade />}

      {/* 5. ⌘K Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 6. Main Route Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* 7. Film Roll Credits & Footer (Skipped on /links) */}
      {!isLinksPage && <Footer />}
    </div>
  );
};
