"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { FOCUSABLE_SELECTOR, nextTrapTarget } from "@/lib/focusTrap";
import { Eyebrow } from "@/components/muttram/Eyebrow";

export interface DialogShellProps {
  open: boolean;
  onClose: () => void;
  /** Visible title. When omitted, pass `ariaLabel` instead. */
  title?: React.ReactNode;
  tamilTitle?: string;
  eyebrow?: string;
  ariaLabel?: string;
  /** ivory = reading/forms, dark = Sangam-deep showcase, media = photo/video lightbox. */
  tone?: "ivory" | "dark" | "media";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Extra header content (e.g. actions) rendered beside the title. */
  headerAction?: React.ReactNode;
  closeLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

const SIZE = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[min(96vw,1600px)]",
} as const;

const TONE = {
  ivory: {
    panel: "bg-bg-ivory text-ink-earth border border-border-warm",
    header: "border-b border-border-warm bg-bg-sandstone/60",
    title: "text-ink-earth",
    tamil: "text-brand-purple",
    eyebrow: "light" as const,
    close: "text-ink-umber hover:text-brand-purple hover:bg-brand-purple-soft",
  },
  dark: {
    panel: "bg-bg-sangam-deep text-ink-alabaster border border-accent-zari/30",
    header: "border-b border-accent-zari/20 bg-surface-card-dark",
    title: "text-ink-alabaster",
    tamil: "text-brand-lavender",
    eyebrow: "dark" as const,
    close: "text-ink-sand hover:text-ink-alabaster hover:bg-white/10",
  },
  media: {
    panel: "bg-bg-sangam-deep/95 text-ink-alabaster border border-accent-zari/20",
    header: "border-b border-accent-zari/15",
    title: "text-ink-alabaster",
    tamil: "text-brand-lavender",
    eyebrow: "dark" as const,
    close: "text-ink-sand hover:text-ink-alabaster hover:bg-white/10",
  },
};

/**
 * DialogShell — the single modal/lightbox shell.
 * Portal, labelled role="dialog", focus trap, focus restore, scroll lock, Escape (fires once),
 * backdrop click, visible 48px close button, 100dvh-safe height, reduced-motion aware.
 */
export function DialogShell({
  open,
  onClose,
  title,
  tamilTitle,
  eyebrow,
  ariaLabel,
  tone = "ivory",
  size = "md",
  headerAction,
  closeLabel = "Close",
  className = "",
  bodyClassName = "",
  children,
}: DialogShellProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const t = TONE[tone];

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Scroll lock only; Escape is handled below so it fires exactly once.
  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? panel).focus();
    }, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const target = nextTrapTarget(items, document.activeElement as HTMLElement | null, e.shiftKey);
      if (target) {
        e.preventDefault();
        target.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  const hasHeader = Boolean(title || eyebrow || headerAction);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-bg-sangam-deep/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(28,18,43,0.45)] outline-none sm:max-h-[calc(100dvh-3rem)] ${SIZE[size]} ${t.panel} ${className}`.trim()}
          >
            {hasHeader ? (
              <div className={`flex items-start gap-4 px-5 py-4 sm:px-7 sm:py-5 ${t.header}`}>
                <div className="min-w-0 flex-1 space-y-1">
                  {eyebrow && <Eyebrow tone={t.eyebrow}>{eyebrow}</Eyebrow>}
                  {title && (
                    <h2 id={titleId} className={`font-serif text-2xl leading-tight sm:text-3xl ${t.title}`}>
                      {title}
                    </h2>
                  )}
                  {tamilTitle && (
                    <p lang="ta" className={`font-tamil text-base leading-[1.6] ${t.tamil}`}>
                      {tamilTitle}
                    </p>
                  )}
                </div>
                {headerAction}
                <CloseButton label={closeLabel} onClose={onClose} className={t.close} />
              </div>
            ) : (
              <CloseButton
                label={closeLabel}
                onClose={onClose}
                className={`absolute right-3 top-3 z-20 bg-bg-sangam-deep/60 ${t.close}`}
              />
            )}
            <div data-lenis-prevent className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function CloseButton({ label, onClose, className }: { label: string; onClose: () => void; className: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark ${className}`}
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
