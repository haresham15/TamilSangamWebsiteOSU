"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FloatingNav } from "./FloatingNav";
import { CommandPalette } from "./CommandPalette";
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
      {/* 1. Global Floating Nav (Skipped on /links to preserve Linktree simplicity) */}
      {!isLinksPage && <FloatingNav onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* 2. ⌘K Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 3. Main Route Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* 4. Footer (Skipped on /links) */}
      {!isLinksPage && <Footer />}
    </div>
  );
};
