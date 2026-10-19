"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { X, Calendar, Clock, MapPin, Download, ExternalLink, ArrowRight } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar/types";
import { formatEventDateDisplay, formatEventTimeET } from "@/lib/calendar/parse";
import { buildGoogleCalendarUrl } from "@/lib/calendar/ics";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();
  const reducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Store trigger element on open and restore on close
  useEffect(() => {
    if (event) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus first focusable element inside modal
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          }
        }
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [event]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!event) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

  if (typeof document === "undefined") return null;

  const dateDisplay = event ? formatEventDateDisplay(event.start) : "";
  const timeDisplay = event ? formatEventTimeET(event.start, event.end, event.allDay) : "";
  const googleCalendarUrl = event ? buildGoogleCalendarUrl(event) : "#";
  const icsDownloadUrl = event ? `/api/events/${encodeURIComponent(event.id)}/ics` : "#";

  return createPortal(
    <AnimatePresence>
      {event && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={() => {
              playClick();
              onClose();
            }}
            className="absolute inset-0 bg-[#1E1B18]/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Dialog Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, y: reducedMotion ? 0 : 16 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-[#FAF9F6] border border-[#2A2825]/15 rounded-3xl shadow-2xl overflow-hidden z-10 text-left max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="relative px-6 sm:px-8 pt-7 pb-5 border-b border-[#2A2825]/10 bg-[#F4EFE6]/60">
              {/* Close Button */}
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                aria-label={locale === "ta" ? "மூடு" : "Close event details"}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#1E1B18]/5 hover:bg-[#B85C38] hover:text-white text-[#2A2825] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-12">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#B85C38] block mb-1">
                  OSU TAMIL SANGAM · GATHERING
                </span>
                <h2
                  id="calendar-modal-title"
                  className="font-serif text-2xl sm:text-3xl font-bold text-[#2A2825] leading-snug"
                >
                  {locale === "ta" && event.titleTa ? event.titleTa : event.titleEn}
                </h2>
                {event.titleTa && (
                  <p
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="font-tamil text-sm text-[#B85C38] font-medium mt-1"
                  >
                    {locale === "ta" ? event.titleEn : event.titleTa}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-[#F4EFE6] rounded-2xl border border-[#2A2825]/10 text-xs font-sans text-[#57524C]">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#57524C]/80 block">Date</span>
                    <span className="font-medium text-[#2A2825]">{dateDisplay}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#57524C]/80 block">Time</span>
                    <span className="font-medium text-[#2A2825]">{timeDisplay}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start gap-2.5 pt-2 border-t border-[#2A2825]/10">
                  <MapPin className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#57524C]/80 block">Location</span>
                    <span className="font-medium text-[#2A2825]">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#B85C38] font-bold">
                    {locale === "ta" ? "நிகழ்வு விளக்கம்" : "About this gathering"}
                  </h3>
                  <div className="font-sans text-sm text-[#57524C] leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Free Admission Notice */}
              <div className="flex items-center gap-2 p-3 bg-[#FAF9F6] border border-[#2A2825]/15 rounded-xl text-xs font-sans text-[#2A2825]">
                <span className="w-2 h-2 rounded-full bg-[#55CCA2]" />
                <span className="font-medium">
                  {locale === "ta"
                    ? "அனைத்து மாணவர்களுக்கும் அனுமதி இலவசம் · உறுப்பினர் கட்டணம் இல்லை"
                    : "Free admission for all students · No RSVP or ticket required to attend"}
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 sm:px-8 border-t border-[#2A2825]/10 bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Add to Google Calendar */}
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playWoodClick()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2A2825] hover:bg-[#B85C38] text-white text-xs font-sans font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </a>

                {/* Download .ics */}
                <a
                  href={icsDownloadUrl}
                  download
                  onClick={() => playWoodClick()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F4EFE6] text-[#2A2825] border border-[#2A2825]/20 text-xs font-sans font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#B85C38]" />
                  <span>Apple / Outlook (.ics)</span>
                </a>
              </div>

              {/* Open Event Dossier Link (only if slug exists) */}
              {event.slug && (
                <Link
                  href={`/events/${event.slug}`}
                  onClick={() => {
                    playClick();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#B85C38] hover:text-[#2A2825] transition-colors uppercase tracking-wider"
                >
                  <span>{locale === "ta" ? "ஆவணம் பார்க்க" : "Open event dossier"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
